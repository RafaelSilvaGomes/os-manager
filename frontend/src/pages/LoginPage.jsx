// src/pages/LoginPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; 

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: username,
        password: password,
      });
      const accessToken = response.data.access;
      onLogin(accessToken);
    } catch (error) {
      console.error("Erro no login!", error);
      alert("Usuário ou senha inválidos.");
    }
  };

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6} 
        sx={{
          padding: 4, 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "400px",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
          <Typography variant="body2" align="center">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              style={{ color: "#1976d2", textDecoration: "none" }}
            >
              Cadastre-se
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
