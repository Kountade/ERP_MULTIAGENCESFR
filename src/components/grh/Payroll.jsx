// src/components/drh/Payroll.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Eye,
  Edit,
  FileText,
  DollarSign,
  Receipt,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Payroll = () => {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const statusConfig = {
    draft: { label: 'Brouillon', icon: FileText, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' },
    calculated: { label: 'Calculée', icon: TrendingUp, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    approved: { label: 'Approuvée', icon: CheckCircle, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    paid: { label: 'Payée', icon: DollarSign, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' }
  };

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  const years = [2023, 2024, 2025, 2026];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/payroll/'),
      AxiosInstance.get('/employees/')
    ])
      .then(([payrollRes, empRes]) => {
        setPayrolls(payrollRes.data || []);
        setEmployees(empRes.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement', 'error');
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await AxiosInstance.post(`/payroll/${id}/approve/`);
      showNotification('Fiche approuvée avec succès', 'success');
      fetchData();
    } catch (err) {
      showNotification('Erreur lors de l\'approbation', 'error');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await AxiosInstance.post(`/payroll/${id}/mark-paid/`);
      showNotification('Fiche marquée comme payée', 'success');
      fetchData();
    } catch (err) {
      showNotification('Erreur lors du marquage', 'error');
    }
  };

  const handleDelete = async () => {
    if (!payrollToDelete) return;
    try {
      await AxiosInstance.delete(`/payroll/${payrollToDelete.id}/`);
      showNotification('Fiche supprimée avec succès', 'success');
      fetchData();
      setShowDeleteModal(false);
      setPayrollToDelete(null);
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0,00';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  // Filtrage
  const filteredPayrolls = payrolls.filter(p => {
    const matchesSearch = !searchTerm || 
      (p.employee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.payroll_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || p.year === parseInt(filterYear);
    const matchesMonth = !filterMonth || p.month === parseInt(filterMonth);
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesYear && matchesMonth && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: filteredPayrolls.length,
    totalNet: filteredPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0),
    paid: filteredPayrolls.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.net_salary || 0), 0),
    pending: filteredPayrolls.filter(p => p.status !== 'paid' && p.status !== 'cancelled').length
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des fiches de paie...
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
            Fiches de paie
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gestion des fiches de paie ({filteredPayrolls.length} au total)
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
            onClick={() => navigate('/payroll/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle fiche</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total fiches</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Net total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{formatNumber(stats.totalNet)} €</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Payé</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{formatNumber(stats.paid)} €</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En attente</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.pending}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par employé, numéro de fiche..."
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
          </button>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-32 text-sm"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Années</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Mois</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterYear('');
                setFilterMonth('');
                setFilterStatus('');
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
                <th>N° Paie</th>
                <th>Employé</th>
                <th>Période</th>
                <th>Brut</th>
                <th>Net</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                    <p className="text-base-content/50">Aucune fiche de paie trouvée</p>
                   </td>
                 </tr>
              ) : (
                paginatedPayrolls.map((payroll) => {
                  const status = statusConfig[payroll.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  const monthLabel = months.find(m => m.value === payroll.month)?.label || '';
                  
                  return (
                    <tr key={payroll.id} className="hover:bg-base-200 transition-colors">
                      <td>
                        <div className="badge bg-primary/10 text-primary font-mono">
                          {payroll.payroll_number}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">{payroll.employee_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-base-content/40" />
                          <span>{monthLabel} {payroll.year}</span>
                        </div>
                      </td>
                      <td className="font-medium">{formatNumber(payroll.gross_salary)} €</td>
                      <td>
                        <span className="font-bold text-primary">{formatNumber(payroll.net_salary)} €</span>
                      </td>
                      <td>
                        <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => navigate(`/payroll/${payroll.id}`)}
                            className="btn btn-ghost btn-xs"
                            title="Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/payroll/${payroll.id}/slip`)}
                            className="btn btn-ghost btn-xs text-primary"
                            title="Bulletin PDF"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          {payroll.status !== 'paid' && payroll.status !== 'cancelled' && (
                            <button
                              onClick={() => navigate(`/payroll/${payroll.id}/edit`)}
                              className="btn btn-ghost btn-xs"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {payroll.status === 'calculated' && (
                            <button
                              onClick={() => handleApprove(payroll.id)}
                              className="btn btn-ghost btn-xs text-warning"
                              title="Approuver"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {payroll.status === 'approved' && (
                            <button
                              onClick={() => handleMarkPaid(payroll.id)}
                              className="btn btn-ghost btn-xs text-success"
                              title="Marquer payé"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          {payroll.status !== 'paid' && payroll.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setPayrollToDelete(payroll);
                                setShowDeleteModal(true);
                              }}
                              className="btn btn-ghost btn-xs text-error"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
        {filteredPayrolls.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPayrolls.length)} sur {filteredPayrolls.length}
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

      {/* Modal Suppression */}
      {showDeleteModal && payrollToDelete && (
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
                Voulez-vous vraiment supprimer la fiche de paie ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{payrollToDelete.payroll_number}" - {payrollToDelete.employee_name}
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

export default Payroll;