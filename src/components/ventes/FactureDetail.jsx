// src/components/sales/FactureDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import FacturePDF from './FacturePDF';
import { 
  ArrowLeft, Receipt, User, Calendar, CreditCard, 
  CheckCircle, XCircle, Clock, Printer, AlertCircle, 
  RefreshCw, Building2, Package, FileText, 
  DollarSign, Plus, X, Info, Download
} from 'lucide-react';

const FactureDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ montant: '', methode: 'especes', reference: '' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchFacture = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/factures/${id}/`);
      console.log('Facture chargée:', response.data);
      console.log('Items:', response.data.items);
      setFacture(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement', 'error');
      if (error.response?.status === 404) setTimeout(() => navigate('/factures'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacture();
  }, [id]);

  // Génération du PDF avec le composant React
  const handleGeneratePDF = async () => {
    if (!facture) return;
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

  // Alternative: télécharger via l'API backend
  const handleDownloadPDFFromAPI = async () => {
    if (!facture) return;
    setGeneratingPDF(true);
    try {
      const response = await AxiosInstance.get(`/factures/${id}/pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_${facture.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showNotification('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors du téléchargement du PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData.montant || parseFloat(paymentData.montant) <= 0) {
      showNotification('Montant invalide', 'error');
      return;
    }
    if (parseFloat(paymentData.montant) > facture.montant_restant) {
      showNotification(`Le montant dépasse le reste à payer (${formatPrice(facture.montant_restant)})`, 'error');
      return;
    }
    try {
      await AxiosInstance.post(`/factures/${id}/enregistrer_paiement/`, {
        montant: parseFloat(paymentData.montant),
        methode: paymentData.methode,
        reference: paymentData.reference,
        notes: `Paiement du ${new Date().toLocaleString()}`
      });
      showNotification('Paiement enregistré avec succès', 'success');
      setShowPaymentModal(false);
      setPaymentData({ montant: '', methode: 'especes', reference: '' });
      fetchFacture();
    } catch (error) {
      showNotification('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const statusConfig = {
    draft: { label: 'Brouillon', icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    sent: { label: 'Envoyée', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    paid: { label: 'Payée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    partially_paid: { label: 'Partiellement payée', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    overdue: { label: 'En retard', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!facture) return null;

  const status = statusConfig[facture.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const canAddPayment = facture.status !== 'paid' && facture.status !== 'cancelled' && facture.montant_restant > 0;
  const items = facture.items || [];

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

      {/* Modal Paiement */}
      {showPaymentModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Enregistrer un paiement</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p>Total: {formatPrice(facture.total_ttc)}</p>
              <p className="text-green-600">Déjà payé: {formatPrice(facture.montant_paye)}</p>
              <p className="text-orange-600">Reste à payer: {formatPrice(facture.montant_restant)}</p>
            </div>
            <div className="form-control mb-3">
              <label className="label">Montant *</label>
              <input type="number" step="1" min="1" max={facture.montant_restant} className="input input-bordered" value={paymentData.montant} onChange={(e) => setPaymentData({ ...paymentData, montant: e.target.value })} />
            </div>
            <div className="form-control mb-3">
              <label className="label">Mode de paiement *</label>
              <select className="select select-bordered" value={paymentData.methode} onChange={(e) => setPaymentData({ ...paymentData, methode: e.target.value })}>
                <option value="especes">Espèces</option>
                <option value="carte">Carte bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div className="form-control mb-3">
              <label className="label">Référence (optionnel)</label>
              <input type="text" className="input input-bordered" placeholder="N° chèque, référence virement..." value={paymentData.reference} onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })} />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowPaymentModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handlePayment}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/factures')} className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Facture {facture.reference}</h1>
              <p className="text-sm text-gray-600">Émise le {formatDate(facture.date_facture)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchFacture} className="btn btn-outline btn-sm gap-2">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            <button onClick={handleGeneratePDF} disabled={generatingPDF} className="btn btn-outline btn-primary btn-sm gap-2">
              {generatingPDF ? <div className="loading loading-spinner loading-xs"></div> : <Download className="w-4 h-4" />}
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      {canAddPayment && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary gap-2 w-full sm:w-auto">
            <CreditCard className="w-4 h-4" /> Enregistrer un paiement
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Articles
            </h2>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2" />
                <p>Aucun article</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Produit</th>
                      <th className="text-center">Qté</th>
                      <th className="text-right">Prix unitaire</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product_name || item.product?.name || '-'}</td>
                        <td className="text-center">{item.quantity || item.quantite || 0}</td>
                        <td className="text-right">{formatPrice(item.prix_unitaire || item.prix_unitaire_ht || 0)}</td>
                        <td className="text-right font-semibold">{formatPrice(item.total || item.montant_ht || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="text-right font-semibold">Sous-total HT</td>
                      <td className="text-right">{formatPrice(facture.sous_total)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-right">TVA (18%)</td>
                      <td className="text-right">{formatPrice(facture.tva)}</td>
                    </tr>
                    <tr className="border-t">
                      <td colSpan="3" className="text-right font-bold text-lg">Total TTC</td>
                      <td className="text-right font-bold text-primary text-lg">{formatPrice(facture.total_ttc)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Informations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-info" /> Informations
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <p className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="w-4 h-4" /> {status.label}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p>{facture.client?.nom || facture.client?.raison_sociale || 'Anonyme'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Échéance</p>
                  <p>{formatDate(facture.date_echeance)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agence</p>
                  <p>{facture.agence?.nom || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p>{facture.type_facture === 'proforma' ? 'Proforma' : facture.type_facture === 'finale' ? 'Finale' : 'Avoir'}</p>
                </div>
              </div>
            </div>
          </div>

          {facture.conditions_paiement && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-2">Conditions de paiement</h2>
              <p className="text-gray-600 text-sm">{facture.conditions_paiement}</p>
            </div>
          )}
          
          {facture.notes && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-gray-600 text-sm">{facture.notes}</p>
            </div>
          )}
          
          {facture.pied_de_page && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-2">Pied de page</h2>
              <p className="text-gray-600 text-sm">{facture.pied_de_page}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactureDetail;