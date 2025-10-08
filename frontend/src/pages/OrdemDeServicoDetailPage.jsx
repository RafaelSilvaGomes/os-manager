// src/pages/OrdemDeServicoDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// 1. Importe o nosso novo componente de formulário
import AddMaterialForm from '../components/AddMaterialForm';

function OrdemDeServicoDetailPage() {
  const { id } = useParams(); 
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Transformamos a busca de dados em uma função que podemos chamar de novo
  const fetchOrdemDetalhes = async () => {
    setLoading(true); // Mostra o 'carregando' toda vez que buscamos
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://127.0.0.1:8000/api/ordens/${id}/`, config);
      setOrdem(response.data);
    } catch (error) {
      console.error(`Erro ao buscar detalhes da OS #${id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdemDetalhes();
  }, [id]);

  if (loading) {
    return <p>Carregando detalhes da Ordem de Serviço...</p>;
  }

  if (!ordem) {
    return <p>Ordem de Serviço não encontrada.</p>;
  }

  return (
    <div>
      <h2>Detalhes da OS #{ordem.id}</h2>
      {/* ... (o resto dos detalhes da OS continua igual) ... */}
      <p><strong>Cliente ID:</strong> {ordem.cliente}</p>
      <p><strong>Status:</strong> {ordem.status}</p>
      <p><strong>Valor Total:</strong> R$ {ordem.valor_total}</p>
      <p><strong>Data de Abertura:</strong> {new Date(ordem.data_abertura).toLocaleString()}</p>
      <hr />

      {/* ... (a lista de serviços continua igual) ... */}
      <h3>Serviços Incluídos:</h3>
      {/* ... */}
      
      <h3>Materiais Utilizados:</h3>
      {ordem.materiais_utilizados && ordem.materiais_utilizados.length > 0 ? (
        <ul>
          {ordem.materiais_utilizados.map(item => (
            <li key={item.id}>
              {item.quantidade}x {item.material.nome} - R$ {item.material.preco_unidade} (un.)
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum material utilizado.</p>
      )}

      <hr />
      
      {/* 3. Renderizamos nosso novo componente de formulário aqui */}
      {/* Passamos o 'id' da OS e a função de recarregar como 'props' */}
      <AddMaterialForm ordemId={id} onSuccess={fetchOrdemDetalhes} />

    </div>
  );
}

export default OrdemDeServicoDetailPage;