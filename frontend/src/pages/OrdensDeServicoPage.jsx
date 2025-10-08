// src/pages/OrdensDeServicoPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Usaremos o Link para futuras páginas de detalhe
import axios from 'axios';

function OrdensDeServicoPage() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) { setLoading(false); return; }

        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        const response = await axios.get('http://127.0.0.1:8000/api/ordens/', config);
        
        setOrdens(response.data);
      } catch (error) {
        console.error('Erro ao buscar Ordens de Serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdens();
  }, []);

  if (loading) {
    return <p>Carregando Ordens de Serviço...</p>;
  }

  return (
    <div>
      <div className="header-actions">
          <h2>Ordens de Serviço</h2>
          {/* Em breve, este botão nos levará para a página de criação */}
          <Link to="/ordens/novo" className="form-button">Criar Nova OS</Link>
      </div>

      <ul className="item-list">
        {ordens.length > 0 ? (
          ordens.map((ordem) => (
            <li key={ordem.id}>
              {/* O Link fará com que o item seja clicável no futuro */}
              <Link to={`/ordens/${ordem.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <span>OS #{ordem.id} - Cliente ID: {ordem.cliente}</span>
                <span>Status: {ordem.status}</span>
                <span>Valor: R$ {ordem.valor_total}</span>
              </Link>
            </li>
          ))
        ) : (
          <p>Nenhuma Ordem de Serviço encontrada.</p>
        )}
      </ul>
    </div>
  );
}

export default OrdensDeServicoPage;