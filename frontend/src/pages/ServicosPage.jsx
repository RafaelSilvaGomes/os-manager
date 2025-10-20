// src/pages/ServicosPage.jsx (VERSÃO ATUALIZADA)

import { useState, useEffect } from "react";
import axios from "axios";
// 1. IMPORTAMOS O COLLAPSE e PAPER
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Paper,
} from "@mui/material";

function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [editingServico, setEditingServico] = useState(null);

  // 2. NOVO ESTADO para controlar a visibilidade do formulário
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchServicos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/servicos/",
        config
      );
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingServico) {
      await handleUpdateServico();
    } else {
      await handleCreateServico();
    }
  };

  const handleCreateServico = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const novoServico = { nome, descricao, preco };
      await axios.post(
        "http://127.0.0.1:8000/api/servicos/",
        novoServico,
        config
      );
      alert("Serviço cadastrado com sucesso!");
      fetchServicos();
      setIsFormOpen(false); // 3. FECHA o formulário após o sucesso
      clearForm();
    } catch (error) {
      console.error("Erro ao cadastrar serviço:", error);
      alert("Erro ao cadastrar serviço.");
    }
  };

  const handleUpdateServico = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const servicoAtualizado = { nome, descricao, preco };
      await axios.put(
        `http://127.0.0.1:8000/api/servicos/${editingServico.id}/`,
        servicoAtualizado,
        config
      );
      alert("Serviço atualizado com sucesso!");
      fetchServicos();
      setIsFormOpen(false); // 4. FECHA o formulário após o sucesso
      clearForm();
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert("Erro ao atualizar serviço.");
    }
  };

  const handleDeleteServico = async (servicoId) => {
    if (window.confirm("Tem certeza que deseja deletar este serviço?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/servicos/${servicoId}/`,
          config
        );
        setServicos(servicos.filter((servico) => servico.id !== servicoId));
        alert("Serviço deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar serviço:", error);
        alert("Erro ao deletar serviço.");
      }
    }
  };

  const handleEditClick = (servico) => {
    setEditingServico(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao || "");
    setPreco(servico.preco);
    setIsFormOpen(true); // 5. ABRE o formulário ao clicar em "Editar"
  };

  const handleCancel = () => {
    clearForm();
    setIsFormOpen(false);
  };

  const clearForm = () => {
    setNome("");
    setDescricao("");
    setPreco("");
    setEditingServico(null);
  };

  if (loading) {
    return <p>Carregando serviços...</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* 6. CABEÇALHO COM TÍTULO E BOTÃO PRINCIPAL */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Meus Serviços
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            clearForm();
            setIsFormOpen(true);
          }}
        >
          Adicionar Serviço
        </Button>
      </Box>

      {/* 7. FORMULÁRIO ENVOLVIDO PELO COLLAPSE */}
      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingServico ? "Editar Serviço" : "Cadastrar Novo Serviço"}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Nome do Serviço"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            {/* Bug/typo corrigido aqui (era e.targe.value) */}
            <TextField
              label="Preço (ex: 50.00)"
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
              fullWidth
            />
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              {/* 8. BOTÃO DE CANCELAR AGORA FECHA O FORMULÁRIO */}
              <Button type="button" onClick={handleCancel} variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                {editingServico ? "Salvar" : "Cadastrar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* 9. LISTA DE SERVIÇOS (não precisamos mais do Divider) */}
      <Box>
        {/* Verificamos se o array de serviços tem itens */}
        {servicos.length > 0 ? (
          servicos.map((servico) => (
            <Card key={servico.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{servico.nome}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {servico.descricao}
                </Typography>
                <Typography variant="h6" color="primary">
                  R$ {servico.preco}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEditClick(servico)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteServico(servico.id)}
                >
                  Deletar
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          // Se não tiver, mostramos esta mensagem
          <Typography>Você ainda não cadastrou nenhum serviço.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default ServicosPage;
