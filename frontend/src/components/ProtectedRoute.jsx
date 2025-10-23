import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

function ProtectedRoute({ token }) {
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
