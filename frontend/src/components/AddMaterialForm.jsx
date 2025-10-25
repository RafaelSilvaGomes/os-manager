// src/components/AddMaterialForm.jsx

import { useState, useEffect } from "react";
import axios from "axios";

// 1. As importações completas do Material-UI para este componente
import {
  Box,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  TextField,
  Typography,
} from "@mui/material";

function AddMaterialForm({ token, ordemId, onSuccess, onLogout, setSnackbar }) {
  const [materiais, setMateriais] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    const fetchMateriais = async () => {
      if (!token) {
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/materiais/",
          config
        );
        setMateriais(response.data);
      } catch (error) {
        console.error("Erro ao buscar catálogo de materiais:", error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    };
    fetchMateriais();
  }, [token, onLogout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!materialId || !token) {
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: "Por favor, selecione um material.",
          severity: "warning",
        });
      } else {
        alert("Por favor, selecione um material.");
      }
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = {
      ordem_de_servico: ordemId,
      material_id: materialId,
      quantidade: quantidade,
    };

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/materiais-utilizados/",
        data,
        config
      );
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: "Material adicionado com sucesso!",
          severity: "success",
        });
      } else {
        alert("Material adicionado com sucesso!");
      }
      setMaterialId("");
      setQuantidade(1);
      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar material:", error);
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: "Erro ao adicionar material.",
          severity: "error",
        });
      } else {
        alert("Erro ao adicionar material.");
      }

      if (error.response && error.response.status === 401) {
        if (onLogout) onLogout();
      }
    }
  };

  return (

    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="center">
        <Grid xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="material-select-label">Material</InputLabel>
            <Select
              labelId="material-select-label"
              value={materialId}
              label="Material"
              onChange={(e) => setMaterialId(e.target.value)}
              required
            >
              <MenuItem value="">
                <em>-- Selecione --</em>
              </MenuItem>
              {materiais.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={4} sm={3}>
          <TextField
            type="number"
            label="Qtd."
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
            fullWidth
            size="small"
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>
        <Grid xs={8} sm={3}>
          <Button type="submit" variant="contained" fullWidth>
            Adicionar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddMaterialForm;
