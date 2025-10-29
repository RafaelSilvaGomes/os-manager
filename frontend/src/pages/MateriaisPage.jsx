// src/pages/MateriaisPage.jsx

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
  // --- NOVOS IMPORTS ---
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

function MateriaisPage({ token, onLogout }) {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoUnidade, setPrecoUnidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- NOVOS ESTADOS PARA O DIALOG DE CONFIRMAÇÃO ---
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchMateriais = async () => {
      if (!token) {
        setLoading(false);
        setMateriais([]);
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/materiais/",
          config
        );
        setMateriais(response.data);
      } catch (error) {
        console.error("Erro ao buscar materiais:", error);
        if (error.response && error.response.status === 401) {
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

    fetchMateriais();
  }, [token, onLogout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação. Tente logar novamente.",
        severity: "error",
      });
      return;
    }
    const materialData = {
      nome,
      descricao,
      preco_unidade: precoUnidade,
      unidade_medida: unidadeMedida,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let updatedMaterial = null;

      if (editingMaterial) {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/materiais/${editingMaterial.id}/`,
          materialData,
          config
        );
        updatedMaterial = response.data;
        setSnackbar({
          open: true,
          message: "Material atualizado com sucesso!",
          severity: "success",
        });
      } else {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/materiais/",
          materialData,
          config
        );
        updatedMaterial = response.data;
        setSnackbar({
          open: true,
          message: "Material cadastrado com sucesso!",
          severity: "success",
        });
      }

      if (editingMaterial) {
        setMateriais(
          materiais.map((m) =>
            m.id === updatedMaterial.id ? updatedMaterial : m
          )
        );
      } else {
        setMateriais([...materiais, updatedMaterial]);
      }

      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar material:", error.response?.data || error);

      // --- 💡 INÍCIO DA ALTERAÇÃO (MENSAGEM DE ERRO) ---
      let errorMessage = "Erro ao salvar material.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        try {
          // Tenta pegar erros de validação (ex: "nome": "Este campo é obrigatório")
          const firstKey = Object.keys(errorData)[0];
          errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
        } catch (e) {
          /* Usa a mensagem padrão */
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      // --- FIM DA ALTERAÇÃO ---

      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  // --- ALTERADO ---
  // Esta função agora APENAS ABRE o Dialog de confirmação
  const handleDeleteMaterial = (materialId) => {
    const material = materiais.find((m) => m.id === materialId);
    if (material) {
      setMaterialToDelete(material);
      setIsConfirmDialogOpen(true);
    }
  };

  // --- NOVA FUNÇÃO ---
  // Esta função fecha o Dialog
  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setTimeout(() => setMaterialToDelete(null), 150);
  };

  // --- NOVA FUNÇÃO (COM LÓGICA MOVIDA DO DELETE ANTIGO) ---
  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;

    const materialId = materialToDelete.id;
    handleCloseConfirmDialog(); // Fecha o dialog

    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação.",
        severity: "error",
      });
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `http://127.0.0.1:8000/api/materiais/${materialId}/`,
        config
      );
      setMateriais(
        materiais.filter((material) => material.id !== materialId)
      );
      setSnackbar({
        open: true,
        message: "Material deletado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar material:", error);

      // --- 💡 INÍCIO DA ALTERAÇÃO (MENSAGEM DE ERRO) ---
      let errorMessage = "Erro ao deletar material.";
      // Pega a mensagem de "detail" que o Django envia (Erro 400)
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      // --- FIM DA ALTERAÇÃO ---

      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };
  
  // --- (O restante das suas funções handleEditClick, handleCancel, etc. continuam iguais) ---

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setNome(material.nome);
    setDescricao(material.descricao || "");
    setPrecoUnidade(material.preco_unidade);
    setUnidadeMedida(material.unidade_medida || "un");
    setIsFormOpen(true);
    window.scrollTo(0, 0);
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

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && materiais.length === 0) {
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
      {/* ... (Todo o seu JSX do topo da página e formulário - sem mudanças) ... */}
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

      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingMaterial ? "Editar Material" : "Cadastrar Novo Material"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "1fr",
              [theme.breakpoints.up("sm")]: {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              [theme.breakpoints.up("md")]: {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
            }}
          >
            <TextField
              label="Nome do Material"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              sx={{
                gridColumn: "1 / -1",
                [theme.breakpoints.up("md")]: {
                  gridColumn: "1 / 2",
                },
              }}
            />
            <TextField
              label="Unidade (ex: un, m, cx)"
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              required
              sx={{
                [theme.breakpoints.up("md")]: {
                  gridColumn: "2 / 3",
                },
              }}
            />
            <TextField
              label="Preço (R$)"
              type="number"
              value={precoUnidade}
              onChange={(e) => setPrecoUnidade(e.target.value)}
              required
              inputProps={{ step: "0.01" }}
              sx={{
                [theme.breakpoints.up("md")]: {
                  gridColumn: "3 / 4",
                },
              }}
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              rows={3}
              sx={{ gridColumn: "1 / -1" }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                gridColumn: "1 / -1",
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
        {materiais.length > 0 ? (
          materiais.map((material) => (
            <Card key={material.id} elevation={3}>
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
                    onClick={() => handleEditClick(material)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    // --- ALTERADO ---
                    // Remove o window.confirm e chama a função que abre o dialog
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {/* ... (Resto do CardContent) ... */}
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
                  {material.nome}
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
                  {material.descricao || "Sem descrição"}
                </Typography>

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

      {/* O Snackbar já estava aqui e correto */}
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

      {/* --- NOVO: JSX DO DIALOG DE CONFIRMAÇÃO --- */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja deletar o material{" "}
            <strong>{materialToDelete?.nome}</strong>? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MateriaisPage;