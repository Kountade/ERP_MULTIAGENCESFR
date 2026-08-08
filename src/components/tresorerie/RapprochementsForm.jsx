// src/components/tresorerie/RapprochementsForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  PiggyBank, Building2, DollarSign, Calendar, User, Building,
  FileText, Scale, Banknote, CreditCard, Smartphone, Check,
  AlertTriangle, TrendingUp, TrendingDown, ArrowLeftRight
} from 'lucide-react'

const RapprochementsForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [agences, setAgences] = useState([])
  const [comptesBancaires, setComptesBancaires] = useState([])

  const [formData, setFormData] = useState({
    reference: '',
    agence: '',
    compte_bancaire: '',
    date_debut: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    solde_comptable: '',
    solde_bancaire: '',
    status: 'brouillon',
    encours_emission: 0,
    encours_encaissement: 0,
    commissions: 0,
    autres_ecarts: 0,
    notes: ''
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Charger les agences
        const agencesRes = await AxiosInstance.get('/agences/')
        setAgences(agencesRes.data || [])

        // Charger les comptes bancaires
        const comptesRes = await AxiosInstance.get('/comptes-bancaires/')
        setComptesBancaires(comptesRes.data || [])

        // Si édition, charger les données du rapprochement
        if (isEdit) {
          const rapprochementRes = await AxiosInstance.get(`/rapprochements/${id}/`)
          const data = rapprochementRes.data
          setFormData({
            reference: data.reference || '',
            agence: data.agence || '',
            compte_bancaire: data.compte_bancaire || '',
            date_debut: data.date_debut || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            date_fin: data.date_fin || new Date().toISOString().split('T')[0],
            solde_comptable: data.solde_comptable || '',
            solde_bancaire: data.solde_bancaire || '',
            status: data.status || 'brouillon',
            encours_emission: data.encours_emission || 0,
            encours_encaissement: data.encours_encaissement || 0,
            commissions: data.commissions || 0,
            autres_ecarts: data.autres_ecarts || 0,
            notes: data.notes || ''
          })
        }
      } catch (error) {
        console.error('Erreur chargement:', error)
        setError('Erreur de chargement des données')
        showNotification('Erreur de chargement des données', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validation
      if (!formData.agence) {
        setError('L\'agence est requise')
        setSaving(false)
        return
      }
      if (!formData.compte_bancaire) {
        setError('Le compte bancaire est requis')
        setSaving(false)
        return
      }
      if (!formData.date_debut) {
        setError('La date de début est requise')
        setSaving(false)
        return
      }
      if (!formData.date_fin) {
        setError('La date de fin est requise')
        setSaving(false)
        return
      }
      if (!formData.solde_comptable || parseFloat(formData.solde_comptable) < 0) {
        setError('Le solde comptable est requis et doit être positif')
        setSaving(false)
        return
      }
      if (!formData.solde_bancaire || parseFloat(formData.solde_bancaire) < 0) {
        setError('Le solde bancaire est requis et doit être positif')
        setSaving(false)
        return
      }
      if (new Date(formData.date_debut) > new Date(formData.date_fin)) {
        setError('La date de début doit être antérieure à la date de fin')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        solde_comptable: parseFloat(formData.solde_comptable) || 0,
        solde_bancaire: parseFloat(formData.solde_bancaire) || 0,
        encours_emission: parseFloat(formData.encours_emission) || 0,
        encours_encaissement: parseFloat(formData.encours_encaissement) || 0,
        commissions: parseFloat(formData.commissions) || 0,
        autres_ecarts: parseFloat(formData.autres_ecarts) || 0,
        agence: parseInt(formData.agence),
        compte_bancaire: parseInt(formData.compte_bancaire)
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/rapprochements/${id}/`, dataToSend)
        showNotification('Rapprochement modifié avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/rapprochements/', dataToSend)
        showNotification('Rapprochement créé avec succès', 'success')
      }

      setTimeout(() => navigate('/rapprochements'), 1000)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors de la sauvegarde'
      setError(msg)
      showNotification(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Calcul automatique du solde rapproché
  const getSoldeRapproche = () => {
    const soldeComptable = parseFloat(formData.solde_comptable) || 0
    const encoursEmission = parseFloat(formData.encours_emission) || 0
    const encoursEncaissement = parseFloat(formData.encours_encaissement) || 0
    const commissions = parseFloat(formData.commissions) || 0
    const autresEcarts = parseFloat(formData.autres_ecarts) || 0
    return soldeComptable - encoursEmission + encoursEncaissement - commissions - autresEcarts
  }

  const getEcart = () => {
    const soldeComptable = parseFloat(formData.solde_comptable) || 0
    const soldeBancaire = parseFloat(formData.solde_bancaire) || 0
    return soldeComptable - soldeBancaire
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            {isEdit ? 'Chargement du rapprochement...' : 'Préparation du formulaire...'}
          </p>
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
            onClick={() => navigate('/rapprochements')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier le rapprochement' : '✅ Nouveau rapprochement'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations du rapprochement' : 'Créez un nouveau rapprochement bancaire'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4 sm:p-6">
        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Agence <span className="text-error">*</span></span>
            </label>
            <select
              name="agence"
              value={formData.agence}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>{agence.nom}</option>
              ))}
            </select>
          </div>

          {/* Compte bancaire */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Compte bancaire <span className="text-error">*</span></span>
            </label>
            <select
              name="compte_bancaire"
              value={formData.compte_bancaire}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Sélectionner un compte</option>
              {comptesBancaires.map(compte => (
                <option key={compte.id} value={compte.id}>{compte.nom} ({compte.banque})</option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date début <span className="text-error">*</span></span>
            </label>
            <input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Date fin */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date fin <span className="text-error">*</span></span>
            </label>
            <input
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Solde comptable */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Solde comptable <span className="text-error">*</span></span>
            </label>
            <input
              type="number"
              name="solde_comptable"
              value={formData.solde_comptable}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              required
            />
          </div>

          {/* Solde bancaire */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Solde bancaire <span className="text-error">*</span></span>
            </label>
            <input
              type="number"
              name="solde_bancaire"
              value={formData.solde_bancaire}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              required
            />
          </div>

          {/* Statut */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Statut</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="partiel">Partiel</option>
              <option value="complete">Complet</option>
            </select>
          </div>

          {/* Éléments de rapprochement - encours émission */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">En-cours d'émission</span>
            </label>
            <input
              type="number"
              name="encours_emission"
              value={formData.encours_emission}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Éléments de rapprochement - encours encaissement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">En-cours d'encaissement</span>
            </label>
            <input
              type="number"
              name="encours_encaissement"
              value={formData.encours_encaissement}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Commissions */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Commissions bancaires</span>
            </label>
            <input
              type="number"
              name="commissions"
              value={formData.commissions}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Autres écarts */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Autres écarts</span>
            </label>
            <input
              type="number"
              name="autres_ecarts"
              value={formData.autres_ecarts}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Récapitulatif (calculé automatiquement) */}
          <div className="form-control col-span-1 md:col-span-2">
            <div className="bg-base-200 rounded-xl p-4 mt-2">
              <h4 className="text-sm font-semibold mb-3">📊 Récapitulatif du rapprochement</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-base-content/60">Solde comptable</p>
                  <p className="text-lg font-bold text-primary">
                    {formatMontant(formData.solde_comptable)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Solde bancaire</p>
                  <p className="text-lg font-bold text-secondary">
                    {formatMontant(formData.solde_bancaire)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Écart</p>
                  <p className={`text-lg font-bold ${getEcart() >= 0 ? 'text-success' : 'text-error'}`}>
                    {getEcart() >= 0 ? '+' : ''}{formatMontant(getEcart())}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Solde rapproché</p>
                  <p className={`text-lg font-bold ${Math.abs(getEcart()) < 1 ? 'text-success' : 'text-warning'}`}>
                    {formatMontant(getSoldeRapproche())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control col-span-1 md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Notes</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes supplémentaires..."
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-base-200">
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/rapprochements')}
            className="btn btn-ghost gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

// Fonction utilitaire pour le formatage
const formatMontant = (montant) => {
  if (!montant && montant !== 0) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant)
}

export default RapprochementsForm