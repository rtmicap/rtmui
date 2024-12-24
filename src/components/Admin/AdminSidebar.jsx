import { Layout, theme, Menu } from 'antd';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import ListOfUsers from './Users/ListOfUsers';
const { Header, Content, Footer, Sider } = Layout;
import { FileAddOutlined, SettingOutlined, BookOutlined, LogoutOutlined, CalendarOutlined, DashboardOutlined, ToolOutlined, FieldTimeOutlined, FormatPainterOutlined, PlusSquareOutlined, MinusSquareOutlined, CheckSquareOutlined, ScissorOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem('Dashboard', '/admin/dashboard', <DashboardOutlined />),
    getItem('List of Users', 'list-users', <BookOutlined />),
    getItem('Logout', 'logout', <LogoutOutlined />),
]

function AdminSidebar() {
    const { userSignOut } = useAuth();

    const navigate = useNavigate();

    const navigateMenuItems = (value) => {
        // console.log("value: ", value);
        if (value.key == 'logout') { // if key is logout 
            userSignOut((response) => {
                // console.log("logout: ", response);
                if (response && response.status) {
                    navigate('/login')
                }
            });
        } else { // navigate to other component
            // console.log('/admin/' + value.key);
            navigate(value.key)
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
                    onBreakpoint={(broken) => {
                        // console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        // console.log(collapsed, type);
                    }}
                >
                    <div className="demo-logo-vertical">
                        <h3 style={{ color: 'white', textAlign: 'center' }}>Admin Account</h3>
                    </div>
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
                                textAlign: 'center',
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

export default AdminSidebar