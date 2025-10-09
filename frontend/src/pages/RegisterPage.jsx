// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Usando a URL correta do nosso backend
            await axios.post('http://127.0.0.1:8000/api/user/register/', formData);
            alert('Cadastro realizado com sucesso! Por favor, faça o login.');
            navigate('/login'); // Redireciona para a página de login
        } catch (error) {
            console.error('Houve um erro no cadastro!', error.response?.data);
            alert('Erro no cadastro: ' + JSON.stringify(error.response?.data));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Cadastre-se
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal" required fullWidth name="first_name" label="Primeiro Nome"
                        value={formData.first_name} onChange={handleChange} autoFocus
                    />
                    <TextField
                        margin="normal" required fullWidth name="last_name" label="Sobrenome"
                        value={formData.last_name} onChange={handleChange}
                    />
                    <TextField
                        margin="normal" required fullWidth name="username" label="Nome de Usuário"
                        value={formData.username} onChange={handleChange}
                    />
                    <TextField
                        margin="normal" required fullWidth name="email" label="Endereço de Email" type="email"
                        value={formData.email} onChange={handleChange}
                    />
                    <TextField
                        margin="normal" required fullWidth name="password" label="Senha" type="password"
                        value={formData.password} onChange={handleChange}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Cadastrar
                    </Button>
                    <Typography variant="body2" align="center">
                        Já tem uma conta?{' '}
                        <Link to="/login" style={{ color: '#1976d2' }}>
                            Faça o login
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}

export default RegisterPage;