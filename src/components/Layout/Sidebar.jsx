import { Layout, Menu, message, theme, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
import {
    FileAddOutlined, SettingOutlined, BookOutlined, LogoutOutlined, CalendarOutlined, DashboardOutlined, ToolOutlined, FieldTimeOutlined, FormatPainterOutlined, PlusSquareOutlined, MinusSquareOutlined, CheckSquareOutlined, ScissorOutlined,
    ContactsOutlined, UnorderedListOutlined, CreditCardOutlined, FileProtectOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from "react";
import Navbar from '../Navbar/Navbar'


function getItem(label, key, icon, children) {

    return {
        key,
        icon,
        children,
        label,
    };
}


const items = [
    getItem('Dashboard', '/', <DashboardOutlined />),
    // getItem('Register a Machine', 'register-machine', <FileAddOutlined />),
    // getItem('Hire a Machine', 'hire-machine', <CalendarOutlined />),
    getItem('Machines', 'machines', <ToolOutlined />, [
        getItem('Register Machines', 'register-machine', <FileAddOutlined />),

        getItem('My Registered Machines', 'my-registered-machines', <CalendarOutlined />),
    ]),
    // getItem('Review Booking', 'review-booking', <ContactsOutlined />),
    getItem('Hire Machines', 'hire-machine', <CalendarOutlined />),
    getItem('Bookings Calendar', 'bookings-calendar', <CalendarOutlined />),
    getItem('Quotes', 'quotes', <ContactsOutlined />),
    getItem('Orders', 'orders', <UnorderedListOutlined />),
    // getItem('My Bookings', 'my-bookings', <UnorderedListOutlined />),
    // getItem('Payment', 'payment', <CreditCardOutlined />),
    getItem('Tools', 'tools', <ToolOutlined />, [
        getItem('Buy Tools', 'buy-tools', <PlusSquareOutlined />),
        getItem('Sell Tools', 'my-tools', <CheckSquareOutlined />),
    ]),
    getItem('Gauges', 'gauges', <FieldTimeOutlined />, [
        getItem('Buy Gauges', 'buy-gauges', <PlusSquareOutlined />),
        getItem('Sell Gauges', 'my-gauges', <MinusSquareOutlined />),
    ]),
    getItem('Scrap', 'scrap', <FieldTimeOutlined />, [
        getItem('Buy Scrap', 'buy-scrap', <PlusSquareOutlined />),
        getItem('Sell Scrap', 'my-scrap', <MinusSquareOutlined />),
    ]),
    getItem('Raw-Material', 'RawMat', <FieldTimeOutlined />, [
        getItem('Buy Raw-Material', 'buy-rawmat', <PlusSquareOutlined />),
        getItem('Sell Raw-Material', 'my-rawmat', <MinusSquareOutlined />),
    ]),
    getItem('Sell Raw Material', 'sell-raw-materials', <FormatPainterOutlined />),
    getItem('Sell Scrap', 'sell-scrap', <ScissorOutlined />),
    // getItem('Documents', 'documents', <BookOutlined />, [
    //     getItem('View Legal Agreement', 'view-legal-docs'),
    //     getItem('View Code of Conduct', 'view-code-conduct'),
    //     getItem('View Company Guidelines', 'view-company-guidelines', null),
    // ]),
    getItem('Settings', 'settings', <SettingOutlined />,
        [
            getItem('Profile', 'profile', <FileProtectOutlined />),
        ]),
    getItem('Co-Ordinators', 'coordinators', <FileAddOutlined />),
    getItem('Logout', 'logout', <LogoutOutlined />),
]

function Sidebar() {
    const [sideNav, setSideNav] = useState("sidebar");
    const { userSignOut, authUser } = useAuth();
    const navigate = useNavigate();

    const navigateMenuItems = (value) => {
        // console.log("value: ", value);
        if (value.key == 'logout') { // if key is logout 
            userSignOut((response) => {
                // console.log("logout: ", response);
                if (response && response.status) {
                    message.success(response.message);
                    navigate('/login');
                }
            });
        } else { // navigate to other component
            if (value.key == 'buy-gauges' || value.key == 'my-gauges') {
                sessionStorage.setItem('searchParam', '{"category":"Gauges","query":"","condition":"both","type":"both"}');
            }

            if (value.key == 'buy-tools' || value.key == 'my-tools') {
                sessionStorage.setItem('searchParam', '{"category":"Tools","query":"","condition":"both","type":"both"}');
            }

            if (value.key == 'buy-scrap' || value.key == 'my-scrap') {
                sessionStorage.setItem('searchParam', '{"category":"Scrap","query":"","condition":"both","type":"both"}');
            }

            if (value.key == 'buy-rawmat' || value.key == 'my-rawmat') {
                sessionStorage.setItem('searchParam', '{"category":"Rawmat","query":"","condition":"both","type":"both"}');
            }

            navigate(value.key)
            // if any side menu clicked then registered machines will be removed
            var existingFormDataArray = JSON.parse(localStorage.getItem('machines')) || [];
            if (existingFormDataArray && existingFormDataArray.length > 0) {
                localStorage.removeItem('machines');
            }
        }
    }

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    className={sideNav}
                    onBreakpoint={(broken) => {
                        // console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        console.log(collapsed, type);
                        !collapsed ? setSideNav("sidebar") : setSideNav("");
                    }}
                >
                    <div className="demo-logo-vertical">
                        <h3 style={{ color: 'white', textAlign: 'center' }}>Logo</h3>
                    </div>
                    <div style={{ color: 'white', textAlign: 'center' }}>{authUser && authUser.companyName}</div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={window.location.pathname} onClick={navigateMenuItems} items={items} />
                </Sider>

                {/* Content Goes here */}
                <Layout>

                    <Content className="contentPage">

                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                // textAlign: 'center',
                            }}
                        >
                            <Outlet />
                        </div>
                    </Content>

                </Layout>

            </Layout>
        </>
    )
}

export default Sidebar;