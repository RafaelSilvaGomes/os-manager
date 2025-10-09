// src/App.jsx

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// --- NOVIDADE: IMPORTAÇÕES PARA O TEMA ---
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

// Importações das Nossas Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ServicosPage from './pages/ServicosPage';
import MateriaisPage from './pages/MateriaisPage';
import OrdensDeServicoPage from './pages/OrdensDeServicoPage';
import OrdemDeServicoCreatePage from './pages/OrdemDeServicoCreatePage';
import OrdemDeServicoDetailPage from './pages/OrdemDeServicoDetailPage';

// --- NOVIDADE: CRIAÇÃO DO TEMA ESCURO ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
    // --- NOVIDADE: "EMBRULHAMOS" TUDO COM O TEMA ---
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Ajuda a padronizar o visual e aplica o fundo escuro */}
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {token && (
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Sistema OS
                </Typography>
                <Button component={Link} to="/" color="inherit">Dashboard</Button>
                <Button component={Link} to="/clientes" color="inherit">Clientes</Button>
                <Button component={Link} to="/servicos" color="inherit">Serviços</Button>
                <Button component={Link} to="/materiais" color="inherit">Materiais</Button>
                <Button component={Link} to="/ordens" color="inherit">Ordens de Serviço</Button>
                <Button onClick={handleLogout} color="inherit">Sair</Button>
              </Toolbar>
            </AppBar>
          )}
          
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
              <Route path="/clientes" element={token ? <ClientesPage /> : <Navigate to="/login" />} />
              <Route path="/servicos" element={token ? <ServicosPage /> : <Navigate to="/login" />} />
              <Route path="/materiais" element={token ? <MateriaisPage /> : <Navigate to="/login" />} />
              <Route path="/ordens" element={token ? <OrdensDeServicoPage /> : <Navigate to="/login" />} />
              <Route path="/ordens/novo" element={token ? <OrdemDeServicoCreatePage /> : <Navigate to="/login" />} />
              <Route path="/ordens/:id" element={token ? <OrdemDeServicoDetailPage /> : <Navigate to="/login" />} />
              <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;