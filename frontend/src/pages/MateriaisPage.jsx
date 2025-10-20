// src/pages/MateriaisPage.jsx (VERSÃO FINAL COM UNIDADE DE MEDIDA)

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Paper,
} from "@mui/material";

function MateriaisPage() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ESTADOS DO FORMULÁRIO (incluindo o novo)
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoUnidade, setPrecoUnidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un"); // Novo estado

  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ... (fetchMateriais e handleDeleteMaterial podem continuar os mesmos) ...
  const fetchMateriais = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        "http://127.0.0.1:8000/api/materiais/",
        config
      );
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 2. PAYLOAD ATUALIZADO com o novo campo
    const materialData = {
      nome,
      descricao,
      preco_unidade: precoUnidade,
      unidade_medida: unidadeMedida,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingMaterial) {
        await axios.put(
          `http://127.0.0.1:8000/api/materiais/${editingMaterial.id}/`,
          materialData,
          config
        );
        alert("Material atualizado com sucesso!");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/materiais/",
          materialData,
          config
        );
        alert("Material cadastrado com sucesso!");
      }
      fetchMateriais();
      setIsFormOpen(false);
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar material:", error.response.data);
      alert("Erro ao salvar material.");
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Tem certeza que deseja deletar este material?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(
          `http://127.0.0.1:8000/api/materiais/${materialId}/`,
          config
        );
        setMateriais(
          materiais.filter((material) => material.id !== materialId)
        );
        alert("Material deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar material:", error);
        alert("Erro ao deletar material.");
      }
    }
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    // 3. PREENCHE O FORMULÁRIO (incluindo o novo campo)
    setNome(material.nome);
    setDescricao(material.descricao || "");
    setPrecoUnidade(material.preco_unidade);
    setUnidadeMedida(material.unidade_medida || "un"); // Preenche o novo campo
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    clearForm();
    setIsFormOpen(false);
  };

  const clearForm = () => {
    // 4. LIMPA O FORMULÁRIO (incluindo o novo campo)
    setNome("");
    setDescricao("");
    setPrecoUnidade("");
    setUnidadeMedida("un"); // Reseta para o padrão
    setEditingMaterial(null);
  };

  if (loading) {
    return <p>Carregando materiais...</p>;
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
          Meus Materiais
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            clearForm();
            setIsFormOpen(true);
          }}
        >
          Adicionar Material
        </Button>
      </Box>

      <Collapse in={isFormOpen}>
        <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {editingMaterial ? "Editar Material" : "Cadastrar Novo Material"}
          </Typography>
          {/* 5. FORMULÁRIO ATUALIZADO */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Nome do Material"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            {/* Campo de Preço e Unidade lado a lado para melhor UI */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Unidade (ex: un, m, cx)"
                value={unidadeMedida}
                onChange={(e) => setUnidadeMedida(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Preço"
                type="number"
                value={precoUnidade}
                onChange={(e) => setPrecoUnidade(e.target.value)}
                required
                fullWidth
                // Adiciona step para facilitar
                inputProps={{ step: "0.01" }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button type="button" onClick={handleCancel} variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                {editingMaterial ? "Salvar" : "Cadastrar"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      <Box>
        {materiais.length > 0 ? (
          materiais.map((material) => (
            <Card key={material.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{material.nome}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {material.descricao}
                </Typography>
                {/* 6. EXIBIÇÃO DINÂMICA DA UNIDADE */}
                <Typography variant="h6" color="primary">
                  R$ {material.preco_unidade} / {material.unidade_medida}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEditClick(material)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteMaterial(material.id)}
                >
                  Deletar
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography>Você ainda não cadastrou nenhum material.</Typography>
        )}
      </Box>
    </Box>
  );
}

export default MateriaisPage;
