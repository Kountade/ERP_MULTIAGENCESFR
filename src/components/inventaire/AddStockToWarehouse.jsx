// src/components/inventaire/AddStockToWarehouse.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Package,
  Warehouse,
  Building2,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  ChevronDown,
  Layers,
  MapPin,
  Hash,
  FileText,
  ShoppingBag,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  Filter,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  Home,
  Info,
  AlertTriangle
} from 'lucide-react'

const AddStockToWarehouse = () => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [existingStock, setExistingStock] = useState(null)
  const [checkingStock, setCheckingStock] = useState(false)
  
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: '',
    location_code: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 1: Produit, 2: Entrepôt, 3: Quantité

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/warehouses/')
      ])
      setProducts(productsRes.data || [])
      setFilteredProducts(productsRes.data || [])
      setWarehouses(warehousesRes.data || [])
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtrage des produits
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  // Vérifier le stock existant
  useEffect(() => {
    const checkExistingStock = async () => {
      if (formData.product_id && formData.warehouse_id) {
        setCheckingStock(true)
        try {
          const stockRes = await AxiosInstance.get(`/warehouse-stocks/by_product/?product_id=${formData.product_id}`)
          const stock = stockRes.data.find(s => s.warehouse === parseInt(formData.warehouse_id))
          setExistingStock(stock || null)
        } catch (error) {
          console.error('Erreur vérification stock:', error)
          setExistingStock(null)
        } finally {
          setCheckingStock(false)
        }
      } else {
        setExistingStock(null)
      }
    }
    checkExistingStock()
  }, [formData.product_id, formData.warehouse_id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    
    // Mise à jour des sélections
    if (name === 'product_id') {
      const product = products.find(p => p.id === parseInt(value))
      setSelectedProduct(product || null)
      if (product) setStep(2)
    }
    if (name === 'warehouse_id') {
      const warehouse = warehouses.find(w => w.id === parseInt(value))
      setSelectedWarehouse(warehouse || null)
      if (warehouse) setStep(3)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.product_id) newErrors.product_id = 'Sélectionnez un produit'
    if (!formData.warehouse_id) newErrors.warehouse_id = 'Sélectionnez un entrepôt'
    if (!formData.quantity || parseInt(formData.quantity) <= 0) newErrors.quantity = 'Quantité invalide'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs', 'error')
      return
    }

    setSubmitting(true)
    try {
      const quantity = parseInt(formData.quantity)
      
      if (existingStock) {
        // Ajuster le stock existant
        const newQuantity = existingStock.quantity + quantity
        await AxiosInstance.post(`/warehouse-stocks/${existingStock.id}/adjust_stock/`, {
          quantity: newQuantity,
          reason: formData.notes || `Ajout de ${quantity} unités`
        })
        showNotification(`Stock mis à jour : ${existingStock.quantity} → ${newQuantity} unités`, 'success')
      } else {
        // Initialiser le stock
        await AxiosInstance.post('/warehouse-stocks/initialize_stock/', {
          product_id: formData.product_id,
          warehouse_id: formData.warehouse_id,
          quantity: quantity,
          location_code: formData.location_code || null
        })
        showNotification(`Stock initialisé avec ${quantity} unités`, 'success')
      }
      
      setTimeout(() => navigate('/stocks'), 1500)
    } catch (error) {
      console.error(error)
      showNotification(error.response?.data?.error || 'Erreur lors de l\'ajout', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    return product?.name || ''
  }

  const getProductRef = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    return product?.reference || ''
  }

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    return product?.price || 0
  }

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === parseInt(warehouseId))
    return warehouse?.name || ''
  }

  const getAgenceName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === parseInt(warehouseId))
    return warehouse?.agence_nom || ''
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0)
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      product_id: '',
      warehouse_id: '',
      quantity: '',
      location_code: '',
      notes: ''
    })
    setSelectedProduct(null)
    setSelectedWarehouse(null)
    setExistingStock(null)
    setSearchTerm('')
    setErrors({})
    setStep(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des données...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
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
            onClick={() => navigate('/stocks')} 
            className="btn btn-ghost btn-circle btn-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ajouter du stock
            </h1>
            <p className="text-base text-base-content/60">
              Ajoutez des produits dans un entrepôt
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={resetForm}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button 
            onClick={() => navigate('/stocks')}
            className="btn btn-ghost gap-2"
          >
            <Package className="w-4 h-4" />
            Voir les stocks
          </button>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/40'}`}>
              1
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-base-content' : 'text-base-content/40'}`}>
              Produit
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-2 bg-base-300">
            <div className={`h-full bg-primary transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/40'}`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-base-content' : 'text-base-content/40'}`}>
              Entrepôt
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-2 bg-base-300">
            <div className={`h-full bg-primary transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/40'}`}>
              3
            </div>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-base-content' : 'text-base-content/40'}`}>
              Quantité
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1: Sélection du produit */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Produit</h2>
                <p className="text-sm text-base-content/60">Sélectionnez le produit à approvisionner</p>
              </div>
              {step >= 1 && selectedProduct && (
                <div className="ml-auto">
                  <span className="badge badge-success gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Sélectionné
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="form-control">
              <label className="label font-medium">
                Rechercher un produit <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-12"
                  placeholder="Nom, référence ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label font-medium">Sélectionner le produit</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.product_id ? 'select-error' : ''}`}
              >
                <option value="">Choisir un produit</option>
                {filteredProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.reference} - {p.name} {p.category ? `(${p.category})` : ''}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <span className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.product_id}
                </span>
              )}
            </div>

            {selectedProduct && (
              <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm">
                      <span className="flex items-center gap-1 text-base-content/60">
                        <Hash className="w-3 h-3" />
                        Réf: {selectedProduct.reference}
                      </span>
                      {selectedProduct.category && (
                        <span className="flex items-center gap-1 text-base-content/60">
                          <Folder className="w-3 h-3" />
                          {selectedProduct.category}
                        </span>
                      )}
                      {selectedProduct.price && (
                        <span className="flex items-center gap-1 text-success font-medium">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(selectedProduct.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Étape 2: Sélection de l'entrepôt */}
        <div className={`bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden transition-opacity duration-300 ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-5 border-b border-base-300 bg-gradient-to-r from-secondary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Entrepôt</h2>
                <p className="text-sm text-base-content/60">Choisissez l'entrepôt de destination</p>
              </div>
              {step >= 2 && selectedWarehouse && (
                <div className="ml-auto">
                  <span className="badge badge-success gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Sélectionné
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="form-control">
              <label className="label font-medium">
                Entrepôt de destination <span className="text-error">*</span>
              </label>
              <select
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.warehouse_id ? 'select-error' : ''}`}
                disabled={!formData.product_id}
              >
                <option value="">Choisir un entrepôt</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.agence_nom ? `(${w.agence_nom})` : ''}
                  </option>
                ))}
              </select>
              {errors.warehouse_id && (
                <span className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.warehouse_id}
                </span>
              )}
              {!formData.product_id && (
                <span className="text-warning text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Veuillez d'abord sélectionner un produit
                </span>
              )}
            </div>

            {selectedWarehouse && (
              <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedWarehouse.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm">
                      {selectedWarehouse.agence_nom && (
                        <span className="flex items-center gap-1 text-base-content/60">
                          <Building2 className="w-3 h-3" />
                          {selectedWarehouse.agence_nom}
                        </span>
                      )}
                      {selectedWarehouse.location && (
                        <span className="flex items-center gap-1 text-base-content/60">
                          <MapPin className="w-3 h-3" />
                          {selectedWarehouse.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vérification du stock existant */}
            {checkingStock && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-base-content/60">Vérification du stock...</span>
              </div>
            )}

            {existingStock && !checkingStock && (
              <div className="bg-info/10 rounded-xl p-4 border border-info/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Stock existant</p>
                    <p className="text-sm text-base-content/70">
                      Ce produit est déjà présent dans cet entrepôt avec{' '}
                      <span className="font-bold text-info">{formatNumber(existingStock.quantity)}</span> unités.
                    </p>
                    <p className="text-sm text-base-content/70 mt-1">
                      L'ajout augmentera le stock à{' '}
                      <span className="font-bold text-primary">
                        {formatNumber(existingStock.quantity + parseInt(formData.quantity || 0))}
                      </span> unités.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Étape 3: Quantité et détails */}
        <div className={`bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden transition-opacity duration-300 ${step < 3 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-5 border-b border-base-300 bg-gradient-to-r from-success/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Quantité et détails</h2>
                <p className="text-sm text-base-content/60">Indiquez la quantité et les informations complémentaires</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="form-control">
              <label className="label font-medium">
                Quantité à ajouter <span className="text-error">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Ex: 100"
                className={`input input-bordered w-full text-lg ${errors.quantity ? 'input-error' : ''}`}
                disabled={!formData.warehouse_id}
                min="1"
                step="1"
              />
              {errors.quantity && (
                <span className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.quantity}
                </span>
              )}
              {!formData.warehouse_id && (
                <span className="text-warning text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Veuillez d'abord sélectionner un entrepôt
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label font-medium">Emplacement (optionnel)</label>
              <input
                type="text"
                name="location_code"
                value={formData.location_code}
                onChange={handleChange}
                placeholder="Ex: A-12, Rack 3, Étagère 2"
                className="input input-bordered w-full"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  <MapPin className="w-3 h-3 inline" /> Code d'emplacement pour faciliter la localisation
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label font-medium">Notes (optionnel)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Raison de l'ajout, bon de livraison, fournisseur, etc."
                className="textarea textarea-bordered h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Résumé de l'opération */}
        {formData.product_id && formData.warehouse_id && formData.quantity && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Résumé de l'opération
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Produit :</span>
                  <span className="font-medium">{getProductName(formData.product_id)}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Référence :</span>
                  <span className="font-mono">{getProductRef(formData.product_id)}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Prix unitaire :</span>
                  <span className="font-medium">{formatCurrency(getProductPrice(formData.product_id))}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Entrepôt :</span>
                  <span className="font-medium">{getWarehouseName(formData.warehouse_id)}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Agence :</span>
                  <span className="font-medium">{getAgenceName(formData.warehouse_id)}</span>
                </div>
                <div className="flex justify-between border-b border-base-300 pb-2">
                  <span className="text-base-content/60">Quantité :</span>
                  <span className="font-bold text-primary text-lg">{formatNumber(formData.quantity)} unités</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-base-content/60">Valeur totale :</span>
                  <span className="font-bold text-success text-lg">
                    {formatCurrency(parseInt(formData.quantity) * getProductPrice(formData.product_id))}
                  </span>
                </div>
              </div>
            </div>
            {existingStock && (
              <div className="mt-4 pt-4 border-t border-base-300">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Stock actuel :</span>
                  <span className="font-medium">{formatNumber(existingStock.quantity)} unités</span>
                  <span className="text-base-content/60">→</span>
                  <span className="text-base-content/60">Nouveau stock :</span>
                  <span className="font-bold text-primary">{formatNumber(existingStock.quantity + parseInt(formData.quantity))} unités</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/stocks')}
            className="btn btn-outline flex-1 gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.product_id || !formData.warehouse_id || !formData.quantity}
            className="btn btn-primary flex-1 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {existingStock ? 'Mettre à jour le stock' : 'Ajouter au stock'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStockToWarehouse