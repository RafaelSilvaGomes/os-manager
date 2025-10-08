// src/components/AddMaterialForm.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

// Nosso componente recebe duas 'props' (propriedades) do componente pai:
// - ordemId: o ID da OS à qual vamos adicionar o material.
// - onSuccess: uma função para ser chamada quando o material for adicionado com sucesso.
function AddMaterialForm({ ordemId, onSuccess }) {
  const [materiais, setMateriais] = useState([]);
  const [materialId, setMaterialId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  // Busca a lista de materiais disponíveis para preencher o dropdown
  useEffect(() => {
    const fetchMateriais = async () => {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/materiais/', config);
        setMateriais(response.data);
      } catch (error) {
        console.error("Erro ao buscar catálogo de materiais:", error);
      }
    };
    fetchMateriais();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!materialId) {
      alert('Por favor, selecione um material.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      material_id: materialId,
      quantidade: quantidade,
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/materiais-utilizados/', data, config);
      alert('Material adicionado com sucesso!');
      // Limpa o formulário
      setMaterialId('');
      setQuantidade(1);
      // Chama a função de sucesso que o componente pai nos passou
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar material:", error);
      alert('Erro ao adicionar material.');
    }
  };

  return (
    <div className="form-container-inline">
      <h4>Adicionar Material</h4>
      <form onSubmit={handleSubmit}>
        <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} required>
          <option value="">-- Selecione um material --</option>
          {materiais.map(material => (
            <option key={material.id} value={material.id}>
              {material.nome} (R$ {material.preco_unidade})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
        />
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default AddMaterialForm;