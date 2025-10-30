import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import EventIcon from '@mui/icons-material/Event';

function AgendaPage({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgenda = async () => {
      if (!token) {
        setLoading(false);
        setError("Usuário não autenticado.");
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://127.0.0.1:8000/api/agenda/",
          config
        );
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados da agenda:", err);
        if (err.response && err.response.status === 401) {
          if (onLogout) onLogout();
        } else {
          setError("Falha ao carregar os agendamentos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, [token, onLogout]);

  const handleEventClick = (clickInfo) => {
    clickInfo.jsEvent.preventDefault();
    if (clickInfo.event.url) {
      navigate(clickInfo.event.url);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <EventIcon fontSize="large" />
        <Typography variant="h4" component="h1">
          Agenda de Serviços
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 1, sm: 2 },
          '& .fc-toolbar-title': {
            fontSize: { xs: '1.1rem', sm: '1.4rem' },
            textTransform: 'uppercase'
          },

          '& .fc-daygrid-event': {
            fontSize: '0.9rem', 
          },

          '& .fc-col-header-cell-cushion': {
            fontSize: { xs: '0.9rem', sm: '1rem' },
            textTransform: 'uppercase'
          }
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          locale={ptBrLocale}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          navLinks={true}
          businessHours={true}
          editable={false}
          
          /* PASSO 1: 
            Adicione esta prop para formatar a hora (ex: 16:00)
          */
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </Paper>
    </Box>
  );
}

export default AgendaPage;