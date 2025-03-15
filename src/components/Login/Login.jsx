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
        // console.log('Success:', values);
        userLogin(values, (res) => {
            // console.log("test u: ", res);
            if (res && res.status && !res.admin) {
                navigate('/');

            } else if (res && res.status && res.admin) {
                
                if (typeof window.gtag === 'function') {
                    window.gtag('Login_Success', 'Dashboard_Page', { /* ... */ });
                  } else {
                    console.warn('gtag not loaded yet');
                  }
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
        <div className="loginCard">
            
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
                            
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            className="loginMainContainer"
                        // autoComplete="off"
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                className="loginContainer"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter username.',
                                    },
                                ]}
                            >
                                <Input autoComplete='off' className="credTextbox"/>
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                className="loginContainer"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter password.',
                                    },
                                ]}
                            >
                                <Input.Password className="credTextbox"/>
                            </Form.Item>
                            
                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                            >
                                <div className="btnContainer">
                                <Button className="loginBtn" type="primary" htmlType="submit">
                                    {isLoading ? 'Logging...' : 'Login'}
                                </Button>
                                <Button className="registerBtn" type='secondary' onClick={() => navigate('/register-account')}>Register</Button>
                                </div>
                            </Form.Item>
                            
                         
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </div>
    )
}

export default Login;