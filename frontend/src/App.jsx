import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardContent,
  FormControl,
  FormGroup,
  Checkbox,
} from "@mui/material";
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from "@mui/icons-material/Settings";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import BuildIcon from "@mui/icons-material/Build";
import GrassIcon from "@mui/icons-material/Grass";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import ComputerIcon from "@mui/icons-material/Computer";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import CarpenterIcon from "@mui/icons-material/Carpenter";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClientesPage from "./pages/ClientesPage";
import ServicosPage from "./pages/ServicosPage";
import MateriaisPage from "./pages/MateriaisPage";
import OrdensDeServicoPage from "./pages/OrdensDeServicoPage";
import OrdemDeServicoCreatePage from "./pages/OrdemDeServicoCreatePage";
import OrdemDeServicoDetailPage from "./pages/OrdemDeServicoDetailPage";
import AgendaPage from "./pages/AgendaPage";

const professionPalettes = {
  eletricista: {
    primary: { main: "#0d47a1" },
    name: "Eletricista",
    icon: <ElectricBoltIcon />,
  },
  pedreiro: {
    primary: { main: "#b71c1c" },
    name: "Pedreiro",
    icon: <BuildIcon />,
  },
  jardineiro: {
    primary: { main: "#1b5e20" },
    name: "Jardineiro",
    icon: <GrassIcon />,
  },
  encanador: {
    primary: { main: "#01579b" },
    name: "Encanador",
    icon: <WaterDropIcon />,
  },
  pintor: {
    primary: { main: "#e65100" },
    name: "Pintor",
    icon: <FormatPaintIcon />,
  },
  informatica: {
    primary: { main: "#4a148c" },
    name: "Téc. Informática",
    icon: <ComputerIcon />,
  },
  ar_condicionado: {
    primary: { main: "#006064" },
    name: "Téc. Ar Cond.",
    icon: <AcUnitIcon />,
  },
  marceneiro: {
    primary: { main: "#3e2723" },
    name: "Marceneiro",
    icon: <CarpenterIcon />,
  },
  limpeza: {
    primary: { main: "#42a5f5" },
    name: "Limpeza/Diarista",
    icon: <CleaningServicesIcon />,
  },
  chaveiro: {
    primary: { main: "#607d8b" },
    name: "Chaveiro",
    icon: <VpnKeyIcon />,
  },
};

const allPaymentMethods = [
  { value: "PIX", label: "Pix" },
  { value: "DIN", label: "Dinheiro" },
  { value: "CC", label: "Cartão de Crédito" },
  { value: "CD", label: "Cartão de Débito" },
  { value: "BOL", label: "Boleto" },
  { value: "TRA", label: "Transferência/TED" },
];

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("accessToken") || null);

  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("themeMode") || "light"
  );
  const firstProfessionKey = Object.keys(professionPalettes)[0];
  const [profession, setProfession] = useState(
    () => localStorage.getItem("profession") || firstProfessionKey
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfessionDialog, setOpenProfessionDialog] = useState(false);
  const openMenu = Boolean(anchorEl);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState(() => {
    const defaultMethods = allPaymentMethods.map(m => m.value); 
    try {
      const stored = localStorage.getItem("paymentMethods");
      return stored ? JSON.parse(stored) : defaultMethods;
    } catch (e) {
      console.error("Erro ao ler formas de pagamento:", e);
      return defaultMethods;
    }
  });

  const theme = useMemo(() => {
    const paletteKey = token ? profession : firstProfessionKey;

    const currentPalette =
      professionPalettes[paletteKey] || professionPalettes[firstProfessionKey];

    return createTheme({
      palette: {
        mode: themeMode,
        primary: currentPalette.primary,

        ...(themeMode === "dark" && {
          background: {
            default: "#1C2025",
            paper: "#282C34",
          },
        }),
      },
      typography: {
        fontSize: 12,
        fontFamily: [
          '"Inter"',
          '"Roboto"',
          '"Helvetica"',
          "Arial",
          "sans-serif",
        ].join(","),
      },
    });
  }, [themeMode, profession, token]);

  useEffect(() => {
    document.body.className = themeMode;
  }, [themeMode]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenPaymentDialog = () => {
    setOpenPaymentDialog(true);
    handleMenuClose();
  };

  const handleClosePaymentDialog = () => {
    try {
      localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    } catch (e) {
      console.error("Erro ao salvar formas de pagamento:", e);
    }
    setOpenPaymentDialog(false);
  };

  const handlePaymentMethodChange = (event) => {
    const { value, checked } = event.target;
    setPaymentMethods((prev) =>
      checked ? [...prev, value] : prev.filter((m) => m !== value)
    );
  };

  const handleOpenProfessionDialog = () => {
    setOpenProfessionDialog(true);
    handleMenuClose();
  };
  const handleCloseProfessionDialog = () => setOpenProfessionDialog(false);

  const toggleThemeMode = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const handleProfessionChange = (newProfession) => {
    setProfession(newProfession);
    localStorage.setItem("profession", newProfession);
    handleCloseProfessionDialog();
  };

  const handleLogin = (accessToken) => {
    try {
      sessionStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
    } catch (e) {
      console.error("ERRO GRAVE AO SALVAR NO SESSIONSTORAGE:", e);
      alert(
        "Ocorreu um erro ao salvar sua sessão. Tente limpar o cache do navegador."
      );
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("accessToken");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            {token && (
              <AppBar position="static">
                <Toolbar>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      mr: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {
                      (
                        professionPalettes[profession] ||
                        professionPalettes[firstProfessionKey]
                      ).icon
                    }
                    OrdemPro
                  </Typography>

                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      component={Link}
                      to="/"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      component={Link}
                      to="/clientes"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Clientes
                    </Button>
                    <Button
                      component={Link}
                      to="/servicos"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Serviços
                    </Button>
                    <Button
                      component={Link}
                      to="/materiais"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Materiais
                    </Button>
                    <Button
                      component={Link}
                      to="/ordens"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Ordens
                    </Button>
                    <Button
                      component={Link}
                      to="/agenda"
                      color="inherit"
                      size="small"
                      sx={{
                        padding: "6px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Agenda
                    </Button>
                  </Box>

                  <Button
                    onClick={handleLogout}
                    color="inherit"
                    size="small"
                    sx={{
                      padding: "6px 12px",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.contrastText,
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Sair
                  </Button>
                  <IconButton
                    color="inherit"
                    aria-label="configurações"
                    aria-controls="settings-menu"
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                    sx={{
                      padding: "6px 12px",
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.contrastText,
                          0.12
                        ),
                      },
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
            )}

            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              MenuListProps={{ "aria-labelledby": "settings-button" }}
            >
              <MenuItem onClick={handleOpenProfessionDialog}>
                Mudar Profissão
              </MenuItem>
              <MenuItem onClick={handleOpenPaymentDialog}>
                Formas de Pagamento
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeMode === "dark"}
                      onChange={toggleThemeMode}
                    />
                  }
                  label={themeMode === "dark" ? "Modo Escuro" : "Modo Claro"}
                />
              </MenuItem>
            </Menu>
            
            <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Gerenciar Formas de Pagamento
              </DialogTitle>
              <DialogContent>
                <FormControl component="fieldset" variant="standard" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                    Selecione as formas de pagamento que você aceita.
                  </Typography>
                  <FormGroup>
                    {allPaymentMethods.map((method) => (
                      <FormControlLabel
                        key={method.value}
                        control={
                          <Checkbox
                            checked={paymentMethods.includes(method.value)}
                            onChange={handlePaymentMethodChange}
                            value={method.value}
                          />
                        }
                        label={method.label}
                        sx={{ color: 'text.primary' }}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePaymentDialog} variant="contained">
                  Salvar e Fechar
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={openProfessionDialog}
              onClose={handleCloseProfessionDialog}
              maxWidth="sm"
            >
              <DialogTitle>Selecione sua Profissão</DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    pt: 1,

                    gridTemplateColumns: "repeat(2, 1fr)",

                    [theme.breakpoints.up("sm")]: {
                      gridTemplateColumns: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {Object.entries(professionPalettes).map(([key, value]) => (
                    <Card key={key} sx={{ width: "100%" }}>
                      <CardActionArea
                        onClick={() => handleProfessionChange(key)}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 2,
                          backgroundColor: value.primary.main,
                          color: theme.palette.getContrastText(
                            value.primary.main
                          ),
                          "&:hover": {
                            backgroundColor:
                              value.primary.dark || value.primary.main,
                            opacity: 0.9,
                          },
                        }}
                      >
                        {value.icon ? (
                          <value.icon.type
                            {...value.icon.props}
                            sx={{ fontSize: 40, mb: 1 }}
                          />
                        ) : (
                          <BuildIcon sx={{ fontSize: 40, mb: 1 }} />
                        )}

                        <Typography
                          variant="body1"
                          component="div"
                          sx={{ textAlign: "center" }}
                        >
                          {value.name}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseProfessionDialog}>Cancelar</Button>
              </DialogActions>
            </Dialog>

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Routes>
                <Route
                  path="/login"
                  element={
                    !token ? (
                      <LoginPage onLogin={handleLogin} />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                <Route
                  path="/register"
                  element={!token ? <RegisterPage /> : <Navigate to="/" />}
                />
                <Route element={<ProtectedRoute token={token} />}>
                  <Route
                    path="/"
                    element={
                      <DashboardPage token={token} onLogout={handleLogout} />
                    }
                  />
                  <Route
                    path="/clientes"
                    element={
                      <ClientesPage token={token} onLogout={handleLogout} />
                    }
                  />
                  <Route
                    path="/servicos"
                    element={
                      <ServicosPage token={token} onLogout={handleLogout} />
                    }
                  />
                  <Route
                    path="/materiais"
                    element={
                      <MateriaisPage token={token} onLogout={handleLogout} />
                    }
                  />
                  <Route
                    path="/ordens"
                    element={
                      <OrdensDeServicoPage
                        token={token}
                        onLogout={handleLogout}
                      />
                    }
                  />
                  <Route
                    path="/ordens/novo"
                    element={
                      <OrdemDeServicoCreatePage
                        token={token}
                        onLogout={handleLogout}
                      />
                    }
                  />
                  <Route
                    path="/ordens/:id"
                    element={
                      <OrdemDeServicoDetailPage
                        token={token}
                        onLogout={handleLogout}
                      />
                    }
                  />
                  <Route 
                    path="/agenda" 
                    element={<AgendaPage token={token} onLogout={handleLogout} />} 
                  />
                  <Route
                    path="/"
                    element={
                      token ? (
                        <DashboardPage token={token} onLogout={handleLogout} />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                </Route>
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
