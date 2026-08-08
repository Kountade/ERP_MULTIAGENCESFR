// src/components/UnitForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Weight,
  Droplet,
  Ruler,
  Square,
  Package,
  Clock,
  Grid3x3,
  Info,
  Box
} from 'lucide-react'

// Suggestions d'unités courantes
const UNIT_SUGGESTIONS = [
  { name: 'Kilogramme', abbreviation: 'kg', icon: Weight, color: 'primary' },
  { name: 'Gramme', abbreviation: 'g', icon: Weight, color: 'primary' },
  { name: 'Tonne', abbreviation: 't', icon: Weight, color: 'primary' },
  { name: 'Litre', abbreviation: 'L', icon: Droplet, color: 'info' },
  { name: 'Millilitre', abbreviation: 'ml', icon: Droplet, color: 'info' },
  { name: 'Mètre', abbreviation: 'm', icon: Ruler, color: 'secondary' },
  { name: 'Centimètre', abbreviation: 'cm', icon: Ruler, color: 'secondary' },
  { name: 'Millimètre', abbreviation: 'mm', icon: Ruler, color: 'secondary' },
  { name: 'Mètre carré', abbreviation: 'm²', icon: Square, color: 'success' },
  { name: 'Pièce', abbreviation: 'pcs', icon: Package, color: 'warning' },
  { name: 'Unité', abbreviation: 'un', icon: Package, color: 'warning' },
  { name: 'Heure', abbreviation: 'h', icon: Clock, color: 'accent' },
  { name: 'Minute', abbreviation: 'min', icon: Clock, color: 'accent' }
]

const UnitForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: ''
  })

  const [previewIcon, setPreviewIcon] = useState(Box)
  const [previewColor, setPreviewColor] = useState('primary')

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/units/${id}/`)
      const unit = res.data
      setFormData({
        name: unit.name || '',
        abbreviation: unit.abbreviation || ''
      })
      updatePreview(unit.name, unit.abbreviation)
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const getIconFromText = (name, abbr) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbr || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids')) {
      return { icon: Weight, color: 'primary' }
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { icon: Droplet, color: 'info' }
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { icon: Ruler, color: 'secondary' }
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { icon: Square, color: 'success' }
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { icon: Package, color: 'warning' }
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { icon: Clock, color: 'accent' }
    }
    return { icon: Box, color: 'neutral' }
  }

  const updatePreview = (name, abbr) => {
    const { icon, color } = getIconFromText(name, abbr)
    setPreviewIcon(icon)
    setPreviewColor(color)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Le nom de l\'unité est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!formData.abbreviation || formData.abbreviation.trim() === '') {
      newErrors.abbreviation = 'L\'abréviation est obligatoire'
    } else if (formData.abbreviation.length > 10) {
      newErrors.abbreviation = 'L\'abréviation ne doit pas dépasser 10 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    
    if (name === 'name') {
      updatePreview(value, formData.abbreviation)
    } else if (name === 'abbreviation') {
      updatePreview(formData.name, value)
    }
  }

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      name: suggestion.name,
      abbreviation: suggestion.abbreviation
    })
    updatePreview(suggestion.name, suggestion.abbreviation)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/units/${id}/`, formData)
        showNotification('Unité modifiée avec succès', 'success')
      } else {
        await AxiosInstance.post('/units/', formData)
        showNotification('Unité créée avec succès', 'success')
      }
      setTimeout(() => navigate('/units'), 1500)
    } catch (error) {
      console.error(error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      if (error.response?.data) {
        errorMsg = Object.entries(error.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
      }
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  const PreviewIconComponent = previewIcon

  return (
    <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/units')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier l\'unité de mesure' : 'Nouvelle unité de mesure'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              Définissez une unité physique ou commerciale pour vos produits
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/units')}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <X className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Annuler</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                <span className="hidden sm:inline">Enregistrement...</span>
                <span className="sm:hidden">En cours...</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Enregistrer</span>
                <span className="sm:hidden">Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className={`p-1.5 lg:p-2 bg-${previewColor}/10 rounded-lg`}>
                    <PreviewIconComponent className={`w-4 h-4 lg:w-5 lg:h-5 text-${previewColor}`} />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Informations de l'unité
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
                {/* Nom de l'unité */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm lg:text-base">
                      Nom complet de l'unité <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Kilogramme, Litre, Mètre, Pièce..."
                    className={`input input-bordered input-sm lg:input-md w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name ? (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </span>
                    </label>
                  ) : (
                    <label className="label pt-1">
                      <span className="label-text-alt text-base-content/50 text-xs">
                        Le nom descriptif de l'unité de mesure
                      </span>
                    </label>
                  )}
                </div>

                {/* Abréviation */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm lg:text-base">
                      Abréviation / Symbole <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                    placeholder="Ex: kg, L, m, pcs..."
                    maxLength={10}
                    className={`input input-bordered input-sm lg:input-md w-full font-bold ${errors.abbreviation ? 'input-error' : ''}`}
                  />
                  {errors.abbreviation ? (
                    <label className="label pt-1">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.abbreviation}
                      </span>
                    </label>
                  ) : (
                    <label className="label pt-1">
                      <span className="label-text-alt text-base-content/50 text-xs">
                        Code court utilisé dans les listes et tableaux (max 10 caractères)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden lg:sticky lg:top-20">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <h2 className="text-base lg:text-lg font-bold text-base-content">
                  Aperçu en temps réel
                </h2>
              </div>
              
              <div className="p-4 lg:p-6">
                <div className={`bg-${previewColor}/5 border-2 border-dashed border-${previewColor}/30 rounded-xl p-6 lg:p-8 text-center`}>
                  <div className={`avatar placeholder mb-4`}>
                    <div className={`bg-${previewColor}/15 rounded-full w-20 h-20 lg:w-24 lg:h-24`}>
                      <PreviewIconComponent className={`w-10 h-10 lg:w-12 lg:h-12 text-${previewColor}`} />
                    </div>
                  </div>
                  
                  <div className="text-3xl lg:text-4xl font-bold text-base-content mb-2">
                    {formData.abbreviation || 'symbole'}
                  </div>
                  
                  <div className="text-sm lg:text-base text-base-content/60 mb-4">
                    {formData.name || 'Nom de l\'unité'}
                  </div>
                  
                  <div className={`badge ${formData.name && formData.abbreviation ? 'badge-success' : 'badge-ghost'} gap-1`}>
                    {formData.name && formData.abbreviation ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Unité valide
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        En attente
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-base-content/70">
                      L'aperçu montre comment l'unité apparaîtra dans les listes et les sélecteurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions d'unités courantes */}
        {!isEditMode && (
          <div className="mt-4 lg:mt-6">
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-info/10 rounded-lg">
                    <Info className="w-4 h-4 lg:w-5 lg:h-5 text-info" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Unités courantes suggérées
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6">
                <p className="text-sm text-base-content/60 mb-4">
                  Cliquez sur une suggestion pour la pré-remplir automatiquement
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {UNIT_SUGGESTIONS.map((suggestion, index) => {
                    const IconComponent = suggestion.icon
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className={`btn btn-outline btn-sm gap-2 border-${suggestion.color}/50 text-${suggestion.color} hover:bg-${suggestion.color}/10 hover:border-${suggestion.color}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        {suggestion.name} ({suggestion.abbreviation})
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/units')}
            className="btn btn-outline btn-sm flex-1"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary btn-sm flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnitForm