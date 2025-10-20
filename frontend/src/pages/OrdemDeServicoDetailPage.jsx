// src/pages/OrdemDeServicoDetailPage.jsx (VERSÃO COMPLETA E FINAL)

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Todas as importações que precisamos do Material-UI
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import AddMaterialForm from "../components/AddMaterialForm";
import AddPagamentoForm from "../components/AddPagamentoForm";

function OrdemDeServicoDetailPage() {
  const { id } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FUNÇÕES DE LÓGICA ---

  const fetchOrdemDetalhes = async () => {
    // Não vamos mais mostrar o 'loading' em cada refresh, só no inicial
    // setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `http://127.0.0.1:8000/api/ordens/${id}/`,
        config
      );
      setOrdem(response.data);
    } catch (error) {
      console.error(`Erro ao buscar detalhes da OS #${id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Ativa o loading só na primeira vez que a página carrega
    fetchOrdemDetalhes();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "AB":
        return "primary";
      case "EA":
        return "warning";
      case "FN":
        return "success";
      case "PG":
        return "success";
      case "CA":
        return "error";
      default:
        return "default";
    }
  };

  const handleDeleteMaterialUtilizado = async (itemId) => {
    if (window.confirm("Tem certeza que deseja remover este material?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/materiais-utilizados/${itemId}/`,
          config
        );
        alert("Material removido com sucesso!");
        fetchOrdemDetalhes(); // Recarrega os dados da OS para atualizar tudo
      } catch (error) {
        console.error("Erro ao remover material:", error);
        alert("Erro ao remover material.");
      }
    }
  };

  const handleDeletePagamento = async (pagamentoId) => {
    if (window.confirm("Tem certeza que deseja remover este pagamento?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/pagamentos/${pagamentoId}/`,
          config
        );
        alert("Pagamento removido com sucesso!");
        fetchOrdemDetalhes(); // Recarrega os dados da OS
      } catch (error) {
        console.error("Erro ao remover pagamento:", error);
        alert("Erro ao remover pagamento.");
      }
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) {
    return <p>Carregando detalhes...</p>;
  }
  if (!ordem) {
    return <p>Ordem de Serviço não encontrada.</p>;
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          {/* CORREÇÃO: Mostra o nome do cliente */}
          OS #{ordem.id} - {ordem.cliente.nome}
        </Typography>
        <Chip label={ordem.status} color={getStatusColor(ordem.status)} />
      </Box>

      {/* Card de Informações Gerais */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações Gerais
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Cliente:</strong> {ordem.cliente.nome}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {ordem.cliente.telefone || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Endereço do Serviço:</strong>{" "}
                {ordem.endereco_servico || "N/A"}
              </Typography>
              <Typography>
                <strong>Data Agendada:</strong>{" "}
                {ordem.data_agendamento
                  ? new Date(ordem.data_agendamento).toLocaleString()
                  : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
                Valor Total: R$ {ordem.valor_total}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grid de Serviços e Materiais */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Serviços Incluídos
              </Typography>
              {/* CORREÇÃO: O campo é 'servicos' (do serializer), não 'servicos_details' */}
              {ordem.servicos && ordem.servicos.length > 0 ? (
                <List dense>
                  {ordem.servicos.map((s) => (
                    <ListItem key={s.id}>
                      <ListItemText
                        primary={s.nome}
                        secondary={`R$ ${s.preco}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">Nenhum serviço.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Materiais Utilizados
              </Typography>
              {ordem.materiais_utilizados &&
              ordem.materiais_utilizados.length > 0 ? (
                <List dense>
                  {ordem.materiais_utilizados.map((m) => (
                    <ListItem
                      key={m.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteMaterialUtilizado(m.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      {/* CORREÇÃO: O objeto do material está em m.material */}
                      <ListItemText
                        primary={`${m.quantidade}x ${m.material.nome}`}
                        secondary={`R$ ${m.material.preco_unidade} / ${m.material.unidade_medida}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">Nenhum material.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Grid de Pagamentos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pagamentos Registrados
              </Typography>
              {ordem.pagamentos && ordem.pagamentos.length > 0 ? (
                <List dense>
                  {ordem.pagamentos.map((p) => (
                    <ListItem
                      key={p.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeletePagamento(p.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`R$ ${p.valor_pago} (${p.forma_pagamento})`}
                        secondary={`em ${new Date(
                          p.data_pagamento
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">
                  Nenhum pagamento registrado.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }}>Ações</Divider>

      {/* Grid de Ações (Formulários) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Adicionar Material
          </Typography>
          <AddMaterialForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Registrar Pagamento
          </Typography>
          <AddPagamentoForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default OrdemDeServicoDetailPage;
