import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />
      <main style={{ paddingBottom: '3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
