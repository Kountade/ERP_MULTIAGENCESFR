// src/components/tresorerie/FraisTresorerieDetail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Edit, Trash2, RefreshCw, AlertCircle, CheckCircle,
  Loader2, Receipt, DollarSign, Clock, Calendar, User, Building2,
  FileText, X, MoreVertical, Truck, Utensils, Briefcase, Phone,
  Home, BookOpen, Award, Shield, Wrench, Coffee, Plane,
  GraduationCap, Stethoscope, Landmark, ShoppingBag, Smartphone,
  CreditCard, Banknote, Check
} from 'lucide-react'

const FraisTresorerieDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [frais, setFrais] = useState(null)
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

      const response = await AxiosInstance.get(`/frais/${id}/`)
      setFrais(response.data)

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
      await AxiosInstance.post(`/frais/${id}/valider/`)
      showNotification('Frais validé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  // ✅ PAYER
  const handlePayer = async () => {
    try {
      await AxiosInstance.post(`/frais/${id}/payer/`)
      showNotification('Frais payé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors du paiement', 'error')
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      transport: <Truck className="w-6 h-6" />,
      restauration: <Utensils className="w-6 h-6" />,
      fournitures: <Briefcase className="w-6 h-6" />,
      communication: <Phone className="w-6 h-6" />,
      entretien: <Wrench className="w-6 h-6" />,
      formation: <GraduationCap className="w-6 h-6" />,
      mission: <Plane className="w-6 h-6" />,
      representations: <Coffee className="w-6 h-6" />,
      assurances: <Shield className="w-6 h-6" />,
      impots: <Landmark className="w-6 h-6" />,
      loyer: <Home className="w-6 h-6" />,
      services: <ShoppingBag className="w-6 h-6" />,
      autre: <FileText className="w-6 h-6" />
    }
    return icons[category] || <FileText className="w-6 h-6" />
  }

  const getCategoryBadge = (category) => {
    const categories = {
      transport: 'badge-info',
      restauration: 'badge-warning',
      fournitures: 'badge-primary',
      communication: 'badge-secondary',
      entretien: 'badge-neutral',
      formation: 'badge-accent',
      mission: 'badge-info',
      representations: 'badge-warning',
      assurances: 'badge-success',
      impots: 'badge-error',
      loyer: 'badge-primary',
      services: 'badge-secondary',
      autre: 'badge-ghost'
    }
    return <span className={`badge ${categories[category] || 'badge-ghost'} badge-lg gap-2`}>{category || 'Autre'}</span>
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-lg">Brouillon</span>,
      en_attente: <span className="badge badge-warning badge-lg gap-2"><Clock className="w-4 h-4" /> En attente</span>,
      valide: <span className="badge badge-info badge-lg gap-2"><CheckCircle className="w-4 h-4" /> Validé</span>,
      paye: <span className="badge badge-success badge-lg gap-2"><CheckCircle className="w-4 h-4" /> Payé</span>,
      refuse: <span className="badge badge-error badge-lg gap-2"><X className="w-4 h-4" /> Refusé</span>,
      annule: <span className="badge badge-ghost badge-lg gap-2"><X className="w-4 h-4" /> Annulé</span>
    }
    return statusMap[status] || <span className="badge badge-ghost badge-lg">{status || 'Inconnu'}</span>
  }

  const getModePaiementIcon = (mode) => {
    const icons = {
      especes: <Banknote className="w-5 h-5" />,
      carte: <CreditCard className="w-5 h-5" />,
      cheque: <FileText className="w-5 h-5" />,
      virement: <ArrowLeft className="w-5 h-5" />,
      mobile_money: <Smartphone className="w-5 h-5" />
    }
    return icons[mode] || <Banknote className="w-5 h-5" />
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

  if (error || !frais) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur</h2>
          <p className="text-base-content/60 mb-4">{error || 'Frais non trouvé'}</p>
          <button onClick={() => navigate('/frais')} className="btn btn-primary gap-2">
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
            onClick={() => navigate('/frais')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {frais.reference || 'Frais'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex flex-wrap items-center gap-2">
              {frais.titre}
              <span className="w-px h-3 bg-base-300"></span>
              {getCategoryBadge(frais.categorie)}
              {getStatusBadge(frais.status)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1">
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>
          {frais.status === 'en_attente' && (
            <button onClick={handleValider} className="btn btn-sm btn-info gap-1">
              <CheckCircle className="w-3 h-3" />
              Valider
            </button>
          )}
          {frais.status === 'valide' && (
            <button onClick={handlePayer} className="btn btn-sm btn-success gap-1">
              <DollarSign className="w-3 h-3" />
              Payer
            </button>
          )}
          <Link to={`/frais/${id}/edit`} className="btn btn-sm btn-primary gap-1">
            <Edit className="w-3 h-3" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Informations - Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Montant</p>
          <p className="text-2xl font-bold text-success">{formatMontant(frais.montant)}</p>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Catégorie</p>
          <div className="flex items-center gap-2 mt-1">
            {getCategoryIcon(frais.categorie)}
            <span className="text-lg font-medium">{frais.categorie || 'Non définie'}</span>
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Date du frais</p>
          <p className="text-lg font-medium">{formatDate(frais.date_frais)}</p>
          {frais.date_paiement && (
            <p className="text-xs text-base-content/40">Payé le: {formatDate(frais.date_paiement)}</p>
          )}
        </div>
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60">Bénéficiaire</p>
          <div className="flex items-center gap-2 mt-1">
            <User className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium">{frais.beneficiaire || 'Non spécifié'}</span>
          </div>
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
              <span className="text-sm font-mono font-medium">{frais.reference || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Titre</span>
              <span className="text-sm font-medium">{frais.titre || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Agence</span>
              <span className="text-sm">{frais.agence_nom || 'Non spécifiée'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Statut</span>
              <span>{getStatusBadge(frais.status)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-base-content/60">Date de création</span>
              <span className="text-sm">{formatDate(frais.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-3">💳 Informations de paiement</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Mode de paiement</span>
              <span className="text-sm font-medium flex items-center gap-2">
                {getModePaiementIcon(frais.mode_paiement)}
                {frais.mode_paiement || 'Non spécifié'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-base-200">
              <span className="text-sm text-base-content/60">Pièce justificative</span>
              <span className="text-sm font-mono">{frais.piece_justificative || '-'}</span>
            </div>
            {frais.mouvement && (
              <div className="flex justify-between py-1 border-b border-base-200">
                <span className="text-sm text-base-content/60">Mouvement associé</span>
                <span className="text-sm font-mono text-primary">
                  <Link to={`/mouvements/${frais.mouvement}`} className="hover:underline">
                    #{frais.mouvement}
                  </Link>
                </span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-sm text-base-content/60">Validé par</span>
              <span className="text-sm">{frais.valide_par_email || 'En attente'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {frais.notes && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-base-content/60 mb-2">📝 Notes</h3>
          <p className="text-sm text-base-content/70">{frais.notes}</p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        {frais.status === 'en_attente' && (
          <button onClick={handleValider} className="btn btn-info gap-2">
            <CheckCircle className="w-4 h-4" />
            Valider le frais
          </button>
        )}
        {frais.status === 'valide' && (
          <button onClick={handlePayer} className="btn btn-success gap-2">
            <DollarSign className="w-4 h-4" />
            Payer le frais
          </button>
        )}
        <Link to={`/frais/${id}/edit`} className="btn btn-primary gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
      </div>
    </div>
  )
}

export default FraisTresorerieDetail