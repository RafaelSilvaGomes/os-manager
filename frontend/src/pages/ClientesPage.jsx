// src/pages/ClientesPage.jsx (VERSÃO ATUALIZADA)

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Collapse, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ClientesPage({ onLogout }) { 
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [pontoReferencia, setPontoReferencia] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [editingClient, setEditingClient] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchClientes = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) { setLoading(false); return; }
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get('http://127.0.0.1:8000/api/clientes/', config);
            setClientes(response.data);
        } catch (error) { console.error('Erro ao buscar clientes:', error);
            if (error.response && error.response.status === 401) {
                alert('Sua sessão expirou. Por favor, faça login novamente.');
                onLogout(); // Desloga o usuário
            }
         }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const clienteData = { nome, email, telefone, endereco, ponto_referencia: pontoReferencia, observacoes };

        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            if (editingClient) {
                await axios.put(`http://127.0.0.1:8000/api/clientes/${editingClient.id}/`, clienteData, config);
                alert('Cliente atualizado com sucesso!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/clientes/', clienteData, config);
                alert('Cliente cadastrado com sucesso!');
            }
            fetchClientes();
            setIsFormOpen(false);
            clearForm();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao salvar cliente.');
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
            setIsFormOpen(false); // 2. FECHA o formulário após o sucesso
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
            setIsFormOpen(false); // 3. FECHA o formulário após o sucesso
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
        setEmail(cliente.email || '');
        setTelefone(cliente.telefone || '');
        setEndereco(cliente.endereco || '');
        setPontoReferencia(cliente.ponto_referencia || '');
        setObservacoes(cliente.observacoes || '');
        setIsFormOpen(true);
    };
    
    const handleCancel = () => {
        clearForm();
        setIsFormOpen(false);
    };

    const clearForm = () => {
        setNome('');
        setEmail('');
        setTelefone('');
        setEndereco('');
        setPontoReferencia('');
        setObservacoes('');
        setEditingClient(null);
    };

    if (loading) { return <p>Carregando clientes...</p>; }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">Meus Clientes</Typography>
                <Button variant="contained" onClick={() => { clearForm(); setIsFormOpen(true); }}>
                    Cadastrar Cliente
                </Button>
            </Box>

            <Collapse in={isFormOpen}>
                <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                        {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                    </Typography>
                    {/* 4. FORMULÁRIO COM OS NOVOS CAMPOS */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth />
                        <TextField label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} fullWidth />
                        <TextField label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} fullWidth />
                        <TextField label="Ponto de Referência" value={pontoReferencia} onChange={(e) => setPontoReferencia(e.target.value)} fullWidth />
                        <TextField label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} fullWidth multiline rows={3} />
                        <TextField label="Email (opcional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                            <Button type="button" onClick={handleCancel} variant="outlined">Cancelar</Button>
                            <Button type="submit" variant="contained">{editingClient ? 'Salvar' : 'Cadastrar'}</Button>
                        </Box>
                    </Box>
                </Paper>
            </Collapse>

            {/* 5. TABELA ATUALIZADA PARA MOSTRAR O ENDEREÇO */}
            <TableContainer component={Paper}>
                <Table size="small" sx={{ minWidth: 650 }} aria-label="tabela de clientes">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Endereço</TableCell>
                            {/* 1. NOVO CABEÇALHO ADICIONADO */}
                            <TableCell sx={{ fontWeight: 'bold' }}>Ponto de Referência</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clientes.length > 0 ? (
                            clientes.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell>{cliente.nome}</TableCell>
                                    <TableCell>{cliente.telefone}</TableCell>
                                    <TableCell>{cliente.endereco}</TableCell>
                                    {/* 2. NOVO DADO SENDO EXIBIDO */}
                                    <TableCell>{cliente.ponto_referencia}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleEditClick(cliente)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDeleteCliente(cliente.id)} color="error"><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {/* 3. COLSPAN ATUALIZADO PARA 5 COLUNAS */}
                                <TableCell colSpan={5} align="center">
                                    Você ainda não cadastrou nenhum cliente.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ClientesPage;