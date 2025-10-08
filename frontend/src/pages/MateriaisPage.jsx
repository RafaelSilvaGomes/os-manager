// src/pages/MateriaisPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function MateriaisPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoUnidade, setPrecoUnidade] = useState('');

  // Estado para controlar a edição
  const [editingMaterial, setEditingMaterial] = useState(null);

  // --- FUNÇÕES DE API ---

  const fetchMateriais = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get('http://127.0.0.1:8000/api/materiais/', config);
      setMateriais(response.data);
    } catch (error) { console.error('Erro ao buscar materiais:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingMaterial) {
      handleUpdateMaterial();
    } else {
      handleCreateMaterial();
    }
  };

  const handleCreateMaterial = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const novoMaterial = { nome, descricao, preco_unidade: precoUnidade };
      await axios.post('http://127.0.0.1:8000/api/materiais/', novoMaterial, config);
      alert('Material cadastrado com sucesso!');
      fetchMateriais();
    } catch (error) { console.error('Erro ao cadastrar material:', error); alert('Erro ao cadastrar material.'); }
    finally { clearForm(); }
  };
  
  const handleUpdateMaterial = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const materialAtualizado = { nome, descricao, preco_unidade: precoUnidade };
      await axios.put(`http://127.0.0.1:8000/api/materiais/${editingMaterial.id}/`, materialAtualizado, config);
      alert('Material atualizado com sucesso!');
      fetchMateriais();
    } catch (error) { console.error('Erro ao atualizar material:', error); alert('Erro ao atualizar material.'); }
    finally { clearForm(); }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Tem certeza que deseja deletar este material?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        await axios.delete(`http://127.0.0.1:8000/api/materiais/${materialId}/`, config);
        setMateriais(materiais.filter(material => material.id !== materialId));
        alert('Material deletado com sucesso!');
      } catch (error) { console.error('Erro ao deletar material:', error); alert('Erro ao deletar material.'); }
    }
  };

  // --- FUNÇÕES DE CONTROLE DO FORMULÁRIO ---

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setNome(material.nome);
    setDescricao(material.descricao);
    setPrecoUnidade(material.preco_unidade);
  };

  const clearForm = () => {
    setNome('');
    setDescricao('');
    setPrecoUnidade('');
    setEditingMaterial(null);
  };

  // --- RENDERIZAÇÃO ---

  if (loading) { return <p>Carregando materiais...</p>; }

  return (
    <div>
      <div className="form-container">
        <h3>{editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome do Material" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input type="number" step="0.01" placeholder="Preço por Unidade" value={precoUnidade} onChange={(e) => setPrecoUnidade(e.target.value)} required />
          <button type="submit" className="form-button">{editingMaterial ? 'Salvar Alterações' : 'Cadastrar'}</button>
          {editingMaterial && (
            <button type="button" onClick={clearForm} className="cancel-btn">Cancelar</button>
          )}
        </form>
      </div>

      <hr />

      <h2>Meus Materiais</h2>
      <ul className="item-list">
        {materiais.map((material) => (
          <li key={material.id}>
            <span>{material.nome} - R$ {material.preco_unidade}</span>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEditClick(material)}>Editar</button>
              <button className="delete-btn" onClick={() => handleDeleteMaterial(material.id)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MateriaisPage;