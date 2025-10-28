import { useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Stack,
} from "@mui/material";

function AddPagamentoForm({ ordemId, onSuccess, valorPendente }) {
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const handleRegistrarPagamento = async (valorASerPago) => {
    const valorNumerico = Number(valorASerPago);
    if (!valorNumerico || valorNumerico <= 0) {
      return;
    }

    if (valorNumerico > Number(valorPendente) + 0.01) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      forma_pagamento: formaPagamento,
      valor_pago: valorNumerico.toFixed(2),
    };

    try {
      console.log("--- 5. CHAMANDO axios.post com valor:", data.valor_pago);
      await axios.post("http://127.0.0.1:8000/api/pagamentos/", data, config);
      alert("Pagamento registrado com sucesso!");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Erro ao registrar pagamento.";
      alert(errorMessage);
    }
  };

  const valorPendenteNumerico = Number(valorPendente) || 0;
  const valorMetade = valorPendenteNumerico / 2;

  const formatarBRL = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isDisabled = valorPendenteNumerico <= 0;

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="pagamento-select-label">
              Forma de Pagamento
            </InputLabel>
            <Select
              labelId="pagamento-select-label"
              value={formaPagamento}
              label="Forma de Pagamento"
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
        <Grid item xs={12} sm={6}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="flex-end"
          >
            <Button
              variant="contained"
              color="info"
              disabled={isDisabled}
              onClick={() => handleRegistrarPagamento(valorMetade)}
              size="small"
            >
              Pagar 50% (R$ {formatarBRL(valorMetade)})
            </Button>

            <Button
              variant="contained"
              color="success"
              disabled={isDisabled}
              onClick={() => handleRegistrarPagamento(valorPendenteNumerico)}
              size="small"
            >
              {isDisabled
                ? "Pago"
                : `Pagar Total (R$ ${formatarBRL(valorPendenteNumerico)})`}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddPagamentoForm;
