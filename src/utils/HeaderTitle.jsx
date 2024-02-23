import React from 'react';
import { Layout, Menu, theme } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

function HeaderTitle({ title }) {
    return (
        <>
            <Layout>
                <Header
                    style={{
                        color:'white',
                        padding: 0,
                    }}
                >
                    {title}
                </Header>
            </Layout>
        </>
    )
}

export default HeaderTitle;