import React from 'react';
import { Layout } from 'antd';
import Navbar from '../Navbar/Navbar';

const { Content } = Layout;

const HomePage = () => {
    return (
        <Layout>
            <Navbar />
            <Content>
                {/* Your homepage content goes here */}
                <h1>Welcome to Our Website!</h1>
                <p>This is the homepage content.</p>
            </Content>
        </Layout>
    );
};

export default HomePage;
