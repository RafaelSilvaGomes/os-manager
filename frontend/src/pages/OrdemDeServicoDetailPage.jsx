// src/pages/OrdemDeServicoDetailPage.jsx (VERSÃO MODERNA)

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Adicionado useNavigate
import axios from "axios";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress, // NOVO
  Snackbar, // NOVO
  Alert, // NOVO
  Button, // NOVO
  useTheme, // NOVO
  Paper, // NOVO
} from "@mui/material";
// ÍCONES
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaymentIcon from "@mui/icons-material/Payment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";

import AddMaterialForm from "../components/AddMaterialForm";
import AddPagamentoForm from "../components/AddPagamentoForm";

// Vamos assumir que onLogout é passado para consistência
function OrdemDeServicoDetailPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate(); // NOVO
  const theme = useTheme(); // NOVO
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  // NOVO: Estado do Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- FUNÇÕES DE LÓGICA ---

  const fetchOrdemDetalhes = async () => {
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
      if (error.response && error.response.status === 401) {
        setSnackbar({
          open: true,
          message: "Sua sessão expirou.",
          severity: "error",
        });
        if (onLogout) onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrdemDetalhes();
  }, [id, onLogout]); // Adicionado onLogout

  // Funções de Status (copiadas da página de listagem)
  const getStatusColor = (status) => {
    switch (status) {
      case "AB":
        return "primary";
      case "EA":
        return "warning";
      case "FN":
        return "success";
      case "PG":
        return "secondary";
      case "CA":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "AB":
        return "Aberta";
      case "EA":
        return "Em Andamento";
      case "FN":
        return "Finalizada";
      case "PG":
        return "Paga";
      case "CA":
        return "Cancelada";
      default:
        return status;
    }
  };

  // NOVO: Handler do Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // TODO: Substituir window.confirm por um Dialog/Modal de confirmação

  const handleDeleteMaterialUtilizado = async (itemId) => {
    if (window.confirm("Tem certeza que deseja remover este material?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/materiais-utilizados/${itemId}/`,
          config
        );
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Material removido com sucesso!",
          severity: "success",
        });
        fetchOrdemDetalhes();
      } catch (error) {
        console.error("Erro ao remover material:", error);
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Erro ao remover material.",
          severity: "error",
        });
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
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Pagamento removido com sucesso!",
          severity: "success",
        });
        fetchOrdemDetalhes();
      } catch (error) {
        console.error("Erro ao remover pagamento:", error);
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Erro ao remover pagamento.",
          severity: "error",
        });
      }
    }
  };

  // --- RENDERIZAÇÃO ---

  // ALTERADO: Estado de loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  // ALTERADO: Estado vazio
  if (!ordem) {
    return (
      <Paper
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          m: 3,
        }}
      >
        <InfoIcon color="error" />
        <Typography>
          Ordem de Serviço não encontrada ou foi deletada.
        </Typography>
      </Paper>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        {/* NOVO: Botão Voltar + Título com Ícone */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton component={Link} to="/ordens">
            <ArrowBackIcon />
          </IconButton>
          <ReceiptLongIcon fontSize="large" />
          <Typography variant="h4" component="h1">
            OS #{ordem.id} - {ordem.cliente.nome}
          </Typography>
        </Box>
        {/* ALTERADO: Chip com label traduzido */}
        <Chip
          label={getStatusLabel(ordem.status)}
          color={getStatusColor(ordem.status)}
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      {/* Card de Informações Gerais (COM CSS GRID) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AccountCircleIcon />
            <Typography variant="h6">Informações Gerais</Typography>
          </Box>

          {/* ALTERADO: Substituído <Grid> por <Box display: 'grid'> */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box>
              {" "}
              {/* Coluna 1 */}
              <Typography>
                <strong>Cliente:</strong> {ordem.cliente.nome}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {ordem.cliente.telefone || "N/A"}
              </Typography>
            </Box>
            <Box>
              {" "}
              {/* Coluna 2 */}
              <Typography>
                <strong>Endereço do Serviço:</strong>{" "}
                {ordem.endereco_servico || "N/A"}
              </Typography>
              <Typography>
                <strong>Data Agendada:</strong>{" "}
                {ordem.data_agendamento
                  ? new Date(ordem.data_agendamento).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Valor Total */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Valor Total: R$ {ordem.valor_total}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              (Serviços: R$ {ordem.valor_servicos} + Materiais: R${" "}
              {ordem.valor_materiais})
            </Typography>
            <Typography
              variant="h6"
              color="success.main"
              sx={{ fontWeight: "bold", mt: 1 }}
            >
              Valor Pago: R$ {ordem.valor_pago}
            </Typography>
            <Typography
              variant="h6"
              color={ordem.valor_pendente > 0 ? "error.main" : "text.primary"}
              sx={{ fontWeight: "bold" }}
            >
              Pendente: R$ {ordem.valor_pendente}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Grid de Serviços, Materiais e Pagamentos (COM CSS GRID) */}
      {/* ALTERADO: Substituído <Grid container> por <Box display: 'grid'> */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          mb: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        {/* Coluna 1: Serviços */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DesignServicesIcon />
              <Typography variant="h6">Serviços Incluídos</Typography>
            </Box>
            {ordem.servicos && ordem.servicos.length > 0 ? (
              <List dense>
                {ordem.servicos.map((s) => (
                  <ListItem key={s.id} sx={{ pl: 0 }}>
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

        {/* Coluna 2: Materiais */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Inventory2Icon />
              <Typography variant="h6">Materiais Utilizados</Typography>
            </Box>
            {ordem.materiais_utilizados &&
            ordem.materiais_utilizados.length > 0 ? (
              <List dense>
                {ordem.materiais_utilizados.map((m) => (
                  <ListItem
                    key={m.id}
                    sx={{ pl: 0 }}
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
      </Box>

      {/* Card de Pagamentos (ocupa a linha inteira) */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <PaymentIcon />
            <Typography variant="h6">Pagamentos Registrados</Typography>
          </Box>
          {ordem.pagamentos && ordem.pagamentos.length > 0 ? (
            <List dense>
              {ordem.pagamentos.map((p) => (
                <ListItem
                  key={p.id}
                  sx={{ pl: 0 }}
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
                    primary={`R$ ${p.valor_pago} (${p.forma_pagamento_display})`} // Use o _display
                    secondary={`em ${new Date(
                      p.data_pagamento
                    ).toLocaleDateString("pt-BR")}`}
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

      {/* Divider de Ações */}
      <Divider sx={{ my: 4 }}>
        <Chip icon={<AddCircleOutlineIcon />} label="Adicionar Itens à OS" />
      </Divider>

      {/* Grid de Ações (Formulários) (COM CSS GRID) */}
      {/* ALTERADO: Substituído <Grid container> por <Box display: 'grid'> */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Adicionar Material
          </Typography>
          <AddMaterialForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
        </Paper>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registrar Pagamento
          </Typography>
          <AddPagamentoForm ordemId={id} onSuccess={fetchOrdemDetalhes} />
        </Paper>
      </Box>

      {/* NOVO: Componente Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default OrdemDeServicoDetailPage;
