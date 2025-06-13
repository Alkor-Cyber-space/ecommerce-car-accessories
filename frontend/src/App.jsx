import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Register from './pages/auth/Register'
import VendorLogin from './pages/auth/VendorLogin'
import ResetPassword from './pages/auth/ResetPassword'
import LandingPage from './pages/LandingPage'

function App() {

  return (
    <>
   <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/vendor-login" element={<VendorLogin />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

   </Routes>
    </>
  )
}

export default App
