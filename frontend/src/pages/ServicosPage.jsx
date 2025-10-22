// src/pages/ServicosPage.jsx (VERSÃO MODERNA COM CSS GRID)

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
  CircularProgress, // NOVO
  Snackbar, // NOVO
  Alert, // NOVO
  useTheme, // NOVO
  IconButton, // NOVO
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // NOVO
import DesignServicesIcon from "@mui/icons-material/DesignServices"; // NOVO
import EditIcon from "@mui/icons-material/Edit"; // NOVO
import DeleteIcon from "@mui/icons-material/Delete"; // NOVO
import InfoIcon from "@mui/icons-material/Info"; // NOVO

function ServicosPage({ onLogout }) {
  // Adicionando onLogout
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [editingServico, setEditingServico] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = useTheme(); // NOVO

  // NOVO: Estado do Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
    fetchServicos();
  }, [onLogout]); // Adicionado

  // ALTERADO: Lógica de Create/Update unificada
  const handleSubmit = async (event) => {
    event.preventDefault();
    const servicoData = { nome, descricao, preco };

    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingServico) {
        await axios.put(
          `http://127.0.0.1:8000/api/servicos/${editingServico.id}/`,
          servicoData,
          config
        );
        setSnackbar({
          open: true,
          message: "Serviço atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/servicos/",
          servicoData,
          config
        );
        setSnackbar({
          open: true,
          message: "Serviço cadastrado com sucesso!",
          severity: "success",
        });
      }
      fetchServicos();
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar serviço.",
        severity: "error",
      });
    }
  };

  // REMOVIDO: handleCreateServico e handleUpdateServico (unificados acima)

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
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Serviço deletado com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar serviço:", error);
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Erro ao deletar serviço.",
          severity: "error",
        });
      }
    }
  };

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

  // NOVO: Handler do Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ALTERADO: Estado de loading
  if (loading) {
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
    <Box>
      {/* ALTERADO: Header com ícones */}
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

      {/* Formulário */}
      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingServico ? "Editar Serviço" : "Cadastrar Novo Serviço"}
          </Typography>

          {/* ALTERADO: Formulário com CSS GRID */}
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
              // Ocupa 2 colunas no desktop
              sx={{ [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" } }}
            />

            {/* Box dos botões, ocupa 2 colunas no desktop */}
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

      {/* ALTERADO: Lista de Serviços com CSS GRID (layout compacto) */}
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
              {/* Usando o mesmo layout de card compacto do MateriaisPage */}
              <CardContent
                sx={{
                  position: "relative",
                  p: 1.5, // Padding compacto
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
                    pr: 9, // Espaço para botões
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
          // ALTERADO: Estado Vazio melhorado
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
            <Typography>Você ainda não cadastrou nenhum serviço.</Typography>
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

export default ServicosPage;
