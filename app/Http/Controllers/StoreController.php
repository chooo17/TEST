<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone'   => 'nullable|string',
            'logo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $store = auth()->user()->store;

        $data = $request->only(['name', 'address', 'phone']);

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                \Storage::disk('public')->delete($store->logo);
            }
            $data['logo'] = $request->file('logo')->store('stores', 'public');
        }

        $store->update($data);

        return redirect()->route('kelolatoko')->with('success', 'Profil toko berhasil diupdate!');
    }
}