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
      {/* <Navbar /> */}

      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/hirer/*" element={<HirerLayout />}>
            <Route index element={<HirerDashboard />} />
            <Route path="hire-machine" element={<HireMachines />} />
            <Route path="view-legal-agreement" element={<HireMachines />} />
            <Route path="view-code-conduct" element={<HireMachines />} />
            <Route path="change-password" element={<HireMachines />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>


    </>


  );
};
export default App;
