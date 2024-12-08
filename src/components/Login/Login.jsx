import { Button, Card, Form, Input, Layout, message, Spin } from 'antd';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppNotificationContainer from '../../utils/Notifications/AppNotificationContainer';
import AppHeader from '../AppHeader/AppHeader';
const { Content } = Layout;

function Login() {
    const navigate = useNavigate();
    const { isLoading, error, userLogin } = useAuth();

    const onFinish = async (values) => {
        console.log('Success:', values);
        userLogin(values, (res) => {
            console.log("test u: ", res);
            if (res && res.status && !res.admin) {
                navigate('/');
            } else if (res && res.status && res.admin) {
                navigate('/admin/dashboard');
            } if (res && !res.status && !res.admin) {
                message.error(res && res.response && res.response.message ? res.response.message : "Unable to login! Please contact support");
            } 
        });
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        errorInfo.errorFields.forEach(fieldError => {
            message.error(fieldError.errors[0]);
        });
    };

    return (
        <>
            <h2>Login Page</h2>
            <br />
            <Button type='primary' onClick={() => navigate('/register-account')}>Register Account</Button>
            <Layout>
                <Content style={{ padding: 40 }}>
                    <Card
                        title={<h3 style={{ textAlign: 'center' }}>Sign In</h3>}
                        // extra={<a href="#">More</a>}
                        style={{
                            width: 700,
                        }}
                    >
                        <Form
                            name="basic"
                            labelCol={{
                                span: 8,
                            }}
                            wrapperCol={{
                                span: 16,
                            }}
                            style={{
                                maxWidth: 600,
                            }}
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                        // autoComplete="off"
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your username!',
                                    },
                                ]}
                            >
                                <Input autoComplete='off' />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                            >
                                <Button type="primary" htmlType="submit">
                                    {isLoading ? 'Logging...' : 'Submit'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </>
    )
}

export default Login;