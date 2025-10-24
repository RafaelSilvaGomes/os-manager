// src/components/AddPagamentoForm.jsx

import { useState } from "react";
import axios from "axios";
import { Box, Grid, Select, MenuItem, InputLabel, FormControl, Button, Typography } from "@mui/material";

// 1. Recebe 'valorPendente' como propriedade do componente pai
function AddPagamentoForm({ ordemId, onSuccess, valorPendente }) {
  // 2. Removemos o estado 'valorPago'
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("--- 1. handleSubmit INICIADO ---"); // Espião 1

    // 3. Verificamos se há valor pendente antes de prosseguir
    console.log("--- 2. Verificando valorPendente:", valorPendente); // Espião 2
    if (!valorPendente || valorPendente <= 0) {
      console.log("--- SAÍDA ANTECIPADA: Valor pendente é zero ou inválido ---"); // Espião Saída A
      alert("Esta Ordem de Serviço já está paga ou o valor pendente é inválido.");
      return; // Sai da função aqui
    }

    const token = localStorage.getItem("accessToken");
    console.log("--- 3. Token pego do localStorage:", token); // Espião 3

    // Verificação extra: Se o token for nulo aqui, algo está muito errado
    if (!token) {
        console.error("--- ERRO/SAÍDA: Token não encontrado no localStorage! ---"); // Espião Saída B
        alert("Erro de autenticação. Por favor, faça login novamente.");
        // Idealmente, chamar onLogout() aqui se ele for passado como prop
        // if (onLogout) onLogout(); // Descomente se 'onLogout' for passado
        return; // Sai da função aqui
    }

    console.log("--- 4. Preparando para chamar a API ---"); // Espião 4
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      forma_pagamento: formaPagamento,
      valor_pago: valorPendente,
      // Não enviamos valor_pago
    };

    try {
      console.log("--- 5. CHAMANDO axios.post ---"); // Espião 5
      await axios.post("http://127.0.0.1:8000/api/pagamentos/", data, config);
      console.log("--- 6. API respondeu com SUCESSO ---"); // Espião 6
      alert("Pagamento registrado com sucesso!");
      onSuccess();
    } catch (error) {
      // Este é o log de erro que você JÁ estava vendo
      console.error("--- 7. ERRO na chamada da API ---"); // Espião 7
      console.error("Erro ao registrar pagamento:", error); 
      const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || "Erro ao registrar pagamento.";
      console.error("Detalhes do erro da API:", error.response?.data);
      alert(errorMessage);
    }
    console.log("--- 8. handleSubmit FINALIZADO ---"); // Espião 8
  };

  // 5. Formata o valor pendente para exibição segura (trata undefined/null)
  const valorPendenteNumerico = Number(valorPendente) || 0;
  const valorPendenteFormatado = valorPendenteNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="center">
        {/* 6. Removido o Grid item do TextField 'Valor Pago' */}
        <Grid item xs={12} sm={8}> {/* Aumentado o espaço para o Select */}
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
        <Grid item xs={12} sm={4}> {/* Aumentado o espaço para o Botão */}
          {/* 7. Botão ajustado para mostrar o valor pendente e ficar desabilitado se pago */}
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={valorPendenteNumerico <= 0} // Desabilita se não houver pendência
          >
            {valorPendenteNumerico > 0 ? `Pagar R$ ${valorPendenteFormatado}` : "Pago"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddPagamentoForm;