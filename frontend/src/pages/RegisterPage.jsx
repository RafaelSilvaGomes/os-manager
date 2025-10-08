import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário após o cadastro

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
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        try {
            // O endereço da API. Verifique se o seu backend está rodando!
            const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
            console.log(response.data);
            alert('Cadastro realizado com sucesso!');
            navigate('/login'); // Redireciona para a página de login
        } catch (error) {
            console.error('Houve um erro no cadastro!', error.response.data);
            // Aqui você pode exibir os erros para o usuário (ex: "email já existe")
            alert('Erro no cadastro: ' + JSON.stringify(error.response.data));
        }
    };

    return (
        <div>
            <h2>Página de Cadastro</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Nome de usuário" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Senha" onChange={handleChange} required />
                <input type="text" name="first_name" placeholder="Primeiro Nome" onChange={handleChange} />
                <input type="text" name="last_name" placeholder="Sobrenome" onChange={handleChange} />
                <button type="submit">Cadastrar</button>
            </form>
        </div>
    );
}

export default RegisterPage;