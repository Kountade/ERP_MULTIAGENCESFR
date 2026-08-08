// src/components/BrandForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  Upload,
  Building2,
  Globe,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Info,
  Link2,
  FileText,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react'

const BrandForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [dragActive, setDragActive] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null,
    website: '',
    is_active: true
  })

  const [logoPreview, setLogoPreview] = useState(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState(null)
  const [errors, setErrors] = useState({})

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const res = await AxiosInstance.get(`/brands/${id}/`)
      const brand = res.data
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        logo: null,
        website: brand.website || '',
        is_active: brand.is_active !== undefined ? brand.is_active : true
      })
      if (brand.logo) {
        setExistingLogoUrl(brand.logo)
        setLogoPreview(brand.logo)
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement de la marque', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Le nom de la marque est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Le nom ne doit pas dépasser 100 caractères'
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Veuillez entrer une URL valide (ex: https://www.exemple.com)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file) => {
    // Validation du fichier
    if (!file.type.match('image.*')) {
      showNotification('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)', 'error')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('L\'image ne doit pas dépasser 5MB', 'error')
      return
    }
    
    setFormData(prev => ({ ...prev, logo: file }))
    setLogoPreview(URL.createObjectURL(file))
    setExistingLogoUrl(null)
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }))
    setLogoPreview(null)
    setExistingLogoUrl(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error')
      return
    }

    setSubmitting(true)
    
    try {
      const payload = new FormData()
      
      payload.append('name', formData.name.trim())
      
      if (formData.description) {
        payload.append('description', formData.description.trim())
      }
      
      if (formData.website) {
        payload.append('website', formData.website.trim())
      }
      
      payload.append('is_active', formData.is_active)
      
      if (formData.logo instanceof File) {
        payload.append('logo', formData.logo)
      } else if (isEditMode && !existingLogoUrl && !formData.logo) {
        payload.append('logo', '')
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (isEditMode) {
        await AxiosInstance.put(`/brands/${id}/`, payload, config)
        showNotification('Marque modifiée avec succès', 'success')
      } else {
        await AxiosInstance.post('/brands/', payload, config)
        showNotification('Marque créée avec succès', 'success')
      }
      
      setTimeout(() => navigate('/brands'), 1500)
      
    } catch (error) {
      console.error('Erreur:', error)
      let errorMsg = 'Erreur lors de l\'enregistrement'
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMsg = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ')
        } else {
          errorMsg = error.response.data
        }
      }
      
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/brands')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-base-content mb-2">
              {isEditMode ? 'Modifier la marque' : 'Nouvelle marque'}
            </h1>
            <p className="text-base text-base-content/60">
              {isEditMode 
                ? 'Modifiez les informations de la marque' 
                : 'Ajoutez une nouvelle marque pour vos produits'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/brands')}
            className="btn btn-outline gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Mettre à jour' : 'Créer la marque'}
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-base-content">
                    Informations générales
                  </h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Nom de la marque */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base">
                      Nom de la marque <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Apple, Samsung, Nike..."
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name ? (
                    <label className="label">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </span>
                    </label>
                  ) : (
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">
                        Le nom doit être unique et reconnaissable
                      </span>
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </span>
                    <span className="label-text-alt text-base-content/50">
                      Optionnel
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez la marque, son histoire, ses valeurs..."
                    className="textarea textarea-bordered w-full h-32"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      {formData.description.length} / 500 caractères
                    </span>
                  </label>
                </div>

                {/* Site web */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-base flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Site web
                    </span>
                    <span className="label-text-alt text-base-content/50">
                      Optionnel
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.exemple.com"
                      className={`input input-bordered w-full pl-10 ${errors.website ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.website ? (
                    <label className="label">
                      <span className="label-text-alt text-error flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.website}
                      </span>
                    </label>
                  ) : (
                    <label className="label">
                      <span className="label-text-alt text-base-content/50">
                        L'URL complète du site officiel de la marque
                      </span>
                    </label>
                  )}
                </div>

                {/* Statut actif */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="toggle toggle-primary toggle-lg"
                    />
                    <div>
                      <span className="label-text font-semibold text-base">Marque active</span>
                      <p className="text-sm text-base-content/60 mt-1">
                        Les marques inactives n'apparaîtront pas dans les sélections
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Information supplémentaire */}
            <div className="bg-info/5 border border-info/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Info className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-2">Information</h3>
                  <p className="text-sm text-base-content/70">
                    Les marques permettent d'organiser vos produits et d'améliorer la recherche. 
                    Une bonne description et un logo professionnel renforcent la crédibilité de votre catalogue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload du logo */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden sticky top-20">
              <div className="p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-base-content">
                    Logo de la marque
                  </h2>
                </div>
              </div>
              
              <div className="p-6">
                {/* Zone de drop */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                    ${dragActive 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : 'border-base-300 hover:border-primary/50 bg-base-200/30'
                    }
                    ${logoPreview ? 'pb-4' : 'py-12'}
                  `}
                >
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 btn btn-error btn-circle btn-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-base-content/60">
                        Cliquez ou déposez pour changer
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-base font-semibold mb-2">
                        Ajouter un logo
                      </p>
                      <p className="text-sm text-base-content/60 mb-4">
                        Glissez-déposez ou cliquez pour sélectionner
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('logo-input').click()}
                        className="btn btn-outline btn-sm gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Parcourir
                      </button>
                    </>
                  )}
                  
                  <input
                    id="logo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Informations sur le format */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Formats acceptés: JPG, PNG, GIF, WebP</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Taille maximale: 5 MB</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Format recommandé: 500x500px</span>
                  </div>
                </div>

                {/* Conseil */}
                <div className="mt-6 p-4 bg-warning/5 border border-warning/20 rounded-xl">
                  <p className="text-xs text-base-content/70">
                    <span className="font-semibold">💡 Conseil :</span> Un logo de qualité 
                    améliore la reconnaissance de votre marque. Privilégiez un fond transparent 
                    pour une meilleure intégration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 shadow-lg z-40">
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/brands')}
            className="btn btn-outline flex-1"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BrandForm