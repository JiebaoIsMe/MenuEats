import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' // react router dom

import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import LandingPage from './pages/landing'
import CustomerHome from './pages/CustomerHome'
import RiderHome from './pages/RiderHome'
import BusinessOwnerHome from './pages/BusinessOwnerHome'
import OrderSummary from './pages/OrderSummary'
import CustomerOrderHistory from './pages/CustomerOrderHistory'
import BusinessOwnerOrderHistory from './pages/BusinessOwnerOrderHistory'
import RiderOrderHistory from './pages/RiderOrderHistory'
import CustomerMessaging from './pages/CustomerMessaging'
import BusinessOwnerMessaging from './pages/BusinessOwnerMessaging'
import RiderMessaging from './pages/RiderMessaging'
import EditRestaurantInfo from './pages/EditRestaurantInfo'
import ManageMenu from './pages/ManageMenu'
import Profile from './pages/Profile'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/rider" element={<RiderHome />} />
          <Route path="/business" element={<BusinessOwnerHome />} />
          <Route path="/order-confirmation" element={<OrderSummary />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/customer-order-history" element={<CustomerOrderHistory />} />
          <Route path="/business-order-history" element={<BusinessOwnerOrderHistory />} />
          <Route path="/rider-order-history" element={<RiderOrderHistory />} />
          <Route path="/customer-messaging" element={<CustomerMessaging />} />
          <Route path="/business-messaging" element={<BusinessOwnerMessaging />} />
          <Route path="/rider-messaging" element={<RiderMessaging />} />
          <Route path="/edit-restaurant-info" element={<EditRestaurantInfo />} />
          <Route path="/manage-menu" element={<ManageMenu />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App
