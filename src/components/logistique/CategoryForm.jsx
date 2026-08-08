// src/components/CategoryForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  Upload,
  Folder,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Info,
  FileText,
  Loader2,
  ChevronDown,
  Layers
} from 'lucide-react'

const CategoryForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [parentCategories, setParentCategories] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    image: null,
    is_active: true
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await AxiosInstance.get('/categories/')
      let categories = res.data
      
      if (isEditMode) {
        const catRes = await AxiosInstance.get(`/categories/${id}/`)
        const category = catRes.data
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parent: category.parent || '',
          image: null,
          is_active: category.is_active !== undefined ? category.is_active : true
        })
        if (category.image) {
          setExistingImageUrl(category.image)
          setImagePreview(category.image)
        }
        // Exclure la catégorie elle-même et ses enfants
        categories = categories.filter(c => c.id !== parseInt(id) && c.parent !== parseInt(id))
      }
      setParentCategories(categories)
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des données', 'error')
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
      newErrors.name = 'Le nom de la catégorie est obligatoire'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Le nom ne doit pas dépasser 100 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
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
    if (!file.type.match('image.*')) {
      showNotification('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)', 'error')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('L\'image ne doit pas dépasser 5MB', 'error')
      return
    }
    
    setFormData(prev => ({ ...prev, image: file }))
    setImagePreview(URL.createObjectURL(file))
    setExistingImageUrl(null)
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
    setExistingImageUrl(null)
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
      
      if (formData.parent) {
        payload.append('parent', formData.parent)
      }
      
      payload.append('is_active', formData.is_active)
      
      if (formData.image instanceof File) {
        payload.append('image', formData.image)
      } else if (isEditMode && !existingImageUrl && !formData.image) {
        payload.append('image', '')
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (isEditMode) {
        await AxiosInstance.put(`/categories/${id}/`, payload, config)
        showNotification('Catégorie modifiée avec succès', 'success')
      } else {
        await AxiosInstance.post('/categories/', payload, config)
        showNotification('Catégorie créée avec succès', 'success')
      }
      
      setTimeout(() => navigate('/categories'), 1500)
      
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
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

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
            onClick={() => navigate('/categories')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              {isEditMode 
                ? 'Modifiez les informations de la catégorie' 
                : 'Ajoutez une nouvelle catégorie pour vos produits'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/categories')}
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
                <span className="hidden sm:inline">{isEditMode ? 'Mettre à jour' : 'Créer'}</span>
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
                  <div className="p-1.5 lg:p-2 bg-primary/10 rounded-lg">
                    <Folder className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Informations générales
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
                {/* Nom de la catégorie */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm lg:text-base">
                      Nom de la catégorie <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Électronique, Vêtements, Alimentation..."
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
                        Le nom doit être unique et descriptif
                      </span>
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm lg:text-base flex items-center gap-2">
                      <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                      Description
                    </span>
                    <span className="label-text-alt text-base-content/50 text-xs">
                      Optionnel
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez la catégorie, son utilité..."
                    className="textarea textarea-bordered text-sm lg:text-base w-full h-24 lg:h-28"
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/50 text-xs">
                      {formData.description.length} / 500 caractères
                    </span>
                  </label>
                </div>

                {/* Catégorie parente */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm lg:text-base flex items-center gap-2">
                      <Layers className="w-3 h-3 lg:w-4 lg:h-4" />
                      Catégorie parente
                    </span>
                    <span className="label-text-alt text-base-content/50 text-xs">
                      Optionnel
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={handleInputChange}
                      className="select select-bordered select-sm lg:select-md w-full appearance-none"
                    >
                      <option value="">Aucune (catégorie racine)</option>
                      {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  </div>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/50 text-xs">
                      Laissez vide pour une catégorie principale
                    </span>
                  </label>
                </div>

                {/* Statut actif */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3 lg:gap-4">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="toggle toggle-primary toggle-sm lg:toggle-md"
                    />
                    <div>
                      <span className="label-text font-medium text-sm lg:text-base">Catégorie active</span>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        Les catégories inactives n'apparaîtront pas dans les sélections
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="mt-4 lg:mt-6 bg-info/5 border border-info/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-info/10 rounded-lg flex-shrink-0">
                  <Info className="w-4 h-4 text-info" />
                </div>
                <div>
                  <h3 className="font-medium text-sm lg:text-base mb-1">Information</h3>
                  <p className="text-xs lg:text-sm text-base-content/70">
                    Les catégories permettent d'organiser vos produits de manière hiérarchique. 
                    Une catégorie parente peut contenir plusieurs sous-catégories.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload d'image */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden lg:sticky lg:top-20">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-secondary/10 rounded-lg">
                    <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Image de la catégorie
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6">
                {/* Zone de drop */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-4 lg:p-6 text-center transition-all duration-200
                    ${dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-base-300 hover:border-primary/50 bg-base-200/30'
                    }
                  `}
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="w-full h-36 lg:h-40 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 btn btn-error btn-circle btn-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-base-content/60">
                        Cliquez ou déposez pour changer
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <FolderOpen className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
                      </div>
                      <p className="text-sm lg:text-base font-medium mb-1">
                        Ajouter une image
                      </p>
                      <p className="text-xs text-base-content/60 mb-3">
                        Glissez-déposez ou cliquez
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-input').click()}
                        className="btn btn-outline btn-xs lg:btn-sm gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Parcourir
                      </button>
                    </>
                  )}
                  
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Informations sur le format */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>JPG, PNG, GIF, WebP</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Taille max: 5 MB</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Format recommandé: 500x500px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Barre d'actions flottante pour mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/categories')}
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
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm