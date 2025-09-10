import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";


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

import AccountSettings from './pages/vendor/AccountSettings';

import Notification from './pages/vendor/Notification';


import ReturnsRefundsTable from './components/vendor/ReturnsRefundsTable';
import OrderDetailView from './pages/vendor/orders/OrderDetailView';
import OrderDetailEdit from './pages/vendor/orders/OrderDetailEdit';
import OrderManagement from './pages/vendor/orders/OrderManagement';
import OrdersLayout from './pages/vendor/orders/OrdersLayout';
import SupportHelp from './pages/vendor/SupportHelp';
import CreateTicket from './pages/vendor/CreateTicket';
import PaymentsEarnings from './pages/vendor/PaymentsEarnings';
import SearchFilter from './pages/admin/SearchFilter';
import AuditLogs from './pages/admin/AuditLogs';
import UserDetails from './components/admin/userAndVendor/UserDetails';
import SupportHelpAdmin from './pages/admin/SupportHelpAdmin';
import SupportResponse from './pages/admin/SupportResponse';
import SalesReport from './components/admin/reports/SalesReport';
import ReturnsReport from './components/admin/reports/ReturnsReport';
import TransactionReport from './components/admin/reports/TransactionReports';
import TaxReport from './components/admin/reports/TaxReport';
import InventoryOverview from './components/admin/inventoryControl/InventoryOverview';
import StockTable from './components/admin/inventoryControl/StockManagement';
import VendorsDoc from './components/admin/userAndVendor/VendorsDoc';
import IndexCatogery from './pages/admin/Catogery/IndexCatogery';
import NewVendorRequest from './components/admin/userAndVendor/NewVendorRequest';
import ResetPassword from './pages/auth/ResetPassword';
import VendorDetails from './components/admin/userAndVendor/VendorDetails';
import PromotionCouponForm from './components/admin/PromotionCouponForm';
import Promotions from './pages/admin/Promotions';
import PromotionLayout from './pages/admin/PromotionLayout';




function App() {
  return (
    <>
      <Routes>
        {/* Auth & Admin */}
        <Route path="/signin" element={<AdminSignIn />} />
        <Route path="/login" element={<VendorSignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/api/auth/password/reset-password/:uidb64/:token/" element={<ResetPassword />} />
        <Route path="/register/verifyOtp" element={<Verify />} />
        <Route path='/register' element={<VendorRegister />} />

        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sales-analytics" element={<SalesAnalytics />} />
          <Route path="revenue-trends" element={<CombinedChartPanel />} />
          <Route path="inventory-overview" element={<InventoryOverview />} />
          <Route path="inventory-stock" element={<StockTable />} />
          <Route path="users" element={<UserDataTable />} />
          <Route path="vendors" element={<VendorDataTable />} />
          <Route path="admins" element={<AdminOverview />} />
          <Route path="vendor-documents" element={<VendorsDoc />} />
          <Route path="Sales-Report" element={<SalesReport />} />
          <Route path="returns" element={<ReturnsReport />} />
          <Route path="transaction" element={<TransactionReport />} />
          <Route path='tax-reports' element={<TaxReport />} />
          <Route path='search-filter' element={<SearchFilter />} />
          <Route path='promotions' element={<PromotionLayout />}>
                <Route index element={<Promotions />} />
                  <Route path="promotion-form" element={<PromotionCouponForm/>} />
             </Route>
          <Route path='auditlogs' element={<AuditLogs />} />
          <Route path='user-details/:id' element={<UserDetails />} />
          <Route path='support-admin' element={<SupportHelpAdmin />} />
          <Route path='support-response' element={<SupportResponse />} />
          <Route path='index-catogery' element={<IndexCatogery />} />
          <Route path='new-vendor-request' element={<NewVendorRequest />} />
          <Route path='vendor-details/:id'element={<VendorDetails />} />

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
            <Route path=":id" element={<ProductDetailView />} />
            <Route path=":id/edit" element={<EditProduct />} />
          
          </Route>

          <Route path='returns' element={<ReturnsRefundsTable />} />
          <Route path='reviews' element={<RatingAndReviewLayout />} />
            
          <Route path='account-settings' element={<AccountSettings />}></Route>
         

          <Route path='orders' element={<OrdersLayout />} >
            <Route index element={<OrderManagement />} />
            <Route path='order-detail' element={<OrderDetailView />} />
            <Route path='edit-order' element={<OrderDetailEdit />} />
          </Route>

             <Route path='notification' element={<Notification />}/>
             <Route path='support-help' element={<SupportHelp />}/> 
             <Route path='createticket' element={<CreateTicket />}/>
             {/* <Route path='promotions' element={<PromotionLayout />}>
                <Route index element={<Promotions />} />
                  <Route path="promotion-form" element={<PromotionCouponForm/>} />
             </Route> */}
             <Route path='payments-earnings' element={<PaymentsEarnings />} />

             

        </Route>
                           

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />

    </>

  );
}

export default App;
