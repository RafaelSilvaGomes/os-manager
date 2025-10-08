// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import './App.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ServicosPage from './pages/ServicosPage';
import MateriaisPage from './pages/MateriaisPage';
import OrdensDeServicoPage from './pages/OrdensDeServicoPage';
import OrdemDeServicoCreatePage from './pages/OrdemDeServicoCreatePage';
import OrdemDeServicoDetailPage from './pages/OrdemDeServicoDetailPage';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (accessToken) => {
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <BrowserRouter>
      <div>
        {/* Navbar simples que aparece se o usuário estiver logado */}
        {token && (
          <nav>
            <h1>Sistema OS</h1>
            <div>
              <Link to="/">Dashboard</Link>
              <Link to="/clientes">Clientes</Link>
              <Link to="/servicos">Serviços</Link>
              <Link to="/materiais">Materiais</Link>
              <Link to="/ordens">Ordens de Serviço</Link>

            </div>
            <button onClick={handleLogout}>Sair</button>
          </nav>
        )}
        
        <main>
          <Routes>
            {/* Rota para o Dashboard (página principal) */}
            <Route 
              path="/" 
              element={token ? <DashboardPage /> : <Navigate to="/login" />} 
            />
            {/* Rota para a página de Login */}
            <Route 
              path="/login" 
              element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
             <Route 
              path="/clientes" 
              element={token ? <ClientesPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/servicos" 
              element={token ? <ServicosPage /> : <Navigate to="/login" />} 
            />
            <Route 
<<<<<<< HEAD
              path="/materiais" 
              element={token ? <MateriaisPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/ordens" 
              element={token ? <OrdensDeServicoPage /> : <Navigate to="/login" />} 
            />
             <Route 
            path="/ordens/novo" 
            element={token ? <OrdemDeServicoCreatePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ordens/:id" 
            element={token ? <OrdemDeServicoDetailPage /> : <Navigate to="/login" />} 
          />
=======
              path="/register" 
              element={<RegisterPage />} />
>>>>>>> 89e6fd85d81384cbee4e9f50d15ddb9e1754b2a1
            <Route 
              path="/login" 
              element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} 
            />  
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;