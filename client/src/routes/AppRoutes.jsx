import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PharmacyLayout from '../layouts/PharmacyLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Landing from '../pages/public/Landing';
import About from '../pages/public/About';
import Safety from '../pages/public/Safety';
import Disclaimer from '../pages/public/Disclaimer';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';
import Contact from '../pages/public/Contact';
import Architecture from '../pages/public/Architecture';
import Security from '../pages/public/Security';
import Research from '../pages/public/Research';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Customer / Catalog Pages
import MedicineSearch from '../pages/medicines/MedicineSearch';
import MedicineDetail from '../pages/medicines/MedicineDetail';
import MedicineCategories from '../pages/medicines/MedicineCategories';
import NearbyPharmacies from '../pages/pharmacies/NearbyPharmacies';
import PharmacyDetail from '../pages/pharmacies/PharmacyDetail';
import PharmacyNetworkMap from '../pages/pharmacies/PharmacyNetworkMap';
import Cart from '../pages/cart/Cart';
import Checkout from '../pages/checkout/Checkout';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import PrescriptionUpload from '../pages/prescriptions/PrescriptionUpload';
import MyPrescriptions from '../pages/prescriptions/MyPrescriptions';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import Profile from '../pages/customer/Profile';
import Addresses from '../pages/customer/Addresses';
import Notifications from '../pages/notifications/Notifications';
import WriteReview from '../pages/reviews/WriteReview';
import MedicineReminders from '../pages/reminders/MedicineReminders';
import CycleTracker from '../pages/cycle/CycleTracker';

// Pharmacy Partner Pages
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard';
import PharmacyOrders from '../pages/pharmacy/PharmacyOrders';
import PharmacyOrderDetail from '../pages/pharmacy/PharmacyOrderDetail';
import PharmacyInventory from '../pages/pharmacy/PharmacyInventory';
import PharmacyPrescriptions from '../pages/pharmacy/PharmacyPrescriptions';
import PharmacyProfile from '../pages/pharmacy/PharmacyProfile';

// Delivery Partner Pages
import DeliveryDashboard from '../pages/delivery/DeliveryDashboard';
import DeliveryActive from '../pages/delivery/DeliveryActive';
import DeliveryHistory from '../pages/delivery/DeliveryHistory';
import DeliveryProfile from '../pages/delivery/DeliveryProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPharmacies from '../pages/admin/AdminPharmacies';
import AdminPharmacyDetail from '../pages/admin/AdminPharmacyDetail';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminPrescriptions from '../pages/admin/AdminPrescriptions';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Marketing & Informational Routes (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/medicines" element={<MedicineSearch />} />
        <Route path="/medicines/:id" element={<MedicineDetail />} />
        <Route path="/categories" element={<MedicineCategories />} />
        <Route path="/pharmacies" element={<NearbyPharmacies />} />
        <Route path="/pharmacies/:id" element={<PharmacyDetail />} />
        <Route path="/pharmacy-network" element={<PharmacyNetworkMap />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/security" element={<Security />} />
        <Route path="/research" element={<Research />} />
      </Route>

      {/* 2. Authentication Routes (AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* 3. Customer Protected Routes (DashboardLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/prescriptions" element={<MyPrescriptions />} />
        <Route path="/prescriptions/upload" element={<PrescriptionUpload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reviews/write" element={<WriteReview />} />
        <Route path="/reminders" element={<MedicineReminders />} />
        <Route path="/cycle-tracker" element={<CycleTracker />} />
      </Route>

      {/* 4. Pharmacy Partner Routes (PharmacyLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN']}>
            <PharmacyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/pharmacy" element={<PharmacyDashboard />} />
        <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
        <Route path="/pharmacy/orders/:id" element={<PharmacyOrderDetail />} />
        <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
        <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
        <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
      </Route>

      {/* 5. Delivery Partner Routes (DeliveryLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'ADMIN']}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/active" element={<DeliveryActive />} />
        <Route path="/delivery/history" element={<DeliveryHistory />} />
        <Route path="/delivery/profile" element={<DeliveryProfile />} />
      </Route>

      {/* 6. Admin Routes (AdminLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
        <Route path="/admin/pharmacies/:id" element={<AdminPharmacyDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* Catch-all 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
