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
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";

function ClientesPage({ token, onLogout }) {
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
  const theme = useTheme();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchClientes = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/clientes/",
          config
        );
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
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

    fetchClientes();
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
    const clienteData = {
      nome,
      email,
      telefone,
      endereco,
      ponto_referencia: pontoReferencia,
      observacoes,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingClient) {
        await axios.put(
          `http://127.0.0.1:8000/api/clientes/${editingClient.id}/`,
          clienteData,
          config
        );
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
        setSnackbar({
          open: true,
          message: "Cliente cadastrado com sucesso!",
          severity: "success",
        });
      }
      if (editingClient) {
        setClientes(
          clientes.map((c) =>
            c.id === editingClient.id
              ? { ...clienteData, id: editingClient.id }
              : c
          )
        );
      } else {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/clientes/",
          config
        );
        setClientes(response.data);
      }

      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar cliente.",
        severity: "error",
      });
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação. Tente logar novamente.",
        severity: "error",
      });
      return;
    }
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/clientes/${clienteId}/`,
          config
        );
        setClientes(clientes.filter((cliente) => cliente.id !== clienteId));
        setSnackbar({
          open: true,
          message: "Cliente deletado com sucesso!",
          severity: "success",
        });
      } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        setSnackbar({
          open: true,
          message: "Erro ao deletar cliente.",
          severity: "error",
        });
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
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
    window.scrollTo(0, 0);
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

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && clientes.length === 0) {
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeopleIcon fontSize="large" />
          <Typography variant="h5" component="h2">
            Meus Clientes
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
          Cadastrar Cliente
        </Button>
      </Box>

      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4, overflow: "hidden" }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "1fr",
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
            <TextField
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
                {editingClient ? "Salvar" : "Cadastrar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

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

export default ClientesPage;
