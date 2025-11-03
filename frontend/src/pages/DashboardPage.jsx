// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  // --- NOVOS IMPORTS ---
  Autocomplete,
  TextField,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Build as BuildIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  // --- NOVOS IMPORTS DE ÍCONE ---
  PersonSearch as PersonSearchIcon,
  RequestQuote as RequestQuoteIcon,
  EventRepeat as EventRepeatIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

// Função helper para formatar dinheiro
const formatarBRL = (valor) => {
  const valorNum = Number(valor);
  if (isNaN(valorNum)) return "R$ 0,00";
  return valorNum.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

function DashboardPage({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // --- NOVOS ESTADOS PARA O RELATÓRIO DO CLIENTE ---
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null); // Guarda o objeto {id, nome}
  const [clientReport, setClientReport] = useState(null);
  const [clientReportLoading, setClientReportLoading] = useState(false);
  // --------------------------------------------------

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        console.error("Dashboard: Prop 'token' não encontrada.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // --- ATUALIZADO: Busca stats E clientes em paralelo ---
        const [statsResponse, clientsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/dashboard/stats/", config),
          axios.get("http://127.0.0.1:8000/api/clientes/", config)
        ]);
        
        setStats(statsResponse.data);
        setClientList(clientsResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout(); 
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [token, onLogout]);

  // --- NOVO USEEFFECT: Busca stats do cliente quando 'selectedClient' muda ---
  useEffect(() => {
    const fetchClientStats = async () => {
      if (!selectedClient || !token) {
        setClientReport(null);
        return;
      }

      setClientReportLoading(true);
      setClientReport(null); // Limpa o relatório anterior
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Chama a nova API que criamos
        const response = await axios.get(
          `http://127.0.0.1:8000/api/clientes/${selectedClient.id}/stats/`,
          config
        );
        setClientReport(response.data);
      } catch (error) {
        console.error("Erro ao buscar stats do cliente:", error);
      } finally {
        setClientReportLoading(false);
      }
    };

    fetchClientStats();
  }, [selectedClient, token]);
  // -----------------------------------------------------------------------

  if (loading) {
    // ... (seu JSX de loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    // ... (seu JSX de erro)
    return (
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        Não foi possível carregar os dados do dashboard. Verifique sua conexão ou tente novamente mais tarde.
      </Typography>
    );
  }

  // Formata os stats globais (seu código original)
  const displayStats = {
    totalClientes: stats?.total_clientes || 0,
    totalServicos: stats?.total_servicos || 0,
    ordensAtivas: stats?.ordens_abertas || 0, 
    receitaMes: formatarBRL(stats?.faturamento_mes), // Atualizado para usar a formatação
    totalOrdensGeral: stats?.total_ordens_geral || 0,
    ordensAbertasDetalhe: stats?.ordens_abertas || 0,
    ordensEmAndamentoDetalhe: stats?.ordens_em_andamento || 0, 
    ordensConcluidasDetalhe: stats?.ordens_concluidas || 0,
    ordensFinalizadasPendentesDetalhe: stats?.ordens_finalizadas_pendentes || 0,
    ordensPagasDetalhe: stats?.ordens_pagas || 0, 
    receitaTotal: formatarBRL(stats?.receita_total), // Atualizado
    ticketMedio: formatarBRL(stats?.ticket_medio), // Atualizado
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Visão geral do seu negócio
      </Typography>

      {/* --- SEUS CARDS GLOBAIS (Sem alteração) --- */}
      <Box
        sx={{
          display: "grid", gap: 3, mb: 4,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("sm")]: { gridTemplateColumns: "repeat(2, 1fr)" },
          [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(4, 1fr)" },
        }}
      >
        {/* Card Clientes */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#3a3f5a', color: 'white' }}>
          <GroupsIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Clientes</Typography>
            <Typography variant="h5">{displayStats.totalClientes}</Typography>
          </Box>
        </Card>
        {/* Card Serviços */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#624D8C', color: 'white' }}>
            <BuildIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Serviços</Typography>
              <Typography variant="h5">{displayStats.totalServicos}</Typography>
            </Box>
          </Card>
        {/* Card Total OS */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#b8860b', color: 'white' }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 40, mr: 2 }} /> 
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Total OS Criadas</Typography>
            <Typography variant="h5">{displayStats.totalOrdensGeral}</Typography>
          </Box>
        </Card>
        {/* Card Receita Mês */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#388E3C', color: 'white' }}>
          <MonetizationOnIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Receita do Mês</Typography>
            <Typography variant="h5">{displayStats.receitaMes}</Typography>
          </Box>
        </Card>
      </Box>

      {/* --- NOVO COMPONENTE: RELATÓRIO POR CLIENTE --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonSearchIcon />
          <Typography variant="h6">Relatório por Cliente</Typography>
        </Box>
        
        <Autocomplete
          fullWidth
          options={clientList}
          getOptionLabel={(option) => option.nome || ""}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedClient}
          onChange={(event, newValue) => {
            setSelectedClient(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Digite ou selecione um cliente"
              variant="outlined"
            />
          )}
          sx={{ mb: 3 }}
        />

        {/* --- Área de exibição do Relatório --- */}
        <Box>
          {clientReportLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : clientReport ? (
            // Relatório do Cliente
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MonetizationOnIcon color="success" />
                      <Typography variant="body1" color="text.secondary">Total Faturado</Typography>
                    </Box>
                    <Typography variant="h5">{formatarBRL(clientReport.total_faturado)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <RequestQuoteIcon color="error" />
                      <Typography variant="body1" color="text.secondary">Valor Pendente</Typography>
                    </Box>
                    <Typography variant="h5">{formatarBRL(clientReport.total_pendente)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body1" color="text.secondary">OS Concluídas</Typography>
                    </Box>
                    <Typography variant="h5">{clientReport.total_os_concluidas}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EventRepeatIcon color="action" />
                      <Typography variant="body1" color="text.secondary">Total de OS (Geral)</Typography>
                    </Box>
                    <Typography variant="h5">{clientReport.total_os_geral}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            // Mensagem inicial (se nenhum cliente estiver selecionado)
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, color: 'text.secondary', gap: 1 }}>
              <HourglassEmptyIcon />
              <Typography>Selecione um cliente para ver seu relatório detalhado.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
      {/* ------------------------------------------------ */}

      {/* --- SEUS CARDS DE STATUS E FINANCEIRO (Sem alteração) --- */}
      <Box
        sx={{
          display: "grid", gap: 3,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(2, 1fr)" },
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Status das Ordens</Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>Abertas</Typography>
                <Typography variant="body2" color="text.secondary">Aguardando início</Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>{displayStats.ordensAbertasDetalhe}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>Em Andamento</Typography>
                <Typography variant="body2" color="text.secondary">Serviços em execução</Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>{displayStats.ordensEmAndamentoDetalhe}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReportProblemIcon sx={{ color: 'warning.light', mr: 1 }} /> 
                <Typography variant="body1" sx={{ flexGrow: 1 }}>Finalizadas (Pendentes)</Typography>
                <Typography variant="body2" color="text.secondary">Aguardando pagamento</Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>{displayStats.ordensFinalizadasPendentesDetalhe}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>Finalizadas</Typography>
                <Typography variant="body2" color="text.secondary">Serviço e pagamento OK</Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>{displayStats.ordensPagasDetalhe}</Typography> 
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
             <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
             <Box sx={{ mt: 2 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">OS Concluídas (Total)</Typography> 
                 <Typography variant="h6">{displayStats.ordensConcluidasDetalhe}</Typography>
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Receita (Total)</Typography>
                 <Typography variant="h6">{displayStats.receitaTotal}</Typography>
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Ticket Médio (Geral)</Typography>
                 <Typography variant="h6">{displayStats.ticketMedio}</Typography>
               </Box>
             </Box>
          </CardContent>
        </Card>
      </Box>
      
      <Card sx={{ mt: 4, backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', p: 2 }}>
        <LightbulbIcon sx={{ fontSize: 30, color: 'warning.light', mr: 2 }} />
        <Typography variant="body1">
          Dica Rápida: Mantenha suas ordens atualizadas para uma visão precisa.
        </Typography>
      </Card>

    </Box>
  );
}

export default DashboardPage;