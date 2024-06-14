import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoutes({ component, ...rest }) {
    const token = localStorage.getItem("authToken");
    let auth = { token }

    return (
        auth.token ? <Outlet /> : <Navigate to="/login" />
    )
}

export default PrivateRoutes;