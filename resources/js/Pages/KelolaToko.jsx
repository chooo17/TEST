import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import {
    PencilSquareIcon,
    TrashIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function KelolaToko({
    auth,
    products = [],
    categories = [],
    materials = [],
    users = [],
}) {
    const [tab, setTab] = useState("menu");
    const [search, setSearch] = useState("");

    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    const [editingMaterial, setEditingMaterial] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [stockMode, setStockMode] = useState("in");
    const [qtyInputs, setQtyInputs] = useState({});
    const [stockModes, setStockModes] = useState({});
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recipeItems, setRecipeItems] = useState([]);

    const {
        data,   
        setData,
        post,
        put,
        processing,
        reset,
        errors,
    } = useForm({
        name: "",
        category_id: "",
        selling_price: "",
        image: null,
        sku: "SKU-" + Date.now(),
        cost_price: 0,
        stock: 0,
        unit: "pcs",
        is_active: 1,
        min_stock: 0,
        buy_price: 0,
        qty: 0,
        initial_qty: 0,
        use_initial_qty: false,
        email: "",
        password: "",
        role: "",
    });

    

    const filteredProducts = useMemo(() => {
        return products.filter((item) =>
            (item.name || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [products, search]);

    const filteredMaterials = useMemo(() => {
        return materials.filter((item) =>
            (item.name || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [materials, search]);

    const openAddMenu = () => {
        reset();
        setData({
            name: "",
            category_id: "",
            selling_price: "",
            image: null,
            sku: "SKU-" + Date.now(),
            cost_price: 0,
            stock: 0,
            unit: "pcs",
            is_active: 1,
            min_stock: 0,
            buy_price: 0,
            qty: 0,
        });
        setShowMenuModal(true);
    };

    const openAddMaterial = () => {
        setEditingMaterial(null);
        reset();
        setData({
            name: "",
            stock: "",
            unit: "pcs",
            min_stock: "",
            buy_price: "",
            qty: "",
        });
        setShowMaterialModal(true);
    };

    const openEditMaterial = (item) => {
        setEditingMaterial(item);
        setData({
            name: item.name ?? "",
            stock: item.stock ?? 0,
            unit: item.unit ?? "pcs",
            min_stock: item.min_stock ?? 0,
            buy_price: item.buy_price ?? 0,
            qty: "",
        });
        setShowMaterialModal(true);
    };

    const openAddUser = () => {
        setEditingUser(null);
        reset();
        setData({
            name: "",
            email: "",
            password: "",
            role: "",
        });
        setShowUserModal(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setData({
            name: user.name ?? "",
            email: user.email ?? "",
            password: "",
            role: user.roles?.[0]?.name ?? "",
        });
        setShowUserModal(true);
    };

    const saveMaterial = () => {
        if (editingMaterial) {
            put(`/bahan/${editingMaterial.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowMaterialModal(false);
                    reset();
                },
            });
        } else {
            post("/bahan", {
                preserveScroll: true,
                onSuccess: () => {
                    setShowMaterialModal(false);
                    reset();
                },
            });
        }
    };

    const saveUser = () => {
        if (editingUser) {
            put(
                `/users/${editingUser.id}`,
                {
                    role: data.role,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowUserModal(false);
                        setEditingUser(null);
                        reset();
                    },
                }
            );
        } else {
            post("/users", {
                preserveScroll: true,
                onSuccess: () => {
                    setShowUserModal(false);
                    reset();
                },
            });
        }
    };

    const saveMenu = () => {
        post("/products", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowMenuModal(false);
                reset();
            },
        });
    };

    const adjustStock = (item) => {
    const qty = Number(qtyInputs[item.id] || 0);
    const type = stockModes[item.id] || "in";

    if (qty <= 0) return;

    router.post(
        `/bahan/${item.id}/stock`,
        {
            type,
            qty,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                setQtyInputs((prev) => ({
                    ...prev,
                    [item.id]: "",
                }));
            },
        }
    );
};

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Toko" />

            <div className="p-6 text-white space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                    <h1 className="text-3xl font-bold">
                        Kelola Toko
                    </h1>

                    <input
                        type="text"
                        placeholder="Search bahan / menu..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full md:w-80 px-4 py-2 rounded-xl bg-[#111827] border border-gray-700 text-white"
                    />
                </div>

                {/* TAB */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setTab("menu")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "menu"
                                ? "bg-orange-500 text-white"
                                : "bg-gray-700 text-gray-300"
                        }`}
                    >
                        Stock Menu
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab("bahan")}
                        className={`px-4 py-2 rounded-xl ${
                            tab === "bahan"
                                ? "bg-orange-500 text-white"
                                : "bg-gray-700 text-gray-300"
                        }`}
                    >
                        Bahan
                    </button>

                    {auth?.roles?.includes('superadmin') && (
                        <button
                            type="button"
                            onClick={() => setTab("pengguna")}
                            className={`px-4 py-2 rounded-xl ${
                                tab === "pengguna"
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-700 text-gray-300"
                            }`}
                        >
                            Pengguna
                        </button>
                    )}
                </div>

                {/* MENU TAB */}
                {tab === "menu" && (
                    <div className="bg-[#1f2937] rounded-2xl p-4 space-y-4 border border-gray-700">
                         {/* Header */}
                        <div className="flex justify-between items-center">
                         <div>
                            <h2 className="text-xl font-bold text-white">
                                Master Menu
                             </h2>
                            <p className="text-sm text-gray-400">
                         Daftar Menu 
                             </p>
                            </div>
                            
                            <button
                                type="button"
                                onClick={openAddMenu}
                                className="px-4 py-2 rounded-xl bg-orange-500"
                            >
                                + Tambah Menu
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filteredProducts.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center bg-[#111827] rounded-xl p-4"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {item.category?.name ??
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        Rp{" "}
                                        {Number(
                                            item.selling_price || 0
                                        ).toLocaleString("id-ID")}
                                    </div>

                                    <div>
                                      Stock: {Math.floor(item.available_stock || 0)}
                                    </div>

                                    <div>
                                        {item.available_stock > 0 ? (
                                            <span className="text-xs bg-green-600 px-2 py-1 rounded">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-red-600 px-2 py-1 rounded">
                                                Habis
                                            </span>
                                        )}
                                    </div>
 
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProduct(item);

                                            if (
                                                item.recipe &&
                                                item.recipe.items &&
                                                item.recipe.items.length > 0
                                            ) {
                                                setRecipeItems(
                                                    item.recipe.items.map((row) => ({
                                                        material_id: row.material_id,
                                                        qty: row.qty,
                                                    }))
                                                );
                                            } else {
                                                setRecipeItems([
                                                    {
                                                        material_id: "",
                                                        qty: "",
                                                    },
                                                ]);
                                            }

                                            setShowRecipeModal(true);
                                        }}
                                        className="px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                                    >
                                        Resep
                                    </button>

                                    <div className="flex gap-2">
                                        <button className="p-2 rounded bg-blue-500/20">
                                            <PencilSquareIcon className="w-4 h-4 text-blue-400" />
                                        </button>

                                        <button
                                            className="p-2 rounded bg-red-500/20"
                                            onClick={() =>
                                                router.delete(
                                                    `/products/${item.id}`
                                                )
                                            }
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>

                                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BAHAN TAB */}
               {tab === "bahan" && (
    <div className="bg-[#1f2937] rounded-2xl p-4 border border-gray-700 space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">
                    Master Bahan
                </h2>
                <p className="text-sm text-gray-400">
                    Daftar bahan baku yang tersedia
                </p>
            </div>

            <button
                type="button"
                onClick={openAddMaterial}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
            >
                + Tambah Bahan
            </button>
        </div>

        {/* List */}
        {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((item) => (
    <div
        key={item.id}
        className="bg-[#111827] border border-gray-700 rounded-2xl p-4 space-y-4"
    >

        {/* Info */}
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-semibold text-white">
                    {item.name}
                </h3>
                <p className="text-sm text-gray-400">
                    Stock: {item.stock} {item.unit}
                </p>
            </div>

            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                {item.unit}
            </span>
        </div>

        {/* Harga */}
        <div className="grid grid-cols-2 gap-4 items-center">
    <div>
        <p className="text-xs text-gray-400">
            Harga Beli
        </p>
        <p className="text-orange-400 font-bold">
            Rp {Number(item.buy_price || 0).toLocaleString("id-ID")}
        </p>
    </div>

    <div>
        <p className="text-xs text-gray-400">
            Nilai Stok
        </p>
        <p className="text-cyan-400 font-bold">
            Rp{" "}
            {Math.round(
                ((Number(item.buy_price || 0) / Number(item.initial_qty || 1)) *Number(item.stock || 0))
            ).toLocaleString("id-ID")}
        </p>
    </div>
            {item.stock <= item.min_stock ? (
                <span className="text-xs px-3 py-1 rounded bg-red-500 text-white">
                    Menipis
                </span>
            ) : (
                <span className="text-xs px-3 py-1 rounded bg-green-600 text-white">
                    Aman
                </span>
            )}
        </div>
        
                

        {/* Stock Masuk / Keluar */}
        <div className="grid grid-cols-3 gap-2">
    <select
        value={stockModes[item.id] || "in"}
        onChange={(e) =>
            setStockModes((prev) => ({
                ...prev,
                [item.id]: e.target.value,
            }))
        }
        className="px-3 py-2 rounded bg-[#1f2937] border border-gray-700 text-white"
    >
        <option value="in">Masuk</option>
        <option value="out">Keluar</option>
    </select>

    <input
        type="number"
        min="1"
        placeholder="Qty"
        value={qtyInputs[item.id] || ""}
        onChange={(e) =>
            setQtyInputs((prev) => ({
                ...prev,
                [item.id]: e.target.value,
            }))
        }
        className="px-3 py-2 rounded bg-[#1f2937] border border-gray-700 text-white"
    />

    <button
        type="button"
        onClick={() => adjustStock(item)}
        className="px-3 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
    >
        Proses
    </button>
</div>

        {/* Action */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-700">
            <button
                type="button"
                onClick={() => openEditMaterial(item)}
                className="px-3 py-1 rounded bg-blue-500/20 text-blue-400"
            >
                Edit
            </button>

            <button
                type="button"
                onClick={() => router.delete(`/bahan/${item.id}`)}
                className="px-3 py-1 rounded bg-red-500/20 text-red-400"
            >
                Hapus
            </button>
        </div>
    </div>
))}
            </div>
        ) : (
            <div className="text-center py-10 text-gray-400">
                Belum ada bahan.
            </div>
        )}
    </div>
)}
            </div>

{/* PENGGUNA TAB */}
{auth?.roles?.includes('superadmin') && tab === "pengguna" && (
    <div className="bg-[#1f2937] rounded-2xl p-4 space-y-4 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">
                    Master Pengguna
                </h2>
                <p className="text-sm text-gray-400">
                    Daftar pengguna sistem
                </p>
            </div>
            
            <button
                type="button"
                onClick={openAddUser}
                className="px-4 py-2 rounded-xl bg-orange-500"
            >
                + Tambah Pengguna
            </button>
        </div>

        <div className="space-y-3">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-[#111827] rounded-xl p-4"
                >
                    <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-gray-300">
                        {user.roles.map(role => role.name).join(', ')}
                    </div>
                    <div className="text-gray-400 text-sm">
                        {user.created_at}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => openEditUser(user)}
                            className="px-3 py-1 rounded bg-blue-500/20 text-blue-400"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            ))}
        </div>
        {users.length === 0 && (
            <div className="text-center py-10 text-gray-400">
                Belum ada pengguna.
            </div>
        )}
    </div>
)}

            {/* MODAL MENU */}
            {showMenuModal && (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-700 bg-[#111827] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Tambah Menu
                    </h2>
                    <p className="text-sm text-gray-400">
                        Tambahkan produk baru ke daftar menu
                    </p>
                </div>

                <button
                    onClick={() => setShowMenuModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Nama Menu
                    </label>
                    <input
                        placeholder="Contoh: Americano"
                        className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                        onChange={(e) =>
                            setData("name", e.target.value)
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Kategori
                    </label>
                    <select
                        className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                        onChange={(e) =>
                            setData("category_id", e.target.value)
                        }
                    >
                        <option value="">Pilih Kategori</option>
                        {categories.map((c) => (
                            <option
                                key={c.id}
                                value={c.id}
                            >
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Harga Jual
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                        onChange={(e) =>
                            setData(
                                "selling_price",
                                e.target.value
                            )
                        }
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-[#0f172a] flex justify-end gap-3">
                <button
                    onClick={() => setShowMenuModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
                >
                    Batal
                </button>

                <button
                    onClick={saveMenu}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                >
                    Simpan
                </button>
            </div>
        </div>
    </div>
)}

            {/* MODAL BAHAN */}
            {showMaterialModal && (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-gray-700 bg-[#111827] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {editingMaterial ? "Edit Bahan" : "Tambah Bahan"}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Kelola bahan baku inventory
                    </p>
                </div>

                <button
                    onClick={() => setShowMaterialModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

                <input
                    value={data.name}
                    onChange={(e) =>
                        setData("name", e.target.value)
                    }
                    placeholder="Nama Bahan"
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                />

                <select
                    value={data.unit}
                    onChange={(e) =>
                        setData("unit", e.target.value)
                    }
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                >
                    <option value="pcs">pcs</option>
                    <option value="gr">gr</option>
                    <option value="ml">ml</option>
                    <option value="liter">liter</option>
                </select>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        value={data.stock}
                        onChange={(e) =>
                            setData("stock", e.target.value)
                        }
                        placeholder="Stock"
                        className="rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                    />

                    <input
                        type="number"
                        value={data.min_stock}
                        onChange={(e) =>
                            setData(
                                "min_stock",
                                e.target.value
                            )
                        }
                        placeholder="Minimum Stock"
                        className="rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                    />
                </div>

                <input
                    type="number"
                    value={data.buy_price}
                    onChange={(e) =>
                        setData(
                            "buy_price",
                            e.target.value
                        )
                    }
                    placeholder="Harga Beli"
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                />
            </div>
            <label className="flex items-center gap-3 bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 cursor-pointer">
    <input
        type="checkbox"
        checked={data.use_initial_qty}
        onChange={(e) =>
            setData(
                "use_initial_qty",
                e.target.checked
            )
        }
        className="w-4 h-4 accent-orange-500"
    />

    <span className="text-sm text-gray-300">
        Gunakan stok ini sebagai kuantitas awal pembelian
    </span>
</label>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-[#0f172a] flex justify-end gap-3">
                <button
                    onClick={() => setShowMaterialModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
                >
                    Batal
                </button>

                <button
                    onClick={saveMaterial}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                >
                    Simpan
                </button>
            </div>
        </div>
    </div>
)}

            {/* MODAL PENGGUNA */}
            {showUserModal && (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-gray-700 bg-[#111827] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Kelola pengguna sistem
                    </p>
                </div>

                <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

                <input
                    value={data.name}
                    onChange={(e) =>
                        setData("name", e.target.value)
                    }
                    placeholder="Nama Lengkap"
                    disabled={!!editingUser}
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white disabled:opacity-60"
                />

                <input
                    type="email"
                    value={data.email}
                    onChange={(e) =>
                        setData("email", e.target.value)
                    }
                    placeholder="Email"
                    disabled={!!editingUser}
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white disabled:opacity-60"
                />

                {!editingUser && (
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) =>
                            setData("password", e.target.value)
                        }
                        placeholder="Password"
                        className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                    />
                )}

                <select
                    value={data.role}
                    onChange={(e) =>
                        setData("role", e.target.value)
                    }
                    className="w-full rounded-xl bg-[#1f2937] border border-gray-600 px-4 py-3 text-white"
                >
                    <option value="">Pilih Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                </select>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-[#0f172a] flex justify-end gap-3">
                <button
                    onClick={() => setShowUserModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-700 text-white hover:bg-gray-600"
                >
                    Batal
                </button>

                <button
                    onClick={saveUser}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                >
                    Simpan
                </button>
            </div>
        </div>
    </div>
)}

  {showRecipeModal && (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-[#111827] rounded-2xl border border-gray-700 p-6 space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Atur Resep
                    </h2>

                    <p className="text-sm text-gray-400">
                        {selectedProduct?.name}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowRecipeModal(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* Items */}
            {recipeItems.map((row, index) => {
    const material = materials.find(
        (m) => String(m.id) === String(row.material_id)
    );

    const unit = material?.unit || "";

    const cost =
        material && Number(material.initial_qty) > 0
            ? (
                  (Number(material.buy_price) /
                      Number(material.initial_qty)) *
                  Number(row.qty || 0)
              )
            : 0;

    return (
        <div
            key={index}
            className="grid grid-cols-12 gap-2 items-center"
        >
            {/* Pilih Bahan */}
            <div className="col-span-4">
                <select
                    value={row.material_id}
                    onChange={(e) => {
                        const updated = [...recipeItems];
                        updated[index].material_id =
                            e.target.value;
                        setRecipeItems(updated);
                    }}
                    className="w-full px-4 py-2 rounded bg-[#1f2937] text-white"
                >
                    <option value="">
                        Pilih Bahan
                    </option>

                    {materials.map((m) => (
                        <option
                            key={m.id}
                            value={m.id}
                        >
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Qty */}
            <div className="col-span-2">
                <input
                    type="number"
                    placeholder="Qty"
                     value={row.qty === 0 ? "" : row.qty}
                    onChange={(e) => {
                        const updated = [...recipeItems];
                        updated[index].qty =
                            e.target.value;
                        setRecipeItems(updated);
                    }}
                    className="w-full px-4 py-2 rounded bg-[#1f2937] text-white"
                />
            </div>

            {/* Unit */}
            <div className="col-span-1 text-sm text-gray-300 font-semibold">
                {unit}
            </div>

            {/* Cost */}
            <div className="col-span-3">
                <div className="w-full px-4 py-2 rounded bg-[#1f2937] border border-gray-700 text-cyan-400 font-semibold">
                    Rp {Math.round(cost).toLocaleString("id-ID")}
                </div>
            </div>

            {/* Delete */}
            <div className="col-span-1">
                <button
                    type="button"
                    onClick={() => {
                        const updated =
                            recipeItems.filter(
                                (_, i) => i !== index
                            );
                        setRecipeItems(updated);
                    }}
                    className="text-red-400 hover:text-red-500"
                >
                    ✕
                </button>
            </div>
        </div>
    );
})}
            {/* Tambah */}
            <button
                type="button"
                onClick={() =>
                    setRecipeItems([
                        ...recipeItems,
                        {
                            material_id: "",
                            qty: "",
                        },
                    ])
                }
                className="px-4 py-2 rounded bg-gray-700 text-white"
            >
                + Tambah Bahan
            </button>
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
    <span className="text-gray-400">
        Total HPP
    </span>

    <span className="text-xl font-bold text-orange-400">
        Rp{" "}
        {Math.round(
            recipeItems.reduce((total, row) => {
                const material = materials.find(
                    (m) =>
                        String(m.id) ===
                        String(row.material_id)
                );

                if (
                    material &&
                    Number(material.initial_qty) > 0
                ) {
                    return (
                        total +
                        (Number(
                            material.buy_price
                        ) /
                            Number(
                                material.initial_qty
                            )) *
                            Number(row.qty || 0)
                    );
                }

                return total;
            }, 0)
        ).toLocaleString("id-ID")}
    </span>
</div>

            {/* Footer */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setShowRecipeModal(false)}
                    className="px-4 py-2 rounded bg-gray-600 text-white"
                >
                    Batal
                </button>

                <button
                    type="button"
                    onClick={() => {
                        router.post(
                            `/products/${selectedProduct.id}/recipe`,
                            {
                                items: recipeItems,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowRecipeModal(false);
                                },
                            }
                        );
                    }}
                    className="px-4 py-2 rounded bg-orange-500 text-white"
                >
                    Simpan
                </button>
            </div>
        </div>
    </div>
)}

        </AuthenticatedLayout>
    );
}