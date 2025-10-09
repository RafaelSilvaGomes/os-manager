// src/pages/ClientesPage.jsx (VERSÃO COMPLETA E FINAL)

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent, CardActions, Divider } from '@mui/material';

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (editingClient) {
            handleUpdateCliente();
        } else {
            handleCreateCliente();
        }
    };

    const handleCreateCliente = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const novoCliente = { nome, email, telefone };
            await axios.post('http://127.0.0.1:8000/api/clientes/', novoCliente, config);
            alert('Cliente cadastrado com sucesso!');
            fetchClientes();
        } catch (error) { console.error('Erro ao cadastrar cliente:', error); alert('Erro ao cadastrar cliente.'); }
        finally { clearForm(); }
    };

    const handleUpdateCliente = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const clienteAtualizado = { nome, email, telefone };
            await axios.put(`http://127.0.0.1:8000/api/clientes/${editingClient.id}/`, clienteAtualizado, config);
            alert('Cliente atualizado com sucesso!');
            fetchClientes();
        } catch (error) { console.error('Erro ao atualizar cliente:', error); alert('Erro ao atualizar cliente.'); }
        finally { clearForm(); }
    };

    const handleDeleteCliente = async (clienteId) => {
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

    const handleEditClick = (cliente) => {
        setEditingClient(cliente);
        setNome(cliente.nome);
        setEmail(cliente.email);
        setTelefone(cliente.telefone);
    };

    const clearForm = () => {
        setNome('');
        setEmail('');
        setTelefone('');
        setEditingClient(null);
    };

    if (loading) { return <p>Carregando clientes...</p>; }

    return (
        <Box sx={{ p: 2 }}>
            <Box component="div" className="form-container">
                <Typography variant="h5" component="h2" gutterBottom>
                    {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth />
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                    <TextField label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} fullWidth />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {editingClient && (
                            <Button type="button" onClick={clearForm} variant="outlined">Cancelar</Button>
                        )}
                        <Button type="submit" variant="contained">{editingClient ? 'Salvar' : 'Cadastrar'}</Button>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" component="h2" gutterBottom>
                Meus Clientes
            </Typography>
            
            <Box>
                {clientes.length > 0 ? (
                    clientes.map((cliente) => (
                        <Card key={cliente.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6">{cliente.nome}</Typography>
                                <Typography color="text.secondary" sx={{ mb: 1 }}>{cliente.email}</Typography>
                                <Typography color="text.secondary">{cliente.telefone}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleEditClick(cliente)}>Editar</Button>
                                <Button size="small" color="error" onClick={() => handleDeleteCliente(cliente.id)}>Deletar</Button>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography>Você ainda não cadastrou nenhum cliente.</Typography>
                )}
            </Box>
        </Box>
    );
}

export default ClientesPage;