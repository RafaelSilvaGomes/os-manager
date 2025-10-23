// src/pages/OrdensDeServicoPage.jsx (VERSÃO MODERNA - CORRIGIDA COM PROP TOKEN)

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
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

// 1. Aceita 'token' e 'onLogout' como props
function OrdensDeServicoPage({ token, onLogout }) {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Estado do Snackbar (sem mudanças)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // useEffect agora depende da prop 'token'
  useEffect(() => {
    const fetchOrdens = async () => {
      // 2. Verifica a prop 'token'
      if (!token) {
        setLoading(false);
        setOrdens([]); // Limpa as ordens se não houver token
        return;
      }
      setLoading(true);
      try {
        // 3. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/ordens/",
          config
        );
        setOrdens(response.data);
      } catch (error) {
        console.error("Erro ao buscar Ordens de Serviço:", error);
        if (error.response && error.response.status === 401) {
          // Só chama logout se a prop existir
          if (onLogout) onLogout();
        } else {
          setSnackbar({
            open: true,
            message: "Erro ao buscar Ordens de Serviço.",
            severity: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrdens();
    // 4. Adiciona 'token' às dependências
  }, [token, onLogout]);

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

  const handleDeleteOrdem = async (ordemId) => {
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
    if (
      window.confirm(
        "Tem certeza que deseja deletar esta Ordem de Serviço? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        // 6. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/ordens/${ordemId}/`,
          config
        );
        setOrdens(ordens.filter((ordem) => ordem.id !== ordemId));
        setSnackbar({
          open: true,
          message: "Ordem de Serviço deletada com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar OS:", error);
        setSnackbar({
          open: true,
          message: "Erro ao deletar a Ordem de Serviço.",
          severity: "error",
        });
        // 7. Adiciona tratamento de 401
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  // --- Renderização (ajuste no loading) ---
  if (loading && ordens.length === 0) {
    // Mostra loading só se não houver dados ainda
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
    // Seu JSX existente continua aqui...
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
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

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("sm")]: {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "repeat(3, 1fr)",
          },
          [theme.breakpoints.up("lg")]: {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
        }}
      >
        {ordens.length > 0 ? (
          ordens.map((ordem) => (
            <Card
              key={ordem.id}
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardActionArea component={Link} to={`/ordens/${ordem.id}`}>
                <CardContent sx={{ width: "100%", p: 1.5 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">OS #{ordem.id}</Typography>
                    <Chip
                      label={getStatusLabel(ordem.status)}
                      color={getStatusColor(ordem.status)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Cliente: {ordem.cliente.nome}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{
                      mt: 0.5,
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    R$ {ordem.valor_total}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions sx={{ justifyContent: "flex-end", p: 0.5, pt: 0 }}>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteOrdem(ordem.id)}
                  startIcon={<DeleteIcon />}
                >
                  Deletar
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              gridColumn: "1 / -1",
            }}
          >
            <InfoIcon color="action" />
            <Typography>Nenhuma Ordem de Serviço encontrada.</Typography>
          </Paper>
        )}
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
    </Box>
  );
}

export default OrdensDeServicoPage;
