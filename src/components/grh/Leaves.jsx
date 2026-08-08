// src/components/drh/Leaves.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Calendar,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Grid3x3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  User,
  Briefcase,
  CalendarDays
} from 'lucide-react';
import LeaveCalendar from './LeaveCalendar';

const Leaves = () => {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const statusConfig = {
    pending: { label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    approved: { label: 'Approuvé', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    rejected: { label: 'Rejeté', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    cancelled: { label: 'Annulé', icon: XCircle, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/50' }
  };

  const typeConfig = {
    annual: { label: 'Congés payés', color: 'primary' },
    sick: { label: 'Maladie', color: 'error' },
    unpaid: { label: 'Sans solde', color: 'warning' },
    other: { label: 'Autre', color: 'info' }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchLeaves = () => {
    setLoading(true);
    AxiosInstance.get('/leaves/')
      .then(res => {
        setLeaves(res.data);
        setLoading(false);
        setCalendarRefresh(prev => prev + 1);
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement', 'error');
        setLoading(false);
      });
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleDelete = async () => {
    if (!leaveToDelete) return;
    try {
      await AxiosInstance.delete(`/leaves/${leaveToDelete.id}/`);
      showNotification('Congé supprimé avec succès', 'success');
      fetchLeaves();
      setShowDeleteModal(false);
      setLeaveToDelete(null);
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await AxiosInstance.post(`/leaves/${id}/approve/`);
      showNotification('Congé approuvé avec succès', 'success');
      fetchLeaves();
    } catch (error) {
      showNotification('Erreur lors de l\'approbation', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await AxiosInstance.post(`/leaves/${id}/reject/`);
      showNotification('Congé rejeté', 'success');
      fetchLeaves();
    } catch (error) {
      showNotification('Erreur lors du rejet', 'error');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (l.employee_name?.toLowerCase() || '').includes(search);
    const matchesStatus = !filterStatus || l.status === filterStatus;
    const matchesType = !filterType || l.leave_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  // Ajuster itemsPerPage selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(10);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading && viewMode === 'table') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des demandes...
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
            Congés
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gestion des demandes de congés ({stats.total} au total)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="join">
            <button 
              className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              className={`join-item btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={fetchLeaves}
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

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En attente</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.pending}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Approuvés</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.approved}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Rejetés</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.rejected}</div>
        </div>
      </div>

      {/* Vue Tableau */}
      {viewMode === 'table' && (
        <>
          {/* Filtres */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Rechercher par employé..."
                    className="input input-bordered w-full pl-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline btn-sm sm:hidden gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {showFilters ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
              </button>
              
              <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
                <select 
                  className="select select-bordered w-full sm:w-40 text-sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                </select>
                
                <select 
                  className="select select-bordered w-full sm:w-40 text-sm"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Types</option>
                  <option value="annual">Congés payés</option>
                  <option value="sick">Maladie</option>
                  <option value="unpaid">Sans solde</option>
                  <option value="other">Autre</option>
                </select>
                
                <button 
                  className="btn btn-outline gap-2"
                  onClick={() => {
                    setFilterStatus('');
                    setFilterType('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm bg-base-200">
                    <th>Employé</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                        <p className="text-base-content/50">Aucune demande de congé</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLeaves.map((leave) => {
                      const status = statusConfig[leave.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const typeInfo = typeConfig[leave.leave_type] || typeConfig.other;
                      const startDate = new Date(leave.start_date).toLocaleDateString('fr-FR');
                      const endDate = new Date(leave.end_date).toLocaleDateString('fr-FR');
                      
                      return (
                        <tr key={leave.id} className="hover:bg-base-200 transition-colors">
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="avatar placeholder w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">{leave.employee_name}</span>
                            </div>
                          </td>
                          <td>
                            <div className={`badge badge-sm bg-${typeInfo.color}/10 text-${typeInfo.color}`}>
                              {leave.leave_type_display}
                            </div>
                          </td>
                          <td className="text-sm">
                            {startDate} → {endDate}
                          </td>
                          <td className="text-sm">{leave.duration_days} jour(s)</td>
                          <td>
                            <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center gap-1">
                              {leave.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(leave.id)}
                                    className="btn btn-ghost btn-xs text-success"
                                    title="Approuver"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(leave.id)}
                                    className="btn btn-ghost btn-xs text-error"
                                    title="Rejeter"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setLeaveToDelete(leave);
                                  setShowDeleteModal(true);
                                }}
                                className="btn btn-ghost btn-xs text-error"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLeaves.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLeaves.length)} sur {filteredLeaves.length}
                  </div>
                  
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <select 
                      className="select select-bordered select-xs sm:select-sm"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                    
                    <div className="join">
                      <button 
                        className="join-item btn btn-xs sm:btn-sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage <= 2) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button 
                        className="join-item btn btn-xs sm:btn-sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden p-4">
          <LeaveCalendar refreshTrigger={calendarRefresh} />
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && leaveToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer cette demande de congé ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{leaveToDelete.employee_name}"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1"
                onClick={handleDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;