// src/pages/transferts/Transferts.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Eye, CheckCircle, XCircle, Send, Truck, Ban, AlertCircle,
  Package, ArrowLeftRight, Clock, Filter, Search, RefreshCw, FileText
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';
import TransfertPdf from './TransfertPdf';

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'secondary', icon: Clock },
  pending_approval: { label: 'En attente', color: 'warning', icon: Send },
  approved: { label: 'Approuvé', color: 'info', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'error', icon: XCircle },
  in_transit: { label: 'En transit', color: 'info', icon: Truck },
  partial: { label: 'Partiellement reçu', color: 'warning', icon: Clock },
  completed: { label: 'Terminé', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'neutral', icon: Ban }
};

const Transferts = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [agences, setAgences] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userAgencesIds, setUserAgencesIds] = useState([]);

  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('User');
      const user = userData ? JSON.parse(userData) : null;
      const agenceCourante = JSON.parse(localStorage.getItem('AgenceCourante') || '{}');
      
      let role = 'autre';
      let agencesAccessibles = [];
      
      if (user?.role_global === 'pdg') {
        role = 'pdg';
      } else if (user?.role_global === 'drh') {
        role = 'drh';
      } else if (user?.roles_agence) {
        agencesAccessibles = user.roles_agence
          .filter(r => r.est_actif)
          .map(r => r.agence_id);
        
        const currentRole = user.roles_agence.find(
          r => r.agence_id === agenceCourante.id && r.est_actif
        );
        if (currentRole) {
          role = currentRole.role;
        }
      }
      
      return { user, role, agencesAccessibles, agenceCourante };
    } catch {
      return { user: null, role: 'autre', agencesAccessibles: [], agenceCourante: {} };
    }
  };

  const downloadPDF = async (transfer) => {
    setDownloadingId(transfer.id);
    try {
      const response = await AxiosInstance.get(`/transfers/${transfer.id}/`);
      const fullTransfer = response.data;
      await TransfertPdf(fullTransfer);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      let url = '/transfers/';
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await AxiosInstance.get(url);
      
      setTransfers(res.data);
    } catch (error) {
      console.error('Erreur chargement transferts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgences = async () => {
    try {
      const res = await AxiosInstance.get('agences/');
      setAgences(res.data);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
    }
  };

  useEffect(() => {
    const { role, agencesAccessibles } = getUserInfo();
    setUserRole(role);
    setUserAgencesIds(agencesAccessibles);
    
    fetchTransfers();
    fetchAgences();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({ status: '', search: '' });
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    return (
      <span className={`badge badge-${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const canSubmit = (transfer) => {
    const { agenceCourante, role } = getUserInfo();
    if (transfer.status !== 'draft') return false;
    const isDestinationChef = transfer.to_agence?.id === agenceCourante?.id && (role === 'chef_agence');
    if (role === 'pdg' || role === 'drh') return false;
    return isDestinationChef;
  };

  const canApprove = (transfer) => {
    const { agenceCourante, role } = getUserInfo();
    if (transfer.status !== 'pending_approval') return false;
    if (role === 'pdg') return true;
    const isSourceChef = transfer.from_agence?.id === agenceCourante?.id && (role === 'chef_agence');
    return isSourceChef;
  };

  const canReject = (transfer) => canApprove(transfer);

  const canCancel = (transfer) => {
    const { agenceCourante, role } = getUserInfo();
    if (transfer.status !== 'draft' && transfer.status !== 'pending_approval') return false;
    if (role === 'pdg') return true;
    const isSourceOrDestination = (transfer.from_agence?.id === agenceCourante?.id || transfer.to_agence?.id === agenceCourante?.id) && (role === 'chef_agence');
    return isSourceOrDestination;
  };

  const handleAction = async (id, action) => {
    try {
      let res;
      switch (action) {
        case 'submit':
          res = await AxiosInstance.post(`/transfers/${id}/submit/`);
          break;
        case 'approve':
          res = await AxiosInstance.post(`/transfers/${id}/approve/`);
          break;
        case 'reject':
          const reason = prompt('Motif du rejet :');
          if (!reason && reason !== '') return;
          res = await AxiosInstance.post(`/transfers/${id}/reject/`, { reason });
          break;
        case 'cancel':
          if (!window.confirm('Annuler ce transfert ?')) return;
          res = await AxiosInstance.post(`/transfers/${id}/cancel/`);
          break;
        default:
          return;
      }
      if (res.status === 200 || res.status === 201) {
        fetchTransfers();
      }
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      alert(error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  const { agenceCourante } = getUserInfo();

  // Fonction pour obtenir le type d'agence avec icône
  const getAgenceTypeLabel = (agence) => {
    if (!agence) return { text: 'N/A', icon: '❓' };
    if (agence.type_agence === 'principale') {
      return { text: 'Principale', icon: '🏛️' };
    }
    if (agence.type_agence === 'secondaire') {
      return { text: 'Secondaire', icon: '🏪' };
    }
    return { text: agence.type_agence || 'N/A', icon: '📌' };
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-primary" />
            Transferts entre entrepôts
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez les demandes de transfert de stock
          </p>
          {agenceCourante?.nom && (
            <div className="mt-2 text-xs text-base-content/50">
              Agence courante : <span className="font-semibold text-primary">{agenceCourante.nom}</span>
              {userRole === 'chef_agence' && ' (Chef d\'agence)'}
              {userRole === 'pdg' && ' (PDG - Accès total)'}
              {userRole === 'drh' && ' (DRH)'}
            </div>
          )}
        </div>
        <Link to="/transferts/nouveau" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Nouveau transfert
        </Link>
      </div>

      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-base-content/60" />
              <span className="font-medium">Filtres</span>
              <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm btn-ghost">
                {showFilters ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchTransfers} className="btn btn-sm btn-outline gap-1">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              {(filters.status || filters.search) && (
                <button onClick={resetFilters} className="btn btn-sm btn-ghost">
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Statut</span>
                </label>
                <select name="status" className="select select-bordered" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Tous</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Recherche</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Référence, produit..."
                    className="input input-bordered w-full pl-9"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        <table className="table table-zebra">
          <thead>
            <tr className="bg-base-200">
              <th>Référence</th>
              <th>Statut</th>
              <th>AGENCE SOURCE</th>
              <th>AGENCE DESTINATION</th>
              <th>Nb articles</th>
              <th>Date création</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="7" className="text-center py-8">
                <span className="loading loading-spinner loading-md"></span>
                Chargement...
               </td></tr>
            )}
            {!loading && transfers.length === 0 && (
              <tr><td colSpan="7" className="text-center py-8 text-base-content/50">
                Aucun transfert trouvé
               </td></tr>
            )}
            {!loading && transfers.map((transfer) => {
              const showSubmit = canSubmit(transfer);
              const showApprove = canApprove(transfer);
              const showReject = canReject(transfer);
              const showCancel = canCancel(transfer);
              
              const sourceType = getAgenceTypeLabel(transfer.from_agence);
              const destType = getAgenceTypeLabel(transfer.to_agence);
              
              return (
                <tr key={transfer.id} className="hover">
                  <td className="font-mono text-sm font-medium">{transfer.reference}</td>
                  <td>{getStatusBadge(transfer.status)}</td>
                  
                  {/* AGENCE SOURCE */}
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-primary">{transfer.from_agence_nom}</span>
                      <span className="text-xs text-base-content/50">
                        {sourceType.icon} {sourceType.text}
                      </span>
                    </div>
                  </td>
                  
                  {/* AGENCE DESTINATION */}
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-accent">{transfer.to_agence_nom}</span>
                      <span className="text-xs text-base-content/50">
                        {destType.icon} {destType.text}
                      </span>
                    </div>
                  </td>
                  
                  <td className="text-center">
                    <span className="badge badge-neutral">{transfer.items_count || 0}</span>
                  </td>
                  
                  <td className="text-sm">{new Date(transfer.created_at).toLocaleDateString('fr-FR')}</td>
                  
                  <td>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <Link to={`/transferts/${transfer.id}`} className="btn btn-xs btn-ghost" title="Voir détails">
                        <Eye className="w-3 h-3" />
                      </Link>
                      
                      <button 
                        onClick={() => downloadPDF(transfer)} 
                        className="btn btn-xs btn-ghost text-info" 
                        title="Télécharger PDF"
                        disabled={downloadingId === transfer.id}
                      >
                        {downloadingId === transfer.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                      </button>
                      
                      {showSubmit && (
                        <button 
                          onClick={() => handleAction(transfer.id, 'submit')} 
                          className="btn btn-xs btn-warning gap-1"
                          title="Soumettre la demande"
                        >
                          <Send className="w-3 h-3" /> Soumettre
                        </button>
                      )}
                      
                      {showApprove && (
                        <button 
                          onClick={() => handleAction(transfer.id, 'approve')} 
                          className="btn btn-xs btn-success gap-1"
                          title="Approuver le transfert"
                        >
                          <CheckCircle className="w-3 h-3" /> Approuver
                        </button>
                      )}
                      
                      {showReject && (
                        <button 
                          onClick={() => handleAction(transfer.id, 'reject')} 
                          className="btn btn-xs btn-error gap-1"
                          title="Rejeter la demande"
                        >
                          <XCircle className="w-3 h-3" /> Rejeter
                        </button>
                      )}
                      
                      {showCancel && (
                        <button 
                          onClick={() => handleAction(transfer.id, 'cancel')} 
                          className="btn btn-xs btn-outline gap-1"
                          title="Annuler le transfert"
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 p-3 bg-base-200 rounded-lg text-xs text-base-content/60">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-info" /> PDF : Télécharger le document</span>
          <span className="flex items-center gap-1"><Send className="w-3 h-3 text-warning" /> Soumettre : Chef agence destination</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" /> Approuver : Chef agence source ou PDG</span>
          <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-error" /> Rejeter : Chef agence source ou PDG</span>
          <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> Annuler : Chef source/destination ou PDG</span>
        </div>
      </div>
    </div>
  );
};

export default Transferts;