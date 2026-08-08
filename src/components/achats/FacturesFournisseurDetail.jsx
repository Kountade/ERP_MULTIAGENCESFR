// src/components/achats/FacturesFournisseurDetail.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Hash,
  Tag,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  Plus,
  X
} from 'lucide-react';

const FacturesFournisseurDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // États
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [items, setItems] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [submitting, setSubmitting] = useState(false);

  // Charger les données
  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const response = await AxiosInstance.get(`/factures-fournisseur/${id}/`);
        const data = response.data;
        setFacture(data);
        
        // Charger les paiements
        if (data.payments) {
          setPayments(data.payments);
        } else {
          try {
            const paymentsRes = await AxiosInstance.get(`/factures-fournisseur/${id}/payments/`);
            setPayments(paymentsRes.data || []);
          } catch (e) {
            setPayments([]);
          }
        }
        
        // Charger les lignes de facture
        if (data.items) {
          setItems(data.items);
        } else {
          try {
            const itemsRes = await AxiosInstance.get(`/factures-fournisseur/${id}/items/`);
            setItems(itemsRes.data || []);
          } catch (e) {
            setItems([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Facture non trouvée');
        setLoading(false);
      }
    };
    fetchFacture();
  }, [id]);

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

  const getMethodLabel = (method) => {
    const labels = {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque',
      card: 'Carte bancaire',
      mobile_money: 'Mobile Money',
      other: 'Autre'
    };
    return labels[method] || method;
  };

  // Gérer le paiement
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(facture.amount_remaining)) {
      setError(`Le montant (${formatCurrency(paymentAmount)}) dépasse le reste dû (${formatCurrency(facture.amount_remaining)})`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        invoice: parseInt(id),
        agence: facture.agence?.id || facture.agence,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      };

      const response = await AxiosInstance.post('/paiement-fournisseur/', payload);
      
      // Recharger les données
      const factureRes = await AxiosInstance.get(`/factures-fournisseur/${id}/`);
      setFacture(factureRes.data);
      
      const paymentsRes = await AxiosInstance.get(`/factures-fournisseur/${id}/payments/`);
      setPayments(paymentsRes.data || []);
      
      setShowPaymentModal(false);
      setPaymentAmount('');
      
    } catch (error) {
      console.error('Erreur paiement:', error);
      setError('Erreur lors du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error || !facture) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-xl font-bold text-error">Erreur</h2>
          <p className="text-base-content/60 mt-2">{error || 'Facture non trouvée'}</p>
          <button 
            className="btn btn-primary mt-4 gap-2"
            onClick={() => navigate('/factures-fournisseur')}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(facture.status);
  const StatusIcon = status.icon;
  const progress = facture.total > 0 ? (facture.amount_paid / facture.total) * 100 : 0;
  const isPayable = facture.status === 'pending' || facture.status === 'partial' || facture.status === 'overdue';

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-base-200 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/factures-fournisseur')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Receipt className="w-6 h-6 sm:w-8 sm:h-8" />
              Détail facture
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-base-content/60 font-mono">
                {facture.invoice_number}
              </p>
              <span className={`badge ${status.class} gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Bouton paiement */}
          {isPayable && facture.amount_remaining > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-success gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <CreditCard className="w-4 h-4" />
              Payer {formatCurrency(facture.amount_remaining)}
            </button>
          )}
          
          {/* Boutons actions */}
          <button className="btn btn-ghost btn-sm gap-1">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          <button className="btn btn-ghost btn-sm gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            className="btn btn-ghost btn-sm gap-1"
            onClick={() => navigate(`/factures-fournisseur/${id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Modifier</span>
          </button>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Effectuer un paiement
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-ghost btn-sm btn-square"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-base-content/60 mb-4">
              Facture: <span className="font-mono">{facture.invoice_number}</span>
              <br />
              Reste à payer: <span className="font-bold text-error">{formatCurrency(facture.amount_remaining)}</span>
            </p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Montant</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xs font-bold">
                    FCFA
                  </span>
                  <input
                    type="number"
                    className="input input-bordered w-full pl-16"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    min="0.01"
                    max={facture.amount_remaining}
                    required
                  />
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  Max: {formatCurrency(facture.amount_remaining)}
                </div>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Méthode de paiement</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="card">Carte bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              {error && (
                <div className="alert alert-error text-sm mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-ghost flex-1"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-success flex-1 gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Payer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-base-content/60">
            Progression du paiement
          </span>
          <span className="text-sm font-bold text-primary">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-1">
          <span>Payé: {formatCurrency(facture.amount_paid)}</span>
          <span>Total: {formatCurrency(facture.total)}</span>
          <span>Reste: {formatCurrency(facture.amount_remaining)}</span>
        </div>
      </div>

      {/* Infos facture */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-sm font-semibold uppercase text-base-content/40 tracking-wider mb-4">
            <FileText className="w-4 h-4 inline mr-2" />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fournisseur */}
            <div className="p-4 bg-base-200/50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-base-content/40 uppercase tracking-wider mb-2">
                <Building2 className="w-3 h-3" />
                Fournisseur
              </div>
              <p className="font-medium">{facture.supplier_name || facture.supplier?.company_name || 'N/A'}</p>
              {facture.supplier?.email && (
                <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {facture.supplier.email}
                </p>
              )}
              {facture.supplier?.phone && (
                <p className="text-sm text-base-content/60 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {facture.supplier.phone}
                </p>
              )}
            </div>
            
            {/* Dates */}
            <div className="p-4 bg-base-200/50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-base-content/40 uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3" />
                Dates
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-base-content/60">Facture:</span>
                  <p className="font-medium">{formatDate(facture.invoice_date)}</p>
                </div>
                <div>
                  <span className="text-xs text-base-content/60">Échéance:</span>
                  <p className={`font-medium ${facture.is_overdue ? 'text-error' : ''}`}>
                    {formatDate(facture.due_date)}
                    {facture.is_overdue && ' ⚠️ En retard'}
                  </p>
                </div>
                {facture.payment_date && (
                  <div>
                    <span className="text-xs text-base-content/60">Paiement:</span>
                    <p className="font-medium text-success">{formatDate(facture.payment_date)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Montants */}
            <div className="p-4 bg-base-200/50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-base-content/40 uppercase tracking-wider mb-2">
                <DollarSign className="w-3 h-3" />
                Montants
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-base-content/60">Total:</span>
                  <span className="font-bold text-primary">{formatCurrency(facture.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-base-content/60">Payé:</span>
                  <span className="font-medium text-success">{formatCurrency(facture.amount_paid)}</span>
                </div>
                <div className="flex justify-between border-t border-base-200 pt-1">
                  <span className="text-xs text-base-content/60">Reste:</span>
                  <span className="font-bold text-error">{formatCurrency(facture.amount_remaining)}</span>
                </div>
              </div>
              {facture.currency && (
                <div className="mt-2 text-xs text-base-content/40">
                  Devise: {facture.currency}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {facture.notes && (
            <div className="mt-4 p-4 bg-base-200/30 rounded-lg border border-base-200/50">
              <p className="text-xs text-base-content/40 uppercase tracking-wider flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3" />
                Notes
              </p>
              <p className="text-sm">{facture.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lignes de facture */}
      {items.length > 0 && (
        <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-sm font-semibold uppercase text-base-content/40 tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Lignes de facture ({items.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60 border-b border-base-200">
                  <th>Description</th>
                  <th className="text-right">Quantité</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Remise</th>
                  <th className="text-right">TVA</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-base-200/50 hover:bg-base-200/30">
                    <td>
                      <div className="font-medium">{item.description || item.product?.name}</div>
                      {item.product?.reference && (
                        <div className="text-xs text-base-content/40">Réf: {item.product.reference}</div>
                      )}
                    </td>
                    <td className="text-right">{item.quantity || 1}</td>
                    <td className="text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right">{item.discount_rate || 0}%</td>
                    <td className="text-right">{item.tax_rate || 0}%</td>
                    <td className="text-right font-bold text-primary">{formatCurrency(item.total || (item.unit_price * item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-base-200 font-bold bg-base-100">
                <tr>
                  <td colSpan="5" className="text-right text-base-content/60">
                    Total
                  </td>
                  <td className="text-right text-primary">
                    {formatCurrency(facture.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Paiements */}
      {payments.length > 0 && (
        <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-sm font-semibold uppercase text-base-content/40 tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Historique des paiements ({payments.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60 border-b border-base-200">
                  <th>N° Paiement</th>
                  <th>Date</th>
                  <th>Méthode</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-base-200/50 hover:bg-base-200/30">
                    <td className="font-mono text-sm">{payment.payment_number}</td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>
                      <span className="badge badge-primary badge-sm">
                        {getMethodLabel(payment.payment_method)}
                      </span>
                    </td>
                    <td className="text-right font-bold text-success">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <span className={`badge ${
                        payment.status === 'completed' ? 'badge-success' : 'badge-warning'
                      } badge-sm`}>
                        {payment.status === 'completed' ? 'Terminé' : payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FacturesFournisseurDetail;