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
  TextField,
} from "@mui/material";

function AddMaterialForm({ token, ordemId, onSuccess, onLogout, setSnackbar }) {
  const [allMateriais, setAllMateriais] = useState([]);
  const [filteredMateriais, setFilteredMateriais] = useState([]); 
  const [storeOptions, setStoreOptions] = useState([]); 
  const [selectedStore, setSelectedStore] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [materiaisRes, storesRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/materiais/", config),
          axios.get("http://127.0.0.1:8000/api/material-stores/", config),
        ]);
        setAllMateriais(materiaisRes.data);
        setFilteredMateriais(materiaisRes.data);
        setStoreOptions(storesRes.data);

      } catch (error) {
        console.error("Erro ao buscar catálogo de materiais ou lojas:", error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      }
    };
    fetchAllData();
  }, [token, onLogout]);

  useEffect(() => {
    if (selectedStore === "") {
      setFilteredMateriais(allMateriais);
    } else {
      setFilteredMateriais(
        allMateriais.filter((m) => m.loja === selectedStore)
      );
    }
    setMaterialId("");
  }, [selectedStore, allMateriais]);

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
        <Grid item xs={12} sm={6} md={12}>
          <FormControl fullWidth size="small">
            <InputLabel id="store-filter-label">L</InputLabel>
            <Select
              labelId="store-filter-label"
              value={selectedStore}
              label="Filtrar por Loja"
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <MenuItem value="">
                <em>Todas as Lojas</em>
              </MenuItem>
              {storeOptions.map((storeName) => (
                <MenuItem key={storeName} value={storeName}>
                  {storeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="material-select-label">M</InputLabel>
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
              {filteredMateriais.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4} sm={3} md={3}>
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
        <Grid item xs={8} sm={3} md={3}>
          <Button type="submit" variant="contained" fullWidth>
            Adicionar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddMaterialForm;
