// src/pages/MateriaisPage.jsx (VERSÃO MODERNA COM CSS GRID)

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
import Inventory2Icon from "@mui/icons-material/Inventory2"; // NOVO
import EditIcon from "@mui/icons-material/Edit"; // NOVO
import DeleteIcon from "@mui/icons-material/Delete"; // NOVO
import InfoIcon from "@mui/icons-material/Info"; // NOVO

function MateriaisPage({ onLogout }) {
  // Adicionei onLogout para consistência
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // NOVO

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoUnidade, setPrecoUnidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // NOVO: Estado do Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchMateriais = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/materiais/",
        config
      );
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
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
    fetchMateriais();
  }, [onLogout]); // Adicionado

  const handleSubmit = async (event) => {
    event.preventDefault();
    const materialData = {
      nome,
      descricao,
      preco_unidade: precoUnidade,
      unidade_medida: unidadeMedida,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingMaterial) {
        await axios.put(
          `http://127.0.0.1:8000/api/materiais/${editingMaterial.id}/`,
          materialData,
          config
        );
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Material atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/materiais/",
          materialData,
          config
        );
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Material cadastrado com sucesso!",
          severity: "success",
        });
      }
      fetchMateriais();
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar material:", error.response?.data || error);
      // ALTERADO: Substituído alert()
      setSnackbar({
        open: true,
        message: "Erro ao salvar material.",
        severity: "error",
      });
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Tem certeza que deseja deletar este material?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/materiais/${materialId}/`,
          config
        );
        setMateriais(
          materiais.filter((material) => material.id !== materialId)
        );
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Material deletado com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar material:", error);
        // ALTERADO: Substituído alert()
        setSnackbar({
          open: true,
          message: "Erro ao deletar material.",
          severity: "error",
        });
      }
    }
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setNome(material.nome);
    setDescricao(material.descricao || "");
    setPrecoUnidade(material.preco_unidade);
    setUnidadeMedida(material.unidade_medida || "un");
    setIsFormOpen(true);
    window.scrollTo(0, 0); // Rola para o topo para ver o formulário
  };

  const handleCancel = () => {
    clearForm();
    setIsFormOpen(false);
  };

  const clearForm = () => {
    setNome("");
    setDescricao("");
    setPrecoUnidade("");
    setUnidadeMedida("un");
    setEditingMaterial(null);
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
          <Inventory2Icon fontSize="large" />
          <Typography variant="h5" component="h2">
            Meus Materiais
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
          Adicionar Material
        </Button>
      </Box>

      {/* Formulário */}
      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingMaterial ? "Editar Material" : "Cadastrar Novo Material"}
          </Typography>

          {/* ALTERADO: Formulário com CSS GRID */}
          <Box
            component="form"
            onSubmit={handleSubmit}
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
            <TextField
              label="Nome do Material"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              sx={{ [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" } }}
            />
            <TextField
              label="Unidade (ex: un, m, cx)"
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              required
            />
            <TextField
              label="Preço (R$)"
              type="number"
              value={precoUnidade}
              onChange={(e) => setPrecoUnidade(e.target.value)}
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
                {editingMaterial ? "Salvar" : "Cadastrar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* ALTERADO: Lista de Materiais com CSS GRID */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          // Usando a mesma grade da página de serviços
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
        {materiais.length > 0 ? (
          materiais.map((material) => (
            <Card key={material.id} elevation={3}>
              {/* Aplicando o mesmo layout de card compacto */}
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
                    onClick={() => handleEditClick(material)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteMaterial(material.id)}
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
                  {material.nome}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    minHeight: "40px", // Garante alinhamento
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {material.descricao || "Sem descrição"}
                </Typography>

                {/* Linha do preço (única diferença, com a unidade) */}
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  R$ {material.preco_unidade} / {material.unidade_medida}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          // Estado Vazio (mantido)
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
            <Typography>Você ainda não cadastrou nenhum material.</Typography>
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

export default MateriaisPage;
