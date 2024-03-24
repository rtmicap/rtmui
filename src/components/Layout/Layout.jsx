import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
    return (
        <>
            <Sidebar />
        </>
    )
}

export default Layout;