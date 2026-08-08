// src/components/comptabilite/FactureComptableDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Receipt,
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
  Wallet,
  Banknote,
  AlertTriangle,
  Info,
  User,
  Building,
  Hash,
  Tag,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Send,
  CheckSquare,
  X,
  Plus
} from 'lucide-react'

const FactureComptableDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [facture, setFacture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [paiementData, setPaiementData] = useState({
    montant: '',
    mode_reglement: 'virement',
    reference_externe: '',
    notes: ''
  })

  const typeConfig = {
    client: { label: 'Client', color: 'success', icon: Users },
    fournisseur: { label: 'Fournisseur', color: 'warning', icon: Truck }
  }

  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'neutral', icon: FileText },
    envoyee: { label: 'Envoyée', color: 'info', icon: Send },
    recue: { label: 'Reçue', color: 'info', icon: Download },
    payee: { label: 'Payée', color: 'success', icon: CheckCircle },
    partielle: { label: 'Partiellement payée', color: 'warning', icon: CreditCard },
    impayee: { label: 'Impayée', color: 'error', icon: AlertTriangle },
    annulee: { label: 'Annulée', color: 'neutral', icon: XCircle }
  }

  const modeReglementOptions = [
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'virement', label: 'Virement' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'autre', label: 'Autre' }
  ]

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

      // Récupérer la facture
      let response
      try {
        response = await AxiosInstance.get(`/factures-comptables/${id}/`)
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get(`/comptabilite/factures-comptables/${id}/`)
        } else {
          throw err
        }
      }
      
      setFacture(response.data)

    } catch (error) {
      console.error('❌ Erreur chargement facture:', error)
      setError('Erreur de chargement de la facture')
      showNotification('Erreur de chargement de la facture', 'error')
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

  const handlePaiement = async (e) => {
    e.preventDefault()
    if (!paiementData.montant || parseFloat(paiementData.montant) <= 0) {
      showNotification('Le montant est requis et doit être supérieur à 0', 'error')
      return
    }

    if (parseFloat(paiementData.montant) > facture.montant_restant) {
      showNotification(`Le montant dépasse le restant dû (${formatCurrency(facture.montant_restant)})`, 'error')
      return
    }

    try {
      await AxiosInstance.post(`/reglements/`, {
        type_reglement: facture.type_facture,
        agence: facture.agence,
        client: facture.client,
        fournisseur: facture.fournisseur,
        facture: facture.id,
        montant: parseFloat(paiementData.montant),
        mode_reglement: paiementData.mode_reglement,
        date_reglement: new Date().toISOString().split('T')[0],
        reference_externe: paiementData.reference_externe,
        notes: paiementData.notes
      })

      showNotification('Paiement enregistré avec succès', 'success')
      setShowPaiementModal(false)
      setPaiementData({ montant: '', mode_reglement: 'virement', reference_externe: '', notes: '' })
      fetchData()
    } catch (error) {
      console.error('Erreur paiement:', error)
      showNotification('Erreur lors de l\'enregistrement du paiement', 'error')
    }
  }

  const handleAnnulerFacture = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler cette facture ?')) return

    try {
      await AxiosInstance.post(`/factures-comptables/${id}/annuler/`, {
        motif: 'Annulation manuelle'
      })
      showNotification('Facture annulée avec succès', 'success')
      fetchData()
    } catch (error) {
      console.error('Erreur annulation:', error)
      showNotification('Erreur lors de l\'annulation', 'error')
    }
  }

  const handleEnvoyerFacture = async () => {
    try {
      await AxiosInstance.post(`/factures-comptables/${id}/envoyer/`)
      showNotification('Facture envoyée avec succès', 'success')
      fetchData()
    } catch (error) {
      console.error('Erreur envoi:', error)
      showNotification('Erreur lors de l\'envoi', 'error')
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

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.client
    return (
      <span className={`badge badge-${config.color} gap-1 text-sm border-0 px-4 py-2`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.brouillon
    const Icon = config.icon
    return (
      <span className={`badge badge-${config.color} gap-1 text-sm border-0 px-4 py-2`}>
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
            Chargement de la facture...
          </p>
        </div>
      </div>
    )
  }

  if (error || !facture) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Facture non trouvée'}</p>
          <button onClick={() => navigate('/factures-comptables')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const isPayee = facture.status === 'payee'
  const isAnnulee = facture.status === 'annulee'
  const isBrouillon = facture.status === 'brouillon'

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
            onClick={() => navigate('/factures-comptables')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {facture.reference}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-2 flex-wrap">
              <span>{getTypeBadge(facture.type_facture)}</span>
              <span className="w-px h-4 bg-base-300"></span>
              <span>{formatDate(facture.date_facture)}</span>
              <span className="w-px h-4 bg-base-300"></span>
              {getStatusBadge(facture.status)}
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
          {!isPayee && !isAnnulee && (
            <>
              <button 
                onClick={() => navigate(`/factures-comptables/${id}/modifier`)}
                className="btn btn-sm sm:btn-md btn-primary gap-1"
                disabled={isBrouillon ? false : true}
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Modifier</span>
              </button>
              <button 
                onClick={() => setShowPaiementModal(true)}
                className="btn btn-sm sm:btn-md btn-success gap-1"
                disabled={facture.montant_restant <= 0}
              >
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Paiement</span>
              </button>
              <button 
                onClick={handleAnnulerFacture}
                className="btn btn-sm sm:btn-md btn-error gap-1"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Annuler</span>
              </button>
            </>
          )}
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
            {facture.type_facture === 'client' ? 'Client' : 'Fournisseur'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {facture.type_facture === 'client' ? (
                <Users className="w-5 h-5 text-primary" />
              ) : (
                <Truck className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg">
                {facture.client_nom || facture.fournisseur_nom || '-'}
              </p>
              <p className="text-sm text-base-content/60">
                {facture.type_facture === 'client' ? 'Client' : 'Fournisseur'}
              </p>
            </div>
          </div>
        </div>

        {/* Carte Montants */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Montants</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className="text-xs text-base-content/40">HT</p>
              <p className="font-bold text-sm">{formatCurrency(facture.montant_ht)}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">TVA</p>
              <p className="font-bold text-sm">{formatCurrency(facture.montant_tva)}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">TTC</p>
              <p className="font-bold text-lg text-primary">{formatCurrency(facture.montant_ttc)}</p>
            </div>
          </div>
        </div>

        {/* Carte Statut Paiement */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Paiement</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-base-content/60">Payé</span>
              <span className="font-bold text-success">{formatCurrency(facture.montant_paye)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-base-content/60">Restant</span>
              <span className={`font-bold ${facture.montant_restant > 0 ? 'text-error' : 'text-success'}`}>
                {formatCurrency(facture.montant_restant)}
              </span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${facture.montant_restant > 0 ? 'bg-error' : 'bg-success'}`}
                style={{ width: `${facture.pourcentage_paye || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-base-content/40 text-right">
              {(facture.pourcentage_paye || 0).toFixed(0)}% payé
            </p>
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-base-content/60">Référence</p>
              <p className="font-mono text-sm text-primary">{facture.reference}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Date facture</p>
              <p className="font-medium">{formatDate(facture.date_facture)}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Date échéance</p>
              <p className={`font-medium ${new Date(facture.date_echeance) < new Date() && !isPayee ? 'text-error' : ''}`}>
                {formatDate(facture.date_echeance)}
                {new Date(facture.date_echeance) < new Date() && !isPayee && (
                  <span className="ml-2 badge badge-error badge-xs">En retard</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-base-content/60">Agence</p>
              <p className="font-medium">{facture.agence_nom || '-'}</p>
            </div>
          </div>

          {facture.notes && (
            <div className="mt-4 pt-4 border-t border-base-200">
              <p className="text-xs text-base-content/60">Notes</p>
              <p className="text-sm mt-1">{facture.notes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-base-200 flex flex-wrap gap-4 text-xs text-base-content/40">
            <span>Créé le {formatDate(facture.created_at)}</span>
            {facture.updated_at && facture.updated_at !== facture.created_at && (
              <span>Modifié le {formatDate(facture.updated_at)}</span>
            )}
            {facture.created_by_email && (
              <span>Par {facture.created_by_email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        {!isPayee && !isAnnulee && facture.status !== 'envoyee' && (
          <button 
            onClick={handleEnvoyerFacture}
            className="btn btn-info gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer la facture
          </button>
        )}
        {facture.reglements && facture.reglements.length > 0 && (
          <button 
            onClick={() => navigate(`/reglements?facture=${facture.id}`)}
            className="btn btn-ghost gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir les règlements
          </button>
        )}
      </div>

      {/* Modal Paiement */}
      {showPaiementModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-success" />
                Enregistrer un paiement
              </h3>
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowPaiementModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-base-200/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Facture</span>
                <span className="font-mono">{facture.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Restant dû</span>
                <span className="font-bold text-error">{formatCurrency(facture.montant_restant)}</span>
              </div>
            </div>

            <form onSubmit={handlePaiement}>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Montant</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={facture.montant_restant}
                    placeholder="0.00"
                    value={paiementData.montant}
                    onChange={(e) => setPaiementData(prev => ({ ...prev, montant: e.target.value }))}
                    className="input input-bordered w-full focus:input-primary"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Mode de paiement</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <select
                    value={paiementData.mode_reglement}
                    onChange={(e) => setPaiementData(prev => ({ ...prev, mode_reglement: e.target.value }))}
                    className="select select-bordered w-full focus:select-primary"
                    required
                  >
                    {modeReglementOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Référence externe</span>
                  </label>
                  <input
                    type="text"
                    placeholder="N° de chèque, de virement, etc."
                    value={paiementData.reference_externe}
                    onChange={(e) => setPaiementData(prev => ({ ...prev, reference_externe: e.target.value }))}
                    className="input input-bordered w-full focus:input-primary"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Notes</span>
                  </label>
                  <textarea
                    placeholder="Informations complémentaires..."
                    value={paiementData.notes}
                    onChange={(e) => setPaiementData(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea textarea-bordered w-full h-20 focus:textarea-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowPaiementModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-success flex-1 gap-2"
                  disabled={!paiementData.montant || parseFloat(paiementData.montant) <= 0}
                >
                  <CheckCircle className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
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

export default FactureComptableDetail