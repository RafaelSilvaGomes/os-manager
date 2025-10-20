// src/pages/OrdemDeServicoCreatePage.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import DeleteIcon from "@mui/icons-material/Delete";

// Hook para obter o token (você pode colocar isso em um arquivo 'auth.js' depois)
const useAuthToken = () => {
  return localStorage.getItem("accessToken");
};

function OrdemDeServicoCreatePage({ onLogout }) {
  const navigate = useNavigate();
  const token = useAuthToken();

  // --- Estados para os dados principais da OS ---
  const [clienteId, setClienteId] = useState("");
  const [enderecoServico, setEnderecoServico] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState(null);
  const [servicosIds, setServicosIds] = useState([]);

  // --- Estados para as listas de dropdowns ---
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [materiais, setMateriais] = useState([]);

  // --- Estados para o "Carrinho" de Materiais ---
  const [materiaisNoCarrinho, setMateriaisNoCarrinho] = useState([]);
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);

  // 1. BUSCAR TODOS OS DADOS NECESSÁRIOS (Clientes, Serviços, Materiais)
  useEffect(() => {
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

    // Usamos Promise.all para fazer as 3 requisições em paralelo
    Promise.all([fetchClientes, fetchServicos, fetchMateriais])
      .then((responses) => {
        setClientes(responses[0].data);
        setServicos(responses[1].data);
        setMateriais(responses[2].data);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        if (error.response && error.response.status === 401) {
          alert("Sua sessão expirou. Faça login novamente.");
          onLogout();
        }
      });
  }, [token, onLogout]);

  // 2. FUNÇÃO PARA PREENCHER O ENDEREÇO
  const handleClienteChange = (e) => {
    const id = e.target.value;
    setClienteId(id);

    // Acha o cliente na lista e preenche o endereço
    const clienteSelecionado = clientes.find((c) => c.id === id);
    if (clienteSelecionado) {
      setEnderecoServico(clienteSelecionado.endereco || "");
    }
  };

  // 3. FUNÇÕES DO "CARRINHO" DE MATERIAIS
  const handleAdicionarMaterial = () => {
    if (!materialSelecionado || quantidadeMaterial <= 0) {
      alert("Selecione um material e uma quantidade válida.");
      return;
    }

    // Verifica se o material já está no carrinho
    const jaExiste = materiaisNoCarrinho.find(
      (item) => item.material_id === materialSelecionado
    );
    if (jaExiste) {
      alert("Este material já foi adicionado.");
      return;
    }

    const material = materiais.find((m) => m.id === materialSelecionado);

    setMateriaisNoCarrinho([
      ...materiaisNoCarrinho,
      {
        material_id: material.id,
        nome: material.nome, // Usamos o 'nome' apenas para exibir na tabela
        unidade_medida: material.unidade_medida,
        quantidade: parseInt(quantidadeMaterial, 10),
      },
    ]);

    // Limpa os campos de seleção
    setMaterialSelecionado("");
    setQuantidadeMaterial(1);
  };

  const handleRemoverMaterial = (id) => {
    setMateriaisNoCarrinho(
      materiaisNoCarrinho.filter((item) => item.material_id !== id)
    );
  };

  // 4. FUNÇÃO DE SUBMISSÃO (A MAIS IMPORTANTE)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Formata os materiais para enviar para a API (só ID e quantidade)
    const materiaisParaEnviar = materiaisNoCarrinho.map((item) => ({
      material_id: item.material_id,
      quantidade: item.quantidade,
    }));

    // Monta o payload final
    const payload = {
      cliente_id: parseInt(clienteId, 10),
      endereco_servico: enderecoServico,
      data_agendamento: dataAgendamento ? dataAgendamento.toISOString() : null,
      servicos_ids: servicosIds,
      materiais_para_adicionar: materiaisParaEnviar,
      status: "AB", // 'AB' = Aberta (conforme seu models.py)
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ordens/",
        payload,
        config
      );

      alert("Ordem de Serviço criada com sucesso!");
      // Navega para a página de detalhes da OS recém-criada
      navigate(`/ordens/${response.data.id}`);
    } catch (error) {
      console.error("Erro ao criar OS:", error.response?.data || error);
      alert("Erro ao criar Ordem de Serviço.");
      if (error.response && error.response.status === 401) {
        onLogout();
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Criar Nova Ordem de Serviço
      </Typography>

      {/* --- SEÇÃO DO CLIENTE E ENDEREÇO --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dados do Cliente e Serviço
        </Typography>

        <Grid container spacing={2}>
          {/* Linha 1, Coluna 1: Cliente */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="cliente-select-label">Cliente</InputLabel>
              <Select
                labelId="cliente-select-label"
                value={clienteId}
                label="Cliente" // A propriedade que corrige o tamanho
                onChange={handleClienteChange}
              >
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Linha 1, Coluna 2: Data/Hora */}
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Data e Hora do Agendamento"
              value={dataAgendamento}
              onChange={(newValue) => setDataAgendamento(newValue)}
              // renderInput é a forma correta de aplicar o fullWidth
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          {/* Linha 2: Endereço (ocupa a linha inteira) */}
          <Grid item xs={12}>
            <TextField
              label="Endereço de Realização do Serviço"
              value={enderecoServico}
              onChange={(e) => setEnderecoServico(e.target.value)}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </Paper>

      {/* --- SEÇÃO DE SERVIÇOS --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Serviços a Realizar
        </Typography>
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

      {/* --- SEÇÃO DE MATERIAIS --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Materiais a Utilizar
        </Typography>
        {/* Inputs para adicionar material */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl fullWidth sx={{ flex: 3 }}>
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
            sx={{ flex: 1 }}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAdicionarMaterial}
            sx={{ flex: 1 }}
          >
            Adicionar
          </Button>
        </Box>

        {/* Tabela de materiais no carrinho */}
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
              {materiaisNoCarrinho.map((item) => (
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- BOTÃO DE SALVAR --- */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
      >
        Criar Ordem de Serviço
      </Button>
    </Box>
  );
}

export default OrdemDeServicoCreatePage;
