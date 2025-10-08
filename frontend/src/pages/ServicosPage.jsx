// src/pages/ServicosPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');

  // Estado para controlar a edição
  const [editingServico, setEditingServico] = useState(null);

  // --- FUNÇÕES DE API ---

  const fetchServicos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get('http://127.0.0.1:8000/api/servicos/', config);
      setServicos(response.data);
    } catch (error) { console.error('Erro ao buscar serviços:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingServico) {
      handleUpdateServico();
    } else {
      handleCreateServico();
    }
  };

  const handleCreateServico = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const novoServico = { nome, descricao, preco };
      await axios.post('http://127.0.0.1:8000/api/servicos/', novoServico, config);
      alert('Serviço cadastrado com sucesso!');
      fetchServicos();
    } catch (error) { console.error('Erro ao cadastrar serviço:', error); alert('Erro ao cadastrar serviço.'); }
    finally { clearForm(); }
  };
  
  const handleUpdateServico = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const servicoAtualizado = { nome, descricao, preco };
      await axios.put(`http://127.0.0.1:8000/api/servicos/${editingServico.id}/`, servicoAtualizado, config);
      alert('Serviço atualizado com sucesso!');
      fetchServicos();
    } catch (error) { console.error('Erro ao atualizar serviço:', error); alert('Erro ao atualizar serviço.'); }
    finally { clearForm(); }
  };

  const handleDeleteServico = async (servicoId) => {
    if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        await axios.delete(`http://127.0.0.1:8000/api/servicos/${servicoId}/`, config);
        setServicos(servicos.filter(servico => servico.id !== servicoId));
        alert('Serviço deletado com sucesso!');
      } catch (error) { console.error('Erro ao deletar serviço:', error); alert('Erro ao deletar serviço.'); }
    }
  };

  // --- FUNÇÕES DE CONTROLE DO FORMULÁRIO ---

  const handleEditClick = (servico) => {
    setEditingServico(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao);
    setPreco(servico.preco);
  };

  const clearForm = () => {
    setNome('');
    setDescricao('');
    setPreco('');
    setEditingServico(null);
  };

  // --- RENDERIZAÇÃO ---

  if (loading) { return <p>Carregando serviços...</p>; }

  return (
    <div>
      <div className="form-container">
        <h3>{editingServico ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome do Serviço" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <textarea  placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input type="number" step="0.01" placeholder="Preço (ex: 50.00)" value={preco} onChange={(e) => setPreco(e.target.value)} required />
          <button type="submit" className="form-button">{editingServico ? 'Salvar Alterações' : 'Cadastrar'}</button>
          {editingServico && (
            <button type="button" onClick={clearForm} className="cancel-btn">Cancelar</button>
          )}
        </form>
      </div>

      <hr />

      <h2>Meus Serviços</h2>
      <ul className="item-list">
        {servicos.map((servico) => (
          <li key={servico.id}>
            <span>{servico.nome} - R$ {servico.preco}</span>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEditClick(servico)}>Editar</button>
              <button className="delete-btn" onClick={() => handleDeleteServico(servico.id)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServicosPage;