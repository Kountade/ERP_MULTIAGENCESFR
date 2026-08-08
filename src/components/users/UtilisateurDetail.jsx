// src/components/users/UtilisateurDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  User, Mail, Phone, MapPin, Calendar, Building2, Shield, 
  Edit, ArrowLeft, CheckCircle, XCircle, Briefcase, 
  CreditCard, IdCard, Store, Crown, AlertCircle, 
  UserCheck, UserX, Package, ShoppingCart, Clock, X,
  Users, HardDrive, Award, Sparkles, Trophy, RefreshCw
} from 'lucide-react';

const UtilisateurDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // Configuration des rôles
  const roleConfig = {
    pdg: { label: 'PDG', icon: Crown, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error', description: 'Accès total à toutes les agences' },
    drh: { label: 'DRH', icon: Shield, color: 'secondary', bgColor: 'bg-secondary/10', textColor: 'text-secondary', description: 'Gestion RH toutes agences' },
    chef_agence: { label: "Chef d'agence", icon: Store, color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary', description: 'Gestion complète de l\'agence' },
    gestionnaire_stock: { label: 'Gestionnaire stock', icon: HardDrive, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info', description: 'Gestion des stocks et logistique' },
    commercial: { label: 'Commercial', icon: ShoppingCart, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning', description: 'Force de vente' },
    autre: { label: 'Utilisateur', icon: User, color: 'neutral', bgColor: 'bg-base-200', textColor: 'text-base-content/70', description: 'Compte standard' }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Non renseigné';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non renseigné';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Non renseigné';
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(`/users/${id}/`);
      setUtilisateur(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      if (error.response?.status === 404) {
        setError('Utilisateur non trouvé');
      } else {
        setError('Erreur lors du chargement des données');
      }
      showNotification(error.message || 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleToggleStatus = async () => {
    if (!utilisateur) return;
    setStatusLoading(true);
    try {
      await AxiosInstance.patch(`/users/${utilisateur.id}/`, {
        is_active: !utilisateur.is_active
      });
      showNotification(`Utilisateur ${utilisateur.is_active ? 'désactivé' : 'activé'} avec succès`, 'success');
      fetchUserData();
      setOpenStatusDialog(false);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors de la modification du statut', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des informations...
          </p>
        </div>
      </div>
    );
  }

  if (error || !utilisateur) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">{error || 'Utilisateur non trouvé'}</h2>
          <p className="text-base-content/60 mb-4">L'utilisateur que vous recherchez n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate('/utilisateurs')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = roleConfig[utilisateur.role_global] || roleConfig.autre;
  const RoleIcon = roleInfo.icon;
  const nomComplet = `${utilisateur.first_name || ''} ${utilisateur.last_name || ''}`.trim() || utilisateur.email?.split('@')[0] || 'Utilisateur';

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
            {nomComplet}
          </h1>
          <p className="text-base text-base-content/60">
            {utilisateur.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchUserData} className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Link to="/utilisateurs" className="btn btn-outline gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <Link to={`/utilisateurs/${id}/edit`} className="btn btn-secondary gap-2">
            <Edit className="w-4 h-4" /> Modifier
          </Link>
          <button 
            onClick={() => setOpenStatusDialog(true)}
            className={`btn gap-2 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'} text-white`}
          >
            {utilisateur.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {utilisateur.is_active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Statistiques / Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-primary"><User className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Rôle</div>
          <div className="stat-value text-2xl font-black flex items-center gap-2">
            <span className={`badge ${roleInfo.bgColor} ${roleInfo.textColor} gap-1 py-2 px-3`}>
              <RoleIcon className="w-4 h-4" /> {roleInfo.label}
            </span>
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Statut</div>
          <div className="stat-value text-2xl font-black flex items-center gap-2">
            <span className={`badge ${utilisateur.is_active ? 'badge-success' : 'badge-error'} gap-1 py-2 px-3`}>
              {utilisateur.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {utilisateur.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-info"><Building2 className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Agences</div>
          <div className="stat-value text-2xl font-black">{utilisateur.roles_agence?.length || 0}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-warning"><Clock className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Dernière connexion</div>
          <div className="stat-value text-lg font-black truncate">
            {utilisateur.last_login ? formatDate(utilisateur.last_login) : 'Jamais'}
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne gauche - Informations personnelles (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Carte informations personnelles */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Prénom</label>
                    <p className="text-base-content font-medium">{utilisateur.first_name || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Nom</label>
                    <p className="text-base-content font-medium">{utilisateur.last_name || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Téléphone</label>
                    <p className="text-base-content">{utilisateur.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Email</label>
                    <p className="text-base-content">{utilisateur.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Matricule</label>
                    <p className="text-base-content">{utilisateur.employee_id || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              {/* Carte adresse */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Adresse</label>
                    <p className="text-base-content">{utilisateur.address || 'Non renseignée'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Ville</label>
                    <p className="text-base-content">{utilisateur.city || 'Non renseignée'}</p>
                  </div>
                </div>
              </div>

              {/* Carte informations professionnelles */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informations professionnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Date d'embauche</label>
                    <p className="text-base-content">{formatDate(utilisateur.hire_date)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Type de contrat</label>
                    <p className="text-base-content">{utilisateur.contract_type || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Rôles et métadonnées (1/3) */}
            <div className="space-y-6">
              
              {/* Carte rôle global */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rôle global
                </h2>
                <div className={`p-4 rounded-xl ${roleInfo.bgColor} border border-${roleInfo.color}/20`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${roleInfo.color}/20`}>
                      <RoleIcon className={`h-6 w-6 ${roleInfo.textColor}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${roleInfo.textColor}`}>{roleInfo.label}</p>
                      <p className="text-xs text-base-content/50">{roleInfo.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte rôles par agence */}
              {utilisateur.roles_agence && utilisateur.roles_agence.length > 0 && (
                <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Rôles par agence
                    <span className="badge badge-primary badge-sm">{utilisateur.roles_agence.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {utilisateur.roles_agence.map((role, idx) => {
                      const roleInfoAgence = roleConfig[role.role] || roleConfig.autre;
                      const RoleAgenceIcon = roleInfoAgence.icon;
                      return (
                        <div key={idx} className={`p-3 rounded-lg ${roleInfoAgence.bgColor} border border-${roleInfoAgence.color}/20`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg bg-${roleInfoAgence.color}/20`}>
                              <RoleAgenceIcon className={`h-4 w-4 ${roleInfoAgence.textColor}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${roleInfoAgence.textColor}`}>{role.role_display}</p>
                              <p className="text-xs text-base-content/60">{role.agence_nom}</p>
                              <p className="text-xs text-base-content/40 mt-1">Attribué le {formatDate(role.date_attribution)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Carte métadonnées */}
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Métadonnées
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Date de création</label>
                    <p className="text-sm text-base-content">{formatDateTime(utilisateur.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Dernière modification</label>
                    <p className="text-sm text-base-content">{formatDateTime(utilisateur.updated_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Dernière connexion</label>
                    <p className="text-sm text-base-content">{formatDateTime(utilisateur.last_login)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-base-200/50 border-t border-base-300">
          <Link to="/utilisateurs" className="btn btn-ghost gap-2">
            Retour à la liste
          </Link>
          <Link to={`/utilisateurs/${id}/edit`} className="btn btn-secondary gap-2">
            <Edit className="w-4 h-4" /> Modifier
          </Link>
          <button 
            onClick={() => setOpenStatusDialog(true)}
            className={`btn gap-2 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'} text-white`}
          >
            {utilisateur.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {utilisateur.is_active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Modal confirmation changement de statut */}
      {openStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-slideDown">
            <div className={`p-6 text-center ${utilisateur.is_active ? 'bg-warning/10' : 'bg-success/10'}`}>
              {utilisateur.is_active ? (
                <UserX className="h-12 w-12 text-warning mx-auto mb-2" />
              ) : (
                <UserCheck className="h-12 w-12 text-success mx-auto mb-2" />
              )}
              <h3 className="text-xl font-bold text-base-content">
                {utilisateur.is_active ? 'Désactiver' : 'Activer'} l'utilisateur
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70">
                Êtes-vous sûr de vouloir {utilisateur.is_active ? 'désactiver' : 'activer'} l'utilisateur 
                <strong className={utilisateur.is_active ? 'text-warning' : 'text-success'}>
                  " {nomComplet} "
                </strong>
                ?
              </p>
              <p className="text-sm text-base-content/50 mt-2">
                {utilisateur.is_active 
                  ? 'L\'utilisateur ne pourra plus se connecter.' 
                  : 'L\'utilisateur pourra à nouveau se connecter.'}
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-base-200 border-t border-base-300">
              <button onClick={() => setOpenStatusDialog(false)} className="btn btn-ghost flex-1">
                Annuler
              </button>
              <button 
                onClick={handleToggleStatus} 
                disabled={statusLoading}
                className={`btn flex-1 gap-2 ${utilisateur.is_active ? 'btn-warning' : 'btn-success'} text-white`}
              >
                {statusLoading ? <span className="loading loading-spinner loading-sm"></span> : (utilisateur.is_active ? 'Désactiver' : 'Activer')}
              </button>
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

export default UtilisateurDetail;