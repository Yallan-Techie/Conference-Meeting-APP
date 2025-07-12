// service/guard.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ApiService from './ApiService';

export const ProtectedRoute = ({ element: Component }) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const AdminRoute = ({ element: Component }) => {
  const location = useLocation();
  return ApiService.isAdmin() ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// ✅ UPDATED: Allow ADMIN, USER
export const UserOrAdminRoute = ({ element: Component }) => {
  const location = useLocation();
  const role = localStorage.getItem('role');
  return (
    ['ADMIN', 'USER'].includes(role) &&
    ApiService.isAuthenticated()
  ) ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};
