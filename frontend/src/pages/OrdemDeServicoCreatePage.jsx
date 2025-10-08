// src/pages/OrdemDeServicoCreatePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos o hook de navegação
import axios from 'axios';

function OrdemDeServicoCreatePage() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const navigate = useNavigate(); // 2. Inicializamos o hook de navegação

  // Estados para o nosso formulário
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState([]); // Agora é um array

  useEffect(() => {
    // A função que busca os dados continua a mesma
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [clientesResponse, servicosResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/clientes/', config),
          axios.get('http://127.0.0.1:8000/api/servicos/', config)
        ]);
        setClientes(clientesResponse.data);
        setServicos(servicosResponse.data);
      } catch (error) { console.error("Erro ao buscar dados:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // 3. Função para lidar com a seleção dos checkboxes de serviço
  const handleServicoChange = (servicoId) => {
    // Verifica se o ID do serviço já está no array
    if (servicosSelecionados.includes(servicoId)) {
      // Se estiver, remove (desmarcou o checkbox)
      setServicosSelecionados(servicosSelecionados.filter(id => id !== servicoId));
    } else {
      // Se não estiver, adiciona (marcou o checkbox)
      setServicosSelecionados([...servicosSelecionados, servicoId]);
    }
  };

  // 4. Função para enviar o formulário para a API
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const novaOrdem = {
        cliente: clienteSelecionado,
        servicos: servicosSelecionados
        // O valor_total e status serão calculados/definidos pelo backend
      };
      
      await axios.post('http://127.0.0.1:8000/api/ordens/', novaOrdem, config);

      alert('Ordem de Serviço criada com sucesso!');
      // 5. A MÁGICA: Redireciona o usuário de volta para a lista de OS
      navigate('/ordens');

    } catch (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      alert('Erro ao criar Ordem de Serviço.');
    }
  };

  if (loading) {
    return <p>Carregando dados do formulário...</p>;
  }

  // 6. O formulário de verdade!
  return (
    <div className="form-container">
      <h2>Criar Nova Ordem de Serviço</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="cliente">Selecione o Cliente</label>
          <select id="cliente" value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)} required>
            <option value="">-- Escolha um cliente --</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Selecione os Serviços</label>
          <div className="checkbox-group">
            {servicos.map(servico => (
              <div key={servico.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`servico-${servico.id}`}
                  value={servico.id}
                  onChange={() => handleServicoChange(servico.id)}
                />
                <label htmlFor={`servico-${servico.id}`}>{servico.nome} - R$ {servico.preco}</label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="form-button">Criar Ordem de Serviço</button>
      </form>
    </div>
  );
}

export default OrdemDeServicoCreatePage;