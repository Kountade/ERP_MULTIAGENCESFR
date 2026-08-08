// src/components/drh/ExpenseClaims.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  Receipt, 
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
  DollarSign, 
  Calendar, 
  User,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Printer
} from 'lucide-react';

const ExpenseClaims = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusConfig = {
    pending: { label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning', borderColor: 'border-warning/30' },
    approved: { label: 'Approuvé', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success', borderColor: 'border-success/30' },
    rejected: { label: 'Rejeté', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error', borderColor: 'border-error/30' },
    paid: { label: 'Remboursé', icon: DollarSign, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info', borderColor: 'border-info/30' }
  };

  const expenseTypes = {
    transport: { label: 'Transport', icon: TrendingUp, color: 'primary' },
    meal: { label: 'Repas', icon: TrendingUp, color: 'secondary' },
    accommodation: { label: 'Hébergement', icon: TrendingUp, color: 'info' },
    supplies: { label: 'Fournitures', icon: TrendingUp, color: 'warning' },
    client: { label: 'Client', icon: TrendingUp, color: 'success' },
    other: { label: 'Autre', icon: FileText, color: 'neutral' }
  };

  const showNotification = (message, type) => { 
    setNotification({ show: true, message, type }); 
    setTimeout(() => setNotification({ ...notification, show: false }), 4000); 
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/expenses/'),
      AxiosInstance.get('/employees/')
    ])
      .then(([expRes, empRes]) => { 
        setExpenses(expRes.data || []); 
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

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try { 
      await AxiosInstance.delete(`/expenses/${expenseToDelete.id}/`); 
      showNotification('Note de frais supprimée avec succès', 'success'); 
      fetchData(); 
      setShowDeleteModal(false); 
      setExpenseToDelete(null);
    } catch (err) { 
      showNotification('Erreur lors de la suppression', 'error'); 
    }
  };

  const handleApprove = async (id) => { 
    try { 
      await AxiosInstance.post(`/expenses/${id}/approve/`); 
      showNotification('Note de frais approuvée', 'success'); 
      fetchData(); 
    } catch(err) { 
      showNotification('Erreur lors de l\'approbation', 'error'); 
    } 
  };

  const handleReject = async (id) => { 
    try { 
      await AxiosInstance.post(`/expenses/${id}/reject/`, { reason: 'Non conforme' }); 
      showNotification('Note de frais rejetée', 'success'); 
      fetchData(); 
    } catch(err) { 
      showNotification('Erreur lors du rejet', 'error'); 
    } 
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = !searchTerm || 
      (exp.employee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (exp.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || exp.status === filterStatus;
    const matchesType = !filterType || exp.expense_type === filterType;
    const matchesDateStart = !dateRange.start || new Date(exp.date) >= new Date(dateRange.start);
    const matchesDateEnd = !dateRange.end || new Date(exp.date) <= new Date(dateRange.end);
    return matchesSearch && matchesStatus && matchesType && matchesDateStart && matchesDateEnd;
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = { 
    total: expenses.length, 
    pending: expenses.filter(e => e.status === 'pending').length, 
    approved: expenses.filter(e => e.status === 'approved').length, 
    rejected: expenses.filter(e => e.status === 'rejected').length,
    paid: expenses.filter(e => e.status === 'paid').length,
    totalAmount: expenses.reduce((a, b) => a + (b.amount || 0), 0),
    monthlyAverage: expenses.length > 0 ? (expenses.reduce((a, b) => a + (b.amount || 0), 0) / expenses.length).toFixed(0) : 0
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.textColor}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des notes de frais...
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
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedExpense && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl p-0 overflow-hidden">
            <div className={`p-4 ${statusConfig[selectedExpense.status]?.bgColor} border-b`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Receipt className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold">Détail de la note de frais</h3>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="btn btn-sm btn-ghost btn-circle">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Employé</label>
                  <p className="text-base font-semibold flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-primary" />
                    {selectedExpense.employee_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(selectedExpense.date)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
                  <p className="text-base flex items-center gap-2 mt-1">
                    <FileText className="w-4 h-4 text-primary" />
                    {expenseTypes[selectedExpense.expense_type]?.label || selectedExpense.expense_type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</label>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedExpense.description || 'Non renseignée'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedExpense.status)}
                    <span className={`badge ${statusConfig[selectedExpense.status]?.bgColor} ${statusConfig[selectedExpense.status]?.textColor}`}>
                      {statusConfig[selectedExpense.status]?.label}
                    </span>
                  </div>
                </div>
                {selectedExpense.rejection_reason && (
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Motif du rejet</label>
                    <p className="text-sm text-error bg-error/10 p-2 rounded-lg mt-1">{selectedExpense.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-action p-4 bg-gray-50">
              <button onClick={() => setShowDetailModal(false)} className="btn btn-ghost">Fermer</button>
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
                <Receipt className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">Notes de frais</h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              Gérez les dépenses professionnelles – {stats.total} note(s) enregistrée(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={fetchData}
              className="btn btn-sm sm:btn-md btn-outline gap-2 hover:bg-primary/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button 
              onClick={() => navigate('/expenses/new')}
              className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-none shadow-lg hover:shadow-xl transition-all gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle note
            </button>
          </div>
        </div>
      </div>

      {/* Cartes statistiques élégantes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">En attente</p>
                <p className="text-xl sm:text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Approuvées</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Remboursées</p>
                <p className="text-xl sm:text-2xl font-bold text-info">{stats.paid}</p>
              </div>
              <DollarSign className="w-8 h-8 text-info/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Montant total</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Moyenne</p>
                <p className="text-lg sm:text-xl font-bold text-secondary">{formatCurrency(stats.monthlyAverage)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-secondary/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par employé ou description..."
              className="input input-bordered w-full pl-9 py-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm sm:hidden gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          
          <div className={`${showFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3`}>
            <select 
              className="select select-bordered w-full focus:border-primary"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full focus:border-primary"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tous les types</option>
              {Object.entries(expenseTypes).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <input
              type="date"
              placeholder="Date début"
              className="input input-bordered w-full focus:border-primary"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            
            <input
              type="date"
              placeholder="Date fin"
              className="input input-bordered w-full focus:border-primary"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
            
            <button 
              className="btn btn-outline gap-2 hover:bg-primary/10 transition-all"
              onClick={() => {
                setFilterStatus('');
                setFilterType('');
                setSearchTerm('');
                setDateRange({ start: '', end: '' });
                setCurrentPage(1);
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
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
                <th className="py-4 font-semibold">Employé</th>
                <th className="py-4 font-semibold">Date</th>
                <th className="py-4 font-semibold">Type</th>
                <th className="py-4 font-semibold hidden md:table-cell">Description</th>
                <th className="py-4 font-semibold text-right">Montant</th>
                <th className="py-4 font-semibold text-center">Statut</th>
                <th className="py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <Receipt className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-base-content/50 font-medium">Aucune note de frais trouvée</p>
                      <button 
                        onClick={() => navigate('/expenses/new')}
                        className="btn btn-primary btn-sm gap-2 mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une note
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => {
                  const status = statusConfig[expense.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const typeInfo = expenseTypes[expense.expense_type] || expenseTypes.other;
                  return (
                    <tr key={expense.id} className="hover:bg-base-200 transition-colors group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-base-content">{expense.employee_name}</p>
                            <p className="text-xs text-base-content/50">{expense.employee_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{formatDate(expense.date)}</td>
                      <td>
                        <span className="badge bg-primary/10 text-primary gap-1">
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="hidden md:table-cell max-w-xs">
                        <p className="text-sm text-base-content/70 truncate">{expense.description || '-'}</p>
                      </td>
                      <td className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(expense.amount)}</p>
                      </td>
                      <td className="text-center">
                        <div className={`badge ${status.bgColor} ${status.textColor} gap-1 px-3 py-3`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedExpense(expense); setShowDetailModal(true); }}
                            className="btn btn-ghost btn-sm btn-circle"
                            title="Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {expense.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(expense.id)}
                                className="btn btn-ghost btn-sm btn-circle text-success hover:bg-success/10"
                                title="Approuver"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(expense.id)}
                                className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                                title="Rejeter"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                            className="btn btn-ghost btn-sm btn-circle text-primary hover:bg-primary/10"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setExpenseToDelete(expense); setShowDeleteModal(true); }}
                            className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
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

        {/* Pagination élégante */}
        {filteredExpenses.length > 0 && (
          <div className="px-6 py-4 border-t border-base-200 bg-base-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de <span className="font-semibold text-primary">{((currentPage - 1) * itemsPerPage) + 1}</span> à{" "}
                <span className="font-semibold text-primary">{Math.min(currentPage * itemsPerPage, filteredExpenses.length)}</span> sur{" "}
                <span className="font-semibold">{filteredExpenses.length}</span> notes
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  className="select select-bordered select-sm"
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                >
                  <option value="5">5 lignes</option>
                  <option value="10">10 lignes</option>
                  <option value="15">15 lignes</option>
                  <option value="20">20 lignes</option>
                </select>
                
                <div className="join">
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary text-white' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && expenseToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">
            <div className="bg-error/10 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold text-error">Confirmer la suppression</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70">
                Voulez-vous vraiment supprimer cette note de frais ?
              </p>
              <p className="font-semibold text-error mt-2">
                {expenseToDelete.description || expenseToDelete.employee_name}
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1 gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseClaims;