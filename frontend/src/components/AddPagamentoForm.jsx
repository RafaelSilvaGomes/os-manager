import { useState, useEffect } from "react";
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

const allPaymentMethods = [
  { value: "PIX", label: "Pix" },
  { value: "DIN", label: "Dinheiro" },
  { value: "CC", label: "Cartão de Crédito" },
  { value: "CD", label: "Cartão de Débito" },
  { value: "BOL", label: "Boleto" },
  { value: "TRA", label: "Transferência/TED" },
];

function AddPagamentoForm({ token, ordemId, onSuccess, valorPendente }) {
  const [availableMethods, setAvailableMethods] = useState([]);
  const [formaPagamento, setFormaPagamento] = useState("");

useEffect(() => {
    const stored = localStorage.getItem("paymentMethods");
    const defaultMethods = allPaymentMethods.map(m => m.value);
    let userMethods = defaultMethods;

    if (stored) {
      try {
        userMethods = JSON.parse(stored);
      } catch (e) { }
    }
    const enabledMethods = allPaymentMethods.filter(m => 
      userMethods.includes(m.value)
    );
    
    setAvailableMethods(enabledMethods);

    if (enabledMethods.length > 0) {
      setFormaPagamento(enabledMethods[0].value);
    } else {
      setFormaPagamento("");
    }
  }, []);

  const handleRegistrarPagamento = async (valorASerPago) => {
    const valorNumerico = Number(valorASerPago);
    if (!valorNumerico || valorNumerico <= 0) {
      return;
    }

    if (valorNumerico > Number(valorPendente) + 0.01) {
      return;
    }

    if (!token) {
      alert("Erro de autenticação: Token não encontrado.");
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
              disabled={availableMethods.length === 0}
            >
              {availableMethods.length === 0 ? (
                <MenuItem value="" disabled>
                  Nenhuma forma de pgto. habilitada
                </MenuItem>
              ) : (
                availableMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))
              )}
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
              disabled={isDisabled || availableMethods.length === 0}
              onClick={() => handleRegistrarPagamento(valorMetade)}
              size="small"
            >
              Pagar 50% (R$ {formatarBRL(valorMetade)})
            </Button>

            <Button
              variant="contained"
              color="success"
              disabled={isDisabled || availableMethods.length === 0}
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
