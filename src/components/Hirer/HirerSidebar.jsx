import { Layout, Menu, theme } from 'antd';
import React from 'react'
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
import { FileAddOutlined, SettingOutlined, BookOutlined, LogoutOutlined, CalendarOutlined, DashboardOutlined, ToolOutlined, FieldTimeOutlined, FormatPainterOutlined, PlusSquareOutlined, MinusSquareOutlined, CheckSquareOutlined, ScissorOutlined } from '@ant-design/icons';


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
    getItem('Register a Machine', 'register-machine', <FileAddOutlined />),
    getItem('Hire a Machine', 'hire-machine', <CalendarOutlined />),
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
    getItem('Settings', 'settings', <SettingOutlined />),
    getItem('Logout', '/logout', <LogoutOutlined />),
]

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

export default HirerSidebar