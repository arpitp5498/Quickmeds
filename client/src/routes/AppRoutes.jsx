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
const Landing = React.lazy(() => import('../pages/public/Landing'));
const About = React.lazy(() => import('../pages/public/About'));
const Safety = React.lazy(() => import('../pages/public/Safety'));
const Disclaimer = React.lazy(() => import('../pages/public/Disclaimer'));
const Privacy = React.lazy(() => import('../pages/public/Privacy'));
const Terms = React.lazy(() => import('../pages/public/Terms'));
const Contact = React.lazy(() => import('../pages/public/Contact'));
const Security = React.lazy(() => import('../pages/public/Security'));

// Auth Pages
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));

// Customer / Catalog Pages
const MedicineSearch = React.lazy(() => import('../pages/medicines/MedicineSearch'));
const MedicineDetail = React.lazy(() => import('../pages/medicines/MedicineDetail'));
const MedicineCategories = React.lazy(() => import('../pages/medicines/MedicineCategories'));
const EmergencyEssentials = React.lazy(() => import('../pages/medicines/EmergencyEssentials'));
const NearbyPharmacies = React.lazy(() => import('../pages/pharmacies/NearbyPharmacies'));
const PharmacyDetail = React.lazy(() => import('../pages/pharmacies/PharmacyDetail'));
const PharmacyNetworkMap = React.lazy(() => import('../pages/pharmacies/PharmacyNetworkMap'));
const Cart = React.lazy(() => import('../pages/cart/Cart'));
const Checkout = React.lazy(() => import('../pages/checkout/Checkout'));
const OrderList = React.lazy(() => import('../pages/orders/OrderList'));
const OrderDetail = React.lazy(() => import('../pages/orders/OrderDetail'));
const PrescriptionUpload = React.lazy(() => import('../pages/prescriptions/PrescriptionUpload'));
const MyPrescriptions = React.lazy(() => import('../pages/prescriptions/MyPrescriptions'));
const CustomerDashboard = React.lazy(() => import('../pages/customer/CustomerDashboard'));
const Profile = React.lazy(() => import('../pages/customer/Profile'));
const Addresses = React.lazy(() => import('../pages/customer/Addresses'));
const Notifications = React.lazy(() => import('../pages/notifications/Notifications'));
const WriteReview = React.lazy(() => import('../pages/reviews/WriteReview'));
const MedicineReminders = React.lazy(() => import('../pages/reminders/MedicineReminders'));
const CycleTracker = React.lazy(() => import('../pages/cycle/CycleTracker'));

// New Production Feature Pages
const PeriodCare = React.lazy(() => import('../pages/medicines/PeriodCare'));
const DoctorConsultation = React.lazy(() => import('../pages/customer/DoctorConsultation'));
const LabTests = React.lazy(() => import('../pages/customer/LabTests'));
const AmbulanceAssistance = React.lazy(() => import('../pages/customer/AmbulanceAssistance'));

// Pharmacy Partner Pages
const PharmacyDashboard = React.lazy(() => import('../pages/pharmacy/PharmacyDashboard'));
const PharmacyOrders = React.lazy(() => import('../pages/pharmacy/PharmacyOrders'));
const PharmacyOrderDetail = React.lazy(() => import('../pages/pharmacy/PharmacyOrderDetail'));
const PharmacyInventory = React.lazy(() => import('../pages/pharmacy/PharmacyInventory'));
const PharmacyPrescriptions = React.lazy(() => import('../pages/pharmacy/PharmacyPrescriptions'));
const PharmacyProfile = React.lazy(() => import('../pages/pharmacy/PharmacyProfile'));

// Delivery Partner Pages
const DeliveryDashboard = React.lazy(() => import('../pages/delivery/DeliveryDashboard'));
const DeliveryActive = React.lazy(() => import('../pages/delivery/DeliveryActive'));
const DeliveryHistory = React.lazy(() => import('../pages/delivery/DeliveryHistory'));
const DeliveryProfile = React.lazy(() => import('../pages/delivery/DeliveryProfile'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminPharmacies = React.lazy(() => import('../pages/admin/AdminPharmacies'));
const AdminPharmacyDetail = React.lazy(() => import('../pages/admin/AdminPharmacyDetail'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminPrescriptions = React.lazy(() => import('../pages/admin/AdminPrescriptions'));
const AdminInventoryHealth = React.lazy(() => import('../pages/admin/AdminInventoryHealth'));
const AdminAnalytics = React.lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminAuditLogs = React.lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminDoctors = React.lazy(() => import('../pages/admin/AdminDoctors'));
const PromotionManager = React.lazy(() => import('../pages/admin/PromotionManager'));

// Doctor Portal Pages
import DoctorLayout from '../layouts/DoctorLayout';
const DoctorDashboard = React.lazy(() => import('../pages/doctor/DoctorDashboard'));
const DoctorAppointments = React.lazy(() => import('../pages/doctor/DoctorAppointments'));
const DoctorConsultationDetail = React.lazy(() => import('../pages/doctor/DoctorConsultationDetail'));
const DoctorProfile = React.lazy(() => import('../pages/doctor/DoctorProfile'));

// Patient Health Records
const HealthRecords = React.lazy(() => import('../pages/customer/HealthRecords'));


const AppRoutes = () => {
  return (
    <React.Suspense fallback={<p role="status">Loading…</p>}>
    <Routes>


      {/* 1. Public Marketing & Informational Routes (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/medicines" element={<MedicineSearch />} />
        <Route path="/medicines/:id" element={<MedicineDetail />} />
        <Route path="/emergency" element={<EmergencyEssentials />} />
        <Route path="/sos" element={<EmergencyEssentials />} />
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
        <Route path="/architecture" element={<Navigate to="/" replace />} />
        <Route path="/security" element={<Security />} />
        <Route path="/research" element={<Navigate to="/" replace />} />
        <Route path="/period-care" element={<PeriodCare />} />
        <Route path="/ambulance" element={<AmbulanceAssistance />} />
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
        <Route path="/doctors" element={<DoctorConsultation />} />
        <Route path="/lab-tests" element={<LabTests />} />
        <Route path="/health-records" element={<HealthRecords />} />
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

      {/* 5b. Doctor Portal Routes (DoctorLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/appointments/:id" element={<DoctorConsultationDetail />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
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
        <Route path="/admin/inventory-health" element={<AdminInventoryHealth />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/promotions" element={<PromotionManager />} />
      </Route>

      {/* Catch-all 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
