// src/components/tresorerie/FraisTresorerieForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  Receipt, DollarSign, Calendar, User, Building2, FileText,
  Truck, Utensils, Briefcase, Phone, Home, BookOpen, Award,
  Shield, Wrench, Coffee, Plane, GraduationCap, Stethoscope,
  Landmark, ShoppingBag, Smartphone, CreditCard, Banknote
} from 'lucide-react'

const FraisTresorerieForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [agences, setAgences] = useState([])

  const [formData, setFormData] = useState({
    reference: '',
    titre: '',
    agence: '',
    categorie: 'autre',
    montant: '',
    date_frais: new Date().toISOString().split('T')[0],
    date_paiement: '',
    beneficiaire: '',
    piece_justificative: '',
    mode_paiement: 'especes',
    status: 'brouillon',
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

        // Si édition, charger les données du frais
        if (isEdit) {
          const fraisRes = await AxiosInstance.get(`/frais/${id}/`)
          const data = fraisRes.data
          setFormData({
            reference: data.reference || '',
            titre: data.titre || '',
            agence: data.agence || '',
            categorie: data.categorie || 'autre',
            montant: data.montant || '',
            date_frais: data.date_frais || new Date().toISOString().split('T')[0],
            date_paiement: data.date_paiement || '',
            beneficiaire: data.beneficiaire || '',
            piece_justificative: data.piece_justificative || '',
            mode_paiement: data.mode_paiement || 'especes',
            status: data.status || 'brouillon',
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
      if (!formData.titre) {
        setError('Le titre est requis')
        setSaving(false)
        return
      }
      if (!formData.agence) {
        setError('L\'agence est requise')
        setSaving(false)
        return
      }
      if (!formData.montant || parseFloat(formData.montant) <= 0) {
        setError('Le montant doit être supérieur à 0')
        setSaving(false)
        return
      }
      if (!formData.beneficiaire) {
        setError('Le bénéficiaire est requis')
        setSaving(false)
        return
      }
      if (!formData.date_frais) {
        setError('La date est requise')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        montant: parseFloat(formData.montant) || 0,
        agence: parseInt(formData.agence)
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/frais/${id}/`, dataToSend)
        showNotification('Frais modifié avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/frais/', dataToSend)
        showNotification('Frais créé avec succès', 'success')
      }

      setTimeout(() => navigate('/frais'), 1000)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors de la sauvegarde'
      setError(msg)
      showNotification(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      transport: <Truck className="w-5 h-5" />,
      restauration: <Utensils className="w-5 h-5" />,
      fournitures: <Briefcase className="w-5 h-5" />,
      communication: <Phone className="w-5 h-5" />,
      entretien: <Wrench className="w-5 h-5" />,
      formation: <GraduationCap className="w-5 h-5" />,
      mission: <Plane className="w-5 h-5" />,
      representations: <Coffee className="w-5 h-5" />,
      assurances: <Shield className="w-5 h-5" />,
      impots: <Landmark className="w-5 h-5" />,
      loyer: <Home className="w-5 h-5" />,
      services: <ShoppingBag className="w-5 h-5" />,
      autre: <FileText className="w-5 h-5" />
    }
    return icons[category] || <FileText className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            {isEdit ? 'Chargement du frais...' : 'Préparation du formulaire...'}
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
            onClick={() => navigate('/frais')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier le frais' : '📄 Nouveau frais'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations du frais' : 'Créez un nouveau frais'}
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
          {/* Titre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Titre <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Achat fournitures bureau"
              className="input input-bordered w-full"
              required
            />
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

          {/* Catégorie */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Catégorie <span className="text-error">*</span></span>
            </label>
            <div className="flex items-center gap-2">
              <div className="text-base-content/40">
                {getCategoryIcon(formData.categorie)}
              </div>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="select select-bordered flex-1"
                required
              >
                <option value="transport">Transport</option>
                <option value="restauration">Restauration</option>
                <option value="fournitures">Fournitures de bureau</option>
                <option value="communication">Communication</option>
                <option value="entretien">Entretien</option>
                <option value="formation">Formation</option>
                <option value="mission">Mission</option>
                <option value="representations">Représentation</option>
                <option value="assurances">Assurances</option>
                <option value="impots">Impôts et taxes</option>
                <option value="loyer">Loyer</option>
                <option value="services">Services</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Montant */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Montant <span className="text-error">*</span></span>
            </label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              required
            />
          </div>

          {/* Date du frais */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date du frais <span className="text-error">*</span></span>
            </label>
            <input
              type="date"
              name="date_frais"
              value={formData.date_frais}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Date de paiement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date de paiement</span>
            </label>
            <input
              type="date"
              name="date_paiement"
              value={formData.date_paiement}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Bénéficiaire */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Bénéficiaire <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="beneficiaire"
              value={formData.beneficiaire}
              onChange={handleChange}
              placeholder="Nom du bénéficiaire"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Mode de paiement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Mode de paiement</span>
            </label>
            <select
              name="mode_paiement"
              value={formData.mode_paiement}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="especes">Espèces</option>
              <option value="carte">Carte bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="autre">Autre</option>
            </select>
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
              <option value="en_attente">En attente de validation</option>
              <option value="valide">Validé</option>
              <option value="paye">Payé</option>
            </select>
          </div>

          {/* Pièce justificative */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Pièce justificative</span>
            </label>
            <input
              type="text"
              name="piece_justificative"
              value={formData.piece_justificative}
              onChange={handleChange}
              placeholder="Ex: FACT-001"
              className="input input-bordered w-full"
            />
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
            onClick={() => navigate('/frais')}
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

export default FraisTresorerieForm