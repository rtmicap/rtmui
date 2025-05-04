import React, { useEffect, useState } from 'react';
import { FileAddOutlined, UserOutlined, BookOutlined, LogoutOutlined, RestOutlined, DashboardOutlined, ContainerOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Menu, message, theme } from 'antd';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import PrivateRoutes from './utils/PrivateRoutes';
import Dashboard from './components/Layout/Dashboard';
import Navbar from './components/Navbar/Navbar';
import { Footer } from 'antd/es/layout/layout';
import Layout from './components/Layout/Layout';
import HireMachines from './components/Hire Machines/HireMachines';
import AppHeader from './components/AppHeader/AppHeader';
import HomePage from './components/Homepage/HomePage';
// Tools
import BuyTools from './components/Tools/BuyTools';
import Tools_detail from './components/Tools/Tools_detail';
import MyTools from './components/Tools/MyTools';
import SellTools from './components/Tools/SellTools';
// gauges
import BuyGauges from './components/Gauges/BuyGauges';
import RentGauges from './components/Gauges/RentGauges';
import SellGauges from './components/Gauges/SellGauges';

import RawMaterial from './components/RawMaterial/RawMaterial';
import SellScrap from './components/Scrap/SellScrap';
import Settings from './components/Settings/Settings';
import RegistrationAccount from './components/Registration Supplier/RegistrationAccount';
import RegistrationMachines from './components/Register Machines/RegistrationMachines';
import SuccessMessage from './components/Registration Supplier/SuccessMessage';
import { useAuth } from './contexts/AuthContext';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import ListOfUsers from './components/Admin/Users/ListOfUsers';
import Missing from './components/Missing';
import Quotes from './components/Quotes/Quotes';
import Orders from './components/Orders/Orders';
import MyBookings from './components/My Bookings/MyBookings';
import BookingMachines from './components/Booking Machines/BookingMachines';
import MyRegisteredMachines from './components/MyRegisteredMachines/MyRegisteredMachines';
import ReviewBooking from './components/Review Booking/ReviewBooking';
import Payment from './components/Payment/Payment';
import OrderDetailPage from './components/Orders/Order Detail Page/OrderDetailPage';
import Shipment from './components/Shipment/Shipment';
import SampleReports from './components/Sample Reports/SampleReports';
import FinalReports from './components/Final Reports/FinalReports';
import './App.scss';
import EditMachine from './components/EditMachine/EditMachine';
import ManageCoordinator from './components/Profile/coordinator/ManageCoordinator';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  //console.log("from localStorage: ", token);

  // const { authUser } = useAuth();

  /*if (token) {
    console.log("test auth error- Token available.");
  } else {
    if (location.pathname !== '/login') {
      console.log("No token: Redirecting to login...");
      message.warning("Your session has expired. Please login again!");
      navigate('/login');
      return;
    }
  } */

  // USer Idle timer
  const [isIdle, setIsIdle] = useState(false);
  let timeoutId;

  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setIsIdle(true);

      localStorage.clear("authToken");
      navigate("/login");
      // Perform logout or display timeout message here
    }, 1200000); // 20 minutes
  };

  useEffect(() => {
    const handleUserActivity = () => {
      setIsIdle(false);
      resetTimer();
    };
    // Initial timer setup
    resetTimer();
    // Event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    // Cleanup function to remove event listeners and clear timeout
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, []);

  //end idel timer code

  return (
    <>
      {/* <AppHeader /> */}
      <Routes>
        {/* With Auth */}
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="hire-machine" element={<HireMachines />} />
            <Route path="register-machine" element={<RegistrationMachines />} />
            <Route path="my-registered-machines" element={<MyRegisteredMachines />} />
            <Route path="view-legal-agreement" element={<HireMachines />} />
            <Route path="view-code-conduct" element={<HireMachines />} />
            <Route path="change-password" element={<HireMachines />} />
            <Route path="my-registered-machines/edit-machine/:machineId" element={<EditMachine />} />
            {/* <Route path="hire-machine/booking/:machineId" element={<Booking />} /> */}
            <Route path="hire-machine/book-machine/:machineId" element={<BookingMachines />} />
            {/* Tools */}
            <Route path='buy-tools' element={<BuyTools />} />
            <Route path='tools-detail' element={<Tools_detail />} />
            <Route path="my-tools" element={<MyTools />} />
            <Route path="sell-tools" element={<SellTools />} />


             {/* Gauges */}
            <Route path='buy-gauges' element={<BuyTools />} />
            <Route path='tools-detail' element={<Tools_detail />} />
            <Route path="my-gauges" element={<MyTools />} />
            {/* <Route path="sell-gauges" element={<SellTools />} /> */}


            {/* Quotes */}
            <Route path='quotes' element={<Quotes />} />

            {/* review-booking */}
            <Route path='review-booking' element={<ReviewBooking />} />

            {/* Orders */}
            <Route path='orders' element={<Orders />} />
            <Route path="order-details/:orderId" element={<OrderDetailPage />} />
            <Route path="order-details/:orderId/shipment-details" element={<Shipment />} />
            <Route path="order-details/:orderId/sample-report" element={<SampleReports />} />
            <Route path="order-details/:orderId/final-report" element={<FinalReports />} />
            {/* My Bookings */}
            <Route path='my-bookings' element={<MyBookings />} />

            {/* payment */}
            <Route path='payment' element={<Payment />} />

           
            {/* Raw Material */}
            <Route path='sell-raw-materials' element={<RawMaterial />} />

            {/* Scrap */}
            <Route path='sell-scrap' element={<SellScrap />} />
            {/* Settings */}
            {/* <Route path='settings' element={<Settings />} /> */}
            <Route path='coordinators' element={<ManageCoordinator />} />
            {/* Documents */}
            <Route path="view-legal-docs" element={<RentGauges />} />
            <Route path="view-code-conduct" element={<SellGauges />} />
            <Route path="view-company-guidelines" element={<SellGauges />} />

            {/* Shipments Details */}
            <Route path="shipment-details" element={<Shipment />} />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index path="dashboard" element={<AdminDashboard />} />
            <Route path="list-users" element={<ListOfUsers />} />
          </Route>
        </Route>

        {/* Without Auth */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register-account" element={<RegistrationAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={<SuccessMessage />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </>

  );
};
export default App;
