import { Route, Routes } from 'react-router-dom'
import './App.css'
import AdminSignIn from './pages/auth/AdminSignin'
import VendorSignIn from './pages/auth/VendorSignin'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorHome from './pages/vendor/VendorHome'
import AdminHome from './pages/admin/AdminHome'
import VendorProfile from './pages/vendor/VendorProfile'
import ForgotPassword from './pages/auth/ForgotPassword'
import VendorRegister from './pages/auth/vendorRegister'
import Verify from './pages/auth/Verify'

function App() {
  

  return (
<>
<Routes>
  {/* protected route --------todo */}
  <Route path='/signin' element={<AdminSignIn />} />
  <Route path="/admin" element={<AdminHome />} />
  <Route path='/login' element={<VendorSignIn />} />
  <Route path='/register' element={<VendorRegister />} />
  <Route path="/register/verify" element={<Verify />} />
  <Route path="/vendor" element={<VendorHome />} />
  <Route path='/vendor/profile' element={<VendorProfile/>}/>
  <Route path='/forgot-password' element={<ForgotPassword />} />
  {/* Add more routes as needed */}

</Routes>
</>
  )
}

export default App
