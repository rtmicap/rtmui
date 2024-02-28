import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { HomeOutlined, InfoCircleOutlined, DollarCircleOutlined, PhoneOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';
import './Navbar.css';
const { Header } = Layout;


const Navbar = () => {
  return (
    <Header className="navbar">
      <div className="logo">
        <img src={''} alt="Company Logo" />
      </div>
      <Menu theme="light" mode="horizontal" defaultSelectedKeys={['home']} className="menu">
        <Menu.Item key="home">Home</Menu.Item>
        <Menu.Item key="about">About Us</Menu.Item>
        <Menu.Item key="pricing">Pricing</Menu.Item>
        <Menu.Item key="contact">Contact Us</Menu.Item>
      </Menu>
    </Header>
  );
};

export default Navbar;
