// src/pages/ServicosPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const response = await axios.get('http://127.0.0.1:8000/api/servicos/', config);
        
        setServicos(response.data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
  }, []);

  if (loading) {
    return <p>Carregando serviços...</p>;
  }

  return (
    <div>
      <h2>Meus Serviços</h2>
      {servicos.length > 0 ? (
        <ul>
          {servicos.map((servico) => (
            <li key={servico.id}>
              {servico.nome} - R$ {servico.preco}
            </li>
          ))}
        </ul>
      ) : (
        <p>Você ainda não cadastrou nenhum serviço.</p>
      )}
    </div>
  );
}

export default ServicosPage;