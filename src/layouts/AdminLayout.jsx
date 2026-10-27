import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Users,
  UserRound,
  Package,
  Palette,
  Truck,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { logout as firebaseLogout } from "../utils/auth";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Production Summary",
    path: "/admin/production",
    icon: Factory,
  },
  {
    label: "Dealers",
    path: "/admin/dealers",
    icon: Users,
  },
  {
    label: "Salespersons",
    path: "/admin/salespersons",
    icon: UserRound,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Shades",
    path: "/admin/shades",
    icon: Palette,
  },
  {
    label: "Transports",
    path: "/admin/transports",
    icon: Truck,
  },
  {
    label: "WhatsApp",
    path: "/admin/whatsapp",
    icon: MessageSquare,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await firebaseLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          bg-gradient-to-b from-white to-orange-50/40 border-r border-slate-200
          transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pareek
            </h1>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Order Management
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#B5220E] to-[#E4572E] text-white shadow-md shadow-red-950/15"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Page Branding */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              Admin Portal
            </p>
            <p className="text-xs text-slate-400">
              Manage your orders and operations
            </p>
          </div>

          {/* Profile */}
          <div className="relative ml-auto">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#B5220E] to-[#E4572E] text-sm font-semibold text-white">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Admin
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  onClick={() => navigate("/admin/settings")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
