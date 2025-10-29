// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import {
  Groups as GroupsIcon,
  Build as BuildIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

function DashboardPage({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        console.error("Dashboard: Prop 'token' não encontrada.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/stats/",
          config
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout(); 
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, onLogout]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        Não foi possível carregar os dados do dashboard. Verifique sua conexão ou tente novamente mais tarde.
      </Typography>
    );
  }

  const displayStats = {
    totalClientes: stats?.total_clientes || 0,
    totalServicos: stats?.total_servicos || 0,
    ordensAtivas: stats?.ordens_abertas || 0, 
    receitaMes: stats?.faturamento_mes || "0.00",
    totalOrdensGeral: stats?.total_ordens_geral || 0,
    ordensAbertasDetalhe: stats?.ordens_abertas || 0,
    ordensEmAndamentoDetalhe: stats?.ordens_em_andamento || 0, 
    ordensConcluidasDetalhe: stats?.ordens_concluidas || 0,
    ordensFinalizadasPendentesDetalhe: stats?.ordens_finalizadas_pendentes || 0,
    ordensPagasDetalhe: stats?.ordens_pagas || 0, 
    receitaTotal: stats?.receita_total || "0.00",   
    ticketMedio: stats?.ticket_medio || "0.00",    
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Visão geral do seu negócio
      </Typography>

      <Box
        sx={{
          display: "grid", gap: 3, mb: 4,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("sm")]: { gridTemplateColumns: "repeat(2, 1fr)" },
          [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(4, 1fr)" },
        }}
      >
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#3a3f5a', color: 'white' }}>
          <GroupsIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Clientes</Typography>
            <Typography variant="h5">{displayStats.totalClientes}</Typography>
          </Box>
        </Card>

        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#624D8C', color: 'white' }}>
           <BuildIcon sx={{ fontSize: 40, mr: 2 }} />
           <Box>
             <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Serviços</Typography>
             <Typography variant="h5">{displayStats.totalServicos}</Typography>
           </Box>
         </Card>

        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#b8860b', color: 'white' }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 40, mr: 2 }} /> 
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Total OS Criadas</Typography>
            <Typography variant="h5">{displayStats.totalOrdensGeral}</Typography>
          </Box>
        </Card>

        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#388E3C', color: 'white' }}>
          <MonetizationOnIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Receita do Mês</Typography>
            <Typography variant="h5">R$ {displayStats.receitaMes}</Typography>
          </Box>
        </Card>
      </Box>

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
                 <Typography variant="h6">R$ {displayStats.receitaTotal}</Typography>
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Ticket Médio (Geral)</Typography>
                 <Typography variant="h6">R$ {displayStats.ticketMedio}</Typography>
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