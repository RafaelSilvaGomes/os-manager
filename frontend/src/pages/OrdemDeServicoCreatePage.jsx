import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import InfoIcon from "@mui/icons-material/Info";

const duracaoOptions = [
  { value: 0.5, label: "00:30 h" },
  { value: 1.0, label: "01:00 h" },
  { value: 1.5, label: "01:30 h" },
  { value: 2.0, label: "02:00 h" },
  { value: 2.5, label: "02:30 h" },
  { value: 3.0, label: "03:00 h" },
  { value: 3.5, label: "03:30 h" },
  { value: 4.0, label: "04:00 h" },
  { value: 4.5, label: "04:30 h" },
  { value: 5.0, label: "05:00 h" },
  { value: 5.5, label: "05:30 h" },
  { value: 6.0, label: "06:00 h" },
  { value: 7.0, label: "07:00 h" },
  { value: 8.0, label: "08:00 h" },
];

function OrdemDeServicoCreatePage({ token, onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [clienteId, setClienteId] = useState("");
  const [enderecoServico, setEnderecoServico] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState(null);
  const [duracaoEstimada, setDuracaoEstimada] = useState("");
  const [servicosIds, setServicosIds] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [materiaisNoCarrinho, setMateriaisNoCarrinho] = useState([]);
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setClientes([]);
      setServicos([]);
      setMateriais([]);
      return;
    }

    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchClientes = axios.get(
      "http://127.0.0.1:8000/api/clientes/",
      config
    );
    const fetchServicos = axios.get(
      "http://127.0.0.1:8000/api/servicos/",
      config
    );
    const fetchMateriais = axios.get(
      "http://127.0.0.1:8000/api/materiais/",
      config
    );

    Promise.all([fetchClientes, fetchServicos, fetchMateriais])
      .then((responses) => {
        setClientes(responses[0].data);
        setServicos(responses[1].data);
        setMateriais(responses[2].data);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        } else {
          setSnackbar({
            open: true,
            message: "Erro ao carregar dados iniciais.",
            severity: "error",
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
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

    const materiaisParaEnviar = materiaisNoCarrinho.map((item) => ({
      material_id: item.material_id,
      quantidade: item.quantidade,
    }));

    const payload = {
      cliente_id: parseInt(clienteId, 10),
      endereco_servico: enderecoServico,
      data_agendamento: dataAgendamento ? dataAgendamento.toISOString() : null,
      duracao_estimada_horas: duracaoEstimada ? parseFloat(duracaoEstimada) : null,
      servicos_ids: servicosIds,
      materiais_para_adicionar: materiaisParaEnviar,
      status: "AB",
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ordens/",
        payload,
        config
      );
      navigate(`/ordens/${response.data.id}`);
    } catch (error) {
      console.error("Erro ao criar OS:", error.response?.data || error);
      setSnackbar({
        open: true,
        message: "Erro ao criar Ordem de Serviço.",
        severity: "error",
      });

      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  const handleClienteChange = (e) => {
    const id = e.target.value;
    setClienteId(id);
    const clienteSelecionado = clientes.find((c) => c.id === id);
    if (clienteSelecionado) {
      setEnderecoServico(clienteSelecionado.endereco || "");
    }
  };

  const handleAdicionarMaterial = () => {
    if (!materialSelecionado || quantidadeMaterial <= 0) {
      setSnackbar({
        open: true,
        message: "Selecione um material e uma quantidade válida.",
        severity: "warning",
      });
      return;
    }
    const jaExiste = materiaisNoCarrinho.find(
      (item) => item.material_id === materialSelecionado
    );
    if (jaExiste) {
      setSnackbar({
        open: true,
        message: "Este material já foi adicionado.",
        severity: "info",
      });
      return;
    }
    const material = materiais.find((m) => m.id === materialSelecionado);
    if (!material) {
      setSnackbar({
        open: true,
        message: "Material selecionado inválido.",
        severity: "error",
      });
      return;
    }
    setMateriaisNoCarrinho([
      ...materiaisNoCarrinho,
      {
        material_id: material.id,
        nome: material.nome,
        unidade_medida: material.unidade_medida,
        quantidade: parseInt(quantidadeMaterial, 10),
      },
    ]);
    setMaterialSelecionado("");
    setQuantidadeMaterial(1);
  };

  const handleRemoverMaterial = (id) => {
    setMateriaisNoCarrinho(
      materiaisNoCarrinho.filter((item) => item.material_id !== id)
    );
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

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
        <Typography sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Box>
    );
  }

  if (
    !loading &&
    clientes.length === 0 &&
    servicos.length === 0 &&
    materiais.length === 0
  ) {
    return (
      <Paper
        sx={{
          p: 3,
          m: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <InfoIcon color="warning" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="text.secondary">
          Não foi possível carregar os dados.
        </Typography>
        <Typography color="text.secondary">
          Verifique sua conexão ou tente novamente mais tarde.
        </Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Voltar para o Dashboard
        </Button>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ReceiptLongIcon fontSize="large" />
        <Typography variant="h4" component="h1">
          Criar Nova Ordem de Serviço
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AccountCircleIcon />
          <Typography variant="h6">Dados do Cliente e Serviço</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "1fr",
            [theme.breakpoints.up("md")]: {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
          }}
        >
          <FormControl fullWidth required>
            <InputLabel id="cliente-select-label">Cliente</InputLabel>
            <Select
              labelId="cliente-select-label"
              value={clienteId}
              label="Cliente"
              onChange={handleClienteChange}
            >
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Endereço de Realização do Serviço"
            value={enderecoServico}
            onChange={(e) => setEnderecoServico(e.target.value)}
            fullWidth
            required
          />

          <DateTimePicker
            label="Data e Hora do Agendamento"
            value={dataAgendamento}
            onChange={(newValue) => setDataAgendamento(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            ampm={false}
            format="DD/MM/YYYY HH:mm"
          />

          <FormControl fullWidth>
            <InputLabel id="duracao-estimada-label">
              Duração Estimada
            </InputLabel>
            <Select
              labelId="duracao-estimada-label"
              value={duracaoEstimada}
              label="Duração Estimada"
              onChange={(e) => setDuracaoEstimada(e.target.value)}
            >
              <MenuItem value="">
                <em>Nenhuma (opcional)</em>
              </MenuItem>
              {duracaoOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <DesignServicesIcon />
          <Typography variant="h6">Serviços a Realizar</Typography>
        </Box>
        <FormControl fullWidth>
          <InputLabel id="servicos-select-label">Serviços</InputLabel>
          <Select
            labelId="servicos-select-label"
            multiple
            value={servicosIds}
            onChange={(e) => setServicosIds(e.target.value)}
            input={<OutlinedInput label="Serviços" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((id) => {
                  const servico = servicos.find((s) => s.id === id);
                  return <Chip key={id} label={servico ? servico.nome : ""} />;
                })}
              </Box>
            )}
          >
            {servicos.map((servico) => (
              <MenuItem key={servico.id} value={servico.id}>
                {servico.nome} (R$ {servico.preco})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Inventory2Icon />
          <Typography variant="h6">Materiais a Utilizar</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            mb: 2,
            gridTemplateColumns: "1fr auto",
            [theme.breakpoints.up("sm")]: {
              gridTemplateColumns: "3fr 1fr 1fr",
            },
            alignItems: "start",
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="material-select-label">Material</InputLabel>
            <Select
              labelId="material-select-label"
              value={materialSelecionado}
              label="Material"
              onChange={(e) => setMaterialSelecionado(e.target.value)}
            >
              <MenuItem value="">
                <em>Selecione...</em>
              </MenuItem>
              {materiais.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.nome} (R$ {material.preco_unidade} /{" "}
                  {material.unidade_medida})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Qtde."
            type="number"
            value={quantidadeMaterial}
            onChange={(e) => setQuantidadeMaterial(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ [theme.breakpoints.down("sm")]: { gridColumn: "1 / 2" } }}
          />

          <Button
            variant="contained"
            onClick={handleAdicionarMaterial}
            startIcon={<AddIcon />}
            sx={{
              height: "56px",
              [theme.breakpoints.down("sm")]: {
                gridColumn: "2 / 3",
                justifySelf: "start",
              },
            }}
          >
            Adicionar
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Material</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materiaisNoCarrinho.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ p: 2 }}
                    >
                      Nenhum material adicionado.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materiaisNoCarrinho.map((item) => (
                  <TableRow key={item.material_id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{item.unidade_medida}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleRemoverMaterial(item.material_id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 3,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="large"
          onClick={() => navigate("/ordens")}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
        >
          Criar Ordem de Serviço
        </Button>
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

export default OrdemDeServicoCreatePage;
