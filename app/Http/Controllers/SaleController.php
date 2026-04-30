<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer|exists:products,id',
                'items.*.qty' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'payment_method' => 'required|in:Cash,QRIS,Debit',
                'paid_amount' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
            ]);

            DB::beginTransaction();

            $user = Auth::user();
            $subtotal = (float) $validated['subtotal'];
            $paidAmount = (float) $validated['paid_amount'];
            $changeAmount = $paidAmount - $subtotal;

            if ($paidAmount < $subtotal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominal pembayaran kurang!',
                ], 422);
            }

            // Create sale
            $sale = Sale::create([
                'invoice_no' => $this->generateInvoiceNo(),
                'store_id' => $user->store_id ?? 1,
                'user_id' => $user->id,
                'customer_id' => null,
                'subtotal' => $subtotal,
                'discount' => 0,
                'tax' => 0,
                'grand_total' => $subtotal,
                'payment_method' => $validated['payment_method'],
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'status' => 'completed',
                'sale_date' => now(),
            ]);

            // Create sale items and update product stock
            foreach ($validated['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => (int) $item['product_id'],
                    'qty' => (int) $item['qty'],
                    'price' => (float) $item['price'],
                    'cost_price' => 0,
                    'subtotal' => (float) $item['price'] * (int) $item['qty'],
                ]);

                // Update product stock
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('stock', $item['qty']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil!',
                'sale' => $sale,
                'change' => round($changeAmount, 2),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . implode(', ', collect($e->errors())->flatten()->toArray()),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function generateInvoiceNo()
    {
        $date = now();
        $yy = $date->format('y');
        $mm = $date->format('m');
        $dd = $date->format('d');

        $key = "invoice-counter-{$yy}{$mm}{$dd}";
        $counter = cache($key, 0);
        $counter++;
        cache([$key => $counter], 1440); // cache for 24 hours

        $number = str_pad($counter, 4, '0', STR_PAD_LEFT);
        return "INV-{$yy}{$mm}{$dd}-{$number}";
    }
}
