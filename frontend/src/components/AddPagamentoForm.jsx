import { useState } from "react";
import axios from "axios";
import { Box, Grid, Select, MenuItem, InputLabel, FormControl, Button, Typography } from "@mui/material";


function AddPagamentoForm({ ordemId, onSuccess, valorPendente }) {
  
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("--- 1. handleSubmit INICIADO ---"); 

  
    console.log("--- 2. Verificando valorPendente:", valorPendente); 
    if (!valorPendente || valorPendente <= 0) {
      console.log("--- SAÍDA ANTECIPADA: Valor pendente é zero ou inválido ---"); 
      alert("Esta Ordem de Serviço já está paga ou o valor pendente é inválido.");
      return; 
    }

    const token = localStorage.getItem("accessToken");
    console.log("--- 3. Token pego do localStorage:", token); 

    
    if (!token) {
        console.error("--- ERRO/SAÍDA: Token não encontrado no localStorage! ---"); 
        alert("Erro de autenticação. Por favor, faça login novamente.");

        return; 
    }

    console.log("--- 4. Preparando para chamar a API ---"); 
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      forma_pagamento: formaPagamento,
      valor_pago: valorPendente,
 
    };

    try {
      console.log("--- 5. CHAMANDO axios.post ---"); 
      await axios.post("http://127.0.0.1:8000/api/pagamentos/", data, config);
      console.log("--- 6. API respondeu com SUCESSO ---");
      alert("Pagamento registrado com sucesso!");
      onSuccess();
    } catch (error) {

      console.error("--- 7. ERRO na chamada da API ---");
      console.error("Erro ao registrar pagamento:", error); 
      const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || "Erro ao registrar pagamento.";
      console.error("Detalhes do erro da API:", error.response?.data);
      alert(errorMessage);
    }
    console.log("--- 8. handleSubmit FINALIZADO ---"); 
  };


  const valorPendenteNumerico = Number(valorPendente) || 0;
  const valorPendenteFormatado = valorPendenteNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8}> 
          <FormControl fullWidth size="small">
            <InputLabel id="pagamento-select-label">Forma de Pagamento</InputLabel>
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
        <Grid item xs={12} sm={4}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={valorPendenteNumerico <= 0} 
          >
            {valorPendenteNumerico > 0 ? `Pagar R$ ${valorPendenteFormatado}` : "Pago"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddPagamentoForm;