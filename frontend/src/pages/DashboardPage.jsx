// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Icon } from '@mui/material'; // Adicionamos 'Icon'
import {
  Groups as GroupsIcon,
  Build as BuildIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material'; // Importamos os ícones do Material-UI


function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-utilizamos a função de busca de estatísticas que você já fez
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/stats/', config);
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Dados fictícios para demonstração, já que alguns KPIs ainda não temos no backend
  // Você pode remover ou ajustar conforme formos implementando
  const mockStats = {
    totalClientes: stats?.total_clientes || 0,
    totalServicos: 15, // Backend não tem esse dado ainda
    ordensAtivas: stats?.ordens_abertas || 0,
    receitaMes: stats?.faturamento_mes || '0.00',
    ordensAbertasDetalhe: stats?.ordens_abertas || 0,
    ordensEmAndamentoDetalhe: 2, // Backend não tem esse dado ainda
    ordensConcluidasDetalhe: 5,  // Backend não tem esse dado ainda
    receitaTotal: 1250.75, // Backend não tem esse dado ainda
    ticketMedio: 150.00, // Backend não tem esse dado ainda
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Título e Subtítulo */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Visão geral do seu negócio
      </Typography>

      {/* Grid para os Cards de KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card: Total Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#3a3f5a' }}>
            <GroupsIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Total Clientes</Typography>
              <Typography variant="h5">{mockStats.totalClientes}</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card: Total Serviços (Ainda mockado) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#624D8C' }}>
            <BuildIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Total Serviços</Typography>
              <Typography variant="h5">{mockStats.totalServicos}</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card: Ordens Ativas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#b8860b' }}>
            <PlaylistAddCheckIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Ordens Ativas</Typography>
              <Typography variant="h5">{mockStats.ordensAtivas}</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card: Receita do Mês */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#388E3C' }}>
            <MonetizationOnIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Receita do Mês</Typography>
              <Typography variant="h5">R$ {mockStats.receitaMes}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Grid para Status das Ordens e Resumo Financeiro */}
      <Grid container spacing={3}>
        {/* Card: Status das Ordens */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Status das Ordens</Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>Abertas</Typography>
                  <Typography variant="body2" color="text.secondary">Aguardando início</Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>{mockStats.ordensAbertasDetalhe}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkIcon sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>Em Andamento</Typography>
                  <Typography variant="body2" color="text.secondary">Serviços em execução</Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>{mockStats.ordensEmAndamentoDetalhe}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>Concluídas</Typography>
                  <Typography variant="body2" color="text.secondary">Serviços finalizados</Typography>
                  <Typography variant="h6" sx={{ ml: 2 }}>{mockStats.ordensConcluidasDetalhe}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card: Resumo Financeiro (Ainda mockado) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Ordens Concluídas</Typography>
                  <Typography variant="h6">{mockStats.ordensConcluidasDetalhe}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Receita Total</Typography>
                  <Typography variant="h6">R$ {mockStats.receitaTotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Ticket Médio</Typography>
                  <Typography variant="h6">R$ {mockStats.ticketMedio}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Dica Rápida */}
      <Card sx={{ mt: 4, backgroundColor: '#333', display: 'flex', alignItems: 'center', p: 2 }}>
        <LightbulbIcon sx={{ fontSize: 30, color: 'warning.light', mr: 2 }} />
        <Typography variant="body1">
          Dica Rápida: Mantenha suas ordens atualizadas para uma visão precisa.
        </Typography>
      </Card>

    </Box>
  );
}

export default DashboardPage;