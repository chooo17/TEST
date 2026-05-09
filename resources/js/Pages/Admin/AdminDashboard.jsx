import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    BanknotesIcon, ShoppingBagIcon, CubeIcon,
    ArrowTrendingUpIcon, ArrowTrendingDownIcon,
    ClockIcon, FireIcon, ExclamationTriangleIcon,
    ChartBarIcon,
} from "@heroicons/react/24/solid";

function formatRp(v) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);
}

function GrowthBadge({ value }) {
    const isUp = value >= 0;
    return (
        <span className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            {isUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {isUp ? "+" : ""}{value}%
        </span>
    );
}

function StatCard({ icon: Icon, label, value, growth, sub }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <GrowthBadge value={growth} />
            </div>
            <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {sub && <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const methodBadgeColor = {
    Cash:  "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
    QRIS:  "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
    Debit: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
};

export default function AdminDashboard({
    stats = {},
    recentSales = [],
    topProducts = [],
    lowStock = [],
    tanggal = "",
    greeting = "Selamat Datang",
    storeName = "Toko",
}) {
    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Dashboard Admin" />
            <div className="flex flex-col gap-4 p-4 h-full overflow-auto no-scrollbar">

                {/* HEADER */}
                <div className="bg-orange-500 rounded-2xl p-5 shadow-lg flex justify-between items-start">
                    <div>
                        <p className="text-orange-100 text-sm">{greeting} — {tanggal}</p>
                        <h1 className="text-2xl font-bold text-white mt-0.5">{storeName}</h1>
                    </div>
                    <Link href="/laporan"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition">
                        <ChartBarIcon className="w-4 h-4" /> Laporan
                    </Link>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard icon={BanknotesIcon} label="Pendapatan" value={formatRp(stats.pendapatan)} growth={stats.growthPendapatan ?? 0} sub="hari ini" />
                    <StatCard icon={ShoppingBagIcon} label="Pesanan" value={stats.pesanan ?? 0} growth={stats.growthPesanan ?? 0} sub="hari ini" />
                    <StatCard icon={CubeIcon} label="Item Terjual" value={stats.itemTerjual ?? 0} growth={stats.growthItem ?? 0} sub="hari ini" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* TRANSAKSI TERBARU */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Transaksi Terbaru</h2>
                        </div>
                        {recentSales.length === 0 && (
                            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6">Belum ada transaksi</p>
                        )}
                        {recentSales.map((sale, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                <div>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">{sale.invoice_no}</p>
                                    <p className="text-gray-400 dark:text-slate-500 text-xs">{sale.items_count} item · {sale.sale_date}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-orange-500 font-bold text-sm">{formatRp(sale.grand_total)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${methodBadgeColor[sale.payment_method] ?? "bg-gray-100 dark:bg-white/20 text-gray-600 dark:text-white"}`}>
                                        {sale.payment_method}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PRODUK TERLARIS */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <FireIcon className="w-4 h-4 text-orange-500" />
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Terlaris Bulan Ini</h2>
                        </div>
                        {topProducts.length === 0 && (
                            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6">Belum ada data</p>
                        )}
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-100 dark:bg-slate-700 shrink-0 flex items-center justify-center text-xs font-bold text-orange-500 dark:text-white">
                                    {p.image
                                        ? <img src={`/storage/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                        : `#${i + 1}`
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{p.name}</p>
                                    <p className="text-gray-400 dark:text-slate-500 text-xs">{formatRp(p.revenue)}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-500/30 text-orange-600 dark:text-orange-200 font-bold shrink-0">
                                    {p.qty}x
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STOK MENIPIS */}
                {lowStock.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/40 p-4 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                            <h2 className="font-bold text-red-700 dark:text-white text-sm">Stok Menipis — Perlu Restock</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {lowStock.map((p, i) => (
                                <div key={i} className="bg-red-100 dark:bg-red-500/20 rounded-xl px-3 py-2 flex justify-between items-center">
                                    <p className="text-red-700 dark:text-white text-xs truncate">{p.name}</p>
                                    <span className="text-xs font-bold text-red-500 dark:text-red-200 ml-2 shrink-0">{p.stock} {p.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
