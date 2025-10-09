// src/pages/ServicosPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Card, CardContent, CardActions, Divider, TextareaAutosize } from '@mui/material';

function ServicosPage() {
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [editingServico, setEditingServico] = useState(null);

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

    const handleEditClick = (servico) => {
        setEditingServico(servico);
        setNome(servico.nome);
        setDescricao(servico.descricao || '');
        setPreco(servico.preco);
    };

    const clearForm = () => {
        setNome('');
        setDescricao('');
        setPreco('');
        setEditingServico(null);
    };

    if (loading) { return <p>Carregando serviços...</p>; }

    return (
        <Box sx={{ p: 2 }}>
            <Box component="div" className="form-container">
                <Typography variant="h5" component="h2" gutterBottom>
                    {editingServico ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Nome do Serviço" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth />
                    <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} fullWidth multiline rows={3} />
                    <TextField label="Preço (ex: 50.00)" type="number" value={preco} onChange={(e) => setPreco(e.targe.value)} required fullWidth />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {editingServico && (
                            <Button type="button" onClick={clearForm} variant="outlined">Cancelar</Button>
                        )}
                        <Button type="submit" variant="contained">{editingServico ? 'Salvar' : 'Cadastrar'}</Button>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" component="h2" gutterBottom>
                Meus Serviços
            </Typography>
            
            <Box>
                {servicos.map((servico) => (
                    <Card key={servico.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{servico.nome}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{servico.descricao}</Typography>
                            <Typography variant="h6" color="primary">R$ {servico.preco}</Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => handleEditClick(servico)}>Editar</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteServico(servico.id)}>Deletar</Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default ServicosPage;