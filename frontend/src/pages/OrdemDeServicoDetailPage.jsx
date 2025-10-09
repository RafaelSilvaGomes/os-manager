// src/pages/OrdemDeServicoDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AddMaterialForm from '../components/AddMaterialForm';
// 1. Importe o nosso novo componente de formulário de pagamento
import AddPagamentoForm from '../components/AddPagamentoForm';

function OrdemDeServicoDetailPage() {
  const { id } = useParams(); 
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrdemDetalhes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://127.0.0.1:8000/api/ordens/${id}/`, config);
      setOrdem(response.data);
    } catch (error) { console.error(`Erro ao buscar detalhes da OS #${id}:`, error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrdemDetalhes();
  }, [id]);

  if (loading) { return <p>Carregando detalhes...</p>; }
  if (!ordem) { return <p>Ordem de Serviço não encontrada.</p>; }

  return (
    <div>
      <h2>Detalhes da OS #{ordem.id}</h2>
      {/* ... (Detalhes da OS) ... */}
      <p><strong>Status:</strong> {ordem.status}</p>
      <p><strong>Valor Total:</strong> R$ {ordem.valor_total}</p>

      <hr />

      <h3>Serviços Incluídos:</h3>
      {/* ... (Lista de Serviços) ... */}

      <h3>Materiais Utilizados:</h3>
      {/* ... (Lista de Materiais) ... */}

      {/* 2. ADICIONE ESTA NOVA SEÇÃO PARA PAGAMENTOS */}
      <h3>Pagamentos Registrados:</h3>
      {ordem.pagamentos && ordem.pagamentos.length > 0 ? (
        <ul>
          {ordem.pagamentos.map(pagamento => (
            <li key={pagamento.id}>
              {new Date(pagamento.data_pagamento).toLocaleDateString()}: R$ {pagamento.valor_pago} ({pagamento.forma_pagamento})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum pagamento registrado.</p>
      )}

      <hr />
      
      {/* 3. Renderizamos os dois formulários */}
      <div className="action-forms">
        <AddMaterialForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
        <AddPagamentoForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
      </div>

    </div>
  );
}

export default OrdemDeServicoDetailPage;