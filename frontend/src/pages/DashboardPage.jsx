// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';

function DashboardPage() {
  // 1. Estado para guardar os dados e controlar o carregamento
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 2. Faz a requisição para o nosso novo endpoint de estatísticas
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/stats/', config);
        
        setStats(response.data); // Guarda o objeto de estatísticas no estado
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // O array vazio [] garante que a busca aconteça só uma vez

  // Enquanto os dados não chegam, mostra um indicador de carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* 3. O Grid do MUI organiza nossos cards em uma grade responsiva */}
      <Grid container spacing={3}>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Ordens de Serviço Abertas
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.ordens_abertas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Faturamento do Mês
              </Typography>
              <Typography variant="h3" component="div">
                R$ {stats?.faturamento_mes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Clientes
              </Typography>
              <Typography variant="h3" component="div">
                {stats?.total_clientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
    </Box>
  );
}

export default DashboardPage;