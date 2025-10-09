// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 1. Importamos os componentes que vamos usar do Material-UI
import { Button, TextField, Container, Typography, Box } from '@mui/material';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password,
      });
      const accessToken = response.data.access;
      onLogin(accessToken);
    } catch (error) {
      console.error('Erro no login!', error);
      alert('Falha no login.');
    }
  };

  // 2. A estrutura do nosso componente agora usa os componentes do MUI
  return (
    // Container centraliza o conteúdo na tela
    <Container component="main" maxWidth="xs">
      {/* Box é como uma <div>, mas com superpoderes de estilização */}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* 3. O <input> vira um <TextField> estiloso */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nome de Usuário"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* O <input type="password"> também vira um <TextField> */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* 4. O <button> vira um <Button> com animações e estilos */}
          <Button
            type="submit"
            fullWidth
            variant="contained" // Este é o estilo de botão principal, com cor
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
          <Typography variant="body2" align="center">
            Não tem uma conta?{' '}
            <Link to="/register" style={{ color: '#1976d2' }}>
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;