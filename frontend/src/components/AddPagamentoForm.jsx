// src/components/AddPagamentoForm.jsx

import { useState } from 'react';
import axios from 'axios';

function AddPagamentoForm({ ordemId, onSuccess }) {
  const [valorPago, setValorPago] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX'); // Padrão 'PIX'

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!valorPago) {
      alert('Por favor, insira um valor.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      valor_pago: valorPago,
      forma_pagamento: formaPagamento,
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/pagamentos/', data, config);
      alert('Pagamento registrado com sucesso!');
      setValorPago('');
      onSuccess(); // Avisa o componente pai para recarregar os dados
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert('Erro ao registrar pagamento.');
    }
  };

  return (
    <div className="form-container-inline">
      <h4>Registrar Pagamento</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          placeholder="Valor Pago"
          value={valorPago}
          onChange={(e) => setValorPago(e.target.value)}
          required
        />
        <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} required>
          <option value="PIX">Pix</option>
          <option value="DIN">Dinheiro</option>
          <option value="CC">Cartão de Crédito</option>
          <option value="CD">Cartão de Débito</option>
          <option value="BOL">Boleto</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default AddPagamentoForm;