import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// auth
import AdminSignIn from './pages/auth/AdminSignin';
import VendorSignIn from './pages/auth/VendorSignin';
import ForgotPassword from './pages/auth/ForgotPassword';
import VendorRegister from './pages/auth/vendorRegister';
import Verify from './pages/auth/Verify';
import CompanyDetails from './pages/vendor/registerforms/CompanyDetailsForm';
import VendorRegisterLayout from './pages/vendor/registerforms/VenderRgisterLayout';
import ContactDetailsForm from './pages/vendor/registerforms/ContactDetailsForm';
import KYCDocumentsUpload from './pages/vendor/registerforms/KYCDocUpload';
import BusinessDocumentsUpload from './pages/vendor/registerforms/BusinessDocumentsUpload';
import BankTaxDetailsUpload from './pages/vendor/registerforms/BankTaxDetailsUpload';
import AgreementsUpload from './pages/vendor/registerforms/AgreementsUpload';

// admin routes
import AdminHome from './pages/admin/AdminHome';

// vendor routes
import VendorHome from './pages/vendor/VendorHome';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import ProductLayout from './pages/vendor/ProductsLayout';
import AddProduct from './pages/vendor/products/AddProduct';
import ProductDetailView from './pages/vendor/products/ProductDetailView';
import EditProduct from './pages/vendor/products/EditProduct';
import ProductList from './pages/vendor/products/ManageProduct';
import AdminDashboard from './pages/admin/AdminDashboard';
import SalesAnalytics from './pages/admin/SalesAnalytics';
import CombinedChartPanel from './pages/admin/RevenueTrends';
import UserDataTable from './components/admin/userAndVendor/UserData';
import VendorDataTable from './components/admin/userAndVendor/VendorData';
import AdminOverview from './components/admin/userAndVendor/AdminsData';
import RatingAndReviewLayout from './pages/vendor/ratings&reviews/RatingAndReviewLayout';
import RevenueChart from './components/vendor/RevenueChart';

function App() {
  return (

    <>
      <Routes>
        {/* Auth & Admin */}
        <Route path="/signin" element={<AdminSignIn />} />
        {/* <Route path="/admin" element={<AdminHome />} /> */}
        <Route path="/login" element={<VendorSignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register/verifyOtp" element={<Verify />} />
        <Route path='/register' element={<VendorRegister />} />

        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sales-analytics" element={<SalesAnalytics />} />
          <Route path="revenue-trends" element={<CombinedChartPanel />} />
          <Route path="users" element={<UserDataTable />} />
          <Route path="vendors" element={<VendorDataTable />} />
          <Route path="admins" element={<AdminOverview />} />
          <Route path="Sales Report" element={<UserDataTable />} />
          <Route path="vendors" element={<VendorDataTable />} />
          <Route path="admins" element={<AdminOverview />} />


        </Route>

        {/* Vendor Register Steps (Nested under /vendor-register) */}
        <Route path="/vendor-register" element={<VendorRegisterLayout />}>
          <Route path="company-details" element={<CompanyDetails />} />
          <Route path="contact-details" element={<ContactDetailsForm />} />
          <Route path="kyc-documents" element={<KYCDocumentsUpload />} />
          <Route path="business-documents" element={<BusinessDocumentsUpload />} />
          <Route path="bank-details" element={<BankTaxDetailsUpload />} />
          <Route path="agreements" element={<AgreementsUpload />} />
        </Route>

        {/* Vendor Dashboard */}
        <Route path="/vendor" element={<VendorHome />} >
          <Route path='dashboard' element={<VendorDashboard />} />
          <Route path='profile' element={<VendorProfile />} />
          <Route path="products" element={<ProductLayout />}>
            <Route index element={<ProductList />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="1" element={<ProductDetailView />} />
            <Route path="1/edit" element={<EditProduct />} />
            {/* <Route path="product/:productId" element={<ProductView />} /> */}
          </Route>
          <Route path='reviews' element={<RatingAndReviewLayout />} />
          <Route path='orders' element={<RevenueChart />} />

        </Route>

        {/* <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path='/vendor/Products' element={<ProductList/>}/>
        <Route path="/vendor/add" element={<AddProduct />} />
   */}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />

    </>
  );
}

export default App;
