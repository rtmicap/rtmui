import { Layout, Menu, message, theme, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
import { FileAddOutlined, SettingOutlined, BookOutlined, LogoutOutlined, CalendarOutlined, DashboardOutlined, ToolOutlined, FieldTimeOutlined, FormatPainterOutlined, PlusSquareOutlined, MinusSquareOutlined, CheckSquareOutlined, ScissorOutlined, ContactsOutlined, UnorderedListOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from "react";


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
    getItem('Machine(s)', 'machines', <ToolOutlined />, [
        getItem('Register a Machine(s)', 'register-machine', <FileAddOutlined />),
        getItem('Hire a Machine', 'hire-machine', <CalendarOutlined />),
        getItem('My Registered Machines', 'my-registered-machines', <CalendarOutlined />),
    ]),
    // getItem('Review Booking', 'review-booking', <ContactsOutlined />),
    getItem('My Quotes', 'quotes', <ContactsOutlined />),
    getItem('My Orders', 'orders', <UnorderedListOutlined />),
    /* getItem('My Bookings', 'my-bookings', <UnorderedListOutlined />),
    getItem('Payment', 'payment', <CreditCardOutlined />),
    getItem('Tools', 'tools', <ToolOutlined />, [
        getItem('Buy Tools', 'buy-tools', <PlusSquareOutlined />),
        getItem('Sell Tools', 'sell-tools', <MinusSquareOutlined />),
        getItem('Rent Tools', 'rent-tools', <CheckSquareOutlined />),
    ]),
    getItem('Gauges', 'gauges', <FieldTimeOutlined />, [
        getItem('Buy Gauges', 'buy-gauges', <PlusSquareOutlined />),
        getItem('Sell Gauges', 'sell-gauges', <MinusSquareOutlined />),
        getItem('Rent Gauges', 'rent-gauges', <CheckSquareOutlined />),
    ]),
    getItem('Sell Raw Material', 'sell-raw-materials', <FormatPainterOutlined />),
    getItem('Sell Scrap', 'sell-scrap', <ScissorOutlined />),
    getItem('Documents', 'documents', <BookOutlined />, [
        getItem('View Legal Agreement', 'view-legal-docs'),
        getItem('View Code of Conduct', 'view-code-conduct'),
        getItem('View Company Guidelines', 'view-company-guidelines', null),
    ]),
    getItem('Settings', 'settings', <SettingOutlined />), */
    getItem('Logout', 'logout', <LogoutOutlined />),
]

function Sidebar() {
    const [sideNav, setSideNav] = useState("sidebar");
    const { userSignOut, authUser } = useAuth();
    const navigate = useNavigate();

    const navigateMenuItems = (value) => {
        console.log("value: ", value);
        if (value.key == 'logout') { // if key is logout 
            userSignOut((response) => {
                console.log("logout: ", response);
                if (response && response.status) {
                    navigate('/login');
                    message.success("Thank you! Please visit again")
                }
            });
        } else { // navigate to other component
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
                        console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        console.log(collapsed, type);
                        !collapsed? setSideNav("sidebar"):setSideNav("");
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
                    <Content style={{ margin: '24px 16px 0' }}>
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