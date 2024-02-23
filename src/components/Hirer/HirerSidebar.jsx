import { Layout, Menu, theme } from 'antd';
import React from 'react'
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
import { FileAddOutlined, UserOutlined, BookOutlined, LogoutOutlined, RestOutlined, DashboardOutlined, ContainerOutlined, SnippetsOutlined } from '@ant-design/icons';

const ListsItems = [
    { icon: DashboardOutlined, label: 'Dashboard', key: '/hirer' },
    { icon: FileAddOutlined, label: 'Hire a Machine', key: 'hire-machine' },
    { icon: BookOutlined, label: 'View Legal Agreement', key: 'view-legal-agreement' },
    { icon: ContainerOutlined, label: 'View Code of Conduct', key: 'view-code-conduct' },
    { icon: SnippetsOutlined, label: 'View Company Guidelines', key: 'view-company-guidelines' },
    { icon: RestOutlined, label: 'Change Password', key: 'change-password' },
    { icon: LogoutOutlined, label: 'Logout', key: '/logout' }
]

const menuItems = ListsItems.map((data, index) => {
    return ({
        key: data.key,
        icon: React.createElement(data.icon),
        label: data.label
    })
});

function HirerSidebar() {

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
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={(broken) => {
                        console.log(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        console.log(collapsed, type);
                    }}
                >
                    <div className="demo-logo-vertical">
                        <h3 style={{ color: 'white', textAlign: 'center' }}>Company Logo</h3>
                    </div>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={window.location.pathname} onClick={navigateMenuItems} items={menuItems} />
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

export default HirerSidebar