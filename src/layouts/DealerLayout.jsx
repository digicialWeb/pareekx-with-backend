import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, PlusCircle, ShoppingCart, UserCircle, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { logout as firebaseLogout } from "../utils/auth";

const DealerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dealer/dashboard", icon: LayoutDashboard },
    { label: "My Orders", path: "/dealer/orders", icon: ShoppingCart },
    { label: "New Order", path: "/dealer/orders/new", icon: PlusCircle },
    { label: "My Profile", path: "/dealer/profile", icon: UserCircle },
  ];

  const handleLogout = async () => {
    await firebaseLogout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen">
        <aside className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-[#26110d] text-white shadow-2xl transition-transform duration-300 lg:w-64 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
            <div><h1 className="text-2xl font-black tracking-tight">PareekX</h1><p className="mt-1 text-xs text-slate-400">Dealer Panel</p></div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu"><X size={20} /></button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? "bg-gradient-to-r from-[#B5220E] to-[#E4572E] text-white shadow-lg shadow-red-950/30" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /><span>{item.label}</span></NavLink>;
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"><LogOut size={18} />Logout</button>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
                <div className="min-w-0"><h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">Dealer Panel</h2><p className="hidden text-xs text-slate-500 sm:block">Manage your orders and account</p></div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <NavLink to="/dealer/profile" className={({ isActive }) => `flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold transition sm:px-3 ${isActive ? "bg-[#B5220E]/10 text-[#B5220E]" : "text-slate-600 hover:bg-slate-100"}`}><UserCircle size={18} /><span className="hidden sm:inline">My Profile</span></NavLink>
                <div className="hidden rounded-xl bg-[#B5220E]/10 px-3 py-2 text-sm font-bold text-[#B5220E] sm:block">PareekX</div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6"><Outlet /></main>
        </div>
      </div>
    </div>
  );
};

export default DealerLayout;
