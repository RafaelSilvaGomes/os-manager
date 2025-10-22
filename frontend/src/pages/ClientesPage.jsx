// src/pages/ClientesPage.jsx (VERSÃO MODERNA)

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress, // NOVO: Para o loading
  Snackbar, // NOVO: Para notificações
  Alert, // NOVO: Para estilizar o Snackbar
  useTheme, // NOVO: Para usar breakpoints no CSS Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add"; // NOVO: Ícone para o botão
import PeopleIcon from "@mui/icons-material/People"; // NOVO: Ícone para o título
import InfoIcon from "@mui/icons-material/Info"; // NOVO: Ícone para a tabela vazia

function ClientesPage({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = useTheme(); // NOVO: Hook para acessar o tema

  // NOVO: Estado para controlar o Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'warning', 'info'
  });

  const fetchClientes = async () => {
    // ... (sua função fetchClientes continua idêntica, mas trocamos o alert)
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/clientes/",
        config
      );
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      if (error.response && error.response.status === 401) {
        // ALTERADO: Substituímos o alert()
        setSnackbar({
          open: true,
          message: "Sua sessão expirou. Por favor, faça login novamente.",
          severity: "error",
        });
        onLogout(); // Desloga o usuário
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [onLogout]); // Adicione onLogout aqui se ele for uma prop

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clienteData = {
      nome,
      email,
      telefone,
      endereco,
      ponto_referencia: pontoReferencia,
      observacoes,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingClient) {
        await axios.put(
          `http://127.0.0.1:8000/api/clientes/${editingClient.id}/`,
          clienteData,
          config
        );
        // ALTERADO: Substituímos o alert()
        setSnackbar({
          open: true,
          message: "Cliente atualizado com sucesso!",
          severity: "success",
        });
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/clientes/",
          clienteData,
          config
        );
        // ALTERADO: Substituímos o alert()
        setSnackbar({
          open: true,
          message: "Cliente cadastrado com sucesso!",
          severity: "success",
        });
      }
      fetchClientes();
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      // ALTERADO: Substituímos o alert()
      setSnackbar({
        open: true,
        message: "Erro ao salvar cliente.",
        severity: "error",
      });
    }
  };

  // REMOVIDO: As funções handleCreateCliente e handleUpdateCliente
  // (Elas eram redundantes, a handleSubmit já faz o trabalho)

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/clientes/${clienteId}/`,
          config
        );
        setClientes(clientes.filter((cliente) => cliente.id !== clienteId));
        // ALTERADO: Substituímos o alert()
        setSnackbar({
          open: true,
          message: "Cliente deletado com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        // ALTERADO: Substituímos o alert()
        setSnackbar({
          open: true,
          message: "Erro ao deletar cliente.",
          severity: "error",
        });
      }
    }
  };

  const handleEditClick = (cliente) => {
    setEditingClient(cliente);
    setNome(cliente.nome);
    setEmail(cliente.email || "");
    setTelefone(cliente.telefone || "");
    setEndereco(cliente.endereco || "");
    setPontoReferencia(cliente.ponto_referencia || "");
    setObservacoes(cliente.observacoes || "");
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    clearForm();
    setIsFormOpen(false);
  };

  const clearForm = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setEndereco("");
    setPontoReferencia("");
    setObservacoes("");
    setEditingClient(null);
  };

  // NOVO: Função para fechar o Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ALTERADO: Estado de loading profissional
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* ALTERADO: Título com ícone */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeopleIcon fontSize="large" />
          <Typography variant="h5" component="h2">
            Meus Clientes
          </Typography>
        </Box>
        {/* ALTERADO: Botão com ícone */}
        <Button
          variant="contained"
          startIcon={<AddIcon />} // Ícone adicionado
          onClick={() => {
            clearForm();
            setIsFormOpen(true);
          }}
        >
          Cadastrar Cliente
        </Button>
      </Box>

      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
          </Typography>

          {/* ALTERADO: Formulário com CSS GRID */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gap: 2, // Espaço entre os campos
              // 1 coluna por padrão (mobile)
              gridTemplateColumns: "1fr",
              // 2 colunas para telas 'sm' (600px) e maiores
              [theme.breakpoints.up("sm")]: {
                gridTemplateColumns: "1fr 1fr",
              },
            }}
          >
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <TextField
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            {/* NOVO: Campo ocupando 2 colunas */}
            <TextField
              label="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              sx={{ [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" } }}
            />
            <TextField
              label="Ponto de Referência"
              value={pontoReferencia}
              onChange={(e) => setPontoReferencia(e.target.value)}
            />
            <TextField
              label="Email (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* NOVO: Campo ocupando 2 colunas */}
            <TextField
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              multiline
              rows={3}
              sx={{ [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" } }}
            />

            {/* NOVO: Box para alinhar botões à direita, ocupando 2 colunas */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                [theme.breakpoints.up("sm")]: { gridColumn: "1 / -1" }, // Ocupa a linha inteira
              }}
            >
              <Button type="button" onClick={handleCancel} variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                {editingClient ? "Salvar" : "Cadastrar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Tabela (Layout já estava bom) */}
      <TableContainer component={Paper}>
        <Table
          size="small"
          sx={{ minWidth: 650 }}
          aria-label="tabela de clientes"
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Telefone</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Endereço</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Ponto de Referência
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  // NOVO: Efeito de hover na linha
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{cliente.endereco}</TableCell>
                  <TableCell>{cliente.ponto_referencia}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditClick(cliente)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCliente(cliente.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // ALTERADO: Estado vazio melhorado
              <TableRow>
                <TableCell colSpan={5}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      p: 2,
                    }}
                  >
                    <InfoIcon color="action" />
                    <Typography variant="body2">
                      Você ainda não cadastrou nenhum cliente.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* NOVO: Componente Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000} // Fecha após 6 segundos
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

export default ClientesPage;
