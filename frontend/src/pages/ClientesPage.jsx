// src/pages/ClientesPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // --- NOVIDADE: Estado para controlar a edição ---
  // Se for 'null', o formulário é de criação.
  // Se tiver um objeto de cliente, o formulário é de edição.
  const [editingClient, setEditingClient] = useState(null);

  const fetchClientes = async () => { 
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get('http://127.0.0.1:8000/api/clientes/', config);
      setClientes(response.data);
    } catch (error) { console.error('Erro ao buscar clientes:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // --- NOVIDADE: Função para lidar com o envio do formulário (agora faz duas coisas) ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Se estivermos editando um cliente (editingClient não é null)...
    if (editingClient) {
      handleUpdateCliente();
    } else { // Senão, estamos criando um novo cliente
      handleCreateCliente();
    }
  };

  const handleCreateCliente = async () => { /* ... (lógica de criação quase igual) ... */
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const novoCliente = { nome, email, telefone };
      await axios.post('http://127.0.0.1:8000/api/clientes/', novoCliente, config);
      alert('Cliente cadastrado com sucesso!');
      fetchClientes(); // Atualiza a lista
    } catch (error) { console.error('Erro ao cadastrar cliente:', error); alert('Erro ao cadastrar cliente.'); }
    finally { clearForm(); }
  };
  
  // --- NOVIDADE: Função para ATUALIZAR um cliente ---
  const handleUpdateCliente = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const clienteAtualizado = { nome, email, telefone };
      
      // Faz a requisição PUT para a URL específica do cliente que estamos editando
      await axios.put(`http://127.0.0.1:8000/api/clientes/${editingClient.id}/`, clienteAtualizado, config);
      
      alert('Cliente atualizado com sucesso!');
      fetchClientes(); // Atualiza a lista
    } catch (error) { console.error('Erro ao atualizar cliente:', error); alert('Erro ao atualizar cliente.'); }
    finally { clearForm(); }
  };

  const handleDeleteCliente = async (clienteId) => { /* ... (função igual a antes) ... */
    if (window.confirm('Tem certeza?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        await axios.delete(`http://127.0.0.1:8000/api/clientes/${clienteId}/`, config);
        setClientes(clientes.filter(cliente => cliente.id !== clienteId));
        alert('Cliente deletado com sucesso!');
      } catch (error) { console.error('Erro ao deletar cliente:', error); alert('Erro ao deletar cliente.'); }
    }
  };

  // --- NOVIDADE: Funções para controlar o modo de edição ---
  const handleEditClick = (cliente) => {
    setEditingClient(cliente); // Define qual cliente estamos editando
    // Preenche o formulário com os dados desse cliente
    setNome(cliente.nome);
    setEmail(cliente.email);
    setTelefone(cliente.telefone);
  };

  const clearForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setEditingClient(null); // Sai do modo de edição
  };


  if (loading) { return <p>Carregando clientes...</p>; }

  return (
    <div>
      <div className="form-container">
        {/* O formulário agora tem um título e botão dinâmicos */}
        <h3>{editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <button type="submit" className="form-button">{editingClient ? 'Salvar Alterações' : 'Cadastrar'}</button>
          {/* Mostra o botão de cancelar apenas se estivermos no modo de edição */}
          {editingClient && (
            <button type="button" onClick={clearForm} className="cancel-btn">Cancelar</button>
          )}
        </form>
      </div>

      <hr />

      <h2>Meus Clientes</h2>
      <ul className="item-list">
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <span>{cliente.nome} - {cliente.email}</span>
            <div className="actions">
              {/* O botão de editar agora chama a função handleEditClick */}
              <button className="edit-btn" onClick={() => handleEditClick(cliente)}>Editar</button>
              <button className="delete-btn" onClick={() => handleDeleteCliente(cliente.id)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClientesPage;