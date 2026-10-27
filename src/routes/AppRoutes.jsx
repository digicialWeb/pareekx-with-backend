import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import DealerLayout from "../layouts/DealerLayout";
import SalespersonLayout from "../layouts/SalespersonLayout";

import ProtectedRoute from "./ProtectedRoute";

// Auth
import AdminLogin from "../pages/auth/AdminLogin";
import Signup from "../pages/auth/Signup";
import UserLogin from "../pages/auth/UserLogin";

// Admin
import AdminOrders from "../pages/admin/AdminOrders";
import AdminDashboard from "../pages/admin/Dashboard";
import Dealers from "../pages/admin/Dealers";
import ProductionSummary from "../pages/admin/ProductionSummary";
import Products from "../pages/admin/Products";
import Salespersons from "../pages/admin/Salespersons";
import Settings from "../pages/admin/Settings";
import Shades from "../pages/admin/Shades";
import Transports from "../pages/admin/Transports";
import WhatsAppNotifications from "../pages/admin/WhatsAppNotifications";

// Salesperson
import SalespersonDealers from "../pages/salesperson/Dealers";
import SalespersonOrders from "../pages/salesperson/MyOrders";
import SalespersonProfile from "../pages/salesperson/Profile";
import SalespersonDashboard from "../pages/salesperson/SalespersonDashboard";
import SalespersonSettings from "../pages/salesperson/Settings";

// Orders
import NewOrder from "../pages/orders/NewOrder";

// Dealer
import DealerDashboard from "../pages/dealer/DealerDashboard";
import DealerProfile from "../pages/dealer/DealerProfile";
import DealerOrders from "../pages/dealer/MyOrders";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =====================================================
          ROOT
      ===================================================== */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* =====================================================
          AUTH
      ===================================================== */}

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/login" element={<UserLogin />} />

      <Route path="/signup" element={<Signup />} />

      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="orders" element={<AdminOrders />} />

          <Route path="production" element={<ProductionSummary />} />

          <Route path="dealers" element={<Dealers />} />

          <Route path="salespersons" element={<Salespersons />} />

          <Route path="products" element={<Products />} />

          <Route path="shades" element={<Shades />} />

          <Route path="transports" element={<Transports />} />

          <Route path="whatsapp" element={<WhatsAppNotifications />} />

          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* =====================================================
          SALESPERSON
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["SALESPERSON"]} />}>
        <Route path="/salesperson" element={<SalespersonLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<SalespersonDashboard />} />

          <Route path="orders" element={<SalespersonOrders />} />

          <Route path="orders/new" element={<NewOrder role="salesperson" />} />
          <Route path="dealers" element={<SalespersonDealers />} />
          <Route path="profile" element={<SalespersonProfile />} />
          <Route path="settings" element={<SalespersonSettings />} />
        </Route>
      </Route>

      {/* =====================================================
          DEALER
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["DEALER"]} />}>
        <Route path="/dealer" element={<DealerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DealerDashboard />} />
          <Route path="profile" element={<DealerProfile />} />

          <Route path="orders" element={<DealerOrders />} />

          <Route path="orders/new" element={<NewOrder role="dealer" />} />
        </Route>
      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
