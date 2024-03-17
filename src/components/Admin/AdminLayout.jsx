import { Layout, theme, Menu } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
const { Header, Content, Footer, Sider } = Layout;

function AdminLayout() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <>
            <AdminSidebar />
        </>
    )
}

export default AdminLayout;