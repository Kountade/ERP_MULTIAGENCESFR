// src/components/tresorerie/RapprochementsDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Edit, Trash2, RefreshCw, AlertCircle, CheckCircle,
  Loader2, PiggyBank, Building2, DollarSign, Clock, Calendar,
  User, Building, FileText, X, MoreVertical, Scale, Banknote,
  CreditCard, Smartphone, Check, AlertTriangle, TrendingUp,
  TrendingDown, ArrowLeftRight, Printer, Download
} from 'lucide-react'

const RapprochementsDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [rapprochement, setRapprochement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
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

      const response = await AxiosInstance.get(`/rapprochements/${id}/`)
      setRapprochement(response.data)

    } catch (error) {
      console.error('❌ Erreur chargement:', error)
      setError('Erreur de chargement des données')
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  // ✅ VALIDER
  const handleValider = async () => {
    try {
      await AxiosInstance.post(`/rapprochements/${id}/valider/`)
      showNotification('Rapprochement validé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-lg">Brouillon</span>,
      en_cours: <span className="badge badge-warning badge-lg gap-2"><Clock className="w-4 h-4" /> En cours</span>,
      partiel: <span className="badge badge-info badge-lg gap-2"><AlertTriangle className="w-4 h-4" /> Partiel</span>,
      complete: <span className="badge badge-success badge-lg gap-2"><CheckCircle className="w-4 h-4" /> Complet</span>,
      ecart: <span className="badge badge-error badge-lg gap-2"><AlertTriangle className="w-4 h-4" /> Écart</span>
    }
    return statusMap[status] || <span className="badge badge-ghost badge-lg">{status || 'Inconnu'}</span>
  }

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const getEcartColor = (ecart) => {
    if (!ecart && ecart !== 0) return 'text-base-content/40'
    if (Math.abs(ecart) < 1) return 'text-success'
    if (ecart > 0) return 'text-error'
    return 'text-warning'
  }

  const getEcartIcon = (ecart) => {
    if (!ecart && ecart !== 0) return null
    if (Math.abs(ecart) < 1) return <CheckCircle className="w-5 h-5 text-success" />
    if (ecart > 0) return <TrendingUp className="w-5 h-5 text-error" />
    return <TrendingDown className="w-5 h-5 text-warning" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des détails...
          </p>
        </div>
      </div>
    )
  }

  if (error || !rapprochement) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur</h2>
          <p className="text-base-content/60 mb-4">{error || 'Rapprochement non trouvé'}</p>
          <button onClick={() => navigate('/rapprochements')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const isRapproche = Math.abs(rapprochement.ecart || 0) < 1

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="font-semibold">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/rapprochements')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {rapprochement.reference || 'Rapprochement'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex flex-wrap items-center gap-2">
              <span>{rapprochement.compte_bancaire?.banque || 'Compte bancaire'}</span>
              <span className="w-px h-3 bg-base-300"></span>
              {getStatusBadge(rapprochement.status)}
              {isRapproche ? (
                <span className="badge badge-success gap-1"><CheckCircle className="w-3 h-3" /> Rapproché</span>
              ) : (
                <span className="badge badge-error gap-1"><AlertTriangle className="w-3 h-3" /> Non rapproché</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1">
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>
          <button className="btn btn-sm btn-outline gap-1">
            <Printer className="w-3 h-3" />
            Imprimer
          </button>
          <button className="btn btn-sm btn-outline gap-1">
            <Download className="w-3 h-3" />
            Exporter
          </button>
          {rapprochement.status !== 'complete' && (
            <button onClick={handleValider} className="btn btn-sm btn-success gap-1">
              <CheckCircle className="w-3 h-3" />
              Valider
            </button>
          )}
          <Link to={`/rapprochements/${id}/edit`} className="btn btn-sm btn-primary gap-1">
            <Edit className="w-3 h-3" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Informations - Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Solde comptable</p>
          <p className="text-2xl font-bold text-primary">{formatMontant(rapprochement.solde_comptable)}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Solde bancaire</p>
          <p className="text-2xl font-bold text-secondary">{formatMontant(rapprochement.solde_bancaire)}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Écart</p>
          <div className={`flex items-center gap-2 text-2xl font-bold ${getEcartColor(rapprochement.ecart)}`}>
            {getEcartIcon(rapprochement.ecart)}
            {rapprochement.ecart >= 0 ? '+' : ''}{formatMontant(rapprochement.ecart)}
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Solde rapproché</p>
          <p className={`text-2xl font-bold ${isRapproche ? 'text-success' : 'text-warning'}`}>
            {formatMontant(rapprochement.solde_rapproche)}
          </p>
        </div>
      </div>

      {/* Détails du rapprochement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colonne gauche */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-3">📋 Informations générales</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Référence</span>
              <span className="text-sm font-mono font-medium">{rapprochement.reference || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Agence</span>
              <span className="text-sm">{rapprochement.agence_nom || 'Non spécifiée'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Compte bancaire</span>
              <span className="text-sm font-medium">
                {rapprochement.compte_bancaire?.nom || '-'}
                <span className="text-xs text-base-content/40 block">
                  {rapprochement.compte_bancaire?.banque} - {rapprochement.compte_bancaire?.numero_compte}
                </span>
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Période</span>
              <span className="text-sm">
                {formatDate(rapprochement.date_debut)} → {formatDate(rapprochement.date_fin)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Statut</span>
              <span>{getStatusBadge(rapprochement.status)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-base-content/60">Date de création</span>
              <span className="text-sm">{formatDate(rapprochement.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Colonne droite - Éléments de rapprochement */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-3">📊 Éléments de rapprochement</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">En-cours d'émission</span>
              <span className="text-sm font-mono text-warning">
                -{formatMontant(rapprochement.encours_emission)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">En-cours d'encaissement</span>
              <span className="text-sm font-mono text-success">
                +{formatMontant(rapprochement.encours_encaissement)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Commissions bancaires</span>
              <span className="text-sm font-mono text-error">
                -{formatMontant(rapprochement.commissions)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Autres écarts</span>
              <span className={`text-sm font-mono ${rapprochement.autres_ecarts >= 0 ? 'text-warning' : 'text-info'}`}>
                {rapprochement.autres_ecarts >= 0 ? '+' : ''}{formatMontant(rapprochement.autres_ecarts)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t-2 border-base-300 mt-2 pt-2">
              <span className="text-sm font-semibold">Total ajustements</span>
              <span className={`text-sm font-bold ${isRapproche ? 'text-success' : 'text-warning'}`}>
                {formatMontant(rapprochement.solde_rapproche - rapprochement.solde_comptable)}
              </span>
            </div>
            <div className="flex justify-between py-1 bg-base-200 rounded-lg px-2">
              <span className="text-sm font-bold text-primary">Solde rapproché</span>
              <span className={`text-sm font-bold ${isRapproche ? 'text-success' : 'text-warning'}`}>
                {formatMontant(rapprochement.solde_rapproche)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statut de rapprochement */}
      <div className={`rounded-xl border p-4 ${isRapproche ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}>
        <div className="flex items-center gap-3">
          {isRapproche ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-error" />
          )}
          <div>
            <p className={`font-bold ${isRapproche ? 'text-success' : 'text-error'}`}>
              {isRapproche ? '✅ Rapprochement bancaire effectué avec succès' : '⚠️ Écart détecté dans le rapprochement'}
            </p>
            <p className="text-sm text-base-content/60">
              {isRapproche 
                ? 'Les soldes comptable et bancaire correspondent parfaitement.'
                : `Un écart de ${formatMontant(rapprochement.ecart)} a été détecté entre les soldes.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {rapprochement.notes && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-2">📝 Notes</h3>
          <p className="text-sm text-base-content/70">{rapprochement.notes}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        {rapprochement.status !== 'complete' && (
          <button onClick={handleValider} className="btn btn-success gap-2">
            <CheckCircle className="w-4 h-4" />
            Valider le rapprochement
          </button>
        )}
        <Link to={`/rapprochements/${id}/edit`} className="btn btn-primary gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
        <button className="btn btn-outline gap-2">
          <Printer className="w-4 h-4" />
          Imprimer
        </button>
        <button className="btn btn-outline gap-2">
          <Download className="w-4 h-4" />
          Exporter PDF
        </button>
      </div>
    </div>
  )
}

export default RapprochementsDetail