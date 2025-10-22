// src/pages/OrdensDeServicoPage.jsx (VERSÃO MODERNA)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CardActions,
  CircularProgress, // NOVO
  Snackbar, // NOVO
  Alert, // NOVO
  useTheme, // NOVO
  Paper, // NOVO
  IconButton, // NOVO
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // NOVO
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // NOVO
import DeleteIcon from "@mui/icons-material/Delete"; // NOVO
import InfoIcon from "@mui/icons-material/Info"; // NOVO

function OrdensDeServicoPage({ onLogout }) {
  // Adicionado onLogout
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // NOVO

  // NOVO: Estado do Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchOrdens = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/ordens/",
          config
        );
        setOrdens(response.data);
      } catch (error) {
        console.error("Erro ao buscar Ordens de Serviço:", error);
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
    fetchOrdens();
  }, [onLogout]); // Adicionado

  // Uma função para dar cor aos status
  const getStatusColor = (status) => {
    switch (status) {
      case "AB":
        return "primary";
      case "EA":
        return "warning";
      case "FN":
        return "success";
      case "PG":
        return "secondary"; // PG (Paga) pode ser 'secondary' ou 'success'
      case "CA":
        return "error";
      default:
        return "default";
    }
  };

  // NOVO: Função para traduzir os status
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

  const handleDeleteOrdem = async (ordemId) => {
    // Substituindo o window.confirm por um snackbar de confirmação (em uma v2)
    // Por enquanto, mantemos o confirm, mas trocamos os alerts.
    if (
      window.confirm(
        "Tem certeza que deseja deletar esta Ordem de Serviço? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/ordens/${ordemId}/`,
          config
        );
        setOrdens(ordens.filter((ordem) => ordem.id !== ordemId));
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Ordem de Serviço deletada com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar OS:", error);
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Erro ao deletar a Ordem de Serviço.",
          severity: "error",
        });
      }
    }
  };

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

  return (
    <Box>
      {/* ALTERADO: Header com ícones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3, // Aumentei a margem
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongIcon fontSize="large" />
          <Typography variant="h5" component="h2">
            Ordens de Serviço
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/ordens/novo"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Criar Nova OS
        </Button>
      </Box>

      {/* ALTERADO: Lista de OS com CSS GRID */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(1, 1fr)", // Mobile
          [theme.breakpoints.up("sm")]: {
            gridTemplateColumns: "repeat(2, 1fr)", // Tablet
          },
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "repeat(3, 1fr)", // Desktop
          },
          [theme.breakpoints.up("lg")]: {
            gridTemplateColumns: "repeat(4, 1fr)", // Desktop Grande
          },
        }}
      >
        {ordens.length > 0 ? (
          ordens.map((ordem) => (
            <Card key={ordem.id} elevation={3}>
              {/* CardActionArea faz o card inteiro ser clicável */}
              <CardActionArea
                component={Link}
                to={`/ordens/${ordem.id}`}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent sx={{ width: "100%", p: 2, pb: 1 }}>
                  {" "}
                  {/* Padding mais compacto */}
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">OS #{ordem.id}</Typography>
                    <Chip
                      // ALTERADO: Usando o label traduzido
                      label={getStatusLabel(ordem.status)}
                      color={getStatusColor(ordem.status)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                  <Typography color="text.secondary" noWrap>
                    {" "}
                    {/* noWrap corta nomes longos */}
                    Cliente: {ordem.cliente.nome}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    R$ {ordem.valor_total}
                  </Typography>
                </CardContent>
                {/* O CardActionArea ocupa todo o espaço, então CardActions fica fora dele */}
              </CardActionArea>

              <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                {/* O botão de deletar fica fora do link principal */}
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteOrdem(ordem.id)}
                  startIcon={<DeleteIcon />} // NOVO: Ícone
                >
                  Deletar
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          // ALTERADO: Estado Vazio
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              gridColumn: "1 / -1", // Ocupa a grade inteira
            }}
          >
            <InfoIcon color="action" />
            <Typography>Nenhuma Ordem de Serviço encontrada.</Typography>
          </Paper>
        )}
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
    </Box>
  );
}

export default OrdensDeServicoPage;
