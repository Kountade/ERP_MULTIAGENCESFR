// src/components/achats/FacturesFournisseurs.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  User,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';

const FacturesFournisseurs = () => {
  const navigate = useNavigate();
  
  // États
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('invoice_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    total_amount: 0,
    paid_amount: 0,
    pending_amount: 0,
    overdue_count: 0,
    paid_count: 0,
    pending_count: 0,
    partial_count: 0
  });

  // Formatage
  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Brouillon', class: 'badge-ghost', icon: FileText },
      pending: { label: 'En attente', class: 'badge-warning', icon: Clock },
      partial: { label: 'Partielle', class: 'badge-info', icon: TrendingUp },
      paid: { label: 'Payée', class: 'badge-success', icon: CheckCircle },
      overdue: { label: 'En retard', class: 'badge-error', icon: AlertTriangle },
      cancelled: { label: 'Annulée', class: 'badge-ghost', icon: AlertCircle }
    };
    return badges[status] || { label: status, class: 'badge-ghost', icon: FileText };
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'partial', label: 'Partiellement payée' },
    { value: 'paid', label: 'Payée' },
    { value: 'overdue', label: 'En retard' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'draft', label: 'Brouillon' }
  ];

  // Charger les factures
  const fetchFactures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      const response = await AxiosInstance.get('/factures-fournisseur/');
      const data = response.data || [];
      setFactures(data);

      // Calculer les statistiques
      const totalAmount = data.reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);
      const paidAmount = data.reduce((sum, f) => sum + (parseFloat(f.amount_paid) || 0), 0);
      const pendingAmount = data
        .filter(f => f.status === 'pending' || f.status === 'partial')
        .reduce((sum, f) => sum + (parseFloat(f.amount_remaining) || 0), 0);

      setStats({
        total: data.length,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        overdue_count: data.filter(f => f.status === 'overdue').length,
        paid_count: data.filter(f => f.status === 'paid').length,
        pending_count: data.filter(f => f.status === 'pending' || f.status === 'partial').length,
        partial_count: data.filter(f => f.status === 'partial').length
      });

    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  // Filtrage, recherche et tri
  const filteredAndSortedFactures = factures
    .filter(f => {
      // Filtre par statut
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      
      // Recherche
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;
      
      const invoiceNumber = (f.invoice_number || '').toLowerCase();
      const supplierName = (f.supplier_name || f.supplier?.company_name || '').toLowerCase();
      const agenceName = (f.agence?.nom || '').toLowerCase();
      
      return invoiceNumber.includes(search) || 
             supplierName.includes(search) ||
             agenceName.includes(search);
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'total' || sortField === 'amount_paid' || sortField === 'amount_remaining') {
        aVal = parseFloat(a[sortField]) || 0;
        bVal = parseFloat(b[sortField]) || 0;
      } else if (sortField === 'invoice_date' || sortField === 'due_date') {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
      } else if (sortField === 'supplier_name') {
        aVal = a.supplier_name || a.supplier?.company_name || '';
        bVal = b.supplier_name || b.supplier?.company_name || '';
      } else if (sortField === 'invoice_number') {
        aVal = a.invoice_number || '';
        bVal = b.invoice_number || '';
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFactures.length / itemsPerPage);
  const paginatedFactures = filteredAndSortedFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gérer le tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-xl font-bold text-error">Erreur</h2>
          <p className="text-base-content/60 mt-2 max-w-md">{error}</p>
          <button onClick={fetchFactures} className="btn btn-primary mt-4 gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-base-200 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8" />
            Factures Fournisseurs
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {stats.total} facture(s) · {formatCurrency(stats.total_amount)} au total
          </p>
        </div>
        <button 
          onClick={() => navigate('/factures-fournisseur/nouveau')}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Total factures</div>
              <div className="stat-value text-xl font-bold">{stats.total}</div>
            </div>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Payées</div>
              <div className="stat-value text-xl font-bold text-success">{stats.paid_count}</div>
            </div>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">En attente</div>
              <div className="stat-value text-xl font-bold text-warning">{stats.pending_count}</div>
            </div>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">En retard</div>
              <div className="stat-value text-xl font-bold text-error">{stats.overdue_count}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes montants */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Total général</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-lg font-bold text-primary mt-1 truncate">
            {formatCurrency(stats.total_amount)}
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Montant payé</span>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <div className="text-lg font-bold text-success mt-1 truncate">
            {formatCurrency(stats.paid_amount)}
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Reste à payer</span>
            <TrendingDown className="w-4 h-4 text-warning" />
          </div>
          <div className="text-lg font-bold text-warning mt-1 truncate">
            {formatCurrency(stats.pending_amount)}
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par numéro, fournisseur ou agence..."
              className="input input-bordered w-full pl-9 pr-4 py-2 focus:input-primary transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <select
                className="select select-bordered pl-9 pr-8 py-2 focus:select-primary transition-all"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchFactures}
              className="btn btn-ghost gap-2"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        {filteredAndSortedFactures.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-10 h-10 text-base-content/30" />
            </div>
            <p className="text-lg font-semibold text-base-content/50">
              {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucune facture enregistrée'}
            </p>
            <p className="text-sm text-base-content/40 mt-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucune facture ne correspond à vos critères'
                : 'Commencez par créer une nouvelle facture'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => navigate('/factures-fournisseur/nouveau')}
                className="btn btn-primary mt-4 gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle facture
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-xs uppercase text-base-content/60 border-b border-base-200">
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('invoice_number')}
                    >
                      <div className="flex items-center gap-1">
                        N° Facture
                        {sortField === 'invoice_number' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('supplier_name')}
                    >
                      <div className="flex items-center gap-1">
                        Fournisseur
                        {sortField === 'supplier_name' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th>Agence</th>
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('invoice_date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === 'invoice_date' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-right cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Total
                        {sortField === 'total' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-right cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('amount_paid')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Payé
                        {sortField === 'amount_paid' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-right cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('amount_remaining')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Reste
                        {sortField === 'amount_remaining' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="text-center">Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFactures.map((f) => {
                    const status = getStatusBadge(f.status);
                    const StatusIcon = status.icon;
                    const progress = f.total > 0 ? (f.amount_paid / f.total) * 100 : 0;
                    
                    return (
                      <tr key={f.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                        <td className="font-mono text-sm font-medium">
                          {f.invoice_number}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-base-content/40" />
                            <span className="truncate max-w-[150px]">
                              {f.supplier_name || f.supplier?.company_name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-base-content/40" />
                            <span className="text-sm">
                              {f.agence?.nom || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="text-sm">
                          {formatDate(f.invoice_date)}
                        </td>
                        <td className="text-right font-bold text-primary">
                          {formatCurrency(f.total)}
                        </td>
                        <td className="text-right text-success">
                          {formatCurrency(f.amount_paid)}
                        </td>
                        <td className="text-right text-error">
                          {formatCurrency(f.amount_remaining)}
                        </td>
                        <td className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`badge ${status.class} badge-sm flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {f.status !== 'paid' && f.status !== 'cancelled' && (
                              <div className="w-full max-w-[60px]">
                                <div className="w-full bg-base-200 rounded-full h-1">
                                  <div 
                                    className="bg-success h-1 rounded-full transition-all"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => navigate(`/factures-fournisseur/${f.id}`)} 
                            className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {f.status === 'pending' && (
                            <button 
                              onClick={() => navigate(`/paiement-fournisseur/nouveau?facture=${f.id}`)}
                              className="btn btn-success btn-sm btn-square hover:bg-success/20 transition-colors ml-1"
                              title="Effectuer un paiement"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-base-200 font-bold bg-base-100">
                  <tr>
                    <td colSpan="4" className="text-right text-base-content/60">
                      Total général
                    </td>
                    <td className="text-right text-primary">
                      {formatCurrency(filteredAndSortedFactures.reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0))}
                    </td>
                    <td className="text-right text-success">
                      {formatCurrency(filteredAndSortedFactures.reduce((sum, f) => sum + (parseFloat(f.amount_paid) || 0), 0))}
                    </td>
                    <td className="text-right text-error">
                      {formatCurrency(filteredAndSortedFactures.reduce((sum, f) => sum + (parseFloat(f.amount_remaining) || 0), 0))}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedFactures.length > 0 && (
              <div className="p-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-base-100">
                <span className="text-sm text-base-content/60">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedFactures.length)} sur {filteredAndSortedFactures.length}
                </span>
                <div className="flex items-center gap-2">
                  <select 
                    className="select select-bordered select-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <div className="join">
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="join-item btn btn-sm btn-disabled">
                      {currentPage} / {totalPages}
                    </span>
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FacturesFournisseurs;