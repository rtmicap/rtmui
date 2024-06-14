import React, { useEffect } from 'react';
import { FileAddOutlined, UserOutlined, BookOutlined, LogoutOutlined, RestOutlined, DashboardOutlined, ContainerOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Menu, theme } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import RentTools from './components/Tools/RentTools';
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

const App = () => {
  // const {
  //   token: { colorBgContainer, borderRadiusLG },
  // } = theme.useToken();


  // const token = localStorage.getItem('authToken');
  // console.log("localStorage.getItem('authToken'): ", token);

  return (
    <>
      {/* <AppHeader /> */}
      <Routes>
        {/* With Auth */}
        <Route element={<PrivateRoutes />}>
          <Route path="/*" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="hire-machine" element={<HireMachines />} />
            <Route path="register-machine" element={<RegistrationMachines />} />
            <Route path="view-legal-agreement" element={<HireMachines />} />
            <Route path="view-code-conduct" element={<HireMachines />} />
            <Route path="change-password" element={<HireMachines />} />
            {/* <Route path="hire-machine/booking/:machineId" element={<Booking />} /> */}
            <Route path="hire-machine/book-machine/:machineId" element={<BookingMachines />} />
            {/* Tools */}
            <Route path='buy-tools' element={<BuyTools />} />
            <Route path="rent-tools" element={<RentTools />} />
            <Route path="sell-tools" element={<SellTools />} />

            {/* Quotes */}
            <Route path='quotes' element={<Quotes />} />

            {/* Orders */}
            <Route path='orders' element={<Orders />} />

            {/* My Bookings */}
            <Route path='my-bookings' element={<MyBookings />} />

            {/* Gauges */}
            <Route path='buy-gauges' element={<BuyGauges />} />
            <Route path="rent-gauges" element={<RentGauges />} />
            <Route path="sell-gauges" element={<SellGauges />} />
            {/* Raw Material */}
            <Route path='sell-raw-materials' element={<RawMaterial />} />

            {/* Scrap */}
            <Route path='sell-scrap' element={<SellScrap />} />
            {/* Settings */}
            <Route path='settings' element={<Settings />} />
            {/* Documents */}
            <Route path="view-legal-docs" element={<RentGauges />} />
            <Route path="view-code-conduct" element={<SellGauges />} />
            <Route path="view-company-guidelines" element={<SellGauges />} />

          </Route>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index path="dashboard" element={<AdminDashboard />} />
            <Route path="list-users" element={<ListOfUsers />} />
          </Route>
          <Route path="*" element={<Missing />} />
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
