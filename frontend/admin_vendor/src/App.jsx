import { Route, Routes } from 'react-router-dom'
import './App.css'
import AdminSignIn from './pages/auth/AdminSignin'
import VendorSignIn from './pages/auth/VendorSignin'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorHome from './pages/vendor/VendorHome'
import AdminHome from './pages/admin/AdminHome'

function App() {
  

  return (
<>
<Routes>
  {/* protected route --------todo */}
  <Route path='/signin' element={<AdminSignIn />} />
  <Route path="/admin" element={<AdminHome />} />
  <Route path='/Vendor-Signin' element={<VendorSignIn />} />
  <Route path="/vendor" element={<VendorHome />} />
  {/* Add more routes as needed */}

</Routes>
</>
  )
}

export default App
