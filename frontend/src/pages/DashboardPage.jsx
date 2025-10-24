// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import {
  Groups as GroupsIcon,
  Build as BuildIcon, // Vamos manter, mesmo sem o dado ainda
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon, // Vamos manter
  CheckCircle as CheckCircleIcon, // Vamos manter
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// 1. Recebe 'token' e 'onLogout' como props
function DashboardPage({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      // 2. Verifica a prop 'token' primeiro
      if (!token) {
        console.error("Dashboard: Prop 'token' não encontrada.");
        setLoading(false);
        return; // Sai se não houver token
      }
      setLoading(true); // Ativa o loading
      try {
        // 3. Usa a prop 'token' diretamente
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/stats/",
          config
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
        // 4. Verifica se o erro é 401 e chama onLogout
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout(); // Chama a função de logout passada pelo App.jsx
        }
        // Não precisamos de setError aqui, o 'if (!stats)' abaixo já trata
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // 5. Dependências corretas do useEffect
  }, [token, onLogout]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 6. Mensagem de erro mais clara se os stats não carregarem
  if (!stats) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
        Não foi possível carregar os dados do dashboard. Verifique sua conexão ou tente novamente mais tarde.
      </Typography>
    );
  }

  // 7. Usamos diretamente os dados que VÊM da API (stats)
  //    e colocamos 0 onde o dado ainda não existe no backend
  const displayStats = {
    totalClientes: stats?.total_clientes || 0,
    totalServicos: 0, // Mock: Backend não envia ainda
    ordensAtivas: stats?.ordens_abertas || 0,
    receitaMes: stats?.faturamento_mes || "0.00",
    ordensAbertasDetalhe: stats?.ordens_abertas || 0,
    ordensEmAndamentoDetalhe: 0, // Mock: Backend não envia ainda
    ordensConcluidasDetalhe: 0, // Mock: Backend não envia ainda
    receitaTotal: "0.00", // Mock: Backend não envia ainda
    ticketMedio: "0.00", // Mock: Backend não envia ainda
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Visão geral do seu negócio
      </Typography>

      {/* Grid para os Cards de KPIs */}
      <Box
        sx={{
          display: "grid", gap: 3, mb: 4,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("sm")]: { gridTemplateColumns: "repeat(2, 1fr)" },
          [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(4, 1fr)" },
        }}
      >
        {/* Card: Total Clientes */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#3a3f5a', color: 'white' }}>
          <GroupsIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Clientes</Typography>
            <Typography variant="h5">{displayStats.totalClientes}</Typography>
          </Box>
        </Card>

        {/* Card: Total Serviços (Mockado) */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#624D8C', color: 'white' }}>
           <BuildIcon sx={{ fontSize: 40, mr: 2 }} />
           <Box>
             <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Serviços</Typography>
             <Typography variant="h5">{displayStats.totalServicos}</Typography>
           </Box>
         </Card>

        {/* Card: Ordens Ativas */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#b8860b', color: 'white' }}>
          <PlaylistAddCheckIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Ordens Abertas</Typography>
            <Typography variant="h5">{displayStats.ordensAtivas}</Typography>
          </Box>
        </Card>

        {/* Card: Receita do Mês */}
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: '#388E3C', color: 'white' }}>
          <MonetizationOnIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>Receita do Mês</Typography>
            <Typography variant="h5">R$ {displayStats.receitaMes}</Typography>
          </Box>
        </Card>
      </Box>

      {/* Grid para Status das Ordens e Resumo Financeiro */}
      <Box
        sx={{
          display: "grid", gap: 3,
          gridTemplateColumns: "repeat(1, 1fr)",
          [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(2, 1fr)" },
        }}
      >
        {/* Card: Status das Ordens */}
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
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>Concluídas</Typography>
                <Typography variant="body2" color="text.secondary">Serviços finalizados</Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>{displayStats.ordensConcluidasDetalhe}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card: Resumo Financeiro (Mockado) */}
        <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
             <Box sx={{ mt: 2 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Ordens Concluídas (Mês)</Typography>
                 <Typography variant="h6">{displayStats.ordensConcluidasDetalhe}</Typography>
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Receita Total (Mês)</Typography>
                 <Typography variant="h6">R$ {displayStats.receitaMes}</Typography> {/* Usando a receita do mês aqui */}
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                 <Typography variant="body1">Ticket Médio (Mês)</Typography>
                 <Typography variant="h6">R$ {displayStats.ticketMedio}</Typography>
               </Box>
             </Box>
           </CardContent>
         </Card>
      </Box>
      
      {/* Dica Rápida */}
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