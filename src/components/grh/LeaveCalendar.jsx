// src/components/drh/LeaveCalendar.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Clock,
  CalendarDays,
  LayoutGrid,
  List,
  Eye,
  FileText,
  Users,
  Building2
} from 'lucide-react';

// Configuration du localizer pour react-big-calendar
const localizer = momentLocalizer(moment);

// Mapping des couleurs par type de congé
const leaveTypeConfig = {
  annual: { label: 'Congés payés', color: '#4caf50', bgColor: 'bg-success/10', textColor: 'text-success' },
  sick: { label: 'Maladie', color: '#f44336', bgColor: 'bg-error/10', textColor: 'text-error' },
  maternity: { label: 'Maternité', color: '#9c27b0', bgColor: 'bg-purple-500/10', textColor: 'text-purple-600' },
  paternity: { label: 'Paternité', color: '#2196f3', bgColor: 'bg-info/10', textColor: 'text-info' },
  unpaid: { label: 'Sans solde', color: '#ff9800', bgColor: 'bg-warning/10', textColor: 'text-warning' },
  training: { label: 'Formation', color: '#00bcd4', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-600' },
  family: { label: 'Événement familial', color: '#e91e63', bgColor: 'bg-pink-500/10', textColor: 'text-pink-600' },
  other: { label: 'Autre', color: '#9e9e9e', bgColor: 'bg-base-200', textColor: 'text-base-content/70' }
};

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
  approved: { label: 'Approuvé', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
  rejected: { label: 'Rejeté', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
  cancelled: { label: 'Annulé', icon: XCircle, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' }
};

const LeaveCalendar = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, employeesRes] = await Promise.all([
        AxiosInstance.get('/leaves/'),
        AxiosInstance.get('/employees/')
      ]);
      setLeaves(leavesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer et transformer les congés en événements pour le calendrier
  useEffect(() => {
    let filtered = [...leaves];
    if (filterEmployee) filtered = filtered.filter(l => l.employee === parseInt(filterEmployee));
    if (filterStatus) filtered = filtered.filter(l => l.status === filterStatus);
    if (filterType) filtered = filtered.filter(l => l.leave_type === filterType);

    const mappedEvents = filtered.map(leave => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      end.setDate(end.getDate() + 1);
      const typeConfig = leaveTypeConfig[leave.leave_type] || leaveTypeConfig.other;
      return {
        id: leave.id,
        title: `${leave.employee_name} - ${typeConfig.label}`,
        start: start,
        end: end,
        allDay: true,
        resource: leave,
        color: typeConfig.color,
        status: leave.status
      };
    });
    setEvents(mappedEvents);
  }, [leaves, filterEmployee, filterStatus, filterType]);

  // Style personnalisé des événements
  const eventStyleGetter = (event) => {
    const isPending = event.resource.status === 'pending';
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: isPending ? 0.8 : 1,
        border: isPending ? '2px dashed #fff' : 'none',
        color: '#fff',
        display: 'block',
        fontSize: '0.8rem',
        padding: '2px 4px',
        cursor: 'pointer'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;
    try {
      await AxiosInstance.post(`/leaves/${selectedEvent.id}/approve/`);
      showNotification('Congé approuvé avec succès', 'success');
      fetchData();
      setDialogOpen(false);
    } catch (error) {
      showNotification('Erreur lors de l\'approbation', 'error');
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;
    try {
      await AxiosInstance.post(`/leaves/${selectedEvent.id}/reject/`);
      showNotification('Congé rejeté', 'success');
      fetchData();
      setDialogOpen(false);
    } catch (error) {
      showNotification('Erreur lors du rejet', 'error');
    }
  };

  const handleNavigate = (newDate) => setDate(newDate);
  const handleViewChange = (newView) => setView(newView);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterEmployee('');
    setFilterStatus('');
    setFilterType('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du calendrier...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            Calendrier des congés
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Visualisation des demandes de congés
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/leaves/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle demande</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm sm:hidden gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-48 text-sm"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-44 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tous les types</option>
              {Object.entries(leaveTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={resetFilters}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join ml-auto">
              <button 
                className={`join-item btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleViewChange('month')}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleViewChange('week')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleViewChange('day')}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${view === 'agenda' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleViewChange('agenda')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
        <h3 className="text-sm font-semibold text-base-content mb-3">Légende</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Object.entries(leaveTypeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: config.color }}></div>
              <span className="text-xs text-base-content/70">{config.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-dashed border-warning bg-warning/20"></div>
            <span className="text-xs text-base-content/70">En attente</span>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden p-4">
        <div className="h-[70vh] min-h-[500px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            popup
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              showMore: total => `+${total} voir plus`
            }}
          />
        </div>
      </div>

      {/* Modal Détails du congé */}
      {dialogOpen && selectedEvent && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg p-0 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-base-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Détails du congé</h3>
              {selectedEvent.status && (
                <div className={`badge ${statusConfig[selectedEvent.status]?.bgColor} ${statusConfig[selectedEvent.status]?.textColor} gap-1`}>
                  {statusConfig[selectedEvent.status]?.label}
                </div>
              )}
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Employé</label>
                  <p className="text-base font-semibold mt-1">{selectedEvent.employee_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Type</label>
                  <p className="text-base mt-1">{leaveTypeConfig[selectedEvent.leave_type]?.label || selectedEvent.leave_type}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Durée</label>
                  <p className="text-base mt-1">{selectedEvent.duration_days} jour(s)</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Période</label>
                  <p className="text-base mt-1">
                    {selectedEvent.start_date} → {selectedEvent.end_date}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Motif</label>
                  <p className="text-sm text-base-content/70 mt-1">{selectedEvent.reason || 'Non renseigné'}</p>
                </div>
                {selectedEvent.approved_by_name && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Approuvé par</label>
                    <p className="text-sm mt-1">
                      {selectedEvent.approved_by_name} le {new Date(selectedEvent.approval_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center gap-3 p-4 bg-base-200/50 border-t border-base-200">
              {selectedEvent.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleApprove}
                    className="btn btn-success btn-sm gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button 
                    onClick={handleReject}
                    className="btn btn-error btn-sm gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              )}
              <button 
                onClick={() => setDialogOpen(false)}
                className="btn btn-ghost btn-sm ml-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;