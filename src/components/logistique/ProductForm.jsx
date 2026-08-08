// src/components/ProductForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save, X, Upload, Package, AlertCircle, CheckCircle, Image as ImageIcon,
  Trash2, ArrowLeft, Loader2, Boxes, Tag, Barcode, Hash, Layers,
  Plus, Edit, ChevronDown, Folder, Building2, Weight, Ruler
} from 'lucide-react'

const ProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [dragActive, setDragActive] = useState(false)

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [units, setUnits] = useState([])

  // État initial SANS PRIX
  const [formData, setFormData] = useState({
    reference: '', barcode: '', name: '', description: '', product_type: 'simple',
    category: '', brand: '', unit: '',
    stock_quantity: 0, minimum_stock: 5, maximum_stock: '', location: '',
    is_active: true, is_featured: false, has_variants: false, weight: '', volume: ''
  })

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})

  const [variants, setVariants] = useState([])
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)
  const [variantForm, setVariantForm] = useState({ 
    sku: '', attributes: {}, stock_quantity: 0, image: null, is_active: true 
  })
  const [attributeKey, setAttributeKey] = useState('')
  const [attributeValue, setAttributeValue] = useState('')
  const [variantImagePreview, setVariantImagePreview] = useState(null)

  const productTypes = { simple: 'Simple', variable: 'Variable', service: 'Service', digital: 'Numérique' }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([
        AxiosInstance.get('/categories/'),
        AxiosInstance.get('/brands/'),
        AxiosInstance.get('/units/')
      ])
      setCategories(catRes.data)
      setBrands(brandRes.data)
      setUnits(unitRes.data)

      if (isEditMode) {
        const prodRes = await AxiosInstance.get(`/products/${id}/`)
        const p = prodRes.data
        setFormData({
          reference: p.reference || '', barcode: p.barcode || '', name: p.name || '', 
          description: p.description || '', product_type: p.product_type || 'simple',
          category: p.category || '', brand: p.brand || '', unit: p.unit || '',
          stock_quantity: p.stock_quantity || 0, minimum_stock: p.minimum_stock || 5,
          maximum_stock: p.maximum_stock || '', location: p.location || '',
          is_active: p.is_active !== undefined ? p.is_active : true, 
          is_featured: p.is_featured || false, has_variants: p.has_variants || false,
          weight: p.weight || '', volume: p.volume || ''
        })
        if (p.main_image) setImagePreview(p.main_image)
        
        const varRes = await AxiosInstance.get(`/products/${id}/variants/`).catch(() => ({ data: [] }))
        setVariants(varRes.data || [])
      }
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [id])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.reference?.trim()) newErrors.reference = 'La référence est obligatoire'
    if (!formData.name?.trim()) newErrors.name = 'Le nom du produit est obligatoire'
    if (!formData.category) newErrors.category = 'La catégorie est obligatoire'
    if (!formData.unit) newErrors.unit = 'L\'unité est obligatoire'
    if (formData.has_variants && variants.length === 0) newErrors.variants = 'Au moins une variante est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleMainImageFile = (file) => {
    if (!file.type.match('image.*')) {
      showNotification('Veuillez sélectionner une image', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('L\'image ne doit pas dépasser 5MB', 'error')
      return
    }
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleMainImageSelect = (e) => e.target.files[0] && handleMainImageFile(e.target.files[0])

  const handleRemoveImage = () => { setSelectedImage(null); setImagePreview(null) }

  const handleAddVariant = () => {
    if (!variantForm.sku) {
      showNotification('SKU requis', 'error')
      return
    }
    if (editingVariant) {
      setVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...variantForm, id: editingVariant.id } : v))
    } else {
      setVariants(prev => [...prev, { ...variantForm, id: Date.now() }])
    }
    setShowVariantModal(false)
    setEditingVariant(null)
    setVariantForm({ sku: '', attributes: {}, stock_quantity: 0, image: null, is_active: true })
    setVariantImagePreview(null)
    setAttributeKey(''); setAttributeValue('')
  }

  const handleDeleteVariant = (variantId) => setVariants(prev => prev.filter(v => v.id !== variantId))

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setVariantForm(prev => ({ ...prev, attributes: { ...prev.attributes, [attributeKey]: attributeValue } }))
      setAttributeKey(''); setAttributeValue('')
    }
  }

  const removeAttribute = (key) => {
    setVariantForm(prev => {
      const newAttr = { ...prev.attributes }
      delete newAttr[key]
      return { ...prev, attributes: newAttr }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs', 'error')
      return
    }
    
    setSubmitting(true)
    try {
      const productPayload = new FormData()
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value !== null && value !== undefined && value !== '') {
          productPayload.append(key, value)
        }
      })
      if (selectedImage) productPayload.append('main_image', selectedImage)

      let productResponse
      if (isEditMode) {
        productResponse = await AxiosInstance.put(`/products/${id}/`, productPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        productResponse = await AxiosInstance.post('/products/', productPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      const productId = productResponse.data.id

      if (formData.has_variants) {
        for (const v of variants) {
          const variantPayload = {
            product: productId, sku: v.sku, attributes: v.attributes,
            stock_quantity: v.stock_quantity, is_active: v.is_active
          }
          if (v.id && !String(v.id).includes('temp')) {
            await AxiosInstance.put(`/variants/${v.id}/`, variantPayload)
          } else {
            await AxiosInstance.post('/variants/', variantPayload)
          }
        }
      }

      showNotification(isEditMode ? 'Produit modifié avec succès' : 'Produit créé avec succès', 'success')
      setTimeout(() => navigate('/produits'), 1500)
    } catch (error) {
      console.error(error)
      showNotification("Erreur lors de l'enregistrement", 'error')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70">Chargement...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: Package },
    ...(formData.has_variants ? [{ id: 'variants', label: 'Variantes', icon: Layers }] : [])
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/produits')} className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-base-content">
              {isEditMode ? 'Modifier le produit' : 'Nouveau produit'}
            </h1>
            <p className="text-xs lg:text-sm text-base-content/60">
              {isEditMode ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/produits')} className="btn btn-outline btn-sm lg:btn-md gap-1">
            <X className="w-3 h-3" /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm lg:btn-md gap-1">
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 p-1 rounded-xl shadow-sm border border-base-300">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} className={`tab gap-2 text-sm ${activeTab === tab.id ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab: Informations générales */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg"><Hash className="w-4 h-4 text-primary" /></div>
                    <h2 className="text-base font-bold">Identification</h2>
                  </div>
                </div>
                <div className="p-4 lg:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1">Référence <span className="text-error">*</span></label>
                      <input type="text" name="reference" value={formData.reference} onChange={handleInputChange}
                        className={`input input-bordered input-sm ${errors.reference ? 'input-error' : ''}`} />
                      {errors.reference && <span className="text-error text-xs mt-1">{errors.reference}</span>}
                    </div>
                    <div className="form-control">
                      <label className="label pb-1"><Barcode className="w-3 h-3 inline mr-1" /> Code-barres</label>
                      <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange}
                        className="input input-bordered input-sm" />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">Nom du produit <span className="text-error">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className={`input input-bordered input-sm ${errors.name ? 'input-error' : ''}`} />
                    {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
                  </div>
                  <div className="form-control">
                    <label className="label pb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                      className="textarea textarea-bordered text-sm h-24" placeholder="Description détaillée..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1">Type de produit</label>
                      <select name="product_type" value={formData.product_type} onChange={handleInputChange}
                        className="select select-bordered select-sm">
                        {Object.entries(productTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Catégorie <span className="text-error">*</span></label>
                      <select name="category" value={formData.category} onChange={handleInputChange}
                        className={`select select-bordered select-sm ${errors.category ? 'select-error' : ''}`}>
                        <option value="">Sélectionner</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label pb-1"><Building2 className="w-3 h-3 inline mr-1" /> Marque</label>
                      <select name="brand" value={formData.brand} onChange={handleInputChange}
                        className="select select-bordered select-sm">
                        <option value="">Aucune</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Unité <span className="text-error">*</span></label>
                      <select name="unit" value={formData.unit} onChange={handleInputChange}
                        className={`select select-bordered select-sm ${errors.unit ? 'select-error' : ''}`}>
                        <option value="">Sélectionner</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input type="checkbox" name="has_variants" checked={formData.has_variants} onChange={handleInputChange}
                        className="toggle toggle-primary toggle-sm" />
                      <span className="label-text">Ce produit a des variantes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section Stock (sans prix) */}
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-warning/10 rounded-lg"><Boxes className="w-4 h-4 text-warning" /></div>
                    <h2 className="text-base font-bold">Stock</h2>
                  </div>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1">Quantité en stock</label>
                      <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange}
                        className="input input-bordered input-sm" />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Stock minimum</label>
                      <input type="number" name="minimum_stock" value={formData.minimum_stock} onChange={handleInputChange}
                        className="input input-bordered input-sm" />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Stock maximum</label>
                      <input type="number" name="maximum_stock" value={formData.maximum_stock} onChange={handleInputChange}
                        className="input input-bordered input-sm" />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Emplacement</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                        className="input input-bordered input-sm" placeholder="ex: A12" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-info/10 rounded-lg"><Ruler className="w-4 h-4 text-info" /></div>
                    <h2 className="text-base font-bold">Dimensions</h2>
                  </div>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-1"><Weight className="w-3 h-3 inline mr-1" /> Poids (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} step="0.001"
                        className="input input-bordered input-sm" />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1">Volume (m³)</label>
                      <input type="number" name="volume" value={formData.volume} onChange={handleInputChange} step="0.001"
                        className="input input-bordered input-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Image et options */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6">
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-secondary/10 rounded-lg"><ImageIcon className="w-4 h-4 text-secondary" /></div>
                    <h2 className="text-base font-bold">Image principale</h2>
                  </div>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="relative border-2 border-dashed rounded-xl p-4 text-center border-base-300 bg-base-200/30">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img src={imagePreview} alt="Aperçu" className="w-full h-36 object-contain rounded-lg" />
                          <button type="button" onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 btn btn-error btn-circle btn-xs">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                          <Package className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-sm font-medium mb-1">Ajouter une image</p>
                        <button type="button" onClick={() => document.getElementById('main-image-input').click()}
                          className="btn btn-outline btn-xs gap-1">
                          <Upload className="w-3 h-3" /> Parcourir
                        </button>
                      </>
                    )}
                    <input id="main-image-input" type="file" accept="image/*" onChange={handleMainImageSelect} className="hidden" />
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
                <div className="p-4 lg:p-6">
                  <h3 className="font-semibold text-sm mb-3">Options</h3>
                  <div className="space-y-3">
                    <label className="label cursor-pointer justify-start gap-3 p-0">
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange}
                        className="toggle toggle-success toggle-sm" />
                      <span className="label-text text-sm">Produit actif</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 p-0">
                      <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange}
                        className="toggle toggle-warning toggle-sm" />
                      <span className="label-text text-sm">Mettre en avant</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Variantes */}
        {activeTab === 'variants' && formData.has_variants && (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-base-300 bg-base-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-accent/10 rounded-lg"><Layers className="w-4 h-4 text-accent" /></div>
                <h2 className="text-base font-bold">Variantes du produit</h2>
              </div>
              <button type="button" onClick={() => setShowVariantModal(true)} className="btn btn-primary btn-sm gap-1">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
            <div className="p-4 lg:p-6">
              {variants.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 mx-auto mb-3 text-base-content/30" />
                  <p className="text-base-content/50">Aucune variante définie</p>
                  <button type="button" onClick={() => setShowVariantModal(true)} className="btn btn-outline btn-sm mt-3">
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr className="bg-base-200">
                        <th>SKU</th><th>Attributs</th><th className="text-center">Stock</th><th className="text-center">Statut</th><th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr key={v.id}>
                          <td className="font-mono text-sm">{v.sku}</td>
                          <td><div className="flex flex-wrap gap-1">{Object.entries(v.attributes).map(([key, val]) => (
                            <span key={key} className="badge badge-sm">{key}: {val}</span>
                          ))}</div></td>
                          <td className="text-center text-sm">{v.stock_quantity}</td>
                          <td className="text-center">{v.is_active ? 
                            <span className="badge badge-success badge-sm">Actif</span> : 
                            <span className="badge badge-ghost badge-sm">Inactif</span>}</td>
                          <td><div className="flex justify-end gap-1">
                            <button type="button" className="btn btn-ghost btn-xs" onClick={() => { setEditingVariant(v); setVariantForm(v); setShowVariantModal(true); }}>
                              <Edit className="w-3 h-3" />
                            </button>
                            <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteVariant(v.id)}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Modal Variante */}
      {showVariantModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editingVariant ? 'Modifier la variante' : 'Nouvelle variante'}</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => { setShowVariantModal(false); setEditingVariant(null); setVariantForm({ sku: '', attributes: {}, stock_quantity: 0, image: null, is_active: true }); }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label py-1">SKU *</label>
                <input type="text" className="input input-bordered input-sm" value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })} />
              </div>
              <div>
                <label className="label py-1">Attributs</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Clé" className="input input-bordered input-sm flex-1" value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)} />
                  <input type="text" placeholder="Valeur" className="input input-bordered input-sm flex-1" value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addAttribute}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(variantForm.attributes).map(([key, val]) => (
                    <span key={key} className="badge badge-lg gap-1">{key}: {val}
                      <button type="button" onClick={() => removeAttribute(key)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-control">
                <label className="label py-1">Stock</label>
                <input type="number" className="input input-bordered input-sm" value={variantForm.stock_quantity}
                  onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input type="checkbox" className="toggle toggle-success toggle-sm" checked={variantForm.is_active}
                    onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })} />
                  <span className="label-text">Actif</span>
                </label>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowVariantModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddVariant}>
                {editingVariant ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions flottante mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t p-3 shadow-lg z-40">
        <div className="flex gap-2">
          <button onClick={() => navigate('/produits')} className="btn btn-outline btn-sm flex-1">Annuler</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm flex-1">
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductForm