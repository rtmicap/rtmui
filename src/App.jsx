import React from 'react';
import { FileAddOutlined, UserOutlined, BookOutlined, LogoutOutlined, RestOutlined, DashboardOutlined, ContainerOutlined, SnippetsOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import PrivateRoutes from './utils/PrivateRoutes';
import HirerDashboard from './components/Hirer/HirerDashboard';
import Navbar from './components/Navbar/Navbar';
import { Footer } from 'antd/es/layout/layout';
import HirerLayout from './components/Hirer/HirerLayout';
import HireMachines from './components/Hirer/HireMachines';
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
import Booking from './components/Hirer/Booking/Booking';
import RegisterMachines from './components/Register Machines/RegisterMachines';

const App = () => {
  const navigate = useNavigate();

  const navigateMenuItems = (value) => {
    console.log("value: ", value);
    navigate(value.key)
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <>
      {/* <AppHeader /> */}

      <Routes>
        {/* With Auth */}
        <Route element={<PrivateRoutes />}>
          <Route path="/*" element={<HirerLayout />}>
            <Route index element={<HirerDashboard />} />
            <Route path="hire-machine" element={<HireMachines />} />
            <Route path="register-machine" element={<RegisterMachines />} />
            <Route path="view-legal-agreement" element={<HireMachines />} />
            <Route path="view-code-conduct" element={<HireMachines />} />
            <Route path="change-password" element={<HireMachines />} />
            <Route path="hire-machine/booking/:machineId" element={<Booking />} />
          </Route>
          {/* Tools */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path='buy-tools' element={<BuyTools />} />
            <Route path="rent-tools" element={<RentTools />} />
            <Route path="sell-tools" element={<SellTools />} />
          </Route>
          {/* Gauges */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path='buy-gauges' element={<BuyGauges />} />
            <Route path="rent-gauges" element={<RentGauges />} />
            <Route path="sell-gauges" element={<SellGauges />} />
          </Route>
          {/* Raw Material */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path='sell-raw-materials' element={<RawMaterial />} />
          </Route>
          {/* Scrap */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path='sell-scrap' element={<SellScrap />} />
          </Route>
          {/* Settings */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path='settings' element={<Settings />} />
          </Route>

          {/* Documents */}
          <Route path="/*" element={<HirerLayout />}>
            <Route path="view-legal-docs" element={<RentGauges />} />
            <Route path="view-code-conduct" element={<SellGauges />} />
            <Route path="view-company-guidelines" element={<SellGauges />} />
          </Route>

        </Route>

        {/* Without Auth */}
        <Route path="/home" element={<HomePage />}/>
        <Route path="/register-account" element={<RegistrationAccount />} />
        <Route path="/login" element={<Login />} />
      </Routes>


    </>


  );
};
export default App;
