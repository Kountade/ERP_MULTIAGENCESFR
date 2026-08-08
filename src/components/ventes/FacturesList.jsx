// src/components/sales/FacturesList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import FacturePDF from './FacturePDF';
import {
  FileText, Eye, CheckCircle, XCircle, Clock, Search,
  RefreshCw, Filter, Calendar, AlertCircle, DollarSign,
  ChevronLeft, ChevronRight, Plus, AlertTriangle,
  ArrowUpDown, ChevronUp, ChevronDown, Trash2, Receipt, Printer, TrendingUp, TrendingDown
} from 'lucide-react';

const FacturesList = () => {
  const navigate = useNavigate();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [sortField, setSortField] = useState('date_facture');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    payee: 0,
    partiellement_payee: 0,
    en_retard: 0,
    totalMontant: 0,
    totalPaye: 0,
    totalRestant: 0
  });

  const statutConfig = {
    draft: { label: 'Brouillon', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    sent: { label: 'Envoyée', icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    paid: { label: 'Payée', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' },
    partially_paid: { label: 'Partiellement payée', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100' },
    overdue: { label: 'En retard', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' }
  };

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/factures/');
      const data = response.data;
      setFactures(data);
      
      const totalMontant = data.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
      const totalPaye = data.reduce((sum, f) => sum + (f.montant_paye || 0), 0);
      const totalRestant = data.reduce((sum, f) => sum + (f.montant_restant || 0), 0);
      const payee = data.filter(f => f.status === 'paid').length;
      const partiellement_payee = data.filter(f => f.status === 'partially_paid').length;
      const en_retard = data.filter(f => f.status === 'overdue').length;
      
      setStats({
        total: data.length,
        payee,
        partiellement_payee,
        en_retard,
        totalMontant,
        totalPaye,
        totalRestant
      });
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement des factures', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleGeneratePDF = async (facture, e) => {
    e.stopPropagation();
    setGeneratingPDF(true);
    try {
      await FacturePDF(facture);
      showNotification('PDF généré avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDeleteFacture = async () => {
    if (!factureToDelete) return;
    try {
      await AxiosInstance.delete(`/factures/${factureToDelete.id}/`);
      showNotification(`Facture supprimée avec succès`, 'success');
      fetchFactures();
      setShowDeleteModal(false);
      setFactureToDelete(null);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const getPaymentProgress = (facture) => {
    const total = facture.total_ttc || 0;
    const paye = facture.montant_paye || 0;
    if (total === 0) return 0;
    return (paye / total) * 100;
  };

  const filteredAndSortedFactures = useMemo(() => {
    let filtered = factures.filter(facture => {
      const search = searchTerm.toLowerCase();
      const reference = (facture.reference || '').toLowerCase();
      const clientNom = (facture.client_nom || '').toLowerCase();
      const matchesSearch = reference.includes(search) || clientNom.includes(search);
      const matchesStatut = !filterStatut || facture.status === filterStatut;
      const matchesType = !filterType || facture.type_facture === filterType;
      const matchesDateStart = !dateRange.start || new Date(facture.date_facture) >= new Date(dateRange.start);
      const matchesDateEnd = !dateRange.end || new Date(facture.date_facture) <= new Date(dateRange.end);
      return matchesSearch && matchesStatut && matchesType && matchesDateStart && matchesDateEnd;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'total_ttc') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortField === 'montant_paye') {
        aVal = parseFloat(a.montant_paye) || 0;
        bVal = parseFloat(b.montant_paye) || 0;
      } else if (sortField === 'montant_restant') {
        aVal = parseFloat(a.montant_restant) || 0;
        bVal = parseFloat(b.montant_restant) || 0;
      } else if (sortField === 'payment_percent') {
        aVal = getPaymentProgress(a);
        bVal = getPaymentProgress(b);
      } else if (sortField === 'date_facture' || sortField === 'date_echeance') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [factures, searchTerm, filterStatut, filterType, dateRange, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedFactures.length / itemsPerPage);
  const paginatedFactures = filteredAndSortedFactures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (statut) => {
    const config = statutConfig[statut] || statutConfig.draft;
    const Icon = config.icon;
    return (
      <span className={`badge ${config.bgColor} ${config.color} gap-1 px-3 py-2`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  const PaymentProgressBar = ({ facture }) => {
    const total = facture.total_ttc || 0;
    const paye = facture.montant_paye || 0;
    const percent = total === 0 ? 0 : (paye / total) * 100;
    const reste = total - paye;
    if (total === 0) return null;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-success">Payé: {formatPrice(paye)}</span>
          <span className="text-error">Reste: {formatPrice(reste)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-success h-2 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-right text-xs font-semibold mt-1">
          {percent.toFixed(0)}%
        </div>
      </div>
    );
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && factureToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">
            <div className="bg-error/10 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold text-error">Confirmer la suppression</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70">Voulez-vous vraiment supprimer cette facture ?</p>
              <p className="font-semibold text-error mt-2">{factureToDelete.reference}</p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1 gap-2" onClick={handleDeleteFacture}><Trash2 className="w-4 h-4" /> Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><Receipt className="w-7 h-7 text-primary" /></div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary">Factures</h1>
            </div>
            <p className="text-sm text-gray-600 ml-1">Gérez vos factures – {stats.total} facture(s)</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={fetchFactures} className="btn btn-outline btn-sm gap-2"><RefreshCw className="w-4 h-4" /> Actualiser</button>
            <button onClick={() => navigate('/factures/nouveau')} className="btn btn-primary btn-sm gap-2"><Plus className="w-4 h-4" /> Nouvelle facture</button>
          </div>
        </div>
      </div>

      {/* Cartes statistiques améliorées */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Total factures</p><p className="text-xl font-bold text-primary">{stats.total}</p></div>
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Payées</p><p className="text-xl font-bold text-green-500">{stats.payee}</p></div>
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Part. payées</p><p className="text-xl font-bold text-orange-500">{stats.partiellement_payee}</p></div>
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Montant total</p><p className="text-lg font-bold text-primary">{formatPrice(stats.totalMontant)}</p></div>
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Total payé</p><p className="text-lg font-bold text-success">{formatPrice(stats.totalPaye)}</p></div>
        <div className="card bg-white shadow-md rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Reste à payer</p><p className="text-lg font-bold text-error">{formatPrice(stats.totalRestant)}</p></div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par référence ou client..." className="input input-bordered w-full pl-9" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="btn btn-outline btn-sm w-full sm:hidden gap-2">
          <Filter className="w-4 h-4" /> {showMobileFilters ? 'Masquer' : 'Afficher'} les filtres
        </button>
        <div className={`${showMobileFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3`}>
          <select className="select select-bordered" value={filterStatut} onChange={(e) => { setFilterStatut(e.target.value); setCurrentPage(1); }}>
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="partially_paid">Partiellement payée</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
          </select>
          <select className="select select-bordered" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
            <option value="">Tous les types</option>
            <option value="proforma">Proforma</option>
            <option value="finale">Finale</option>
            <option value="avoir">Avoir</option>
          </select>
          <input type="date" className="input input-bordered" placeholder="Date début" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
          <input type="date" className="input input-bordered" placeholder="Date fin" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
        </div>
      </div>

      {/* Tableau avec progression */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50">
                <th><button className="flex items-center gap-1" onClick={() => handleSort('reference')}>Référence<SortIcon field="reference" /></button></th>
                <th><button className="flex items-center gap-1" onClick={() => handleSort('client_nom')}>Client<SortIcon field="client_nom" /></button></th>
                <th><button className="flex items-center gap-1" onClick={() => handleSort('date_facture')}>Date<SortIcon field="date_facture" /></button></th>
                <th><button className="flex items-center gap-1" onClick={() => handleSort('date_echeance')}>Échéance<SortIcon field="date_echeance" /></button></th>
                <th><button className="flex items-center gap-1" onClick={() => handleSort('total_ttc')}>Montant<SortIcon field="total_ttc" /></button></th>
                <th><button className="flex items-center gap-1" onClick={() => handleSort('montant_paye')}>Payé / Reste<SortIcon field="montant_paye" /></button></th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFactures.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16"><Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" /><p>Aucune facture trouvée</p><button onClick={() => navigate('/factures/nouveau')} className="btn btn-primary btn-sm mt-4"><Plus className="w-4 h-4" /> Créer une facture</button></td></tr>
              ) : (
                paginatedFactures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/factures/${facture.id}`)}>
                    <td className="font-mono text-sm">{facture.reference}</td>
                    <td>{facture.client_nom || 'Anonyme'}</td>
                    <td className="text-sm">{formatDate(facture.date_facture)}</td>
                    <td className="text-sm">{formatDate(facture.date_echeance)}</td>
                    <td className="font-semibold text-primary">{formatPrice(facture.total_ttc)}</td>
                    <td className="min-w-[200px]">
                      <PaymentProgressBar facture={facture} />
                    </td>
                    <td>{getStatusBadge(facture.status)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          className="btn btn-ghost btn-xs btn-square text-info"
                          onClick={(e) => handleGeneratePDF(facture, e)}
                          disabled={generatingPDF}
                          title="Télécharger PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs btn-square"
                          onClick={(e) => { e.stopPropagation(); navigate(`/factures/${facture.id}`); }}
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredAndSortedFactures.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-center items-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /> Précédent</button>
            <div className="flex gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i);
              return <button key={pageNum} onClick={() => goToPage(pageNum)} className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary text-white' : 'btn-outline'}`}>{pageNum}</button>;
            })}</div>
            <button className="btn btn-outline btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Suivant <ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacturesList;
