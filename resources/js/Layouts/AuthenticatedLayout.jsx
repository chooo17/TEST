import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import Sidebar from "@/Components/Sidebar";
import SearchBar from "@/Components/SearchBar";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function AuthenticatedLayout({ header, children, openCart, hideSearch = false }) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("sidebar")) ?? true;
        } catch {
            return true;
        }
    });
    const { isDark, toggle } = useDarkMode();

    useEffect(() => {
        localStorage.setItem("sidebar", JSON.stringify(open));
    }, [open]);

    return (
        <div className={`h-screen flex transition-colors duration-300 ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-orange-400 via-orange-300 to-orange-200"}`}>

            {/* SIDEBAR (FIXED) */}
            <Sidebar open={open} setOpen={setOpen} isDark={isDark} />

            {/* SPACER */}
            <div className={`transition-all duration-300 ${open ? "w-60" : "w-20"}`} />

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col">

                {/* SEARCH — hanya tampil jika tidak di-hide */}
                {!hideSearch && (
                    <div className="px-4 pt-2">
                        <div className={`transition-all duration-300 ${openCart ? "mr-[320px]" : "mr-0"}`}>
                            <SearchBar onSearch={setSearch} />
                        </div>
                    </div>
                )}

                {/* Dark mode toggle button */}
                <div className="absolute top-3 right-4 z-30">
                    <button onClick={toggle}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-sm">
                        {isDark
                            ? <SunIcon className="w-5 h-5 text-yellow-300" />
                            : <MoonIcon className="w-5 h-5 text-white" />}
                    </button>
                </div>


                {/* MAIN */}
                <main className="flex-1 overflow-auto px-4 pt-3">
                    {children}
                </main>

            </div>
        </div>
    );
}