// src/pages/OrdemDeServicoCreatePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';

function OrdemDeServicoCreatePage() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const navigate = useNavigate();

  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [clientesResponse, servicosResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/clientes/', config),
          axios.get('http://127.0.0.1:8000/api/servicos/', config)
        ]);
        setClientes(clientesResponse.data);
        setServicos(servicosResponse.data);
      } catch (error) { console.error("Erro ao buscar dados para o formulário:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleServicoChange = (servicoId) => {
    const id = parseInt(servicoId, 10);
    if (servicosSelecionados.includes(id)) {
      setServicosSelecionados(servicosSelecionados.filter(sId => sId !== id));
    } else {
      setServicosSelecionados([...servicosSelecionados, id]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!clienteSelecionado || servicosSelecionados.length === 0) {
      alert("Por favor, selecione um cliente e ao menos um serviço.");
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const novaOrdem = {
        cliente: clienteSelecionado,
        servicos: servicosSelecionados
      };
      await axios.post('http://127.0.0.1:8000/api/ordens/', novaOrdem, config);
      alert('Ordem de Serviço criada com sucesso!');
      navigate('/ordens');
    } catch (error) {
      console.error('Erro ao criar Ordem de Serviço:', error);
      alert('Erro ao criar Ordem de Serviço.');
    }
  };

  if (loading) {
    return <p>Carregando dados do formulário...</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Criar Nova Ordem de Serviço
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        
        <FormControl fullWidth required>
          <InputLabel id="cliente-select-label">Cliente</InputLabel>
          <Select
            labelId="cliente-select-label"
            id="cliente-select"
            value={clienteSelecionado}
            label="Cliente"
            onChange={(e) => setClienteSelecionado(e.target.value)}
          >
            <MenuItem value=""><em>-- Escolha um cliente --</em></MenuItem>
            {clientes.map(cliente => (
              <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl component="fieldset" variant="standard">
          <Typography component="legend" sx={{ mb: 1 }}>Selecione os Serviços</Typography>
          <FormGroup>
            {servicos.map(servico => (
              <FormControlLabel
                key={servico.id}
                control={
                  <Checkbox 
                    checked={servicosSelecionados.includes(servico.id)} 
                    onChange={() => handleServicoChange(servico.id)} 
                  />
                }
                label={`${servico.nome} - R$ ${servico.preco}`}
              />
            ))}
          </FormGroup>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">Criar Ordem de Serviço</Button>
        </Box>
      </Box>
    </Box>
  );
}

export default OrdemDeServicoCreatePage;