import { Button } from 'antd';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import AppHeader from '../AppHeader/AppHeader';

function Login() {
    const navigate = useNavigate();
    return (
        <>
            <h2>Login Page</h2>
            <br />
            <Button type='primary' onClick={() => navigate('/register-account')}>Register Account</Button>
        </>
    )
}

export default Login;