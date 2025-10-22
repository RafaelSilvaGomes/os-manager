import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Icon,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  Build as BuildIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MonetizationOn as MonetizationOnIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

function DashboardPage({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // Hook para acessar o tema (necessário para os breakpoints)

  // Re-utilizamos a função de busca de estatísticas que você já fez
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/stats/",
          config
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
        if (error.response && error.response.status === 401) {
          alert("Sua sessão expirou. Por favor, faça login novamente.");
          if (onLogout) onLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [onLogout]);

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

  if (!stats) {
    return (
      <Typography>Não foi possível carregar os dados do dashboard.</Typography>
    );
  }

  const displayStats = {
    totalClientes: stats?.total_clientes || 0,
    totalServicos: stats?.total_servicos || 0,
    ordensAtivas: stats?.ordens_abertas || 0,
    receitaMes: stats?.faturamento_mes || "0.00",
    ordensAbertasDetalhe: stats?.ordens_abertas || 0,
    ordensEmAndamentoDetalhe: stats?.ordens_em_andamento || 0,
    ordensConcluidasDetalhe: stats?.ordens_concluidas || 0,
    receitaTotal: stats?.receita_total || "0.00",
    ticketMedio: stats?.ticket_medio || "0.00",
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Visão geral do seu negócio
      </Typography>

      {/* Grid para os Cards de KPIs (AGORA COM CSS GRID) */}
      <Box
        sx={{
          display: "grid",
          gap: 3, // O mesmo que spacing={3}
          mb: 4,
          // 1 coluna por padrão (xs)
          gridTemplateColumns: "repeat(1, 1fr)",
          // 2 colunas em 'sm'
          [theme.breakpoints.up("sm")]: {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
          // 4 colunas em 'md'
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
        }}
      >
        {/* Card: Total Clientes (Sem o <Grid> wrapper) */}
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            backgroundColor: "#3a3f5a",
            color: "white",
          }}
        >
          <GroupsIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Total Clientes
            </Typography>
            <Typography variant="h5">{displayStats.totalClientes}</Typography>
          </Box>
        </Card>

        {/* Card: Total Serviços (Sem o <Grid> wrapper) */}
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            backgroundColor: "#624D8C",
            color: "white",
          }}
        >
          <BuildIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Total Serviços
            </Typography>
            <Typography variant="h5">{displayStats.totalServicos}</Typography>
          </Box>
        </Card>

        {/* Card: Ordens Ativas (Sem o <Grid> wrapper) */}
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            backgroundColor: "#b8860b",
            color: "white",
          }}
        >
          <PlaylistAddCheckIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Ordens Ativas
            </Typography>
            <Typography variant="h5">{displayStats.ordensAtivas}</Typography>
          </Box>
        </Card>

        {/* Card: Receita do Mês (Sem o <Grid> wrapper) */}
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            backgroundColor: "#388E3C",
            color: "white",
          }}
        >
          <MonetizationOnIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Receita do Mês
            </Typography>
            <Typography variant="h5">R$ {displayStats.receitaMes}</Typography>
          </Box>
        </Card>
      </Box>

      {/* Grid para Status das Ordens e Resumo Financeiro (AGORA COM CSS GRID) */}
      <Box
        sx={{
          display: "grid",
          gap: 3, // O mesmo que spacing={3}
          // 1 coluna por padrão (xs)
          gridTemplateColumns: "repeat(1, 1fr)",
          // 2 colunas em 'md'
          [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
        }}
      >
        {/* Card: Status das Ordens (Sem o <Grid> wrapper) */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status das Ordens
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AccessTimeIcon sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Abertas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aguardando início
                </Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {displayStats.ordensAbertasDetalhe}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <WorkIcon sx={{ color: "warning.main", mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Em Andamento
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serviços em execução
                </Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {displayStats.ordensEmAndamentoDetalhe}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Concluídas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serviços finalizados
                </Typography>
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {displayStats.ordensConcluidasDetalhe}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card: Resumo Financeiro (Sem o <Grid> wrapper) */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo Financeiro
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body1">Ordens Concluídas</Typography>
                <Typography variant="h6">
                  {displayStats.ordensConcluidasDetalhe}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body1">Receita Total</Typography>
                <Typography variant="h6">
                  R$ {displayStats.receitaTotal}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body1">Ticket Médio</Typography>
                <Typography variant="h6">
                  R$ {displayStats.ticketMedio}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Dica Rápida (sem alteração) */}
      <Card
        sx={{
          mt: 4,
          backgroundColor: "action.hover",
          display: "flex",
          alignItems: "center",
          p: 2,
        }}
      >
        <LightbulbIcon sx={{ fontSize: 30, color: "warning.light", mr: 2 }} />
        <Typography variant="body1">
          Dica Rápida: Mantenha suas ordens atualizadas para uma visão precisa.
        </Typography>
      </Card>
    </Box>
  );
}

export default DashboardPage;
