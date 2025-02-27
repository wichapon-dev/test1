import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;  