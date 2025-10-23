// Em: frontend/src/components/ProtectedRoute.jsx

import React from "react";
// Importe o 'Outlet'
import { Navigate, useLocation, Outlet } from "react-router-dom";

// Não precisamos mais de 'children' aqui
function ProtectedRoute({ token }) {
  const location = useLocation();

  if (!token) {
    // Se não há token, redireciona para o login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se há token, renderiza o <Outlet />, que será a
  // página filha (Dashboard, Clientes, etc.)
  return <Outlet />;
}

export default ProtectedRoute;
