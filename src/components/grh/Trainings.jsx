// src/components/drh/Trainings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Calendar, 
  User,
  X,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Award,
  BookOpen,
  Video,
  Building2,
  TrendingUp,
  Download
} from 'lucide-react';

const Trainings = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [participantsModal, setParticipantsModal] = useState(false);
  const [trainingParticipants, setTrainingParticipants] = useState([]);

  const statusConfig = {
    planned: { label: 'Planifiée', icon: Calendar, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info', borderColor: 'border-info/30' },
    in_progress: { label: 'En cours', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning', borderColor: 'border-warning/30' },
    completed: { label: 'Terminée', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success', borderColor: 'border-success/30' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error', borderColor: 'border-error/30' }
  };

  const trainingTypes = {
    technical: { label: 'Technique', icon: BookOpen, color: 'primary' },
    soft_skills: { label: 'Soft Skills', icon: Users, color: 'secondary' },
    leadership: { label: 'Leadership', icon: Award, color: 'warning' },
    compliance: { label: 'Conformité', icon: CheckCircle, color: 'info' },
    language: { label: 'Langue', icon: Video, color: 'success' },
    other: { label: 'Autre', icon: GraduationCap, color: 'neutral' }
  };

  const showNotification = (message, type) => { 
    setNotification({ show: true, message, type }); 
    setTimeout(() => setNotification({ ...notification, show: false }), 4000); 
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/trainings/'),
      AxiosInstance.get('/employees/')
    ])
      .then(([trainingRes, empRes]) => { 
        setTrainings(trainingRes.data || []); 
        setEmployees(empRes.data || []);
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement des données', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchParticipants = async (trainingId) => {
    try {
      const response = await AxiosInstance.get(`/trainings/${trainingId}/participants/`);
      setTrainingParticipants(response.data || []);
      setParticipantsModal(true);
    } catch (err) {
      showNotification('Erreur lors du chargement des participants', 'error');
    }
  };

  const handleDelete = async () => {
    if (!trainingToDelete) return;
    try { 
      await AxiosInstance.delete(`/trainings/${trainingToDelete.id}/`); 
      showNotification('Formation supprimée avec succès', 'success'); 
      fetchData(); 
      setShowDeleteModal(false); 
      setTrainingToDelete(null);
    } catch (err) { 
      showNotification('Erreur lors de la suppression', 'error'); 
    }
  };

  const handleRegisterParticipant = async (trainingId) => {
    // Navigation vers la page d'inscription
    navigate(`/trainings/${trainingId}/register`);
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = !searchTerm || 
      (training.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (training.provider?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (training.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || training.status === filterStatus;
    const matchesType = !filterType || training.training_type === filterType;
    const matchesDateStart = !dateRange.start || new Date(training.start_date) >= new Date(dateRange.start);
    const matchesDateEnd = !dateRange.end || new Date(training.end_date) <= new Date(dateRange.end);
    return matchesSearch && matchesStatus && matchesType && matchesDateStart && matchesDateEnd;
  });

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const paginatedTrainings = filteredTrainings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = { 
    total: trainings.length, 
    planned: trainings.filter(t => t.status === 'planned').length, 
    inProgress: trainings.filter(t => t.status === 'in_progress').length,
    completed: trainings.filter(t => t.status === 'completed').length,
    cancelled: trainings.filter(t => t.status === 'cancelled').length,
    totalParticipants: trainings.reduce((sum, t) => sum + (t.participants_count || 0), 0),
    averageCost: trainings.length > 0 ? trainings.reduce((sum, t) => sum + (t.cost || 0), 0) / trainings.length : 0
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.planned;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.textColor}`} />;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des formations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl text-sm sm:text-base rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Détails Formation */}
      {showDetailModal && selectedTraining && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl p-0 overflow-hidden">
            <div className={`p-4 ${statusConfig[selectedTraining.status]?.bgColor} border-b`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold">Détails de la formation</h3>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="btn btn-sm btn-ghost btn-circle">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre</label>
                  <p className="text-lg font-bold text-primary mt-1">{selectedTraining.title}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organisateur</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    {selectedTraining.provider}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Période</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(selectedTraining.start_date)} → {formatDate(selectedTraining.end_date)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lieu</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {selectedTraining.location}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Durée</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {selectedTraining.duration_hours} heures
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Participants</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-primary" />
                    {selectedTraining.participants_count || 0} / {selectedTraining.max_participants}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coût</label>
                  <p className="text-base font-bold text-success mt-1">{formatCurrency(selectedTraining.cost)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedTraining.status)}
                    <span className={`badge ${statusConfig[selectedTraining.status]?.bgColor} ${statusConfig[selectedTraining.status]?.textColor}`}>
                      {statusConfig[selectedTraining.status]?.label}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedTraining.description || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
            <div className="modal-action p-4 bg-gray-50 flex justify-between">
              <button onClick={() => { setShowDetailModal(false); fetchParticipants(selectedTraining.id); }} className="btn btn-outline gap-2">
                <Users className="w-4 h-4" />
                Voir les participants
              </button>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-ghost">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Participants */}
      {participantsModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl p-0 overflow-hidden">
            <div className="bg-primary/10 p-4 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold">Participants à la formation</h3>
                </div>
                <button onClick={() => setParticipantsModal(false)} className="btn btn-sm btn-ghost btn-circle">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {trainingParticipants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Aucun participant inscrit</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trainingParticipants.map((participant, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{participant.employee_name}</p>
                          <p className="text-xs text-gray-500">{participant.department}</p>
                        </div>
                      </div>
                      <span className={`badge ${participant.status === 'completed' ? 'badge-success' : participant.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>
                        {participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-action p-4 bg-gray-50">
              <button onClick={() => setParticipantsModal(false)} className="btn btn-ghost">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">Formations</h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              Gestion des formations et du développement professionnel – {stats.total} formation(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-2 hover:bg-primary/10 transition-all">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button onClick={() => navigate('/trainings/new')} className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-none shadow-lg hover:shadow-xl transition-all gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle formation
            </button>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Total</p><p className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</p></div>
              <GraduationCap className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Planifiées</p><p className="text-xl sm:text-2xl font-bold text-info">{stats.planned}</p></div>
              <Calendar className="w-8 h-8 text-info/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">En cours</p><p className="text-xl sm:text-2xl font-bold text-warning">{stats.inProgress}</p></div>
              <Clock className="w-8 h-8 text-warning/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Terminées</p><p className="text-xl sm:text-2xl font-bold text-success">{stats.completed}</p></div>
              <CheckCircle className="w-8 h-8 text-success/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Participants</p><p className="text-xl sm:text-2xl font-bold text-secondary">{stats.totalParticipants}</p></div>
              <Users className="w-8 h-8 text-secondary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Coût total</p><p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(stats.totalParticipants * stats.averageCost)}</p></div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-base-content/50 font-medium uppercase">Moyenne/formation</p><p className="text-lg sm:text-xl font-bold text-info">{formatCurrency(stats.averageCost)}</p></div>
              <TrendingUp className="w-8 h-8 text-info/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input type="text" placeholder="Rechercher par titre, organisateur ou lieu..." className="input input-bordered w-full pl-9 py-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-2">
            <Filter className="w-4 h-4" /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          <div className={`${showFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3`}>
            <select className="select select-bordered w-full focus:border-primary" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
            </select>
            <select className="select select-bordered w-full focus:border-primary" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="">Tous les types</option>
              {Object.entries(trainingTypes).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
            </select>
            <input type="date" placeholder="Date début" className="input input-bordered w-full focus:border-primary" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
            <input type="date" placeholder="Date fin" className="input input-bordered w-full focus:border-primary" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
            <button className="btn btn-outline gap-2 hover:bg-primary/10 transition-all" onClick={() => { setFilterStatus(''); setFilterType(''); setSearchTerm(''); setDateRange({ start: '', end: '' }); setCurrentPage(1); }}>
              <RefreshCw className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau professionnel */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gradient-to-r from-base-200 to-base-100 text-sm">
                <th className="py-4 font-semibold">Formation</th>
                <th className="py-4 font-semibold">Période</th>
                <th className="py-4 font-semibold hidden md:table-cell">Organisateur</th>
                <th className="py-4 font-semibold hidden lg:table-cell">Lieu</th>
                <th className="py-4 font-semibold text-center">Participants</th>
                <th className="py-4 font-semibold text-right">Coût</th>
                <th className="py-4 font-semibold text-center">Statut</th>
                <th className="py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrainings.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16"><div className="flex flex-col items-center gap-3"><div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><GraduationCap className="w-10 h-10 text-gray-300" /></div><p className="text-base-content/50 font-medium">Aucune formation trouvée</p><button onClick={() => navigate('/trainings/new')} className="btn btn-primary btn-sm gap-2 mt-2"><Plus className="w-4 h-4" />Créer une formation</button></div></td></tr>) : (
                paginatedTrainings.map((training) => {
                  const status = statusConfig[training.status] || statusConfig.planned;
                  const StatusIcon = status.icon;
                  const daysRemaining = getDaysRemaining(training.end_date);
                  return (
                    <tr key={training.id} className="hover:bg-base-200 transition-colors group">
                      <td><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-primary" /></div><div><p className="font-semibold">{training.title}</p><p className="text-xs text-base-content/50">{training.training_type_display}</p></div></div></td>
                      <td><div className="flex flex-col"><span className="text-sm">{formatDate(training.start_date)}</span><span className="text-xs text-base-content/50">→ {formatDate(training.end_date)}</span>{daysRemaining !== null && daysRemaining > 0 && <span className="text-xs text-warning mt-1">{daysRemaining} jours restants</span>}</div></td>
                      <td className="hidden md:table-cell"><div className="flex items-center gap-2"><Building2 className="w-3 h-3 text-gray-400" /><span className="text-sm">{training.provider}</span></div></td>
                      <td className="hidden lg:table-cell"><div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-gray-400" /><span className="text-sm">{training.location}</span></div></td>
                      <td className="text-center"><div className="flex items-center justify-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="font-semibold">{training.participants_count || 0}</span><span className="text-xs text-gray-400">/{training.max_participants}</span></div></td>
                      <td className="text-right"><span className="font-semibold text-primary">{formatCurrency(training.cost)}</span></td>
                      <td className="text-center"><div className={`badge ${status.bgColor} ${status.textColor} gap-1 px-3 py-3`}><StatusIcon className="w-3 h-3" />{status.label}</div></td>
                      <td className="text-center"><div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"><button onClick={() => { setSelectedTraining(training); setShowDetailModal(true); }} className="btn btn-ghost btn-sm btn-circle" title="Détails"><Eye className="w-4 h-4" /></button><button onClick={() => handleRegisterParticipant(training.id)} className="btn btn-ghost btn-sm btn-circle text-primary" title="Inscrire"><User className="w-4 h-4" /></button><button onClick={() => navigate(`/trainings/${training.id}/edit`)} className="btn btn-ghost btn-sm btn-circle" title="Modifier"><Edit className="w-4 h-4" /></button><button onClick={() => { setTrainingToDelete(training); setShowDeleteModal(true); }} className="btn btn-ghost btn-sm btn-circle text-error" title="Supprimer"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination élégante */}
        {filteredTrainings.length > 0 && (
          <div className="px-6 py-4 border-t border-base-200 bg-base-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">Affichage de <span className="font-semibold text-primary">{((currentPage-1)*itemsPerPage)+1}</span> à <span className="font-semibold text-primary">{Math.min(currentPage*itemsPerPage, filteredTrainings.length)}</span> sur <span className="font-semibold">{filteredTrainings.length}</span> formations</div>
              <div className="flex items-center gap-3"><select className="select select-bordered select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}><option value="5">5 lignes</option><option value="10">10 lignes</option><option value="15">15 lignes</option><option value="20">20 lignes</option></select>
              <div className="join"><button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum; if (totalPages <= 5) pageNum = i+1; else if (currentPage <= 3) pageNum = i+1; else if (currentPage >= totalPages-2) pageNum = totalPages-4+i; else pageNum = currentPage-2+i; return <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary text-white' : ''}`}>{pageNum}</button>; })}
              <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}><ChevronRight className="w-4 h-4" /></button></div></div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && trainingToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">
            <div className="bg-error/10 p-4 text-center"><div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3"><Trash2 className="w-8 h-8 text-error" /></div><h3 className="text-xl font-bold text-error">Confirmer la suppression</h3></div>
            <div className="p-6 text-center"><p className="text-base-content/70">Voulez-vous vraiment supprimer cette formation ?</p><p className="font-semibold text-error mt-2">{trainingToDelete.title}</p></div>
            <div className="flex gap-3 p-4 bg-gray-50"><button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button><button className="btn btn-error flex-1 gap-2" onClick={handleDelete}><Trash2 className="w-4 h-4" />Supprimer</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainings;