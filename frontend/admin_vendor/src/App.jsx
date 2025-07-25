import { Route, Routes } from 'react-router-dom';
import './App.css';
import AdminSignIn from './pages/auth/AdminSignin';
import VendorSignIn from './pages/auth/VendorSignin';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorHome from './pages/vendor/VendorHome';
import AdminHome from './pages/admin/AdminHome';
import VendorProfile from './pages/vendor/VendorProfile';
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
import OrderDetailView from './pages/vendor/orders/OrderDetailView';
import OrderDetailEdit from './pages/vendor/orders/OrderDetailEdit';
import OrderManagement from './pages/vendor/orders/OrderManagement';

function App() {
  return (
    <Routes>
      {/* Auth & Admin */}
      <Route path="/signin" element={<AdminSignIn />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/login" element={<VendorSignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register/verifyOtp" element={<Verify />} />
        <Route path='/register' element={<VendorRegister/>} />

      {/* Vendor Register Steps (Nested under /vendor-register) */}
       <Route path="/vendor-register" element={<VendorRegisterLayout/>}>
        <Route path="company-details" element={<CompanyDetails />} />
        <Route path="contact-details" element={<ContactDetailsForm />} />
        <Route path="kyc-documents" element={<KYCDocumentsUpload />} />
        <Route path="business-documents" element={<BusinessDocumentsUpload />} />
        <Route path="bank-details" element={<BankTaxDetailsUpload />} />
        <Route path="agreements" element={<AgreementsUpload/>} />
      </Route>

      {/* Vendor Dashboard */}
      <Route path="/vendor" element={<VendorHome />} />
      <Route path="/vendor/orders" element={<OrderDetailView />} />
      <Route path="/vendor/profile" element={<VendorProfile />} />
       <Route path='/vendor/order' element={<OrderManagement/>}/>

       <Route path='/vendor/orders/1' element={<OrderDetailView/>}/>
       <Route path='/vendor/orders/2' element={<OrderDetailEdit/>}/>'

    </Routes>
  );
}

export default App;
