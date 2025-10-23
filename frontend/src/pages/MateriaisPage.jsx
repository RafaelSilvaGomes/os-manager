// src/pages/MateriaisPage.jsx (VERSÃO MODERNA - CORRIGIDA COM PROP TOKEN)

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
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

// 1. Aceita 'token' e 'onLogout' como props
function MateriaisPage({ token, onLogout }) {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Estados do formulário (sem mudanças)
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoUnidade, setPrecoUnidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Estado do Snackbar (sem mudanças)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // useEffect agora depende da prop 'token'
  useEffect(() => {
    const fetchMateriais = async () => {
      // 2. Verifica a prop 'token'
      if (!token) {
        setLoading(false);
        setMateriais([]); // Limpa materiais se não houver token
        return;
      }
      setLoading(true);
      try {
        // 3. Usa a prop 'token' na configuração
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/materiais/",
          config
        );
        setMateriais(response.data);
      } catch (error) {
        console.error("Erro ao buscar materiais:", error);
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

    fetchMateriais();
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
    const materialData = {
      nome,
      descricao,
      preco_unidade: precoUnidade,
      unidade_medida: unidadeMedida,
    };

    try {
      // 6. Usa a prop 'token' na configuração
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let updatedMaterial = null; // Para atualizar o estado localmente

      if (editingMaterial) {
        const response = await axios.put(
          // Guarda a resposta
          `http://127.0.0.1:8000/api/materiais/${editingMaterial.id}/`,
          materialData,
          config
        );
        updatedMaterial = response.data; // Pega o material atualizado da resposta
        setSnackbar({
          open: true,
          message: "Material atualizado com sucesso!",
          severity: "success",
        });
      } else {
        const response = await axios.post(
          // Guarda a resposta
          "http://127.0.0.1:8000/api/materiais/",
          materialData,
          config
        );
        updatedMaterial = response.data; // Pega o material novo da resposta
        setSnackbar({
          open: true,
          message: "Material cadastrado com sucesso!",
          severity: "success",
        });
      }

      // Atualiza o estado local para feedback imediato
      if (editingMaterial) {
        setMateriais(
          materiais.map((m) =>
            m.id === updatedMaterial.id ? updatedMaterial : m
          )
        );
      } else {
        setMateriais([...materiais, updatedMaterial]);
      }

      // fetchMateriais(); // Não é mais estritamente necessário, mas pode ser usado para garantir
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar material:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar material.",
        severity: "error",
      });
      // 7. Adiciona tratamento de 401
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    // 8. Verifica a prop 'token'
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação. Tente logar novamente.",
        severity: "error",
      });
      return;
    }
    // TODO: Substituir window.confirm por um Dialog/Modal
    if (window.confirm("Tem certeza que deseja deletar este material?")) {
      try {
        // 9. Usa a prop 'token' na configuração
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
        setSnackbar({
          open: true,
          message: "Erro ao deletar material.",
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

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Renderização (ajuste no loading) ---
  if (loading && materiais.length === 0) {
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
              // Layout do formulário ajustado
              gridTemplateColumns: "1fr", // Mobile: 1 coluna
              [theme.breakpoints.up("sm")]: {
                gridTemplateColumns: "repeat(2, 1fr)", // Tablet: 2 colunas
              },
              [theme.breakpoints.up("md")]: {
                gridTemplateColumns: "repeat(3, 1fr)", // Desktop: 3 colunas (nome, unid, preco)
              },
            }}
          >
            <TextField
              label="Nome do Material"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              // Ocupa a linha inteira no mobile e tablet, mas só a primeira coluna no desktop
              sx={{
                gridColumn: "1 / -1", // Default: Ocupa tudo
                [theme.breakpoints.up("md")]: {
                  gridColumn: "1 / 2", // Desktop: Ocupa a primeira coluna
                },
              }}
            />
            <TextField
              label="Unidade (ex: un, m, cx)"
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              required
              // No desktop, fica na segunda coluna
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
              // No desktop, fica na terceira coluna
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
              // Ocupa a linha inteira em todos os tamanhos
              sx={{ gridColumn: "1 / -1" }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                gridColumn: "1 / -1", // Ocupa a linha inteira
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
                    onClick={() => handleDeleteMaterial(material.id)}
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
