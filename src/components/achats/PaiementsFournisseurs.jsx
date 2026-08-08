// src/components/achats/PaiementsFournisseurs.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Wallet,
  Landmark,
  Banknote,
  Phone,
  Mail,
  User
} from 'lucide-react';

const PaiementsFournisseurs = () => {
  const navigate = useNavigate();
  
  // États
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('payment_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    amount_today: 0,
    amount_week: 0,
    amount_month: 0,
    amount_total: 0,
    pending: 0,
    completed: 0,
    failed: 0
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
      pending: { label: 'En attente', class: 'badge-warning' },
      processing: { label: 'En cours', class: 'badge-info' },
      completed: { label: 'Terminé', class: 'badge-success' },
      failed: { label: 'Échoué', class: 'badge-error' },
      cancelled: { label: 'Annulé', class: 'badge-ghost' }
    };
    return badges[status] || { label: status, class: 'badge-ghost' };
  };

  const getMethodIcon = (method) => {
    const icons = {
      cash: Banknote,
      bank_transfer: Landmark,
      check: FileText,
      card: CreditCard,
      mobile_money: Wallet,
      other: CreditCard
    };
    return icons[method] || CreditCard;
  };

  // Charger les paiements
  const fetchPaiements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      // Charger les paiements
      const response = await AxiosInstance.get('/paiement-fournisseur/');
      const data = response.data || [];
      setPaiements(data);

      // Calculer les stats
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoStr = monthAgo.toISOString().split('T')[0];

      const completed = data.filter(p => p.status === 'completed');
      const totalAmount = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      const todayAmount = data
        .filter(p => p.payment_date === today && p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      const weekAmount = data
        .filter(p => p.payment_date >= weekAgoStr && p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      const monthAmount = data
        .filter(p => p.payment_date >= monthAgoStr && p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        total: data.length,
        amount_total: totalAmount,
        amount_today: todayAmount,
        amount_week: weekAmount,
        amount_month: monthAmount,
        pending: data.filter(p => p.status === 'pending').length,
        completed: data.filter(p => p.status === 'completed').length,
        failed: data.filter(p => p.status === 'failed' || p.status === 'cancelled').length
      });

    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  // Filtrage et tri
  const filteredAndSortedPaiements = paiements
    .filter(p => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;
      
      const paymentNumber = (p.payment_number || '').toLowerCase();
      const invoiceNumber = (p.invoice?.invoice_number || p.invoice_number || '').toLowerCase();
      const supplierName = (p.invoice?.supplier?.company_name || p.supplier_name || '').toLowerCase();
      const agenceName = (p.agence?.nom || '').toLowerCase();
      const method = (p.payment_method || '').toLowerCase();
      
      return paymentNumber.includes(search) || 
             invoiceNumber.includes(search) || 
             supplierName.includes(search) ||
             agenceName.includes(search) ||
             method.includes(search);
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'amount') {
        aVal = a.amount || 0;
        bVal = b.amount || 0;
      } else if (sortField === 'payment_date') {
        aVal = a.payment_date || '';
        bVal = b.payment_date || '';
      } else if (sortField === 'invoice_number') {
        aVal = a.invoice?.invoice_number || a.invoice_number || '';
        bVal = b.invoice?.invoice_number || b.invoice_number || '';
      } else if (sortField === 'supplier_name') {
        aVal = a.invoice?.supplier?.company_name || a.supplier_name || '';
        bVal = b.invoice?.supplier?.company_name || b.supplier_name || '';
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPaiements.length / itemsPerPage);
  const paginatedPaiements = filteredAndSortedPaiements.slice(
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
          <p className="text-base-content/60">Chargement des paiements...</p>
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
          <button onClick={fetchPaiements} className="btn btn-primary mt-4 gap-2">
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
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
            Paiements Fournisseurs
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {stats.total} paiement(s) au total · {formatCurrency(stats.amount_total)} versés
          </p>
        </div>
        <button 
          onClick={() => navigate('/paiement-fournisseur/nouveau')}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau paiement
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Total paiements</div>
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
              <div className="stat-title text-xs font-medium text-base-content/60">Terminés</div>
              <div className="stat-value text-xl font-bold text-success">{stats.completed}</div>
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
              <div className="stat-value text-xl font-bold text-warning">{stats.pending}</div>
            </div>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Échoués/Annulés</div>
              <div className="stat-value text-xl font-bold text-error">{stats.failed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes montants */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Aujourd'hui</span>
            <DollarSign className="w-4 h-4 text-success" />
          </div>
          <div className="text-lg font-bold text-success mt-1 truncate">
            {formatCurrency(stats.amount_today)}
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Cette semaine</span>
            <Calendar className="w-4 h-4 text-info" />
          </div>
          <div className="text-lg font-bold text-info mt-1 truncate">
            {formatCurrency(stats.amount_week)}
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-base-content/60">Ce mois</span>
            <Calendar className="w-4 h-4 text-warning" />
          </div>
          <div className="text-lg font-bold text-warning mt-1 truncate">
            {formatCurrency(stats.amount_month)}
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
              placeholder="Rechercher par numéro, facture, fournisseur, agence ou méthode..."
              className="input input-bordered w-full pl-9 pr-4 py-2 focus:input-primary transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={fetchPaiements}
            className="btn btn-ghost gap-2"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        {filteredAndSortedPaiements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-base-content/30" />
            </div>
            <p className="text-lg font-semibold text-base-content/50">
              {searchTerm ? 'Aucun résultat' : 'Aucun paiement enregistré'}
            </p>
            <p className="text-sm text-base-content/40 mt-2">
              {searchTerm 
                ? 'Aucun paiement ne correspond à vos critères de recherche'
                : 'Commencez par créer un nouveau paiement'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => navigate('/paiement-fournisseur/nouveau')}
                className="btn btn-primary mt-4 gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouveau paiement
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
                      onClick={() => handleSort('payment_number')}
                    >
                      <div className="flex items-center gap-1">
                        N° Paiement
                        {sortField === 'payment_number' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('invoice_number')}
                    >
                      <div className="flex items-center gap-1">
                        Facture
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
                    <th>Méthode</th>
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('payment_date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortField === 'payment_date' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-right cursor-pointer hover:text-base-content transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Montant
                        {sortField === 'amount' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="text-center">Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPaiements.map((p) => {
                    const MethodIcon = getMethodIcon(p.payment_method);
                    const status = getStatusBadge(p.status);
                    
                    return (
                      <tr key={p.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                        <td className="font-mono text-sm font-medium">
                          {p.payment_number}
                        </td>
                        <td>
                          <span className="font-medium">
                            {p.invoice?.invoice_number || p.invoice_number}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-base-content/40" />
                            <span className="truncate max-w-[150px]">
                              {p.invoice?.supplier?.company_name || p.supplier_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <MethodIcon className="w-3 h-3 text-primary" />
                            <span className="text-xs capitalize">
                              {p.payment_method?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="text-sm">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="text-right font-bold text-success">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${status.class} badge-sm`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => navigate(`/paiement-fournisseur/${p.id}`)} 
                            className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedPaiements.length > 0 && (
              <div className="p-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-base-100">
                <span className="text-sm text-base-content/60">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedPaiements.length)} sur {filteredAndSortedPaiements.length}
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

export default PaiementsFournisseurs;