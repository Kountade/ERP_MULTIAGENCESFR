// src/components/achats/PaiementsFournisseurDetail.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Banknote,
  Landmark,
  Wallet,
  Download,
  Printer,
  Trash2,
  Edit,
  RefreshCw,
  Clock,
  User,
  Hash,
  Check,
  XCircle,
  Eye,
  FileCheck
} from 'lucide-react'

const PaiementsFournisseurDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [paiement, setPaiement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Configuration des méthodes de paiement
  const methodConfig = {
    cash: { label: 'Espèces', color: 'success', icon: Banknote },
    bank_transfer: { label: 'Virement bancaire', color: 'primary', icon: Landmark },
    check: { label: 'Chèque', color: 'warning', icon: FileText },
    card: { label: 'Carte bancaire', color: 'info', icon: CreditCard },
    mobile_money: { label: 'Mobile Money', color: 'secondary', icon: Wallet },
    other: { label: 'Autre', color: 'neutral', icon: CreditCard }
  }

  const statusConfig = {
    pending: { label: 'En attente', color: 'warning', icon: Clock },
    processing: { label: 'En cours', color: 'info', icon: Loader2 },
    completed: { label: 'Terminé', color: 'success', icon: CheckCircle },
    failed: { label: 'Échoué', color: 'error', icon: AlertCircle },
    cancelled: { label: 'Annulé', color: 'error', icon: XCircle }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
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

  const getMethodBadge = (method) => {
    const config = methodConfig[method] || methodConfig.other
    const Icon = config.icon
    return (
      <div className={`badge badge-${config.color} gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <div className={`badge badge-${config.color} gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    )
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  // Charger le paiement
  const fetchPayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setError('Veuillez vous connecter')
        setLoading(false)
        return
      }

      const response = await AxiosInstance.get(`/paiement-fournisseur/${id}/`)
      setPaiement(response.data)

    } catch (error) {
      console.error('Erreur chargement paiement:', error)
      setError('Erreur de chargement du paiement')
      showNotification('Erreur de chargement du paiement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayment()
  }, [id])

  // Supprimer le paiement
  const handleDelete = async () => {
    try {
      await AxiosInstance.delete(`/paiement-fournisseur/${id}/`)
      showNotification('Paiement supprimé avec succès', 'success')
      setTimeout(() => navigate('/paiements-fournisseurs'), 1500)
    } catch (error) {
      console.error('Erreur suppression:', error)
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setShowDeleteModal(false)
    }
  }

  // Imprimer le reçu
  const handlePrint = () => {
    window.print()
  }

  // Télécharger le reçu
  const handleDownload = async () => {
    try {
      showNotification('Reçu téléchargé avec succès', 'success')
    } catch (error) {
      showNotification('Erreur lors du téléchargement', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du paiement...
          </p>
        </div>
      </div>
    )
  }

  if (error || !paiement) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Paiement non trouvé'}</p>
          <button onClick={fetchPayment} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const canDelete = paiement.status === 'pending' || paiement.status === 'processing'
  const canEdit = paiement.status !== 'completed' && paiement.status !== 'cancelled'

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
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            💳 Détail du paiement
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            {paiement.payment_number} - {formatDate(paiement.payment_date)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/paiements-fournisseurs" className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Retour
          </Link>
          <button
            onClick={handlePrint}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" /> Imprimer
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2 text-info"
            disabled={paiement.status !== 'completed'}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" /> Reçu
          </button>
          {canEdit && (
            <Link
              to={`/paiements-fournisseurs/${id}/edit`}
              className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" /> Modifier
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-sm sm:btn-md btn-error gap-1 sm:gap-2"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Carte résumé */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold">{paiement.payment_number}</h2>
                {getStatusBadge(paiement.status)}
              </div>
              {paiement.reference_number && (
                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                  Réf: {paiement.reference_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-base-content/60">Montant</p>
              <p className="text-2xl sm:text-3xl font-bold text-success">
                {formatCurrency(paiement.amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-base-200 bg-gray-50">
              <h3 className="font-semibold text-base-content flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Informations générales
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-base-content/40">N° Paiement</p>
                  <p className="font-mono font-medium text-sm">{paiement.payment_number}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/40">Méthode</p>
                  <div className="mt-1">{getMethodBadge(paiement.payment_method)}</div>
                </div>
                <div>
                  <p className="text-xs text-base-content/40">Date de paiement</p>
                  <p className="font-medium text-sm">{formatDate(paiement.payment_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/40">N° Référence</p>
                  <p className="font-medium text-sm">{paiement.reference_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/40">Créé par</p>
                  <p className="font-medium text-sm">{paiement.created_by?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/40">Créé le</p>
                  <p className="font-medium text-sm">{formatDateTime(paiement.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Destination du paiement */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-base-200 bg-gray-50">
              <h3 className="font-semibold text-base-content flex items-center gap-2 text-sm sm:text-base">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                Destination du paiement
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              {paiement.caisse ? (
                <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
                  <div className="p-2 bg-success/10 rounded-full">
                    <Banknote className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40">Caisse</p>
                    <p className="font-medium">{paiement.caisse.nom}</p>
                    <p className="text-sm text-success">
                      Solde: {formatCurrency(paiement.caisse.solde_actuel)}
                    </p>
                  </div>
                </div>
              ) : paiement.compte_bancaire ? (
                <div className="flex items-center gap-3 p-3 bg-info/5 rounded-lg border border-info/20">
                  <div className="p-2 bg-info/10 rounded-full">
                    <Landmark className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40">Compte bancaire</p>
                    <p className="font-medium">{paiement.compte_bancaire.nom}</p>
                    <p className="text-sm text-info">
                      Solde: {formatCurrency(paiement.compte_bancaire.solde)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-base-content/60 text-sm">Aucune destination spécifiée</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {paiement.notes && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-base-200 bg-gray-50">
                <h3 className="font-semibold text-base-content flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Notes
                </h3>
              </div>
              <div className="p-3 sm:p-4">
                <p className="whitespace-pre-wrap text-sm">{paiement.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Facture associée */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Facture associée */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-base-200 bg-gray-50">
              <h3 className="font-semibold text-base-content flex items-center gap-2 text-sm sm:text-base">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Facture associée
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              {paiement.invoice ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-base-content/40">N° Facture</p>
                    <Link 
                      to={`/factures-fournisseurs/${paiement.invoice.id}`}
                      className="font-mono font-bold text-primary hover:underline text-sm"
                    >
                      {paiement.invoice.invoice_number}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40">Fournisseur</p>
                    <p className="font-medium text-sm">{paiement.invoice.supplier?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/40">Agence</p>
                    <p className="font-medium text-sm">{paiement.invoice.agence?.nom}</p>
                  </div>
                  <div className="border-t border-base-200 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-xs text-base-content/40">Total facture</span>
                      <span className="font-medium">{formatCurrency(paiement.invoice.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-xs text-base-content/40">Déjà payé</span>
                      <span className="font-medium text-success">{formatCurrency(paiement.invoice.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-xs text-base-content/40">Reste à payer</span>
                      <span className="text-error">{formatCurrency(paiement.invoice.amount_remaining)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-success rounded-full h-2 transition-all"
                        style={{ 
                          width: `${Math.min((paiement.invoice.amount_paid / paiement.invoice.total) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-base-content/40 text-center mt-1">
                      {Math.round((paiement.invoice.amount_paid / paiement.invoice.total) * 100)}% payé
                    </p>
                  </div>
                  <Link
                    to={`/factures-fournisseurs/${paiement.invoice.id}`}
                    className="btn btn-outline btn-sm w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir la facture
                  </Link>
                </div>
              ) : (
                <p className="text-base-content/60 text-sm">Aucune facture associée</p>
              )}
            </div>
          </div>

          {/* Agence */}
          {paiement.agence && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-base-200 bg-gray-50">
                <h3 className="font-semibold text-base-content flex items-center gap-2 text-sm sm:text-base">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Agence
                </h3>
              </div>
              <div className="p-3 sm:p-4">
                <p className="font-medium">{paiement.agence.nom}</p>
                <p className="text-sm text-base-content/60">{paiement.agence.ville}</p>
                <p className="text-sm text-base-content/60">{paiement.agence.adresse}</p>
              </div>
            </div>
          )}
        </div>
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
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer le paiement ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{paiement.payment_number}"
              </p>
              <p className="text-xs text-base-content/50 mt-2">
                Montant: {formatCurrency(paiement.amount)}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                Cette action est irréversible.
              </p>
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
                onClick={handleDelete}
              >
                Supprimer
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
  )
}

export default PaiementsFournisseurDetail