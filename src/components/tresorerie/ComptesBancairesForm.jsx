// src/components/tresorerie/ComptesBancairesForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  PiggyBank, Building2, DollarSign, Calendar, Globe, Hash,
  User, Settings, Shield, RefreshCw, Trash2
} from 'lucide-react'

const ComptesBancairesForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [agences, setAgences] = useState([])

  const [formData, setFormData] = useState({
    banque: '',
    code: '',
    nom: '',
    type_compte: 'courant',
    agence: '',
    numero_compte: '',
    iban: '',
    bic: '',
    devise: 'XOF',
    solde_initial: 0,
    is_active: true,
    is_default: false,
    date_ouverture: new Date().toISOString().split('T')[0],
    description: ''
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

        // Si édition, charger les données du compte
        if (isEdit) {
          const compteRes = await AxiosInstance.get(`/comptes-bancaires/${id}/`)
          const data = compteRes.data
          setFormData({
            banque: data.banque || '',
            code: data.code || '',
            nom: data.nom || '',
            type_compte: data.type_compte || 'courant',
            agence: data.agence || '',
            numero_compte: data.numero_compte || '',
            iban: data.iban || '',
            bic: data.bic || '',
            devise: data.devise || 'XOF',
            solde_initial: data.solde_initial || 0,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_default: data.is_default || false,
            date_ouverture: data.date_ouverture || new Date().toISOString().split('T')[0],
            description: data.description || ''
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
      if (!formData.banque) {
        setError('La banque est requise')
        setSaving(false)
        return
      }
      if (!formData.code) {
        setError('Le code est requis')
        setSaving(false)
        return
      }
      if (!formData.nom) {
        setError('Le nom est requis')
        setSaving(false)
        return
      }
      if (!formData.agence) {
        setError('L\'agence est requise')
        setSaving(false)
        return
      }
      if (!formData.numero_compte) {
        setError('Le numéro de compte est requis')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        solde_initial: parseFloat(formData.solde_initial) || 0
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/comptes-bancaires/${id}/`, dataToSend)
        showNotification('Compte bancaire modifié avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/comptes-bancaires/', dataToSend)
        showNotification('Compte bancaire créé avec succès', 'success')
      }

      setTimeout(() => navigate('/comptes-bancaires'), 1000)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors de la sauvegarde'
      setError(msg)
      showNotification(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            {isEdit ? 'Chargement du compte...' : 'Préparation du formulaire...'}
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
            onClick={() => navigate('/comptes-bancaires')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier le compte bancaire' : '🏦 Nouveau compte bancaire'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations du compte bancaire' : 'Créez un nouveau compte bancaire'}
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
          {/* Banque */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Banque <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="banque"
              value={formData.banque}
              onChange={handleChange}
              placeholder="Ex: ECOBANK"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Code */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Code <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: CMP-001"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Nom */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nom du compte <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Compte Courant Principal"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Type de compte */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de compte</span>
            </label>
            <select
              name="type_compte"
              value={formData.type_compte}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="courant">Compte courant</option>
              <option value="epargne">Compte épargne</option>
              <option value="bloque">Compte bloqué</option>
            </select>
          </div>

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

          {/* Numéro de compte */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Numéro de compte <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="numero_compte"
              value={formData.numero_compte}
              onChange={handleChange}
              placeholder="Ex: 123456789012"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* IBAN */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">IBAN</span>
            </label>
            <input
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              placeholder="Ex: SN12345678901234567890"
              className="input input-bordered w-full"
            />
          </div>

          {/* BIC/SWIFT */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">BIC/SWIFT</span>
            </label>
            <input
              type="text"
              name="bic"
              value={formData.bic}
              onChange={handleChange}
              placeholder="Ex: ECOCSN"
              className="input input-bordered w-full"
            />
          </div>

          {/* Devise */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Devise</span>
            </label>
            <select
              name="devise"
              value={formData.devise}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="XOF">FCFA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar (USD)</option>
            </select>
          </div>

          {/* Solde initial */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Solde initial</span>
            </label>
            <input
              type="number"
              name="solde_initial"
              value={formData.solde_initial}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Date d'ouverture */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date d'ouverture</span>
            </label>
            <input
              type="date"
              name="date_ouverture"
              value={formData.date_ouverture}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Options */}
          <div className="form-control col-span-1 md:col-span-2">
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Compte actif</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Compte par défaut</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-control col-span-1 md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du compte bancaire..."
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
            onClick={() => navigate('/comptes-bancaires')}
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

export default ComptesBancairesForm