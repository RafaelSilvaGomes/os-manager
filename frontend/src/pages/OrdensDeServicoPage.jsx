// src/pages/OrdensDeServicoPage.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Importando os componentes do MUI que vamos usar
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CardActions,
} from "@mui/material";

function OrdensDeServicoPage() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/ordens/",
          config
        );
        setOrdens(response.data);
      } catch (error) {
        console.error("Erro ao buscar Ordens de Serviço:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdens();
  }, []);

  // Uma função para dar cor aos status
  const getStatusColor = (status) => {
    switch (status) {
      case "AB":
        return "primary";
      case "EA":
        return "warning";
      case "FN":
        return "success";
      case "PG":
        return "success";
      case "CA":
        return "error";
      default:
        return "default";
    }
  };
  const handleDeleteOrdem = async (ordemId) => {
    if (
      window.confirm(
        "Tem certeza que deseja deletar esta Ordem de Serviço? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        await axios.delete(
          `http://127.0.0.1:8000/api/ordens/${ordemId}/`,
          config
        );

        // Remove a OS da lista na tela em tempo real
        setOrdens(ordens.filter((ordem) => ordem.id !== ordemId));
        alert("Ordem de Serviço deletada com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar OS:", error);
        alert("Erro ao deletar a Ordem de Serviço.");
      }
    }
  };

  if (loading) {
    return <p>Carregando Ordens de Serviço...</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Ordens de Serviço
        </Typography>
        <Button component={Link} to="/ordens/novo" variant="contained">
          Criar Nova OS
        </Button>
      </Box>

      <Box>
        {ordens.length > 0 ? (
          ordens.map((ordem) => (
            <Card key={ordem.id} sx={{ mb: 2 }}>
              {/* CardActionArea faz o card inteiro ser clicável */}
              <CardActionArea component={Link} to={`/ordens/${ordem.id}`}>
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">OS #{ordem.id}</Typography>
                    <Chip
                      label={ordem.status}
                      color={getStatusColor(ordem.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary">
                    Cliente: {ordem.cliente.nome}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Valor Total: R$ {ordem.valor_total}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteOrdem(ordem.id)}
                >
                  Deletar
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography>Nenhuma Ordem de Serviço encontrada.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default OrdensDeServicoPage;
