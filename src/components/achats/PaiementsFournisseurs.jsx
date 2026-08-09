// src/components/achats/PaiementsFournisseurs.jsx

import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Wallet,
  Landmark,
  Banknote,
  User,
  Download,
  X,
  Filter,
  FileCheck,
  ListFilter,
  CalendarDays,
  CalendarRange,
  FileStack,
  FileSearch
} from 'lucide-react';

// Imports des composants PDF
const PaiementFournisseurRecu = lazy(() => import('./PaiementsFournisseurRecu'));
const PaiementsListePDF = lazy(() => import('./PaiementsListePDF'));

// Import dynamique de pdf
let pdfModule = null;

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
  const [pdfLoading, setPdfLoading] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [pdfReady, setPdfReady] = useState(false);
  
  // États pour les filtres
  const [filterType, setFilterType] = useState('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Charger les modules PDF
  useEffect(() => {
    const loadPDFModules = async () => {
      try {
        const renderer = await import('@react-pdf/renderer');
        pdfModule = renderer;
        setPdfReady(true);
        console.log('✅ Modules PDF chargés avec succès');
      } catch (error) {
        console.warn('⚠️ Modules PDF non disponibles:', error.message);
        setPdfReady(false);
      }
    };
    loadPDFModules();
  }, []);

  // Notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // Formatage
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA';
    try {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num) || num === 0) return '0 FCFA';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    } catch {
      return '0 FCFA';
    }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    return badges[status] || { label: status || 'Inconnu', class: 'badge-ghost' };
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

  const getMethodLabel = (method) => {
    const labels = {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque',
      card: 'Carte bancaire',
      mobile_money: 'Mobile Money',
      other: 'Autre'
    };
    return labels[method] || method || 'N/A';
  };

  // Extraire les factures uniques
  const extractInvoices = (paiementsData) => {
    const invoiceMap = new Map();
    paiementsData.forEach(p => {
      if (p.invoice && p.invoice.id) {
        const key = p.invoice.id;
        if (!invoiceMap.has(key)) {
          invoiceMap.set(key, {
            id: p.invoice.id,
            invoice_number: p.invoice.invoice_number,
            supplier: p.invoice.supplier?.company_name || p.supplier_name || 'N/A',
            total: p.invoice.total || 0,
            amount_paid: 0,
            payment_count: 0,
            due_date: p.invoice.due_date,
            status: p.invoice.status || 'pending'
          });
        }
        const inv = invoiceMap.get(key);
        inv.amount_paid += p.amount || 0;
        inv.payment_count += 1;
      }
    });
    return Array.from(invoiceMap.values());
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

      const response = await AxiosInstance.get('/paiement-fournisseur/');
      const data = response.data || [];
      setPaiements(data);

      const invoicesList = extractInvoices(data);
      setInvoices(invoicesList);

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

  // Charger les données de la facture
  const loadInvoiceData = async (invoiceId) => {
    if (!invoiceId) {
      setSelectedInvoiceData(null);
      return;
    }

    setLoadingInvoice(true);
    try {
      const response = await AxiosInstance.get(`/factures-fournisseur/${invoiceId}/`);
      setSelectedInvoiceData(response.data);
    } catch (error) {
      console.error('Erreur chargement facture:', error);
      showNotification('Erreur lors du chargement de la facture', 'error');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Gérer le changement de filtre
  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    
    if (type === 'invoice') {
      setShowFilterPanel(true);
    } else {
      setSelectedInvoiceId('');
      setSelectedInvoiceData(null);
      setShowFilterPanel(false);
      
      const labels = {
        'today': 'Paiements du jour',
        'month': 'Paiements du mois',
        'all': 'Tous les paiements'
      };
      showNotification(labels[type] || 'Filtre appliqué', 'info');
    }
  };

  // Gérer la sélection d'une facture
  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    setSelectedInvoiceId(invoiceId);
    setCurrentPage(1);
    if (invoiceId) {
      loadInvoiceData(invoiceId);
      const invoice = invoices.find(inv => inv.id === parseInt(invoiceId));
      showNotification(`Filtre: ${invoice?.invoice_number || invoiceId}`, 'info');
    } else {
      setSelectedInvoiceData(null);
      setFilterType('all');
      showNotification('Tous les paiements', 'info');
    }
  };

  // 📄 Télécharger le PDF des paiements filtrés
  const handleDownloadFilteredPayments = async () => {
    const filteredPayments = getFilteredPayments();
    
    if (filteredPayments.length === 0) {
      showNotification('Aucun paiement à télécharger', 'warning');
      return;
    }

    if (!pdfReady || !pdfModule) {
      showNotification('Module PDF non disponible', 'error');
      return;
    }

    setPdfLoading(prev => ({ ...prev, ['filtered_history']: true }));
    try {
      const filters = {
        searchTerm: searchTerm || '',
        filterType: filterType,
        invoiceNumber: selectedInvoiceData?.invoice_number || '',
        supplierName: selectedInvoiceData?.supplier?.company_name || ''
      };

      const { default: ListePDF } = await import('./PaiementsListePDF');
      const blob = await pdfModule.pdf(
        <ListePDF paiements={filteredPayments} filters={filters} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = 'paiements';
      if (searchTerm) {
        fileName += `_recherche_${searchTerm.substring(0, 20)}`;
      }
      if (filterType === 'today') fileName += '_jour';
      else if (filterType === 'month') fileName += '_mois';
      else if (filterType === 'invoice' && selectedInvoiceData) {
        fileName += `_facture_${selectedInvoiceData.invoice_number}`;
      }
      fileName += `_${new Date().toISOString().split('T')[0]}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification(`PDF téléchargé (${filteredPayments.length} paiements)`, 'success');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      showNotification('Erreur lors du téléchargement du PDF', 'error');
    } finally {
      setPdfLoading(prev => ({ ...prev, ['filtered_history']: false }));
    }
  };

  // Télécharger le reçu PDF d'un paiement
  const handleReceiptPDF = async (paiement) => {
    if (!pdfReady || !pdfModule) {
      showNotification('Module PDF non disponible', 'error');
      return;
    }

    setPdfLoading(prev => ({ ...prev, [paiement.id]: true }));
    try {
      let paymentData = paiement;
      if (!paiement.invoice) {
        const response = await AxiosInstance.get(`/paiement-fournisseur/${paiement.id}/`);
        paymentData = response.data;
      }
      
      const { default: ReceiptComponent } = await import('./PaiementsFournisseurRecu');
      const blob = await pdfModule.pdf(<ReceiptComponent paiement={paymentData} />).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recu_paiement_${paymentData.payment_number || paymentData.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification('Reçu PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      showNotification('Erreur lors du téléchargement du PDF', 'error');
    } finally {
      setPdfLoading(prev => ({ ...prev, [paiement.id]: false }));
    }
  };

  // ⭐ Fonction pour obtenir les paiements filtrés (recherche + filtres)
  const getFilteredPayments = () => {
    let filtered = paiements;

    // Filtre par type
    if (filterType === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(p => p.payment_date === today);
    } else if (filterType === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthAgoStr = monthAgo.toISOString().split('T')[0];
      filtered = filtered.filter(p => p.payment_date >= monthAgoStr);
    } else if (filterType === 'invoice' && selectedInvoiceId) {
      filtered = filtered.filter(p => 
        p.invoice?.id === parseInt(selectedInvoiceId) || 
        p.invoice_id === parseInt(selectedInvoiceId)
      );
    }

    // ⭐ Filtre par recherche
    filtered = filtered.filter(p => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;
      
      const paymentNumber = (p.payment_number || '').toLowerCase();
      const invoiceNumber = (p.invoice?.invoice_number || p.invoice_number || '').toLowerCase();
      const supplierName = (p.invoice?.supplier?.company_name || p.supplier_name || '').toLowerCase();
      const agenceName = (p.agence?.nom || '').toLowerCase();
      const method = (p.payment_method || '').toLowerCase();
      const reference = (p.reference_number || '').toLowerCase();
      
      return paymentNumber.includes(search) || 
             invoiceNumber.includes(search) || 
             supplierName.includes(search) ||
             agenceName.includes(search) ||
             method.includes(search) ||
             reference.includes(search);
    });

    return filtered;
  };

  // ⭐ Calcul des statistiques dynamiques basées sur les paiements filtrés
  const filteredStats = useMemo(() => {
    const filtered = getFilteredPayments();
    
    const total = filtered.length;
    const completed = filtered.filter(p => p.status === 'completed').length;
    const pending = filtered.filter(p => p.status === 'pending').length;
    const failed = filtered.filter(p => p.status === 'failed' || p.status === 'cancelled').length;
    const totalAmount = filtered
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { total, completed, pending, failed, totalAmount };
  }, [paiements, searchTerm, filterType, selectedInvoiceId]);

  // ⭐ Filtrage et tri
  const filteredAndSortedPaiements = useMemo(() => {
    const filtered = getFilteredPayments();

    return filtered.sort((a, b) => {
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
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [paiements, searchTerm, sortField, sortOrder, filterType, selectedInvoiceId]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPaiements.length / itemsPerPage);
  const paginatedPaiements = filteredAndSortedPaiements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const hasActiveFilters = searchTerm || filterType !== 'all';
  const filteredCount = filteredAndSortedPaiements.length;

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
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg text-sm sm:text-base max-w-sm`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            ) : notification.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            )}
            <span className="font-semibold text-sm">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle flex-shrink-0"
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
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
            Paiements Fournisseurs
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            <span className="font-semibold">{filteredStats.total}</span> paiement(s) · 
            <span className="font-semibold text-success ml-1">
              {formatCurrency(filteredStats.totalAmount)}
            </span> versés
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => navigate('/paiement-fournisseur/nouveau')}
            className="btn btn-primary btn-sm gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau paiement
          </button>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm gap-2 ${filterType === 'all' && !searchTerm ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            handleFilterChange('all');
            setSearchTerm('');
          }}
        >
          <ListFilter className="w-4 h-4" />
          Tous
        </button>
        <button
          className={`btn btn-sm gap-2 ${filterType === 'today' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => handleFilterChange('today')}
        >
          <CalendarDays className="w-4 h-4" />
          Aujourd'hui
        </button>
        <button
          className={`btn btn-sm gap-2 ${filterType === 'month' ? 'btn-info' : 'btn-outline'}`}
          onClick={() => handleFilterChange('month')}
        >
          <CalendarRange className="w-4 h-4" />
          Ce mois
        </button>
        <button
          className={`btn btn-sm gap-2 ${filterType === 'invoice' ? 'btn-warning' : 'btn-outline'}`}
          onClick={() => {
            setFilterType('invoice');
            setShowFilterPanel(!showFilterPanel);
          }}
        >
          <FileStack className="w-4 h-4" />
          Par facture
          {filterType === 'invoice' && selectedInvoiceId && (
            <span className="badge badge-ghost badge-xs">•</span>
          )}
        </button>

        {/* 📄 Bouton PDF */}
        {filteredCount > 0 && (
          <button
            className={`btn btn-sm gap-2 ${hasActiveFilters ? 'btn-info' : 'btn-outline'}`}
            onClick={handleDownloadFilteredPayments}
            disabled={!pdfReady || pdfLoading['filtered_history']}
          >
            {pdfLoading['filtered_history'] ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSearch className="w-4 h-4" />
            )}
            PDF {hasActiveFilters ? 'résultats' : 'tous'}
          </button>
        )}
      </div>

      {/* Indicateur de filtre actif avec statistiques détaillées */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-4 bg-base-100 rounded-lg p-3 border border-base-200">
          <div className="text-sm font-medium text-base-content/80 flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-primary" />
            {searchTerm && <span>🔍 "{searchTerm}"</span>}
            {filterType === 'today' && <span>📅 Paiements du jour</span>}
            {filterType === 'month' && <span>📆 Paiements du mois</span>}
            {filterType === 'invoice' && selectedInvoiceData && (
              <span>📄 Facture {selectedInvoiceData.invoice_number}</span>
            )}
            <span className="badge badge-primary badge-sm ml-2">
              {filteredCount} paiements
            </span>
            <span className="badge badge-success badge-sm">
              {formatCurrency(filteredStats.totalAmount)}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-xs gap-1"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setSelectedInvoiceId('');
              setSelectedInvoiceData(null);
              setShowFilterPanel(false);
              setCurrentPage(1);
            }}
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      )}

      {/* ⭐ Cartes statistiques dynamiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Total paiements</div>
              <div className="stat-value text-xl font-bold">{filteredStats.total}</div>
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
              <div className="stat-value text-xl font-bold text-success">{filteredStats.completed}</div>
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
              <div className="stat-value text-xl font-bold text-warning">{filteredStats.pending}</div>
            </div>
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-info" />
            </div>
            <div>
              <div className="stat-title text-xs font-medium text-base-content/60">Montant total</div>
              <div className="stat-value text-xl font-bold text-info">
                {formatCurrency(filteredStats.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau de filtre par facture */}
      {showFilterPanel && filterType === 'invoice' && (
        <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-base-200 bg-gradient-to-r from-warning/5 to-warning/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-warning" />
                Filtrer par facture
              </h3>
              <button
                className="btn btn-ghost btn-xs gap-1"
                onClick={() => {
                  setShowFilterPanel(false);
                  setFilterType('all');
                  setSelectedInvoiceId('');
                  setSelectedInvoiceData(null);
                }}
              >
                <X className="w-3 h-3" />
                Fermer
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="label label-text font-medium text-sm">
                  Sélectionnez une facture
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedInvoiceId}
                  onChange={handleInvoiceSelect}
                >
                  <option value="">-- Sélectionner une facture --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.supplier} ({inv.payment_count} paiements)
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoiceId && selectedInvoiceData && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="bg-base-200 rounded-lg p-3 flex-1 min-w-[200px]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-base-content/40 block">Facture</span>
                        <span className="font-bold text-primary">{selectedInvoiceData.invoice_number}</span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/40 block">Total</span>
                        <span className="font-bold">{formatCurrency(selectedInvoiceData.total)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/40 block">Payé</span>
                        <span className="font-bold text-success">
                          {formatCurrency(
                            paiements
                              .filter(p => p.invoice?.id === parseInt(selectedInvoiceId) || p.invoice_id === parseInt(selectedInvoiceId))
                              .reduce((sum, p) => sum + (p.amount || 0), 0)
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-base-content/40 block">Paiements</span>
                        <span className="font-bold text-info">
                          {paiements.filter(p => p.invoice?.id === parseInt(selectedInvoiceId) || p.invoice_id === parseInt(selectedInvoiceId)).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recherche */}
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

      {/* Indicateur PDF */}
      {!pdfReady && (
        <div className="alert alert-warning shadow-lg text-sm mb-4">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Module PDF non disponible - Installation en cours...</span>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        {filteredAndSortedPaiements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-base-content/30" />
            </div>
            <p className="text-lg font-semibold text-base-content/50">
              {searchTerm || filterType !== 'all' ? 'Aucun résultat' : 'Aucun paiement enregistré'}
            </p>
            <p className="text-sm text-base-content/40 mt-2">
              {searchTerm || filterType !== 'all' 
                ? 'Aucun paiement ne correspond à vos critères de recherche'
                : 'Commencez par créer un nouveau paiement'}
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setSelectedInvoiceId('');
                  setSelectedInvoiceData(null);
                  setShowFilterPanel(false);
                  setCurrentPage(1);
                }} 
                className="btn btn-ghost btn-sm mt-4 gap-2"
              >
                <X className="w-4 h-4" />
                Réinitialiser les filtres
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
                      className="cursor-pointer hover:text-base-content transition-colors whitespace-nowrap"
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
                      className="cursor-pointer hover:text-base-content transition-colors whitespace-nowrap"
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
                      className="cursor-pointer hover:text-base-content transition-colors whitespace-nowrap"
                      onClick={() => handleSort('supplier_name')}
                    >
                      <div className="flex items-center gap-1">
                        Fournisseur
                        {sortField === 'supplier_name' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="whitespace-nowrap">Méthode</th>
                    <th 
                      className="cursor-pointer hover:text-base-content transition-colors whitespace-nowrap"
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
                      className="text-right cursor-pointer hover:text-base-content transition-colors whitespace-nowrap"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Montant
                        {sortField === 'amount' && (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="text-center whitespace-nowrap">Statut</th>
                    <th className="text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPaiements.map((p) => {
                    const MethodIcon = getMethodIcon(p.payment_method);
                    const status = getStatusBadge(p.status);
                    const isPdfLoading = pdfLoading[p.id];
                    
                    return (
                      <tr key={p.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                        <td className="font-mono text-sm font-medium">
                          {p.payment_number}
                        </td>
                        <td>
                          <span className="font-medium">
                            {p.invoice?.invoice_number || p.invoice_number || '-'}
                          </span>
                          {p.invoice && (
                            <span className="text-xs text-base-content/40 block">
                              Échéance: {formatDate(p.invoice.due_date)}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-base-content/40 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">
                              {p.invoice?.supplier?.company_name || p.supplier_name || 'N/A'}
                            </span>
                          </div>
                          {p.invoice?.agence?.nom && (
                            <span className="text-xs text-base-content/40 block">
                              {p.invoice.agence.nom}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <MethodIcon className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-xs capitalize">
                              {getMethodLabel(p.payment_method)}
                            </span>
                          </div>
                          {p.reference_number && (
                            <span className="text-xs text-base-content/40 block">
                              Réf: {p.reference_number}
                            </span>
                          )}
                        </td>
                        <td className="text-sm">
                          {formatDate(p.payment_date)}
                          <span className="text-xs text-base-content/40 block">
                            {formatDateTime(p.created_at)}
                          </span>
                        </td>
                        <td className="text-right font-bold text-success whitespace-nowrap">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${status.class} badge-sm whitespace-nowrap`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => navigate(`/paiement-fournisseur/${p.id}`)} 
                              className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              className={`btn btn-ghost btn-sm btn-square ${pdfReady ? 'hover:bg-success/10' : 'opacity-30'} transition-colors`}
                              title={pdfReady ? "Télécharger le reçu PDF" : "PDF non disponible"}
                              onClick={() => handleReceiptPDF(p)}
                              disabled={!pdfReady || isPdfLoading}
                            >
                              {isPdfLoading && pdfLoading[p.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin text-success" />
                              ) : (
                                <Download className="w-4 h-4 text-success" />
                              )}
                            </button>
                          </div>
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

      {/* Légende des actions */}
      <div className="mt-4 p-3 bg-base-100 rounded-xl shadow-sm border border-base-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/60">
          <span className="font-medium">Actions:</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>Détails</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3 text-success" />
            <span>Reçu PDF</span>
          </div>
          <div className="flex items-center gap-1 text-info">
            <FileSearch className="w-3 h-3" />
            <span>PDF des résultats</span>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-1 text-primary font-medium">
              <Filter className="w-3 h-3" />
              <span>Filtres actifs</span>
            </div>
          )}
          {searchTerm && (
            <div className="flex items-center gap-1 text-secondary font-medium">
              <Search className="w-3 h-3" />
              <span>Recherche: "{searchTerm}"</span>
              <span className="badge badge-ghost badge-xs">{filteredCount} résultats</span>
            </div>
          )}
          {!pdfReady && (
            <div className="flex items-center gap-1 text-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>PDF non disponible</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaiementsFournisseurs;