// src/pages/transferts/TransfertDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, CheckCircle, XCircle, Ban, Package,
  Building2, Calendar, FileText, AlertTriangle, Truck, Clock,
  RefreshCw, Rocket, PackageCheck
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'secondary', icon: Clock, actions: ['submit', 'cancel'] },
  pending_approval: { label: 'En attente d\'approbation', color: 'warning', icon: Send, actions: ['approve', 'reject', 'cancel'] },
  approved: { label: 'Approuvé', color: 'info', icon: CheckCircle, actions: ['start_transit', 'cancel'] },
  in_transit: { label: 'En transit', color: 'info', icon: Truck, actions: ['receive'] },
  partial: { label: 'Partiellement reçu', color: 'warning', icon: Clock, actions: ['receive'] },
  completed: { label: 'Terminé', color: 'success', icon: CheckCircle, actions: [] },
  rejected: { label: 'Rejeté', color: 'error', icon: XCircle, actions: [] },
  cancelled: { label: 'Annulé', color: 'neutral', icon: Ban, actions: [] }
};

const TransfertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [agenceCourante, setAgenceCourante] = useState(null);
  const [userRole, setUserRole] = useState('autre');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItems, setReceiveItems] = useState([]);

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem('User');
      const storedAgence = localStorage.getItem('AgenceCourante');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      
      if (storedAgence) {
        const parsed = JSON.parse(storedAgence);
        setAgenceCourante(parsed);
      }
    };
    
    loadUserData();
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get(`/transfers/${id}/`);
      console.log('📦 Transfert reçu:', res.data);
      setTransfer(res.data);
      
      // Initialiser les quantités à recevoir
      if (res.data.items) {
        setReceiveItems(res.data.items.map(item => ({
          item_id: item.id,
          product_name: item.product?.name || item.product_name,
          quantity_requested: item.quantity,
          quantity_received: item.quantity_received || 0,
          quantity_to_receive: 0,
          remaining: item.quantity - (item.quantity_received || 0)
        })));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur chargement du transfert');
      navigate('/transferts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!transfer) return null;
    const config = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    return (
      <span className={`badge badge-lg badge-${config.color} gap-2`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  // ============ PERMISSIONS ============
  
  // Vérifier si l'utilisateur est chef d'agence (générique)
  const isChefAgence = () => {
    if (!user) return false;
    if (user.role_global === 'pdg' || user.role_global === 'drh') return true;
    return user.roles_agence?.some(r => r.role === 'chef_agence' && r.est_actif);
  };

  // Vérifier si l'utilisateur est chef de l'agence source
  const isChefOfSource = () => {
    if (!transfer || !user) return false;
    if (user.role_global === 'pdg') return true;
    return user.roles_agence?.some(
      r => r.agence_id === transfer.from_agence?.id && 
           r.role === 'chef_agence' && 
           r.est_actif
    );
  };

  // Vérifier si l'utilisateur est chef de l'agence destination
  const isChefOfDestination = () => {
    if (!transfer || !user) return false;
    if (user.role_global === 'pdg') return true;
    return user.roles_agence?.some(
      r => r.agence_id === transfer.to_agence?.id && 
           r.role === 'chef_agence' && 
           r.est_actif
    );
  };

  // Actions disponibles
  const canSubmit = () => transfer?.status === 'draft' && isChefOfDestination();
  const canApprove = () => transfer?.status === 'pending_approval' && isChefOfSource();
  const canReject = () => transfer?.status === 'pending_approval' && isChefOfSource();
  const canStartTransit = () => transfer?.status === 'approved' && isChefOfSource();
  const canReceive = () => (transfer?.status === 'in_transit' || transfer?.status === 'partial') && isChefOfDestination();
  const canCancel = () => 
    (transfer?.status === 'draft' || transfer?.status === 'pending_approval' || transfer?.status === 'approved') && 
    (isChefOfSource() || isChefOfDestination() || user?.role_global === 'pdg');

  // ============ ACTIONS ============
  
  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/submit/`);
      if (res.status === 200) {
        fetchTransfer();
        alert('Demande soumise avec succès !');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/approve/`);
      if (res.status === 200) {
        fetchTransfer();
        alert('Transfert approuvé ! Le stock a été débloqué.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTransit = async () => {
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/start-transit/`);
      if (res.status === 200) {
        fetchTransfer();
        alert('Transfert marqué comme en transit.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Motif du rejet :');
    if (!reason && reason !== '') return;
    
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/reject/`, { reason });
      if (res.status === 200) {
        fetchTransfer();
        alert('Transfert rejeté.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Annuler ce transfert ?')) return;
    
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/cancel/`);
      if (res.status === 200) {
        fetchTransfer();
        alert('Transfert annulé.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    // Filtrer les articles à recevoir
    const itemsToReceive = receiveItems.filter(item => item.quantity_to_receive > 0);
    
    if (itemsToReceive.length === 0) {
      alert('Veuillez saisir les quantités reçues');
      return;
    }
    
    const waybill = prompt('Numéro de bon de livraison (optionnel) :', '');
    
    setActionLoading(true);
    try {
      const res = await AxiosInstance.post(`/transfers/${id}/receive/`, {
        items: itemsToReceive.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity_to_receive
        })),
        waybill: waybill || '',
        notes: `Réception partielle le ${new Date().toLocaleDateString('fr-FR')}`
      });
      
      if (res.status === 200) {
        fetchTransfer();
        setShowReceiveModal(false);
        alert('Réception enregistrée ! Le stock a été crédité.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Erreur lors de la réception');
    } finally {
      setActionLoading(false);
    }
  };

  const updateReceiveQuantity = (index, value) => {
    const newItems = [...receiveItems];
    const qty = parseInt(value) || 0;
    const maxQty = newItems[index].remaining;
    newItems[index].quantity_to_receive = Math.min(qty, maxQty);
    setReceiveItems(newItems);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
  
  if (!transfer) return (
    <div className="alert alert-error m-4">
      <AlertTriangle className="w-5 h-5" />
      Transfert introuvable
    </div>
  );

  return (
    <div className="w-full px-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/transferts')} className="btn btn-ghost btn-sm">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-mono">{transfer.reference}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-xs sm:text-sm text-base-content/60">
                Créé le {new Date(transfer.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
          
          {/* BOUTONS D'ACTION - WORKFLOW COMPLET */}
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchTransfer} className="btn btn-ghost btn-sm" title="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {canSubmit() && (
              <button 
                onClick={handleSubmit} 
                disabled={actionLoading} 
                className="btn btn-warning gap-2"
              >
                <Send className="w-4 h-4" /> Soumettre
              </button>
            )}
            
            {canApprove() && (
              <button 
                onClick={handleApprove} 
                disabled={actionLoading} 
                className="btn btn-success gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Approuver & Débloquer stock
              </button>
            )}
            
            {canStartTransit() && (
              <button 
                onClick={handleStartTransit} 
                disabled={actionLoading} 
                className="btn btn-info gap-2"
              >
                <Rocket className="w-4 h-4" /> Démarrer transit
              </button>
            )}
            
            {canReceive() && (
              <button 
                onClick={() => setShowReceiveModal(true)} 
                disabled={actionLoading} 
                className="btn btn-primary gap-2"
              >
                <PackageCheck className="w-4 h-4" /> Réceptionner
              </button>
            )}
            
            {canReject() && (
              <button 
                onClick={handleReject} 
                disabled={actionLoading} 
                className="btn btn-error gap-2"
              >
                <XCircle className="w-4 h-4" /> Rejeter
              </button>
            )}
            
            {canCancel() && (
              <button 
                onClick={handleCancel} 
                disabled={actionLoading} 
                className="btn btn-outline gap-2"
              >
                <Ban className="w-4 h-4" /> Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 sm:px-6 py-6">
        {/* Cartes info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card bg-base-100 shadow-md border-l-4 border-primary">
            <div className="card-body p-4">
              <h3 className="font-semibold text-primary">🏢 Agence source</h3>
              <p className="text-lg font-bold break-words">{transfer.from_agence?.nom}</p>
              <p className="text-sm text-base-content/60">
                Type: {transfer.from_agence?.type_agence === 'principale' ? '🏛️ Principale' : '🏪 Secondaire'}
                {isChefOfSource() && (
                  <span className="badge badge-primary badge-xs ml-2">Vous êtes le chef</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-md border-l-4 border-accent">
            <div className="card-body p-4">
              <h3 className="font-semibold text-accent">📍 Agence destination</h3>
              <p className="text-lg font-bold break-words">{transfer.to_agence?.nom}</p>
              <p className="text-sm text-base-content/60">
                Type: {transfer.to_agence?.type_agence === 'principale' ? '🏛️ Principale' : '🏪 Secondaire'}
                {isChefOfDestination() && (
                  <span className="badge badge-accent badge-xs ml-2">Vous êtes le chef</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Messages d'état */}
        {transfer.status === 'rejected' && transfer.rejected_reason && (
          <div className="alert alert-error mb-6 shadow-md">
            <XCircle className="w-5 h-5" />
            <div>
              <strong>Demande rejetée</strong><br />
              Motif : {transfer.rejected_reason}
            </div>
          </div>
        )}
        
        {transfer.status === 'approved' && (
          <div className="alert alert-success mb-6 shadow-md">
            <CheckCircle className="w-5 h-5" />
            <div>
              <strong>Transfert approuvé</strong><br />
              Le stock a été débloqué. Vous pouvez maintenant démarrer le transit.
            </div>
          </div>
        )}

        {/* Tableau des articles */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4">
            <h3 className="font-bold mb-3">📋 Articles du transfert</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Référence</th>
                    <th className="text-center">Qté demandée</th>
                    <th className="text-center">Qté reçue</th>
                    <th className="text-center">Reste</th>
                    <th className="text-right">Prix unitaire</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.items?.map((item, idx) => {
                    const received = item.quantity_received || 0;
                    const remaining = item.quantity - received;
                    return (
                      <tr key={idx}>
                        <td className="font-medium">{item.product?.name || item.product_name}</td>
                        <td className="font-mono text-sm">{item.product?.reference || '-'}</td>
                        <td className="text-center">
                          <span className="badge badge-primary badge-sm">{item.quantity}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-success badge-sm">{received}</span>
                        </td>
                        <td className="text-center">
                          {remaining > 0 ? (
                            <span className="badge badge-warning badge-sm">{remaining}</span>
                          ) : (
                            <span className="badge badge-neutral badge-sm">✓ Complet</span>
                          )}
                        </td>
                        <td className="text-right">{item.unit_price?.toLocaleString()} FCFA</td>
                        <td className="text-right font-semibold">
                          {(item.quantity * item.unit_price).toLocaleString()} FCFA
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Notes */}
        {transfer.notes && (
          <div className="card bg-base-100 shadow-md mt-4">
            <div className="card-body p-4">
              <h3 className="font-semibold">📝 Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{transfer.notes}</p>
            </div>
          </div>
        )}

        {/* Workflow steps */}
        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <h4 className="font-semibold mb-3">📊 Workflow du transfert</h4>
          <ul className="steps steps-vertical lg:steps-horizontal w-full">
            <li className={`step ${['draft', 'pending_approval', 'approved', 'in_transit', 'partial', 'completed'].includes(transfer.status) ? 'step-primary' : ''}`}>
              📝 Brouillon
            </li>
            <li className={`step ${['pending_approval', 'approved', 'in_transit', 'partial', 'completed'].includes(transfer.status) ? 'step-primary' : ''}`}>
              ⏳ En attente
            </li>
            <li className={`step ${['approved', 'in_transit', 'partial', 'completed'].includes(transfer.status) ? 'step-primary' : ''}`}>
              ✅ Approuvé
            </li>
            <li className={`step ${['in_transit', 'partial', 'completed'].includes(transfer.status) ? 'step-primary' : ''}`}>
              🚚 En transit
            </li>
            <li className={`step ${['partial', 'completed'].includes(transfer.status) ? 'step-primary' : ''}`}>
              📦 Réception partielle
            </li>
            <li className={`step ${transfer.status === 'completed' ? 'step-primary' : ''}`}>
              🎉 Terminé
            </li>
          </ul>
        </div>
      </div>

      {/* Modal de réception */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-primary to-primary-focus p-4 text-primary-content">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Réceptionner le transfert</h2>
                <button onClick={() => setShowReceiveModal(false)} className="btn btn-ghost btn-sm text-white">
                  ✕
                </button>
              </div>
              <p className="text-sm opacity-90">Saisissez les quantités reçues pour chaque article</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {receiveItems.map((item, idx) => (
                  <div key={idx} className="card bg-base-200">
                    <div className="card-body p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-xs text-base-content/60">
                            Demandé: {item.quantity_requested} | 
                            Déjà reçu: {item.quantity_received} | 
                            Reste: {item.remaining}
                          </p>
                        </div>
                        <div className="form-control w-32">
                          <label className="label p-0 pb-1">
                            <span className="label-text text-xs">À recevoir</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.remaining}
                            value={item.quantity_to_receive}
                            onChange={(e) => updateReceiveQuantity(idx, e.target.value)}
                            className="input input-bordered input-sm text-center"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-base-200 p-4 flex gap-3">
              <button onClick={handleReceive} className="btn btn-primary flex-1 gap-2" disabled={actionLoading}>
                {actionLoading ? <span className="loading loading-spinner loading-sm"></span> : <PackageCheck className="w-4 h-4" />}
                Valider la réception
              </button>
              <button onClick={() => setShowReceiveModal(false)} className="btn btn-outline">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfertDetail;