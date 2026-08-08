// src/components/tresorerie/PrevisionsTresorerieForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  TrendingUp, TrendingDown, Calendar, DollarSign, User, Building2,
  FileText, Clock, Target, PieChart, BarChart3, Activity,
  ArrowUpRight, ArrowDownLeft, AlertTriangle, Check
} from 'lucide-react'

const PrevisionsTresorerieForm = () => {
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
    type_prevision: 'entree',
    periode: 'mensuel',
    montant_prevu: '',
    montant_reel: 0,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    source_type: '',
    source_id: '',
    categorie: '',
    sous_categorie: '',
    statut: 'brouillon',
    probabilite: 50,
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

        // Si édition, charger les données de la prévision
        if (isEdit) {
          const previsionRes = await AxiosInstance.get(`/previsions/${id}/`)
          const data = previsionRes.data
          setFormData({
            reference: data.reference || '',
            titre: data.titre || '',
            agence: data.agence || '',
            type_prevision: data.type_prevision || 'entree',
            periode: data.periode || 'mensuel',
            montant_prevu: data.montant_prevu || '',
            montant_reel: data.montant_reel || 0,
            date_debut: data.date_debut || new Date().toISOString().split('T')[0],
            date_fin: data.date_fin || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            source_type: data.source_type || '',
            source_id: data.source_id || '',
            categorie: data.categorie || '',
            sous_categorie: data.sous_categorie || '',
            statut: data.statut || 'brouillon',
            probabilite: data.probabilite || 50,
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
      if (!formData.montant_prevu || parseFloat(formData.montant_prevu) <= 0) {
        setError('Le montant prévu doit être supérieur à 0')
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
      if (new Date(formData.date_debut) > new Date(formData.date_fin)) {
        setError('La date de début doit être antérieure à la date de fin')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        montant_prevu: parseFloat(formData.montant_prevu) || 0,
        montant_reel: parseFloat(formData.montant_reel) || 0,
        agence: parseInt(formData.agence),
        source_id: formData.source_id ? parseInt(formData.source_id) : null,
        probabilite: parseInt(formData.probabilite) || 50
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/previsions/${id}/`, dataToSend)
        showNotification('Prévision modifiée avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/previsions/', dataToSend)
        showNotification('Prévision créée avec succès', 'success')
      }

      setTimeout(() => navigate('/previsions'), 1000)

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
            {isEdit ? 'Chargement de la prévision...' : 'Préparation du formulaire...'}
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
            onClick={() => navigate('/previsions')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier la prévision' : '📊 Nouvelle prévision'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations de la prévision' : 'Créez une nouvelle prévision de trésorerie'}
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
              placeholder="Ex: Encaissement prévu janvier"
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

          {/* Type de prévision */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de prévision <span className="text-error">*</span></span>
            </label>
            <select
              name="type_prevision"
              value={formData.type_prevision}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="entree">Entrée prévue</option>
              <option value="sortie">Sortie prévue</option>
            </select>
          </div>

          {/* Période */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Période</span>
            </label>
            <select
              name="periode"
              value={formData.periode}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="journalier">Journalier</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>

          {/* Montant prévu */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Montant prévu <span className="text-error">*</span></span>
            </label>
            <input
              type="number"
              name="montant_prevu"
              value={formData.montant_prevu}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              required
            />
          </div>

          {/* Montant réel */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Montant réel</span>
            </label>
            <input
              type="number"
              name="montant_reel"
              value={formData.montant_reel}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
            />
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

          {/* Catégorie */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Catégorie</span>
            </label>
            <input
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              placeholder="Ex: Ventes, Achats, Frais..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Sous-catégorie */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Sous-catégorie</span>
            </label>
            <input
              type="text"
              name="sous_categorie"
              value={formData.sous_categorie}
              onChange={handleChange}
              placeholder="Ex: Produit A, Fournisseur B..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Statut */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Statut</span>
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="valide">Validée</option>
              <option value="realise">Réalisée</option>
            </select>
          </div>

          {/* Probabilité */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Probabilité (%)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                name="probabilite"
                value={formData.probabilite}
                onChange={handleChange}
                className="range range-primary range-xs flex-1"
                min="0"
                max="100"
              />
              <span className="text-sm font-bold w-12 text-center">{formData.probabilite}%</span>
            </div>
          </div>

          {/* Source type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de source</span>
            </label>
            <input
              type="text"
              name="source_type"
              value={formData.source_type}
              onChange={handleChange}
              placeholder="Ex: Vente, Achat, Facture..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Source ID */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">ID source</span>
            </label>
            <input
              type="number"
              name="source_id"
              value={formData.source_id}
              onChange={handleChange}
              placeholder="ID de la source"
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
            onClick={() => navigate('/previsions')}
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

export default PrevisionsTresorerieForm