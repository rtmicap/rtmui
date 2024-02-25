import React from 'react';
import { Layout, Divider, theme, Typography } from 'antd';
const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function HeaderTitle({ title }) {
    return (
        <>
            <Layout>
                <Header style={{ background: 'white', top }}>
                    <Title level={3} style={{ textAlign: 'center', color: 'black', marginTop: '15px' }}>
                        {title}
                    </Title>
                </Header>
            </Layout>
            <Divider />
        </>
    )
}

export default HeaderTitle;