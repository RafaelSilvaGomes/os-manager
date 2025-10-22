// src/components/AddPagamentoForm.jsx

import { useState } from "react";
import axios from "axios";

// 1. Importando os componentes do MUI
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";

function AddPagamentoForm({ ordemId, onSuccess }) {
  const [valorPago, setValorPago] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!valorPago) {
      alert("Por favor, insira um valor.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      valor_pago: valorPago,
      forma_pagamento: formaPagamento,
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/pagamentos/", data, config);
      alert("Pagamento registrado com sucesso!");
      setValorPago("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Erro ao registrar pagamento.");
    }
  };

  return (
    // 2. O novo return usando Grid
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="center">
        <Grid xs={12} sm={5}>
          <TextField
            label="Valor Pago"
            type="number"
            step="0.01"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            required
            fullWidth
            size="small"
            InputProps={{ inputProps: { min: 0.01 } }}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="pagamento-select-label">Forma</InputLabel>
            <Select
              labelId="pagamento-select-label"
              value={formaPagamento}
              label="Forma"
              onChange={(e) => setFormaPagamento(e.target.value)}
              required
            >
              <MenuItem value="PIX">Pix</MenuItem>
              <MenuItem value="DIN">Dinheiro</MenuItem>
              <MenuItem value="CC">Cartão de Crédito</MenuItem>
              <MenuItem value="CD">Cartão de Débito</MenuItem>
              <MenuItem value="BOL">Boleto</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={3}>
          <Button type="submit" variant="contained" fullWidth>
            Registrar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddPagamentoForm;
