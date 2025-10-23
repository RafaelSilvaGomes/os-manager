// src/pages/OrdemDeServicoDetailPage.jsx (VERSÃO MODERNA - CORRIGIDA COM PROP TOKEN)

import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  useTheme,
  Paper,
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

// Componentes filhos
import AddMaterialForm from "../components/AddMaterialForm";
import AddPagamentoForm from "../components/AddPagamentoForm";

// 1. Aceita 'token' e 'onLogout' como props
function OrdemDeServicoDetailPage({ token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado do Snackbar (sem mudanças)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- FUNÇÕES DE LÓGICA ---

  // useEffect agora depende da prop 'token'
  const fetchOrdemDetalhes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setOrdem(null);
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `http://127.0.0.1:8000/api/ordens/${id}/`,
        config
      );
      setOrdem(response.data);
    } catch (error) {
      console.error(`Erro ao buscar detalhes da OS #${id}:`, error);
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      } else {
        setSnackbar({
          open: true,
          message: "Erro ao buscar detalhes da Ordem de Serviço.",
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
    // 2. Adicione 'id', 'token' e 'onLogout' como dependências do useCallback
  }, [id, token, onLogout]);

  // 3. O useEffect agora apenas chama a função
  useEffect(() => {
    fetchOrdemDetalhes();
    // 4. A dependência do useEffect agora é a própria função
  }, [fetchOrdemDetalhes]);

  // Funções de Status (sem mudanças)
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

  // Handler do Snackbar (sem mudanças)
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteMaterialUtilizado = async (itemId) => {
    // 5. Verifica a prop 'token'
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação.",
        severity: "error",
      });
      return;
    }
    // TODO: Substituir window.confirm
    if (window.confirm("Tem certeza que deseja remover este material?")) {
      try {
        // 6. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/materiais-utilizados/${itemId}/`,
          config
        );
        setSnackbar({
          open: true,
          message: "Material removido com sucesso!",
          severity: "success",
        });
        // Chama fetchOrdemDetalhes para atualizar a lista e totais
        fetchOrdemDetalhes(); // Rebusca os dados completos da OS
      } catch (error) {
        console.error("Erro ao remover material:", error);
        setSnackbar({
          open: true,
          message: "Erro ao remover material.",
          severity: "error",
        });
        // 7. Adiciona tratamento de 401
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  const handleDeletePagamento = async (pagamentoId) => {
    // 8. Verifica a prop 'token'
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação.",
        severity: "error",
      });
      return;
    }
    // TODO: Substituir window.confirm
    if (window.confirm("Tem certeza que deseja remover este pagamento?")) {
      try {
        // 9. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/pagamentos/${pagamentoId}/`,
          config
        );
        setSnackbar({
          open: true,
          message: "Pagamento removido com sucesso!",
          severity: "success",
        });
        // Chama fetchOrdemDetalhes para atualizar a lista e totais
        fetchOrdemDetalhes(); // Rebusca os dados completos da OS
      } catch (error) {
        console.error("Erro ao remover pagamento:", error);
        setSnackbar({
          open: true,
          message: "Erro ao remover pagamento.",
          severity: "error",
        });
        // 10. Adiciona tratamento de 401
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  // --- RENDERIZAÇÃO ---

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
  if (!ordem) {
    return (
      <Paper
        sx={{
          p: 3,
          m: 3, // Margem para não colar nas bordas
          display: "flex",
          flexDirection: "column", // Empilha os itens
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <InfoIcon color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="text.secondary">
          Ordem de Serviço não encontrada.
        </Typography>
        <Typography color="text.secondary">
          Ela pode ter sido deletada ou o ID está incorreto.
        </Typography>
        <Button component={Link} to="/ordens" sx={{ mt: 2 }}>
          Voltar para Lista
        </Button>
      </Paper>
    );
  }

  return (
    // Seu JSX existente continua aqui...
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            component={Link}
            to="/ordens"
            aria-label="Voltar para lista de ordens"
          >
            <ArrowBackIcon />
          </IconButton>
          <ReceiptLongIcon fontSize="large" />
          <Typography variant="h4" component="h1">
            OS #{ordem.id} - {ordem.cliente.nome}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(ordem.status)}
          color={getStatusColor(ordem.status)}
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      {/* Card Info Gerais */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AccountCircleIcon />
            <Typography variant="h6">Informações Gerais</Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box>
              <Typography>
                <strong>Cliente:</strong> {ordem.cliente.nome}
              </Typography>
              <Typography>
                <strong>Telefone:</strong> {ordem.cliente.telefone || "N/A"}
              </Typography>
            </Box>
            <Box>
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

      {/* Grid Serviços / Materiais */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          mb: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
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
                        color="error" // Adiciona cor ao botão
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

      {/* Card Pagamentos */}
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
                      color="error" // Adiciona cor ao botão
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`R$ ${p.valor_pago} (${p.forma_pagamento_display})`}
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

      <Divider sx={{ my: 4 }}>
        <Chip icon={<AddCircleOutlineIcon />} label="Adicionar Itens à OS" />
      </Divider>

      {/* Grid Formulários de Ação */}
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
          {/* Passando a prop token para os forms filhos */}
          <AddMaterialForm
            token={token}
            ordemId={id}
            onSuccess={fetchOrdemDetalhes}
            onLogout={onLogout}
            setSnackbar={setSnackbar} // <-- ADICIONE ESTA LINHA
          />
        </Paper>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registrar Pagamento
          </Typography>
          {/* Passando a prop token para os forms filhos */}
          <AddPagamentoForm
            token={token}
            ordemId={id}
            onSuccess={fetchOrdemDetalhes}
            onLogout={onLogout}
          />
        </Paper>
      </Box>

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
