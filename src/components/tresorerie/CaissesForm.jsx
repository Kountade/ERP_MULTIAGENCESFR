// src/components/tresorerie/CaissesForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  Coins, Wallet, User, Building2, DollarSign, Shield,
  RefreshCw, Trash2
} from 'lucide-react'

const CaissesForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [agences, setAgences] = useState([])
  const [users, setUsers] = useState([])

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_caisse: 'principale',
    agence: '',
    responsable: '',
    solde_initial: 0,
    seuil_min: 0,
    seuil_max: 0,
    is_active: true,
    is_default: false,
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

        // Charger les utilisateurs
        const usersRes = await AxiosInstance.get('/users/')
        setUsers(usersRes.data || [])

        // Si édition, charger les données de la caisse
        if (isEdit) {
          const caisseRes = await AxiosInstance.get(`/caisses/${id}/`)
          const data = caisseRes.data
          setFormData({
            code: data.code || '',
            nom: data.nom || '',
            type_caisse: data.type_caisse || 'principale',
            agence: data.agence || '',
            responsable: data.responsable || '',
            solde_initial: data.solde_initial || 0,
            seuil_min: data.seuil_min || 0,
            seuil_max: data.seuil_max || 0,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_default: data.is_default || false,
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

      const dataToSend = {
        ...formData,
        solde_initial: parseFloat(formData.solde_initial) || 0,
        seuil_min: parseFloat(formData.seuil_min) || 0,
        seuil_max: parseFloat(formData.seuil_max) || 0
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/caisses/${id}/`, dataToSend)
        showNotification('Caisse modifiée avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/caisses/', dataToSend)
        showNotification('Caisse créée avec succès', 'success')
      }

      setTimeout(() => navigate('/caisses'), 1000)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      const msg = error.response?.data?.message || 'Erreur lors de la sauvegarde'
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
            {isEdit ? 'Chargement de la caisse...' : 'Préparation du formulaire...'}
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
            onClick={() => navigate('/caisses')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier la caisse' : '💰 Nouvelle caisse'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations de la caisse' : 'Créez une nouvelle caisse'}
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
              placeholder="Ex: CAI-001"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Nom */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nom <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Caisse Principale"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Type de caisse */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de caisse</span>
            </label>
            <select
              name="type_caisse"
              value={formData.type_caisse}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="principale">Principale</option>
              <option value="secondaire">Secondaire</option>
              <option value="mobile">Mobile</option>
              <option value="virtuelle">Virtuelle</option>
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

          {/* Responsable */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Responsable</span>
            </label>
            <select
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Sélectionner un responsable</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
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

          {/* Seuil min */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Seuil minimum</span>
            </label>
            <input
              type="number"
              name="seuil_min"
              value={formData.seuil_min}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
          </div>

          {/* Seuil max */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Seuil maximum</span>
            </label>
            <input
              type="number"
              name="seuil_max"
              value={formData.seuil_max}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
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
                <span className="label-text">Caisse active</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Caisse par défaut</span>
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
              placeholder="Description de la caisse..."
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
            onClick={() => navigate('/caisses')}
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

export default CaissesForm