// src/components/VariantForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Layers,
  Image as ImageIcon,
  Trash2,
  Plus,
  Tag,
  DollarSign,
  Box,
  Hash,
  ChevronDown
} from 'lucide-react'

const VariantForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})

  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    product: '',
    sku: '',
    attributes: {},
    purchase_price: '',
    sale_price: '',
    stock_quantity: 0,
    image: null,
    is_active: true
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [attributeKey, setAttributeKey] = useState('')
  const [attributeValue, setAttributeValue] = useState('')

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const prodRes = await AxiosInstance.get('/products/')
      setProducts(prodRes.data)

      if (isEditMode) {
        const varRes = await AxiosInstance.get(`/variants/${id}/`)
        const variant = varRes.data
        setFormData({
          product: variant.product || '',
          sku: variant.sku || '',
          attributes: variant.attributes || {},
          purchase_price: variant.purchase_price || '',
          sale_price: variant.sale_price || '',
          stock_quantity: variant.stock_quantity || 0,
          image: null,
          is_active: variant.is_active !== undefined ? variant.is_active : true
        })
        if (variant.image) {
          setExistingImageUrl(variant.image)
          setImagePreview(variant.image)
        }
      }
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.product) {
      newErrors.product = 'Le produit parent est obligatoire'
    }
    if (!formData.sku || formData.sku.trim() === '') {
      newErrors.sku = 'Le SKU est obligatoire'
    }
    if (!formData.purchase_price || parseFloat(formData.purchase_price) < 0) {
      newErrors.purchase_price = 'Le prix d\'achat doit être valide'
    }
    if (!formData.sale_price || parseFloat(formData.sale_price) < 0) {
      newErrors.sale_price = 'Le prix de vente doit être valide'
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

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setFormData(prev => ({
        ...prev,
        attributes: { ...prev.attributes, [attributeKey]: attributeValue }
      }))
      setAttributeKey('')
      setAttributeValue('')
    }
  }

  const removeAttribute = (key) => {
    setFormData(prev => {
      const newAttr = { ...prev.attributes }
      delete newAttr[key]
      return { ...prev, attributes: newAttr }
    })
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
      
      payload.append('product', formData.product)
      payload.append('sku', formData.sku.trim())
      payload.append('attributes', JSON.stringify(formData.attributes))
      payload.append('purchase_price', formData.purchase_price)
      payload.append('sale_price', formData.sale_price)
      payload.append('stock_quantity', formData.stock_quantity)
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
        await AxiosInstance.put(`/variants/${id}/`, payload, config)
        showNotification('Variante modifiée avec succès', 'success')
      } else {
        await AxiosInstance.post('/variants/', payload, config)
        showNotification('Variante créée avec succès', 'success')
      }
      
      setTimeout(() => navigate('/variants'), 1500)
      
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
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
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
            onClick={() => navigate('/variants')}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier la variante' : 'Nouvelle variante'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              Définissez une déclinaison de produit (taille, couleur, etc.)
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/variants')}
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
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Informations générales */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-primary/10 rounded-lg">
                    <Layers className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Informations générales
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Produit parent */}
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm">
                        Produit parent <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        className={`select select-bordered select-sm lg:select-md w-full appearance-none ${errors.product ? 'select-error' : ''}`}
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                    </div>
                    {errors.product && (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.product}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        SKU <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Ex: TSHIRT-R-M"
                      className={`input input-bordered input-sm lg:input-md w-full ${errors.sku ? 'input-error' : ''}`}
                    />
                    {errors.sku ? (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.sku}
                        </span>
                      </label>
                    ) : (
                      <label className="label pt-1">
                        <span className="label-text-alt text-base-content/50 text-xs">
                          Code unique identifiant cette variante
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Attributs */}
                <div className="form-control w-full">
                  <label className="label pb-1">
                    <span className="label-text font-medium text-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Attributs
                    </span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Clé (ex: taille)"
                      className="input input-bordered input-sm flex-1"
                      value={attributeKey}
                      onChange={(e) => setAttributeKey(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Valeur (ex: M)"
                      className="input input-bordered input-sm flex-1"
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="btn btn-outline btn-sm gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.attributes).map(([key, val]) => (
                      <span key={key} className="badge badge-lg gap-2 py-3">
                        {key}: {val}
                        <button
                          type="button"
                          onClick={() => removeAttribute(key)}
                          className="ml-1 hover:text-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {Object.keys(formData.attributes).length === 0 && (
                      <span className="text-sm text-base-content/50">
                        Aucun attribut défini
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix et stock */}
            <div className="bg-base-100 rounded-xl lg:rounded-2xl shadow-sm border border-base-300 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-success/10 rounded-lg">
                    <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-base-content">
                    Prix et stock
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prix d'achat */}
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm">
                        Prix d'achat (HT) <span className="text-error">*</span>
                      </span>
                    </label>
                    <label className={`input input-bordered input-sm lg:input-md flex items-center gap-2 ${errors.purchase_price ? 'input-error' : ''}`}>
                      <span className="text-base-content/60">€</span>
                      <input
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        className="grow"
                      />
                    </label>
                    {errors.purchase_price && (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.purchase_price}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Prix de vente */}
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm">
                        Prix de vente (HT) <span className="text-error">*</span>
                      </span>
                    </label>
                    <label className={`input input-bordered input-sm lg:input-md flex items-center gap-2 ${errors.sale_price ? 'input-error' : ''}`}>
                      <span className="text-base-content/60">€</span>
                      <input
                        type="number"
                        name="sale_price"
                        value={formData.sale_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        className="grow"
                      />
                    </label>
                    {errors.sale_price && (
                      <label className="label pt-1">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.sale_price}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="form-control w-full">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-sm flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        Quantité en stock
                      </span>
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      min="0"
                      className="input input-bordered input-sm lg:input-md w-full"
                    />
                  </div>

                  {/* Statut actif */}
                  <div className="form-control flex justify-end">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="toggle toggle-success toggle-sm lg:toggle-md"
                      />
                      <span className="label-text font-medium text-sm">Variante active</span>
                    </label>
                  </div>
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
                    Image de la variante
                  </h2>
                </div>
              </div>
              
              <div className="p-4 lg:p-6">
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
                        <Layers className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
                      </div>
                      <p className="text-sm lg:text-base font-medium mb-1">
                        Ajouter une image
                      </p>
                      <p className="text-xs text-base-content/60 mb-3">
                        Glissez-déposez ou cliquez
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('variant-image-input').click()}
                        className="btn btn-outline btn-xs lg:btn-sm gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Parcourir
                      </button>
                    </>
                  )}
                  
                  <input
                    id="variant-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>JPG, PNG, GIF, WebP</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Taille max: 5 MB</span>
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
            onClick={() => navigate('/variants')}
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

export default VariantForm