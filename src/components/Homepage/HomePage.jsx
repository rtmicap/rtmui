import React from 'react';
import { Layout } from 'antd';
import Navbar from '../Navbar/Navbar';
import uploadFilesToS3 from '../Api/storageapi';
import path from 'path';

const { Content } = Layout;

const HomePage = () => {
    // Example usage
    const files = [
        path.resolve(__dirname, '../../../file1.txt')
    ];
    const bucketName = 'rtmfiles';

    uploadFilesToS3(files, bucketName)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });
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
