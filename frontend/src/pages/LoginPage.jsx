// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Note que a função de login agora é passada como uma propriedade (prop) 'onLogin'
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
      // Chama a função onLogin que recebemos do App.jsx, passando o token
      onLogin(accessToken);
    } catch (error) {
      console.error('Erro no login!', error);
      alert('Falha no login.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="username">Usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit"className="form-button">Entrar</button>
      </form>
       <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;