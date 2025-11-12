import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from 'dayjs';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaymentIcon from "@mui/icons-material/Payment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddMaterialForm from "../components/AddMaterialForm";
import AddPagamentoForm from "../components/AddPagamentoForm";

function OrdemDeServicoDetailPage({ token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [newAgendamento, setNewAgendamento] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

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
  }, [id, token, onLogout]);

  useEffect(() => {
    fetchOrdemDetalhes();
  }, [fetchOrdemDetalhes]);

  const getStatusColor = (status) => {
    switch (status) {
      case "AB":
        return "primary";
      case "EA":
        return "warning";
      case "FN":
        return "warning";
      case "PG":
        return "success";
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
        return "Finalizada (Pendente)";
      case "PG":
        return "Finalizada";
      case "CA":
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleFinalizarOS = async () => {
    if (!token) {
        setSnackbar({ open: true, message: "Erro de autenticação.", severity: "error" });
        return;
    }
    if (window.confirm("Tem certeza que deseja marcar este serviço como finalizado?")) {
        setIsFinalizing(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(
                `http://127.0.0.1:8000/api/ordens/${id}/finalizar/`,
                {},
                config
            );
            setSnackbar({
                open: true,
                message: "Serviço marcado como finalizado!",
                severity: "success",
            });
            fetchOrdemDetalhes();
        } catch (error) {
            console.error("Erro ao finalizar OS:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.detail || "Erro ao finalizar serviço.",
                severity: "error",
            });
            if (error.response && error.response.status === 401) {
                if (onLogout) onLogout();
            }
        } finally {
            setIsFinalizing(false);
        }
    }
  };

  const formatarDuracao = (horas) => {
    if (!horas) return "N/A";
    
    const horasNum = parseFloat(horas);
    if (isNaN(horasNum)) return "N/A";

    const horasFormatadas = horasNum.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    const sufixo = horasNum === 1 ? "hora" : "horas";
    
    return `${horasFormatadas} ${sufixo}`;
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteMaterialUtilizado = async (itemId) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação.",
        severity: "error",
      });
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este material?")) {
      try {
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
        fetchOrdemDetalhes();
      } catch (error) {
        console.error("Erro ao remover material:", error);
        setSnackbar({
          open: true,
          message: "Erro ao remover material.",
          severity: "error",
        });
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  const handleDeletePagamento = async (pagamentoId) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação.",
        severity: "error",
      });
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este pagamento?")) {
      try {
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
        fetchOrdemDetalhes();
      } catch (error) {
        console.error("Erro ao remover pagamento:", error);
        setSnackbar({
          open: true,
          message: "Erro ao remover pagamento.",
          severity: "error",
        });
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  const handleOpenReschedule = () => {
    setNewAgendamento(ordem.data_agendamento ? dayjs(ordem.data_agendamento) : null);
    setOpenRescheduleDialog(true);
  };

  const handleCloseReschedule = () => {
    setOpenRescheduleDialog(false);
    setNewAgendamento(null);
  };

  const handleSaveReschedule = async () => {
    if (!token) {
      setSnackbar({ open: true, message: "Erro de autenticação.", severity: "error" });
      return;
    }
    setIsRescheduling(true);
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        data_agendamento: newAgendamento ? newAgendamento.toISOString() : null
      };
      
      await axios.patch(
        `http://127.0.0.1:8000/api/ordens/${id}/`,
        payload,
        config
      );
      
      setSnackbar({ open: true, message: "OS reagendada com sucesso!", severity: "success" });
      handleCloseReschedule();
      fetchOrdemDetalhes();
      
    } catch (error) {
      console.error("Erro ao reagendar OS:", error.response?.data || error);
      
      const errorData = error.response?.data;
      let errorMessage = "Erro ao reagendar OS.";
      if (errorData) {
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.data_agendamento) {
          errorMessage = `Data: ${errorData.data_agendamento[0]}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setIsRescheduling(false);
    }
  };

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
          m: 3,
          display: "flex",
          flexDirection: "column",
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={getStatusLabel(ordem.status)}
            color={getStatusColor(ordem.status)}
            sx={{ fontWeight: "bold" }}
          />

          {(ordem.status === 'AB' || ordem.status === 'EA' || ordem.status === 'FN') && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditCalendarIcon />}
              onClick={handleOpenReschedule}
            >
              Reagendar
            </Button>
          )}

          {(ordem.status === 'AB' || ordem.status === 'EA') && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleFinalizarOS}
              disabled={isFinalizing}
            >
              {isFinalizing ? "Finalizando..." : "Finalizar Serviço"}
            </Button>
          )}
        </Box>
      </Box>

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
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                  <span>
                    <strong>Duração Estimada:</strong>{" "}
                    {formatarDuracao(ordem.duracao_estimada_horas)}
                  </span>
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
                        color="error"
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
                      color="error"
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
          <AddMaterialForm
            token={token}
            ordemId={id}
            onSuccess={fetchOrdemDetalhes}
            onLogout={onLogout}
            setSnackbar={setSnackbar}
          />
        </Paper>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registrar Pagamento
          </Typography>
          <AddPagamentoForm
            token={token}
            ordemId={id}
            onSuccess={fetchOrdemDetalhes}
            onLogout={onLogout}
            valorPendente={ordem?.valor_pendente}
          />
        </Paper>
      </Box>

      <Dialog open={openRescheduleDialog} onClose={handleCloseReschedule} maxWidth="xs" fullWidth>
        <DialogTitle>Reagendar Ordem de Serviço</DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <DateTimePicker
            label="Nova Data e Hora"
            value={newAgendamento}
            onChange={(newValue) => setNewAgendamento(newValue)}
            slotProps={{ 
              textField: { 
                fullWidth: true, 
                margin: "dense"
              } 
            }}
            ampm={false}
            format="DD/MM/YYYY HH:mm"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReschedule} disabled={isRescheduling}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveReschedule} 
            variant="contained" 
            disabled={isRescheduling}
            startIcon={isRescheduling ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isRescheduling ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

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
