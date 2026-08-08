// src/pages/mouvements-stock/MouvementStockDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Box, User, Calendar, DollarSign,
  MapPin, FileText, TrendingUp, TrendingDown, ArrowLeftRight,
  AlertCircle, CheckCircle, Clock, Truck, Building2,
  CreditCard, Hash, Tag, Info, Download, Printer, Share2,
  Copy, Check, ExternalLink, History, ShoppingCart, RefreshCw
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import { toast } from 'react-hot-toast';

// Configuration des types de mouvement
const MOVEMENT_TYPES = {
  in: { 
    label: 'Entrée', 
    icon: TrendingDown, 
    color: 'success',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    badgeColor: 'success',
    actionLabel: 'Entrée en stock'
  },
  out: { 
    label: 'Sortie', 
    icon: TrendingUp, 
    color: 'error',
    bgColor: 'bg-error/10',
    textColor: 'text-error',
    badgeColor: 'error',
    actionLabel: 'Sortie de stock'
  },
  transfer: { 
    label: 'Transfert', 
    icon: ArrowLeftRight, 
    color: 'info',
    bgColor: 'bg-info/10',
    textColor: 'text-info',
    badgeColor: 'info',
    actionLabel: 'Transfert entre entrepôts'
  },
  adjustment: { 
    label: 'Ajustement', 
    icon: Package, 
    color: 'warning',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    badgeColor: 'warning',
    actionLabel: 'Ajustement de stock'
  },
  return: { 
    label: 'Retour fournisseur', 
    icon: RefreshCw, 
    color: 'secondary',
    bgColor: 'bg-secondary/10',
    textColor: 'text-secondary',
    badgeColor: 'secondary',
    actionLabel: 'Retour fournisseur'
  },
  return_customer: { 
    label: 'Retour client', 
    icon: ShoppingCart, 
    color: 'secondary',
    bgColor: 'bg-secondary/10',
    textColor: 'text-secondary',
    badgeColor: 'secondary',
    actionLabel: 'Retour client'
  },
  scrap: { 
    label: 'Mise au rebut', 
    icon: Box, 
    color: 'neutral',
    bgColor: 'bg-neutral/10',
    textColor: 'text-neutral',
    badgeColor: 'neutral',
    actionLabel: 'Mise au rebut'
  },
  quarantine: { 
    label: 'Mise en quarantaine', 
    icon: AlertCircle, 
    color: 'warning',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    badgeColor: 'warning',
    actionLabel: 'Mise en quarantaine'
  },
};

const REFERENCE_TYPES = {
  purchase: { label: 'Bon de commande', icon: ShoppingCart },
  sale: { label: 'Facture de vente', icon: TrendingUp },
  transfer: { label: 'Bon de transfert', icon: ArrowLeftRight },
  inventory: { label: 'Inventaire', icon: Package },
  production: { label: 'Ordre de production', icon: Box },
  manual: { label: 'Saisie manuelle', icon: FileText },
};

const MouvementStockDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [relatedMovements, setRelatedMovements] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);

  // Fetch mouvement principal
  const fetchMovement = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(`/stock-movements/${id}/`);
      setMovement(response.data);
      
      // Fetch mouvements liés si c'est un transfert
      if (response.data.reference_type === 'transfer' && response.data.reference_id) {
        fetchRelatedMovements(response.data.reference_id);
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 404) {
        setError('Mouvement de stock non trouvé');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les droits pour consulter ce mouvement');
      } else {
        setError('Une erreur est survenue lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch mouvements liés (pour les transferts)
  const fetchRelatedMovements = async (transferId) => {
    try {
      const response = await AxiosInstance.get(`/stock-movements/?reference_id=${transferId}&reference_type=transfer`);
      if (response.data.results) {
        setRelatedMovements(response.data.results);
      } else if (Array.isArray(response.data)) {
        setRelatedMovements(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement mouvements liés:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMovement();
    }
  }, [id]);

  // Utilitaires de formatage
  const formatDate = (date, withTime = true) => {
    if (!date) return '-';
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    return new Date(date).toLocaleString('fr-FR', options);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return formatDate(date, false);
  };

  // Actions
  const handleCopyReference = () => {
    navigator.clipboard.writeText(movement.reference);
    setCopied(true);
    toast.success('Référence copiée');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalTitle = document.title;
    document.title = `${movement.reference} - Mouvement de stock`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${movement.reference} - Mouvement de stock</title>
          <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.css" rel="stylesheet" />
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    document.title = originalTitle;
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(movement, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${movement.reference}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export JSON effectué');
  };

  const getStatusColor = (quantity, type) => {
    if (type === 'out' && quantity > 100) return 'error';
    if (type === 'in' && quantity > 100) return 'success';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content/60 animate-pulse">Chargement des détails...</p>
      </div>
    );
  }

  if (error || !movement) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-error" />
              </div>
            </div>
            <h2 className="text-xl font-bold">Erreur</h2>
            <p className="text-base-content/70">{error || 'Mouvement non trouvé'}</p>
            <div className="card-actions justify-center mt-4">
              <Link to="/mouvements-stock" className="btn btn-primary btn-sm gap-1">
                <ArrowLeft className="w-4 h-4" />
                Retour à la liste
              </Link>
              <button onClick={fetchMovement} className="btn btn-ghost btn-sm gap-1">
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = MOVEMENT_TYPES[movement.movement_type] || MOVEMENT_TYPES.in;
  const Icon = typeInfo.icon;
  const RefTypeInfo = REFERENCE_TYPES[movement.reference_type] || { label: movement.reference_type || 'Standard', icon: FileText };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      {/* Barre d'actions flottante */}
      <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm border-b shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <Link to="/mouvements-stock" className="btn btn-ghost btn-sm gap-1">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={handleCopyReference} className="btn btn-sm btn-outline gap-1">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier référence'}
              </button>
              <button onClick={handleExportJSON} className="btn btn-sm btn-outline gap-1">
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-outline gap-1">
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 md:p-6" ref={printRef}>
        {/* En-tête */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${typeInfo.bgColor} shadow-lg`}>
              <Icon className={`w-8 h-8 md:w-10 md:h-10 ${typeInfo.textColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{movement.reference}</h1>
                <button 
                  onClick={handleCopyReference}
                  className="btn btn-xs btn-ghost"
                  title="Copier la référence"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`badge badge-${typeInfo.badgeColor} badge-md gap-1`}>
                  <Icon className="w-3 h-3" />
                  {typeInfo.label}
                </span>
                <span className="badge badge-ghost badge-md gap-1">
                  <RefTypeInfo.icon className="w-3 h-3" />
                  {RefTypeInfo.label}
                </span>
                {movement.reference_id && (
                  <span className="badge badge-ghost badge-md font-mono">
                    #{movement.reference_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="tooltip" data-tip={formatDate(movement.movement_date, true)}>
              <p className="text-sm text-base-content/60 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                {getRelativeTime(movement.movement_date)}
              </p>
            </div>
            <p className="text-xs text-base-content/40 font-mono mt-1">
              ID: {movement.id}
            </p>
          </div>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Carte Produit */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Package className="w-5 h-5" />
                <h2 className="card-title text-base">Produit</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">Nom du produit</p>
                  <p className="font-semibold text-lg">{movement.product?.name || movement.product_name || '-'}</p>
                </div>
                {movement.product?.reference && (
                  <div>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Code référence</p>
                    <p className="font-mono text-sm">{movement.product.reference}</p>
                  </div>
                )}
                {movement.product?.barcode && (
                  <div>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Code barres</p>
                    <p className="font-mono text-sm">{movement.product.barcode}</p>
                  </div>
                )}
                {movement.variant && (
                  <div>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Variante</p>
                    <p className="text-sm">{movement.variant.name || movement.variant}</p>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-base-content/50">Quantité</p>
                    <p className={`text-2xl font-bold ${movement.movement_type === 'out' ? 'text-error' : 'text-success'}`}>
                      {movement.movement_type === 'out' ? '-' : '+'}{formatNumber(movement.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Financière */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-2 text-primary mb-2">
                <DollarSign className="w-5 h-5" />
                <h2 className="card-title text-base">Valeurs financières</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">Prix unitaire</p>
                  <p className="text-xl font-semibold">{formatCurrency(movement.unit_price)}</p>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-base-content/50">Total TTC</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(movement.total_price)}</p>
                  </div>
                </div>
                {movement.product?.margin_percentage && (
                  <div className="mt-2">
                    <p className="text-xs text-base-content/50">Marge brute</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full" 
                          style={{ width: `${movement.product.margin_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{movement.product.margin_percentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte Entrepôts */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Building2 className="w-5 h-5" />
                <h2 className="card-title text-base">Entrepôts</h2>
              </div>
              <div className="space-y-3">
                {movement.from_warehouse && (
                  <div>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Entrepôt source</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-info" />
                      <div>
                        <p className="font-medium">{movement.from_warehouse.name}</p>
                        {movement.from_warehouse.code && (
                          <p className="text-xs text-base-content/50 font-mono">{movement.from_warehouse.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {movement.to_warehouse && (
                  <div className={movement.from_warehouse ? 'pt-2 border-t' : ''}>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Entrepôt destination</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-success" />
                      <div>
                        <p className="font-medium">{movement.to_warehouse.name}</p>
                        {movement.to_warehouse.code && (
                          <p className="text-xs text-base-content/50 font-mono">{movement.to_warehouse.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {(movement.from_location || movement.to_location) && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Emplacements</p>
                    {movement.from_location && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Box className="w-3 h-3 text-base-content/50" />
                        <span>Source: <span className="font-mono">{movement.from_location.code}</span></span>
                      </div>
                    )}
                    {movement.to_location && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <Box className="w-3 h-3 text-base-content/50" />
                        <span>Destination: <span className="font-mono">{movement.to_location.code}</span></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Détails supplémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Carte Métadonnées */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Info className="w-5 h-5" />
                <h2 className="card-title text-base">Informations système</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">Créé par</p>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-base-content/50" />
                    <span className="text-sm">{movement.created_by?.email || movement.created_by || '-'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">Date de création</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-base-content/50" />
                    <span className="text-sm">{formatDate(movement.created_at || movement.movement_date)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">Type de référence</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="w-3 h-3 text-base-content/50" />
                    <span className="text-sm">{movement.reference_type || '-'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">ID référence</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Hash className="w-3 h-3 text-base-content/50" />
                    <span className="text-sm font-mono">{movement.reference_id || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Notes */}
          {movement.notes && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <FileText className="w-5 h-5" />
                  <h2 className="card-title text-base">Notes</h2>
                </div>
                <div className="bg-base-200/50 rounded-lg p-3">
                  <p className="whitespace-pre-wrap text-sm">{movement.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline des événements liés (pour transferts) */}
        {relatedMovements.length > 0 && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <History className="w-5 h-5" />
                  <h2 className="card-title text-base">Historique du transfert</h2>
                </div>
                <button 
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="btn btn-xs btn-ghost"
                >
                  {showTimeline ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              
              {showTimeline && (
                <ul className="timeline timeline-vertical lg:timeline-horizontal mt-4">
                  {relatedMovements.map((item, index) => {
                    const itemTypeInfo = MOVEMENT_TYPES[item.movement_type];
                    const ItemIcon = itemTypeInfo?.icon || Package;
                    const isFirst = index === 0;
                    const isLast = index === relatedMovements.length - 1;
                    
                    return (
                      <li key={item.id}>
                        {!isFirst && <hr className="bg-primary" />}
                        <div className="timeline-middle">
                          <div className={`p-2 rounded-full ${itemTypeInfo?.bgColor || 'bg-base-200'}`}>
                            <ItemIcon className={`w-4 h-4 ${itemTypeInfo?.textColor || 'text-base-content'}`} />
                          </div>
                        </div>
                        <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} mb-10`}>
                          <time className="font-mono text-xs">{formatDate(item.movement_date, false)}</time>
                          <div className="text-lg font-bold">{item.reference}</div>
                          <div className="text-sm">{itemTypeInfo?.label || item.movement_type}</div>
                          <div className="text-xs text-base-content/50">
                            {item.quantity} unités
                          </div>
                        </div>
                        {!isLast && <hr className="bg-primary" />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Footer avec actions */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-base-content/40 no-print">
          <p>Document généré automatiquement par le système de gestion de stock</p>
          <p className="mt-1">ID: {movement.id} | Généré le {formatDate(new Date(), true)}</p>
        </div>
      </div>
    </div>
  );
};

export default MouvementStockDetail;