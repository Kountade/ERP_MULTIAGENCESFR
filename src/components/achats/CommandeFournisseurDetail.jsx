// src/components/achats/CommandeFournisseurDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, Plus, Minus, Trash2, ShoppingCart,
  CheckCircle, AlertCircle, Loader2, Building2, 
  Package, DollarSign, FileText, Truck, Calendar, 
  Users, Clock, Edit, Send, XCircle, CheckSquare,
  Printer, Download, Eye, Hash, Tag, ArrowUpDown,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

const CommandeFournisseurDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'neutral', icon: FileText, bgColor: 'bg-base-300', textColor: 'text-base-content', actions: ['sent', 'cancelled'] },
    sent: { label: 'Envoyée', color: 'info', icon: Send, bgColor: 'bg-info/10', textColor: 'text-info', actions: ['confirmed', 'cancelled'] },
    confirmed: { label: 'Confirmée', color: 'primary', icon: CheckCircle, bgColor: 'bg-primary/10', textColor: 'text-primary', actions: ['in_transit', 'cancelled'] },
    in_transit: { label: 'En transit', color: 'warning', icon: Truck, bgColor: 'bg-warning/10', textColor: 'text-warning', actions: ['partially_received', 'received'] },
    partially_received: { label: 'Partiellement reçue', color: 'info', icon: Package, bgColor: 'bg-info/10', textColor: 'text-info', actions: ['received'] },
    received: { label: 'Reçue', color: 'success', icon: CheckSquare, bgColor: 'bg-success/10', textColor: 'text-success', actions: [] },
    cancelled: { label: 'Annulée', color: 'error', icon: XCircle, bgColor: 'bg-error/10', textColor: 'text-error', actions: [] },
    rejected: { label: 'Rejetée', color: 'error', icon: XCircle, bgColor: 'bg-error/10', textColor: 'text-error', actions: [] }
  };

  const urgencyConfig = {
    normal: { label: 'Normal', color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    urgent: { label: 'Urgent', color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    very_urgent: { label: 'Très urgent', color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' }
  };

  const fetchCommande = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(`/purchase-orders/${id}/`);
      setCommande(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 404) {
        setError('Commande non trouvée');
      } else if (error.response?.status === 401) {
        setError('Session expirée, veuillez vous reconnecter');
      } else {
        setError('Erreur lors du chargement de la commande');
      }
      showNotification(error.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCommande();
  }, [id]);

  const handleChangeStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await AxiosInstance.patch(`/purchase-orders/${id}/`, { status: newStatus });
      showNotification('Statut mis à jour avec succès', 'success');
      fetchCommande();
      setOpenStatusDialog(false);
      setNewStatus('');
    } catch (error) {
      console.error('Erreur:', error);
      let errorMsg = 'Erreur lors de la mise à jour du statut';
      if (error.response?.data?.status) errorMsg = error.response.data.status[0];
      else if (error.response?.data?.error) errorMsg = error.response.data.error;
      else if (error.response?.data?.detail) errorMsg = error.response.data.detail;
      showNotification(errorMsg, 'error', error.response?.data);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await AxiosInstance.delete(`/purchase-orders/${id}/`);
      showNotification('Commande supprimée avec succès', 'success');
      setTimeout(() => navigate('/commandes-fournisseurs'), 2000);
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
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
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la commande...
          </p>
        </div>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">{error || 'Commande non trouvée'}</h2>
          <p className="text-base-content/60 mb-4">La commande n'existe pas ou a été supprimée.</p>
          <button onClick={() => navigate('/commandes-fournisseurs')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[commande.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;
  const urgencyInfo = urgencyConfig[commande.urgency] || urgencyConfig.normal;
  const possibleActions = statusInfo.actions || [];
  
  const subtotal = commande.items?.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) || 0;
  const taxTotal = commande.items?.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0) || 0;
  const grandTotal = commande.total || (subtotal + taxTotal);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold whitespace-pre-line">{notification.message}</span>
            {notification.details && (
              <details className="text-xs">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-1 p-1 bg-black/5 rounded">{JSON.stringify(notification.details, null, 2)}</pre>
              </details>
            )}
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
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {commande.order_number}
          </h1>
          <p className="text-base text-base-content/60">
            Commande du {formatDate(commande.order_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchCommande} className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Link to="/commandes-fournisseurs" className="btn btn-outline gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          {commande.status === 'draft' && (
            <Link 
              to={`/commandes-fournisseurs/${id}/edit`} 
              className="btn btn-secondary gap-2"
            >
              <Edit className="w-4 h-4" /> Modifier
            </Link>
          )}
          {commande.status === 'draft' && (
            <button 
              onClick={() => setShowDeleteModal(true)} 
              className="btn btn-error gap-2"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Statistiques / Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-primary"><ShoppingCart className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Statut</div>
          <div className="stat-value text-2xl font-black flex items-center gap-2">
            <span className={`badge ${statusInfo.bgColor} ${statusInfo.textColor} gap-1 py-2 px-3`}>
              <StatusIcon className="w-4 h-4" /> {statusInfo.label}
            </span>
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-success"><DollarSign className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Total TTC</div>
          <div className="stat-value text-xl font-black truncate">{formatPrice(grandTotal)}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-warning"><Package className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Articles</div>
          <div className="stat-value text-2xl font-black">{commande.items?.length || 0}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-info"><Clock className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Urgence</div>
          <div className="stat-value text-2xl font-black flex items-center gap-2">
            <span className={`badge ${urgencyInfo.bgColor} ${urgencyInfo.textColor} gap-1 py-2 px-3`}>
              {urgencyInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        <div className="p-4 lg:p-6">
          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Fournisseur
              </h3>
              <p className="font-medium">{commande.supplier?.company_name || 'N/A'}</p>
              <p className="text-sm text-base-content/60">{commande.supplier?.code}</p>
            </div>
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Agence destinataire
              </h3>
              <p className="font-medium">{commande.agence?.nom || 'N/A'}</p>
              <p className="text-sm text-base-content/60">{commande.agence?.ville}</p>
              {commande.shipping_address && (
                <p className="text-sm mt-2 text-base-content/70">{commande.shipping_address}</p>
              )}
            </div>
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dates
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/50">Commande:</span>
                  <span>{formatDate(commande.order_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Livraison prévue:</span>
                  <span className={new Date(commande.expected_date) < new Date() ? 'text-warning' : ''}>
                    {formatDate(commande.expected_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          {possibleActions.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-base-200/50 rounded-xl border border-base-300">
              <span className="text-sm font-semibold text-base-content/70 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Actions:
              </span>
              {possibleActions.map(action => {
                const actionConfig = statusConfig[action];
                const ActionIcon = actionConfig?.icon;
                return (
                  <button
                    key={action}
                    onClick={() => { setNewStatus(action); setOpenStatusDialog(true); }}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    {ActionIcon && <ActionIcon className="w-4 h-4" />}
                    {actionConfig?.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Produits commandés */}
          <div className="border-t border-base-300 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Produits commandés
                <span className="badge badge-primary badge-sm">{commande.items?.length || 0}</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200">
                  <tr className="text-sm">
                    <th>Produit</th>
                    <th>Référence</th>
                    <th className="text-center">Qté</th>
                    <th className="text-center">Reçue</th>
                    <th className="text-right">Prix unit.</th>
                    <th className="text-center">Remise</th>
                    <th className="text-center">TVA</th>
                    <th className="text-right">Total HT</th>
                    <th className="text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.items?.map((item, idx) => (
                    <tr key={idx} className="hover">
                      <td className="font-medium">
                        {item.product_name}
                        {item.supplier_reference && (
                          <div className="text-xs text-base-content/50">Réf fourn: {item.supplier_reference}</div>
                        )}
                      </td>
                      <td className="text-xs font-mono">{item.product_reference || '-'}</td>
                      <td className="text-center">
                        <span className="badge badge-neutral">{item.quantity_ordered}</span>
                      </td>
                      <td className="text-center">{item.quantity_received || 0}</td>
                      <td className="text-right">{formatPrice(item.unit_price)}</td>
                      <td className="text-center">{item.discount_rate || 0}%</td>
                      <td className="text-center">{item.tax_rate || 20}%</td>
                      <td className="text-right">{formatPrice(item.subtotal)}</td>
                      <td className="text-right font-semibold text-primary">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr>
                    <td colSpan="7" className="text-right font-bold">Sous-total HT</td>
                    <td colSpan="2" className="text-right font-bold">{formatPrice(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="text-right font-bold">Total TVA</td>
                    <td colSpan="2" className="text-right font-bold text-info">{formatPrice(taxTotal)}</td>
                  </tr>
                  <tr className="border-t-2 border-primary/30 bg-primary/5">
                    <td colSpan="7" className="text-right font-bold text-lg">Total TTC</td>
                    <td colSpan="2" className="text-right font-bold text-primary text-xl">{formatPrice(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {(commande.notes || commande.internal_notes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {commande.notes && (
                <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                  <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{commande.notes}</p>
                </div>
              )}
              {commande.internal_notes && (
                <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                  <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes internes
                  </h3>
                  <p className="text-sm text-base-content/70 whitespace-pre-wrap">{commande.internal_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Métadonnées */}
          <div className="bg-base-200/50 rounded-xl p-4 border border-base-300 mt-6">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Métadonnées
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-base-content/50 block">Créée le</label>
                <p>{formatDateTime(commande.created_at)}</p>
              </div>
              <div>
                <label className="text-base-content/50 block">Modifiée le</label>
                <p>{formatDateTime(commande.updated_at)}</p>
              </div>
              <div>
                <label className="text-base-content/50 block">Créée par</label>
                <p>{commande.created_by?.email || 'Système'}</p>
              </div>
              {commande.validated_by && (
                <div>
                  <label className="text-base-content/50 block">Validée par</label>
                  <p>{commande.validated_by?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal changement de statut */}
      {openStatusDialog && newStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-slideDown">
            <div className={`p-6 text-center ${statusConfig[newStatus]?.bgColor || 'bg-primary/10'}`}>
              {React.createElement(statusConfig[newStatus]?.icon || CheckCircle, { 
                className: `h-12 w-12 mx-auto mb-2 ${statusConfig[newStatus]?.textColor || 'text-primary'}` 
              })}
              <h3 className="text-xl font-bold text-base-content">Changer le statut</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70 mb-4">Voulez-vous changer le statut de la commande ?</p>
              <p className="text-lg font-semibold flex items-center justify-center gap-2 flex-wrap">
                <span className={`badge ${statusInfo.bgColor} ${statusInfo.textColor} gap-1 py-2 px-3`}>
                  <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                </span>
                <span className="text-base-content/30">→</span>
                <span className={`badge ${statusConfig[newStatus]?.bgColor} ${statusConfig[newStatus]?.textColor} gap-1 py-2 px-3`}>
                  {React.createElement(statusConfig[newStatus]?.icon || CheckCircle, { className: "w-3 h-3" })} 
                  {statusConfig[newStatus]?.label}
                </span>
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-base-200 border-t border-base-300">
              <button 
                onClick={() => setOpenStatusDialog(false)} 
                className="btn btn-ghost flex-1"
                disabled={updating}
              >
                Annuler
              </button>
              <button 
                onClick={handleChangeStatus} 
                disabled={updating} 
                className="btn btn-primary flex-1 gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmer la suppression</h3>
            <p className="py-4">
              Voulez-vous vraiment supprimer cette commande ?
            </p>
            <p className="font-semibold text-error">
              "{commande.order_number}" - {formatPrice(grandTotal)}
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

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

export default CommandeFournisseurDetail;