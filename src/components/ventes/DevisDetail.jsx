// src/components/sales/DevisDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import DevisPDF from './DevisPDF';
import { 
  ArrowLeft, Send, Check, Ban, ShoppingCart, Printer, 
  Edit, AlertCircle, CheckCircle, Clock, X, 
  User, Building2, Calendar, Package, FileText, 
  DollarSign, MoreVertical, Eye, Trash2, RefreshCw,
  Phone, Mail, MapPin, Hash, Loader2, Info
} from 'lucide-react';

const DevisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const statutConfig = {
    draft: { label: 'Brouillon', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
    sent: { label: 'Envoyé', icon: Send, color: 'text-blue-500', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    accepted: { label: 'Accepté', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
    refused: { label: 'Refusé', icon: Ban, color: 'text-red-500', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
    converted: { label: 'Converti en vente', icon: ShoppingCart, color: 'text-purple-500', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
    expired: { label: 'Expiré', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
    cancelled: { label: 'Annulé', icon: Ban, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' }
  };

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/devis/${id}/`);
      setDevis(response.data);
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement du devis', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, [id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleAction = async (action, successMessage, data = null) => {
    if (!window.confirm(`Confirmer l'action : ${successMessage} ?`)) return;
    setActionLoading(true);
    try {
      await AxiosInstance.post(`/devis/${id}/${action}/`, data);
      showNotification(successMessage, 'success');
      fetchDevis();
    } catch (error) {
      showNotification(error.response?.data?.error || `Erreur lors de l'action`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToVente = async () => {
    if (!window.confirm('Convertir ce devis en vente ?')) return;
    setActionLoading(true);
    try {
      const response = await AxiosInstance.post(`/devis/${id}/convertir_en_vente/`);
      showNotification('Devis converti en vente avec succès', 'success');
      if (response.data.vente?.id) {
        navigate(`/ventes/${response.data.vente.id}`);
      } else {
        fetchDevis();
      }
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la conversion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      await DevisPDF(devis);
      showNotification('PDF généré avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (!devis) return null;
    const config = statutConfig[devis.status] || statutConfig.draft;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bgColor} ${config.color} border ${config.borderColor}`}>
        <Icon className="w-5 h-5" />
        <span className="font-bold">{config.label}</span>
      </div>
    );
  };

  const isExpired = () => {
    if (!devis || !devis.date_expiration) return false;
    return new Date(devis.date_expiration) < new Date() && devis.status !== 'converted' && devis.status !== 'cancelled';
  };

  const canSend = devis?.status === 'draft';
  const canAccept = devis?.status === 'sent' && !isExpired();
  const canRefuse = devis?.status === 'sent' && !isExpired();
  const canConvert = devis?.status === 'accepted';
  const canEdit = devis?.status === 'draft';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du devis...
          </p>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-error/10 flex items-center justify-center">
            <FileText className="w-12 h-12 text-error" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Devis non trouvé</h2>
            <p className="text-base-content/60 mt-2">Le devis que vous recherchez n'existe pas</p>
          </div>
          <button 
            onClick={() => navigate('/devis')} 
            className="btn btn-primary gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux devis
          </button>
        </div>
      </div>
    );
  }

  const status = statutConfig[devis.status] || statutConfig.draft;
  const StatusIcon = status.icon;
  const expired = isExpired();
  const items = devis.items || [];

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-base-200 to-base-100 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/devis')} 
            className="btn btn-ghost btn-circle btn-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Devis {devis.reference}
            </h1>
            <p className="text-base text-base-content/60">
              Créé le {formatDate(devis.date_creation)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchDevis}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={handleGeneratePDF}
            className="btn btn-outline gap-2"
            disabled={generatingPDF}
          >
            {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            PDF
          </button>
          {canEdit && (
            <button 
              onClick={() => navigate(`/devis/${id}/edit`)} 
              className="btn btn-primary gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Statut et actions */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${status.bgColor} ${status.color} border ${status.borderColor}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-bold">Statut: {status.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span>Total:</span>
              <span className="font-bold text-primary text-lg">{formatPrice(devis.total)}</span>
            </div>
            {expired && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">Expiré</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canSend && (
              <button 
                onClick={() => handleAction('envoyer', 'Devis envoyé')} 
                className="btn btn-primary gap-2"
                disabled={actionLoading}
              >
                <Send className="w-4 h-4" /> 
                Envoyer
              </button>
            )}
            {canAccept && (
              <button 
                onClick={() => handleAction('accepter', 'Devis accepté')} 
                className="btn btn-success gap-2"
                disabled={actionLoading}
              >
                <Check className="w-4 h-4" /> 
                Accepter
              </button>
            )}
            {canRefuse && (
              <button
                onClick={() => {
                  const motif = prompt('Motif du refus :');
                  if (motif && motif.trim()) {
                    handleAction('refuser', 'Devis refusé', { motif: motif.trim() });
                  } else if (motif === '') {
                    showNotification('Le motif ne peut pas être vide', 'error');
                  }
                }}
                className="btn btn-error gap-2"
                disabled={actionLoading}
              >
                <Ban className="w-4 h-4" /> 
                Refuser
              </button>
            )}
            {canConvert && (
              <button 
                onClick={handleConvertToVente} 
                className="btn btn-secondary gap-2"
                disabled={actionLoading}
              >
                <ShoppingCart className="w-4 h-4" /> 
                Convertir en vente
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Articles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Articles</h2>
                  <p className="text-sm text-base-content/60">{items.length} produit{items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <p className="text-base-content/50">Aucun article dans ce devis</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Produit</th>
                        <th className="text-center">Qté</th>
                        <th className="text-right">Prix unitaire</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover">
                          <td>
                            <div>
                              <div className="font-semibold">{item.product_name}</div>
                              {item.product_reference && (
                                <div className="text-xs text-base-content/50 font-mono">{item.product_reference}</div>
                              )}
                            </div>
                          </td>
                          <td className="text-center font-bold">{item.quantity}</td>
                          <td className="text-right">{formatPrice(item.prix_unitaire)}</td>
                          <td className="text-right font-bold">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-base-200">
                      <tr>
                        <td colSpan="3" className="text-right font-semibold">Sous-total</td>
                        <td className="text-right font-semibold">{formatPrice(devis.sous_total)}</td>
                      </tr>
                      <tr className="border-t border-base-300">
                        <td colSpan="3" className="text-right font-bold text-lg">Total</td>
                        <td className="text-right font-bold text-primary text-lg">{formatPrice(devis.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Informations */}
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-info/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg font-bold">Informations</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Client</p>
                  <p className="font-semibold">
                    {devis.client?.nom || 'Anonyme'} {devis.client?.prenom || ''}
                  </p>
                  {devis.client?.email && (
                    <p className="text-sm text-base-content/60 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {devis.client.email}
                    </p>
                  )}
                  {devis.client?.telephone && (
                    <p className="text-sm text-base-content/60 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {devis.client.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Agence</p>
                  <p className="font-semibold">{devis.agence?.nom || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Date de création</p>
                  <p className="font-semibold">{formatDate(devis.date_creation)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Date d'expiration</p>
                  <p className={`font-semibold ${expired ? 'text-error' : ''}`}>
                    {formatDate(devis.date_expiration)}
                    {expired && ' (Expiré)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {devis.conditions && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-5 border-b border-base-300 bg-gradient-to-r from-warning/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning" />
                  </div>
                  <h2 className="text-lg font-bold">Conditions</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-base-content/70 whitespace-pre-wrap">{devis.conditions}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {devis.notes && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-5 border-b border-base-300 bg-gradient-to-r from-secondary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold">Notes</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-base-content/70 whitespace-pre-wrap">{devis.notes}</p>
              </div>
            </div>
          )}

          {/* Pied de page */}
          {devis.pied_de_page && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-5 border-b border-base-300 bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-bold">Pied de page</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-base-content/70 whitespace-pre-wrap">{devis.pied_de_page}</p>
              </div>
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

export default DevisDetail;