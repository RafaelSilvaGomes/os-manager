// src/pages/ServicosPage.jsx (VERSÃO MODERNA - CORRIGIDA COM PROP TOKEN)

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Collapse,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

// 1. Aceita 'token' e 'onLogout' como props
function ServicosPage({ token, onLogout }) {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [editingServico, setEditingServico] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = useTheme();

  // Estado do Snackbar (sem mudanças)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // useEffect agora depende da prop 'token'
  useEffect(() => {
    const fetchServicos = async () => {
      // 2. Verifica a prop 'token'
      if (!token) {
        setLoading(false);
        setServicos([]); // Limpa serviços se não houver token
        return;
      }
      setLoading(true);
      try {
        // 3. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/servicos/",
          config
        );
        setServicos(response.data);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        if (error.response && error.response.status === 401) {
          // Só chama logout se a prop existir
          if (onLogout) onLogout();
        } else {
          setSnackbar({
            open: true,
            message: "Erro ao buscar dados.",
            severity: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
    // 4. Adiciona 'token' às dependências
  }, [token, onLogout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 5. Verifica a prop 'token'
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação. Tente logar novamente.",
        severity: "error",
      });
      return;
    }
    const servicoData = { nome, descricao, preco };

    try {
      // 6. Usa a prop 'token' na configuração
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let updatedService = null; // Para atualizar estado local

      if (editingServico) {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/servicos/${editingServico.id}/`,
          servicoData,
          config
        );
        updatedService = response.data;
        setSnackbar({
          open: true,
          message: "Serviço atualizado com sucesso!",
          severity: "success",
        });
      } else {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/servicos/",
          servicoData,
          config
        );
        updatedService = response.data;
        setSnackbar({
          open: true,
          message: "Serviço cadastrado com sucesso!",
          severity: "success",
        });
      }

      // Atualiza estado local para feedback imediato
      if (editingServico) {
        setServicos(
          servicos.map((s) => (s.id === updatedService.id ? updatedService : s))
        );
      } else {
        setServicos([...servicos, updatedService]);
      }

      // fetchServicos(); // Não é mais estritamente necessário
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar serviço.",
        severity: "error",
      });
      // 7. Adiciona tratamento de 401
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  const handleDeleteServico = async (servicoId) => {
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
    if (window.confirm("Tem certeza que deseja deletar este serviço?")) {
      try {
        // 9. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/servicos/${servicoId}/`,
          config
        );
        setServicos(servicos.filter((servico) => servico.id !== servicoId));
        setSnackbar({
          open: true,
          message: "Serviço deletado com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar serviço:", error);
        setSnackbar({
          open: true,
          message: "Erro ao deletar serviço.",
          severity: "error",
        });
        // 10. Adiciona tratamento de 401
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    }
  };

  // --- Funções handleEditClick, handleCancel, clearForm, handleCloseSnackbar (sem mudanças) ---
  const handleEditClick = (servico) => {
    setEditingServico(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao || "");
    setPreco(servico.preco);
    setIsFormOpen(true);
    window.scrollTo(0, 0); // Rola para o topo
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

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Renderização (ajuste no loading) ---
  if (loading && servicos.length === 0) {
    // Mostra loading só se não houver dados ainda
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
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
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DesignServicesIcon fontSize="large" />
          <Typography variant="h5" component="h2">
            Meus Serviços
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            clearForm();
            setIsFormOpen(true);
          }}
        >
          Adicionar Serviço
        </Button>
      </Box>

      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingServico ? "Editar Serviço" : "Cadastrar Novo Serviço"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "1fr", // Mobile
              [theme.breakpoints.up("sm")]: {
                gridTemplateColumns: "1fr 1fr", // Desktop
              },
            }}
          >
            <TextField
              label="Nome do Serviço"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <TextField
              label="Preço (R$)"
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              rows={3}
              sx={{ [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" } }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" },
              }}
            >
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

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("sm")]: {
            gridTemplateColumns: "repeat(3, 1fr)",
          },
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
          [theme.breakpoints.up("lg")]: {
            gridTemplateColumns: "repeat(5, 1fr)",
          },
        }}
      >
        {servicos.length > 0 ? (
          servicos.map((servico) => (
            <Card key={servico.id} elevation={3}>
              <CardContent
                sx={{
                  position: "relative",
                  p: 1.5,
                  "&:last-child": {
                    pb: 1.5,
                  },
                }}
              >
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(servico)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteServico(servico.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    pr: 9,
                    fontSize: "1.1rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {servico.nome}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    minHeight: "40px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {servico.descricao || "Sem descrição"}
                </Typography>

                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  R$ {servico.preco}
                </Typography>
              </CardContent>
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
            <Typography>Você ainda não cadastrou nenhum serviço.</Typography>
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

export default ServicosPage;
