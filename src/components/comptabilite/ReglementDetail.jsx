// src/components/comptabilite/ReglementDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wallet,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Download,
  Printer,
  Edit,
  Trash2,
  Users,
  Truck,
  CreditCard,
  Banknote,
  Landmark,
  PiggyBank,
  MoreVertical,
  Info,
  User,
  Building,
  Hash,
  Tag,
  Eye,
  ChevronDown,
  ChevronUp,
  Receipt,
  Link,
  ExternalLink
} from 'lucide-react'

const ReglementDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [reglement, setReglement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const typeConfig = {
    client: { label: 'Client', color: 'success', icon: Users },
    fournisseur: { label: 'Fournisseur', color: 'warning', icon: Truck }
  }

  const modeConfig = {
    especes: { label: 'Espèces', color: 'neutral', icon: Banknote },
    carte: { label: 'Carte bancaire', color: 'info', icon: CreditCard },
    cheque: { label: 'Chèque', color: 'warning', icon: FileText },
    virement: { label: 'Virement', color: 'primary', icon: Landmark },
    mobile_money: { label: 'Mobile Money', color: 'secondary', icon: PiggyBank },
    autre: { label: 'Autre', color: 'neutral', icon: MoreVertical }
  }

  const modeColors = {
    especes: 'badge-neutral',
    carte: 'badge-info',
    cheque: 'badge-warning',
    virement: 'badge-primary',
    mobile_money: 'badge-secondary',
    autre: 'badge-neutral'
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setError('Veuillez vous connecter')
        setLoading(false)
        return
      }

      // Récupérer le règlement
      let response
      try {
        response = await AxiosInstance.get(`/reglements/${id}/`)
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get(`/comptabilite/reglements/${id}/`)
        } else {
          throw err
        }
      }
      
      setReglement(response.data)

    } catch (error) {
      console.error('❌ Erreur chargement règlement:', error)
      setError('Erreur de chargement du règlement')
      showNotification('Erreur de chargement du règlement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleDeleteReglement = async () => {
    try {
      await AxiosInstance.delete(`/reglements/${id}/`)
      showNotification('Règlement supprimé avec succès', 'success')
      setTimeout(() => {
        navigate('/reglements')
      }, 1000)
    } catch (error) {
      console.error('Erreur suppression:', error)
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.client
    return (
      <span className={`badge badge-${config.color} gap-1 text-sm border-0 px-4 py-2`}>
        {config.label}
      </span>
    )
  }

  const getModeBadge = (mode) => {
    const config = modeConfig[mode] || modeConfig.autre
    const Icon = config.icon
    return (
      <span className={`badge ${modeColors[mode] || 'badge-ghost'} gap-1 text-sm border-0 px-4 py-2`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du règlement...
          </p>
        </div>
      </div>
    )
  }

  if (error || !reglement) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Règlement non trouvé'}</p>
          <button onClick={() => navigate('/reglements')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/reglements')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {reglement.reference}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-2 flex-wrap">
              <span>{getTypeBadge(reglement.type_reglement)}</span>
              <span className="w-px h-4 bg-base-300"></span>
              <span>{formatDate(reglement.date_reglement)}</span>
              <span className="w-px h-4 bg-base-300"></span>
              {getModeBadge(reglement.mode_reglement)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate(`/reglements/${id}/modifier`)}
            className="btn btn-sm sm:btn-md btn-primary gap-1"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Modifier</span>
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-sm sm:btn-md btn-error gap-1"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Supprimer</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            className="btn btn-sm sm:btn-md btn-info gap-1"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carte Client/Fournisseur */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">
            {reglement.type_reglement === 'client' ? 'Client' : 'Fournisseur'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {reglement.type_reglement === 'client' ? (
                <Users className="w-5 h-5 text-primary" />
              ) : (
                <Truck className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg">
                {reglement.client_nom || reglement.fournisseur_nom || '-'}
              </p>
              <p className="text-sm text-base-content/60">
                {reglement.type_reglement === 'client' ? 'Client' : 'Fournisseur'}
              </p>
            </div>
          </div>
        </div>

        {/* Carte Montant */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Montant</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-primary">{formatCurrency(reglement.montant)}</p>
            <p className="text-sm text-base-content/60">
              Règlement du {formatDate(reglement.date_reglement)}
            </p>
          </div>
        </div>

        {/* Carte Mode */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Mode de paiement</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {(() => {
                const mode = modeConfig[reglement.mode_reglement] || modeConfig.autre
                const Icon = mode.icon
                return <Icon className="w-5 h-5 text-primary" />
              })()}
            </div>
            <div>
              <p className="font-bold text-lg">
                {modeConfig[reglement.mode_reglement]?.label || reglement.mode_reglement}
              </p>
              {reglement.reference_externe && (
                <p className="text-sm text-base-content/60">
                  Réf: {reglement.reference_externe}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-base-content/60">Référence</p>
              <p className="font-mono text-sm text-primary">{reglement.reference}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Date de règlement</p>
              <p className="font-medium">{formatDate(reglement.date_reglement)}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Type</p>
              <p>{typeConfig[reglement.type_reglement]?.label || reglement.type_reglement}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Mode</p>
              <p>{modeConfig[reglement.mode_reglement]?.label || reglement.mode_reglement}</p>
            </div>
          </div>

          {reglement.reference_externe && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <p className="text-xs text-base-content/60">Référence externe</p>
              <p className="font-medium text-sm">{reglement.reference_externe}</p>
            </div>
          )}

          {reglement.notes && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <p className="text-xs text-base-content/60">Notes</p>
              <p className="text-sm mt-1">{reglement.notes}</p>
            </div>
          )}

          {reglement.facture && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <p className="text-xs text-base-content/60">Facture associée</p>
              <div className="flex items-center gap-2 mt-1">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">{reglement.facture_reference}</span>
                <button
                  onClick={() => navigate(`/factures-comptables/${reglement.facture}`)}
                  className="btn btn-ghost btn-xs text-info gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir la facture
                </button>
              </div>
            </div>
          )}

          {reglement.rapproche && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Rapproché bancaire</span>
                <span className="text-xs text-base-content/40">
                  le {formatDate(reglement.date_rapprochement)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-base-200 flex flex-wrap gap-4 text-xs text-base-content/40">
            <span>Créé le {formatDateTime(reglement.created_at)}</span>
            {reglement.updated_at && reglement.updated_at !== reglement.created_at && (
              <span>Modifié le {formatDateTime(reglement.updated_at)}</span>
            )}
            {reglement.created_by_email && (
              <span>Par {reglement.created_by_email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        {reglement.facture && (
          <button 
            onClick={() => navigate(`/factures-comptables/${reglement.facture}`)}
            className="btn btn-outline gap-2"
          >
            <Receipt className="w-4 h-4" />
            Voir la facture associée
          </button>
        )}
        {reglement.type_reglement === 'client' && reglement.client && (
          <button 
            onClick={() => navigate(`/clients/${reglement.client}`)}
            className="btn btn-outline gap-2"
          >
            <Users className="w-4 h-4" />
            Voir le client
          </button>
        )}
        {reglement.type_reglement === 'fournisseur' && reglement.fournisseur && (
          <button 
            onClick={() => navigate(`/fournisseurs/${reglement.fournisseur}`)}
            className="btn btn-outline gap-2"
          >
            <Truck className="w-4 h-4" />
            Voir le fournisseur
          </button>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce règlement ?</p>
              <p className="text-base font-bold text-error mt-2">"{reglement.reference}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1" 
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1" 
                onClick={handleDeleteReglement}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ReglementDetail