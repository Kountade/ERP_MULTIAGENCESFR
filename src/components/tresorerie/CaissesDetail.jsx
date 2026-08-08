// src/components/tresorerie/CaissesDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Edit, Trash2, RefreshCw, AlertCircle, CheckCircle,
  Loader2, Coins, Wallet, User, Building2, DollarSign, Clock,
  Calendar, Shield, TrendingUp, TrendingDown, ArrowLeftRight,
  X, MoreVertical
} from 'lucide-react'

const CaissesDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [caisse, setCaisse] = useState(null)
  const [mouvements, setMouvements] = useState([])
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

      // Récupérer la caisse
      const caisseRes = await AxiosInstance.get(`/caisses/${id}/`)
      setCaisse(caisseRes.data)

      // Récupérer les mouvements de la caisse
      try {
        const mouvementsRes = await AxiosInstance.get(`/caisses/${id}/mouvements/`)
        setMouvements(mouvementsRes.data || [])
      } catch (e) {
        // Si l'endpoint n'existe pas, on essaie avec un filtre
        try {
          const allMouvements = await AxiosInstance.get('/mouvements/')
          const filtered = (allMouvements.data || []).filter(m => m.caisse === parseInt(id))
          setMouvements(filtered)
        } catch (err) {
          setMouvements([])
        }
      }

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

  const getTypeBadge = (type) => {
    const types = {
      principale: 'badge-primary',
      secondaire: 'badge-info',
      mobile: 'badge-warning',
      virtuelle: 'badge-secondary'
    }
    return <span className={`badge ${types[type] || 'badge-ghost'}`}>{type || 'Non défini'}</span>
  }

  const getStatusBadge = (isActive) => {
    if (isActive === undefined) return <span className="badge badge-ghost">Inconnu</span>
    return isActive ? (
      <span className="badge badge-success gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
    ) : (
      <span className="badge badge-ghost gap-1"><Clock className="w-3 h-3" /> Inactive</span>
    )
  }

  const getMouvementBadge = (type) => {
    if (type === 'encaissement') {
      return <span className="badge badge-success gap-1"><TrendingUp className="w-3 h-3" /> Encaissement</span>
    } else if (type === 'decaissement') {
      return <span className="badge badge-error gap-1"><TrendingDown className="w-3 h-3" /> Décaissement</span>
    } else if (type === 'transfert') {
      return <span className="badge badge-info gap-1"><ArrowLeftRight className="w-3 h-3" /> Transfert</span>
    }
    return <span className="badge badge-ghost">{type || 'Inconnu'}</span>
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

  if (error || !caisse) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur</h2>
          <p className="text-base-content/60 mb-4">{error || 'Caisse non trouvée'}</p>
          <button onClick={() => navigate('/caisses')} className="btn btn-primary gap-2">
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
            onClick={() => navigate('/caisses')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {caisse.nom || 'Caisse'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex flex-wrap items-center gap-2">
              {caisse.code && <span className="font-mono">{caisse.code}</span>}
              {caisse.code && <span className="w-px h-3 bg-base-300"></span>}
              {getTypeBadge(caisse.type_caisse)}
              {getStatusBadge(caisse.is_active)}
              {caisse.is_default && <span className="badge badge-primary">Par défaut</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1">
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>
          <Link to={`/caisses/${id}/edit`} className="btn btn-sm btn-primary gap-1">
            <Edit className="w-3 h-3" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Informations - Cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Solde actuel</p>
          <p className={`text-2xl font-bold ${(caisse.solde_actuel || 0) >= 0 ? 'text-success' : 'text-error'}`}>
            {formatMontant(caisse.solde_actuel)}
          </p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Solde initial</p>
          <p className="text-2xl font-bold">{formatMontant(caisse.solde_initial)}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Seuils</p>
          <p className="text-sm font-medium">
            Min: {formatMontant(caisse.seuil_min || 0)} | Max: {formatMontant(caisse.seuil_max || 0)}
          </p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Informations</p>
          <p className="text-sm">
            {caisse.responsable_nom ? `👤 ${caisse.responsable_nom}` : 'Aucun responsable'}
          </p>
          <p className="text-xs text-base-content/40">Créé le {formatDate(caisse.created_at)}</p>
        </div>
      </div>

      {/* Description */}
      {caisse.description && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-sm text-base-content/70">{caisse.description}</p>
        </div>
      )}

      {/* Mouvements */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📋 Mouvements récents</h2>
          <Link to="/mouvements" className="text-sm text-primary hover:underline">
            Voir tout →
          </Link>
        </div>

        {mouvements.length === 0 ? (
          <div className="text-center py-8 text-base-content/40">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucun mouvement pour cette caisse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th>Date</th>
                  <th>Type</th>
                  <th>Libellé</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.slice(0, 10).map((m, idx) => (
                  <tr key={idx} className="hover">
                    <td className="text-xs">{formatDate(m.date_mouvement)}</td>
                    <td>{getMouvementBadge(m.type_mouvement)}</td>
                    <td className="text-sm truncate max-w-[200px]">{m.libelle || '-'}</td>
                    <td className={`text-right font-mono text-sm ${m.type_mouvement === 'encaissement' ? 'text-success' : 'text-error'}`}>
                      {m.type_mouvement === 'encaissement' ? '+' : '-'}{formatMontant(m.montant)}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${m.status === 'effectue' ? 'badge-success' : m.status === 'planifie' ? 'badge-warning' : 'badge-ghost'}`}>
                        {m.status || 'Inconnu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaissesDetail