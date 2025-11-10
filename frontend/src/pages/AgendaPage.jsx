import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

function AgendaPage({ token, onLogout }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchAgenda = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          'http://127.0.0.1:8000/api/agenda/',
          config
        );
        setEvents(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados da agenda:', error);
        if (error.response && error.response.status === 401) {
          if (onLogout) onLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAgenda();
  }, [token, onLogout]);

  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.url) {
      navigate(clickInfo.event.url);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const calendarView = isMobile ? 'listWeek' : 'dayGridMonth';

  const calendarToolbar = isMobile 
    ? {
        left: 'prev,next',
        center: 'title',
        right: 'today'
      }
    : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek' 
      };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}> 
      <FullCalendar
        plugins={[
          dayGridPlugin, 
          timeGridPlugin, 
          interactionPlugin, 
          listPlugin 
        ]}
        initialView={calendarView} 
        headerToolbar={calendarToolbar} 
        events={events}
        eventClick={handleEventClick}
        
        locale="pt-br" 
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          list: 'Lista'
        }}
        height="auto" 
        eventTimeFormat={{ 
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
      />
    </Paper>
  );
}

export default AgendaPage;