import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Collapse,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
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

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

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
      console.error("Erro ao salvar cliente:", error.response?.data || error);

      let errorMessage = "Erro ao salvar cliente.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        try {
          const firstKey = Object.keys(errorData)[0];
          errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
        } catch (e) {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  const handleDeleteCliente = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (cliente) {
      setClienteToDelete(cliente);
      setIsConfirmDialogOpen(true);
    }
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setTimeout(() => setClienteToDelete(null), 150);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    const clienteId = clienteToDelete.id;
    handleCloseConfirmDialog();

    if (!token) {
      setSnackbar({
        open: true,
        message: "Erro de autenticação. Tente logar novamente.",
        severity: "error",
      });
      return;
    }

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
      let errorMessage = "Erro ao deletar cliente.";
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      
      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
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
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeopleIcon fontSize="large" />
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
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
        {clientes.length > 0 ? (
          clientes.map((cliente) => (
            <Card 
              key={cliente.id} 
              elevation={3}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom noWrap>
                  {cliente.nome}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" noWrap gutterBottom>
                  <strong>Telefone:</strong> {cliente.telefone || 'N/A'}
                </Typography>

                {cliente.email && (
                  <Typography variant="body2" color="text.secondary" noWrap gutterBottom>
                    <strong>Email:</strong> {cliente.email}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" noWrap>
                  <strong>Endereço:</strong> {cliente.endereco || 'N/A'}
                </Typography>

                {cliente.ponto_referencia && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    <strong>Ref:</strong> {cliente.ponto_referencia}
                  </Typography>
                )}
                
                {cliente.observacoes && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{mt: 1, fontStyle: 'italic'}}>
                    <strong>Obs:</strong> {cliente.observacoes}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleEditClick(cliente)} size="small" aria-label="Editar" title="Editar">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteCliente(cliente.id)} color="error" size="small" aria-label="Deletar" title="Deletar">
                  <DeleteIcon />
                </IconButton>
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
            <Typography>Você ainda não cadastrou nenhum cliente.</Typography>
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
      <Dialog
          open={isConfirmDialogOpen}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Tem certeza que deseja deletar o cliente{" "}
              <strong>{clienteToDelete?.nome}</strong>? Esta ação não pode ser
              desfeita e pode falhar se o cliente estiver associado a uma Ordem de
              Serviço.
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

export default ClientesPage;
