// src/components/expenses/ExpenseList.jsx - Version avec téléchargement PDF

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { pdf } from '@react-pdf/renderer';
import ExpensePDF from './ExpensePDF';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Trash2,
  Download,
  Wallet,
  RefreshCw,
  AlertCircle,
  Calendar,
  DollarSign,
  Tag,
  Filter,
  ChevronDown,
  ChevronUp,
  Receipt,
  Car,
  Utensils,
  Hotel,
  Briefcase,
  Users,
  MoreHorizontal,
  X,
  ArrowUpDown,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  File,
  Printer
} from 'lucide-react';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [pdfLoading, setPdfLoading] = useState({});

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('User') || '{}');
      setUserRole(userData);
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
      setUserRole(null);
    }
  }, []);

  // Charger les données
  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = '/expenses/';
      
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await AxiosInstance.get(url);
      setExpenses(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement des notes', 'error');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => { 
    setNotification({ show: true, message, type }); 
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000); 
  };

  // Formatage GNF
  const formatGNF = (amount) => {
    if (!amount) return '0 GNF';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 GNF';
    return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF`;
  };

  // Statut badges
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: Clock, label: 'En attente RH' },
      approved: { class: 'badge-info', icon: CheckCircle, label: 'Validé' },
      paid: { class: 'badge-success', icon: Wallet, label: 'Payé' },
      rejected: { class: 'badge-error', icon: XCircle, label: 'Rejeté' },
      cancelled: { class: 'badge-ghost', icon: XCircle, label: 'Annulé' }
    };
    return badges[status] || badges.pending;
  };

  // Types de frais avec icônes
  const getTypeConfig = (type) => {
    const configs = {
      transport: { icon: Car, label: 'Transport', color: 'text-blue-500' },
      meal: { icon: Utensils, label: 'Repas', color: 'text-orange-500' },
      accommodation: { icon: Hotel, label: 'Hébergement', color: 'text-purple-500' },
      supplies: { icon: Briefcase, label: 'Fournitures', color: 'text-green-500' },
      client: { icon: Users, label: 'Client', color: 'text-pink-500' },
      other: { icon: MoreHorizontal, label: 'Autre', color: 'text-gray-500' }
    };
    return configs[type] || configs.other;
  };

  // Filtrer et trier les notes
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];
    
    if (searchTerm) {
      result = result.filter(expense => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (expense.description?.toLowerCase() || '').includes(searchLower) ||
          (expense.expense_type_display?.toLowerCase() || '').includes(searchLower) ||
          (expense.employee_name?.toLowerCase() || '').includes(searchLower)
        );
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'amount') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [expenses, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedExpenses.length / itemsPerPage));
  const paginatedExpenses = filteredAndSortedExpenses.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Vérifier les permissions
  const canValidate = () => {
    return userRole?.role_global === 'pdg' || userRole?.role_global === 'drh';
  };

  const canPay = () => {
    return userRole?.role_global === 'pdg' || 
           userRole?.role_global === 'drh' || 
           userRole?.roles_agence?.some(r => r.role === 'comptable');
  };

  // Actions
  const handleValidate = async (id) => {
    try {
      await AxiosInstance.post(`/expenses/${id}/validate/`, {
        comments: 'Validé par RH'
      });
      showNotification('Note validée avec succès', 'success');
      await fetchExpenses();
    } catch (error) {
      console.error('Erreur validation:', error);
      showNotification(error.response?.data?.error || 'Erreur lors de la validation', 'error');
    }
  };

  const handlePay = async (id) => {
    const reference = prompt('Référence de paiement:');
    if (reference) {
      try {
        await AxiosInstance.post(`/expenses/${id}/pay/`, { 
          payment_reference: reference 
        });
        showNotification('Paiement effectué avec succès', 'success');
        await fetchExpenses();
      } catch (error) {
        console.error('Erreur paiement:', error);
        showNotification(error.response?.data?.error || 'Erreur lors du paiement', 'error');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Motif du rejet:');
    if (reason) {
      try {
        await AxiosInstance.post(`/expenses/${id}/reject/`, { 
          reason: reason 
        });
        showNotification('Note rejetée', 'success');
        await fetchExpenses();
      } catch (error) {
        console.error('Erreur rejet:', error);
        showNotification(error.response?.data?.error || 'Erreur lors du rejet', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await AxiosInstance.delete(`/expenses/${expenseToDelete.id}/`);
      showNotification('Note supprimée avec succès', 'success');
      await fetchExpenses();
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Téléchargement PDF optimisé
  const handlePDFDownload = async (expense) => {
    setPdfLoading(prev => ({ ...prev, [expense.id]: true }));
    try {
      // Récupérer les données complètes
      const response = await AxiosInstance.get(`/expenses/${expense.id}/`);
      const expenseData = response.data;
      
      // Générer le PDF
      const blob = await pdf(<ExpensePDF expense={expenseData} />).toBlob();
      
      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `note_frais_${expense.id}_${(expense.employee_name || 'employe').replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      showNotification('Erreur lors du téléchargement du PDF', 'error');
    } finally {
      setPdfLoading(prev => ({ ...prev, [expense.id]: false }));
    }
  };

  // En-tête de colonne triable
  const SortableHeader = ({ field, label, className = '' }) => (
    <th 
      className={`cursor-pointer hover:bg-base-200 transition-colors whitespace-nowrap ${className}`}
      onClick={() => {
        if (sortField === field) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortField(field);
          setSortDirection('asc');
        }
        setCurrentPage(1);
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-3 h-3" /> : 
            <ChevronDown className="w-3 h-3" />
        )}
        {sortField !== field && <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-base-content/70 font-medium">Chargement des notes de frais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8" />
            Notes de frais
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Gérez vos demandes de remboursement
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchExpenses}
            className="btn btn-outline gap-2 btn-sm sm:btn-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={() => navigate('/expenses/new')}
            className="btn btn-primary gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all btn-sm sm:btn-md"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle note</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par description, type ou employé..."
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
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
            className="btn btn-ghost gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-base-200 rounded-xl">
            {['all', 'pending', 'approved', 'paid', 'rejected', 'cancelled'].map((status) => {
              const statusInfo = getStatusBadge(status);
              const Icon = statusInfo.icon;
              return (
                <button
                  key={status}
                  className={`btn btn-sm gap-1 ${filter === status ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {status === 'all' ? 'Tous' : statusInfo.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tableau - Pleine largeur */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="table table-zebra table-sm w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th className="w-[10%]">Type</th>
                <SortableHeader field="description" label="Description" className="w-[20%]" />
                <SortableHeader field="amount" label="Montant" className="w-[15%]" />
                <SortableHeader field="date" label="Date" className="w-[12%]" />
                <th className="w-[15%]">Statut</th>
                <th className="w-[28%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Receipt className="w-16 h-16 text-base-content/20" />
                      <p className="mt-2 text-base-content/60 font-medium">
                        Aucune note de frais trouvée
                      </p>
                      <p className="text-sm text-base-content/40">
                        Essayez de modifier vos filtres ou créez une nouvelle note
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => {
                  const statusInfo = getStatusBadge(expense.status);
                  const StatusIcon = statusInfo.icon;
                  const typeConfig = getTypeConfig(expense.expense_type);
                  const TypeIcon = typeConfig.icon;
                  const isPdfLoading = pdfLoading[expense.id];
                  
                  return (
                    <tr key={expense.id} className="hover:bg-base-200/50 transition-colors group">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${typeConfig.color} bg-opacity-10 flex-shrink-0`}>
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                          </div>
                          <span className="text-xs font-medium hidden sm:inline">{typeConfig.label}</span>
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[180px]">
                          <p className="font-medium truncate" title={expense.description}>
                            {expense.description || 'Sans description'}
                          </p>
                          {expense.employee_name && (
                            <p className="text-xs text-base-content/40 flex items-center gap-1">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{expense.employee_name}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="font-bold text-primary whitespace-nowrap">
                        {formatGNF(expense.amount)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <Calendar className="w-3 h-3 text-base-content/40 flex-shrink-0" />
                          {expense.date}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.class} border-0 px-3 py-2 gap-1 whitespace-nowrap`}>
                          <StatusIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="text-xs hidden sm:inline">{statusInfo.label}</span>
                          <span className="text-xs sm:hidden">
                            {statusInfo.label.split(' ')[0]}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button
                            className="btn btn-ghost btn-xs tooltip"
                            data-tip="Voir détails"
                            onClick={() => navigate(`/expenses/${expense.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* PDF Download */}
                          <button
                            className="btn btn-ghost btn-xs tooltip"
                            data-tip="Télécharger PDF"
                            onClick={() => handlePDFDownload(expense)}
                            disabled={isPdfLoading}
                          >
                            {isPdfLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <File className="w-4 h-4" />
                            )}
                          </button>
                          
                          {expense.receipt && (
                            <a
                              href={expense.receipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="Télécharger le reçu"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          
                          {/* Validation RH */}
                          {expense.status === 'pending' && canValidate() && (
                            <>
                              <button
                                className="btn btn-success btn-xs tooltip"
                                data-tip="Valider"
                                onClick={() => handleValidate(expense.id)}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                className="btn btn-error btn-xs tooltip"
                                data-tip="Rejeter"
                                onClick={() => handleReject(expense.id)}
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          
                          {/* Paiement comptable */}
                          {expense.status === 'approved' && canPay() && (
                            <button
                              className="btn btn-info btn-xs tooltip"
                              data-tip="Approuver paiement"
                              onClick={() => handlePay(expense.id)}
                            >
                              <Wallet className="w-3 h-3" />
                            </button>
                          )}
                          
                          {/* Annulation */}
                          {expense.status === 'pending' && (
                            <button
                              className="btn btn-ghost btn-xs text-error hover:bg-error/10 tooltip"
                              data-tip="Annuler"
                              onClick={() => {
                                setExpenseToDelete(expense);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
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
        {filteredAndSortedExpenses.length > 0 && (
          <div className="p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedExpenses.length)} sur {filteredAndSortedExpenses.length}
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <select 
                  className="select select-bordered select-sm"
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
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
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
          <div className="modal-box w-11/12 max-w-md p-6">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20 flex items-center justify-center">
                  <Trash2 className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer cette note de frais ?
              </p>
              <div className="mt-2 p-2 bg-base-200 rounded-lg">
                <p className="text-base font-semibold text-error">
                  {expenseToDelete.description || 'Sans description'}
                </p>
                <p className="text-sm text-base-content/60 mt-1">
                  {formatGNF(expenseToDelete.amount)} - {expenseToDelete.date}
                </p>
              </div>
              <p className="text-xs text-base-content/50 mt-2">
                Cette action est irréversible
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

export default ExpenseList;