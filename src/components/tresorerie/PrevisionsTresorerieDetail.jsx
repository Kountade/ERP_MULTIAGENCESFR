// src/components/tresorerie/PrevisionsTresorerieDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Edit, Trash2, RefreshCw, AlertCircle, CheckCircle,
  Loader2, TrendingUp, TrendingDown, Calendar, DollarSign, User,
  Building2, FileText, X, MoreVertical, Clock, Target, PieChart,
  BarChart3, Activity, ArrowUpRight, ArrowDownLeft, AlertTriangle,
  Check, Gauge, Percent
} from 'lucide-react'

const PrevisionsTresorerieDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [prevision, setPrevision] = useState(null)
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

      const response = await AxiosInstance.get(`/previsions/${id}/`)
      setPrevision(response.data)

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
      await AxiosInstance.patch(`/previsions/${id}/`, { statut: 'valide' })
      showNotification('Prévision validée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  const getTypeBadge = (type) => {
    if (type === 'entree') {
      return <span className="badge badge-success badge-lg gap-2"><TrendingUp className="w-4 h-4" /> Entrée</span>
    } else if (type === 'sortie') {
      return <span className="badge badge-error badge-lg gap-2"><TrendingDown className="w-4 h-4" /> Sortie</span>
    }
    return <span className="badge badge-ghost badge-lg">{type || 'Inconnu'}</span>
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-lg">Brouillon</span>,
      en_cours: <span className="badge badge-warning badge-lg gap-2"><Clock className="w-4 h-4" /> En cours</span>,
      valide: <span className="badge badge-info badge-lg gap-2"><CheckCircle className="w-4 h-4" /> Validée</span>,
      realise: <span className="badge badge-success badge-lg gap-2"><CheckCircle className="w-4 h-4" /> Réalisée</span>,
      annule: <span className="badge badge-ghost badge-lg gap-2"><X className="w-4 h-4" /> Annulée</span>,
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
    if (ecart > 0) return 'text-success'
    if (ecart < 0) return 'text-error'
    return 'text-base-content/40'
  }

  const getEcartIcon = (ecart) => {
    if (!ecart && ecart !== 0) return null
    if (ecart > 0) return <ArrowUpRight className="w-5 h-5" />
    if (ecart < 0) return <ArrowDownLeft className="w-5 h-5" />
    return null
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

  if (error || !prevision) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur</h2>
          <p className="text-base-content/60 mb-4">{error || 'Prévision non trouvée'}</p>
          <button onClick={() => navigate('/previsions')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

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
            onClick={() => navigate('/previsions')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {prevision.reference || 'Prévision'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex flex-wrap items-center gap-2">
              {prevision.titre}
              <span className="w-px h-3 bg-base-300"></span>
              {getTypeBadge(prevision.type_prevision)}
              {getStatusBadge(prevision.statut)}
              {prevision.probabilite && (
                <span className="badge badge-ghost gap-1">
                  <Percent className="w-3 h-3" />
                  {prevision.probabilite}%
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1">
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>
          {prevision.statut === 'brouillon' && (
            <button onClick={handleValider} className="btn btn-sm btn-info gap-1">
              <CheckCircle className="w-3 h-3" />
              Valider
            </button>
          )}
          <Link to={`/previsions/${id}/edit`} className="btn btn-sm btn-primary gap-1">
            <Edit className="w-3 h-3" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Informations - Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Montant prévu</p>
          <p className="text-2xl font-bold text-primary">{formatMontant(prevision.montant_prevu)}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Montant réel</p>
          <p className="text-2xl font-bold text-info">{prevision.montant_reel > 0 ? formatMontant(prevision.montant_reel) : 'Non défini'}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Écart</p>
          <div className={`flex items-center gap-2 text-2xl font-bold ${getEcartColor(prevision.ecart)}`}>
            {getEcartIcon(prevision.ecart)}
            {formatMontant(prevision.ecart)}
          </div>
          {prevision.pourcentage_ecart !== 0 && (
            <p className="text-xs text-base-content/40">
              {prevision.pourcentage_ecart > 0 ? '+' : ''}{prevision.pourcentage_ecart.toFixed(2)}%
            </p>
          )}
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Période</p>
          <p className="text-lg font-medium">
            {formatDate(prevision.date_debut)} → {formatDate(prevision.date_fin)}
          </p>
          <p className="text-xs text-base-content/40">{prevision.periode || 'Non spécifiée'}</p>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colonne gauche */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-3">📋 Informations générales</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Référence</span>
              <span className="text-sm font-mono font-medium">{prevision.reference || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Titre</span>
              <span className="text-sm font-medium">{prevision.titre || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Agence</span>
              <span className="text-sm">{prevision.agence_nom || 'Non spécifiée'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Type</span>
              <span>{getTypeBadge(prevision.type_prevision)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Statut</span>
              <span>{getStatusBadge(prevision.statut)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-base-content/60">Date de création</span>
              <span className="text-sm">{formatDate(prevision.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-3">📂 Catégorisation</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Catégorie</span>
              <span className="text-sm font-medium">{prevision.categorie || 'Non définie'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Sous-catégorie</span>
              <span className="text-sm">{prevision.sous_categorie || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Type de source</span>
              <span className="text-sm">{prevision.source_type || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">ID source</span>
              <span className="text-sm font-mono">{prevision.source_id || '-'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-base-content/60">Probabilité</span>
              <span className="text-sm font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                {prevision.probabilite || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Écart */}
      {prevision.ecart !== 0 && (
        <div className={`rounded-xl border p-4 ${prevision.ecart > 0 ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`}>
          <div className="flex items-center gap-3">
            {prevision.ecart > 0 ? (
              <ArrowUpRight className="w-6 h-6 text-success" />
            ) : (
              <ArrowDownLeft className="w-6 h-6 text-error" />
            )}
            <div>
              <p className={`font-bold ${prevision.ecart > 0 ? 'text-success' : 'text-error'}`}>
                Écart de {prevision.ecart > 0 ? '+' : ''}{formatMontant(prevision.ecart)}
              </p>
              <p className="text-sm text-base-content/60">
                {prevision.ecart > 0 ? 'Le montant réel est supérieur au prévu' : 'Le montant réel est inférieur au prévu'}
                {prevision.pourcentage_ecart !== 0 && ` (${prevision.pourcentage_ecart > 0 ? '+' : ''}${prevision.pourcentage_ecart.toFixed(2)}%)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {prevision.notes && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-2">📝 Notes</h3>
          <p className="text-sm text-base-content/70">{prevision.notes}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        {prevision.statut === 'brouillon' && (
          <button onClick={handleValider} className="btn btn-info gap-2">
            <CheckCircle className="w-4 h-4" />
            Valider la prévision
          </button>
        )}
        <Link to={`/previsions/${id}/edit`} className="btn btn-primary gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
      </div>
    </div>
  )
}

export default PrevisionsTresorerieDetail