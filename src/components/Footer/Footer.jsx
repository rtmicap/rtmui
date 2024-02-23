import React from 'react';
const { Header, Content, Footer, Sider } = Layout;

function Footer() {
    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </>
    )
}

export default Footer