// src/components/logistique/ProductPricingManager.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Warehouse,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Percent,
  Clock,
  Tag,
  Hash,
  Shield,
  AlertTriangle,
  Info,
  Loader2,
  Search,
  Filter,
  Package,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Folder,
  Barcode
} from 'lucide-react'

const ProductPricingManager = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // États
  const [product, setProduct] = useState(null)
  const [prices, setPrices] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('list')
  const [sortField, setSortField] = useState('warehouse_name')
  const [sortDirection, setSortDirection] = useState('asc')
  
  // Notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  })

  // Formulaire
  const [formData, setFormData] = useState({
    warehouse_id: '',
    purchase_price: '',
    sale_price: '',
    wholesale_price: '',
    tax_rate: 20,
    currency: 'XOF'
  })

  const [formErrors, setFormErrors] = useState({
    warehouse_id: '',
    purchase_price: '',
    sale_price: '',
    wholesale_price: '',
    tax_rate: ''
  })

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    avgPurchase: 0,
    avgSale: 0,
    avgMargin: 0,
    avgMarginPercent: 0
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [productRes, pricesRes, warehousesRes] = await Promise.all([
        AxiosInstance.get(`/products/${id}/`),
        AxiosInstance.get(`/products/${id}/prices/`).catch(() => ({ data: [] })),
        AxiosInstance.get('/warehouses/').catch(() => ({ data: [] }))
      ])
      setProduct(productRes.data)
      const pricesData = pricesRes.data || []
      setPrices(pricesData)
      setWarehouses(warehousesRes.data || [])
      
      // Calculer les statistiques
      const total = pricesData.length
      const avgPurchase = total > 0 ? pricesData.reduce((sum, p) => sum + p.purchase_price, 0) / total : 0
      const avgSale = total > 0 ? pricesData.reduce((sum, p) => sum + p.sale_price, 0) / total : 0
      const avgMargin = total > 0 ? pricesData.reduce((sum, p) => sum + (p.sale_price - p.purchase_price), 0) / total : 0
      const avgMarginPercent = total > 0 ? pricesData.reduce((sum, p) => {
        return sum + (p.purchase_price > 0 ? ((p.sale_price - p.purchase_price) / p.purchase_price * 100) : 0)
      }, 0) / total : 0
      
      setStats({ total, avgPurchase, avgSale, avgMargin, avgMarginPercent })
      
    } catch (err) {
      console.error('Erreur:', err)
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    showNotification('Données actualisées avec succès', 'success')
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.warehouse_id) errors.warehouse_id = 'Veuillez sélectionner un entrepôt'
    if (!formData.purchase_price || formData.purchase_price === '') errors.purchase_price = 'Le prix d\'achat est requis'
    if (parseFloat(formData.purchase_price) < 0) errors.purchase_price = 'Le prix d\'achat ne peut pas être négatif'
    if (!formData.sale_price || formData.sale_price === '') errors.sale_price = 'Le prix de vente est requis'
    if (parseFloat(formData.sale_price) < 0) errors.sale_price = 'Le prix de vente ne peut pas être négatif'
    if (formData.purchase_price && parseFloat(formData.sale_price) < parseFloat(formData.purchase_price)) {
      errors.sale_price = 'Le prix de vente ne peut pas être inférieur au prix d\'achat'
    }
    if (formData.tax_rate) {
      const tax = parseInt(formData.tax_rate)
      if (isNaN(tax) || tax < 0 || tax > 100) errors.tax_rate = 'La TVA doit être comprise entre 0 et 100%'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      warehouse_id: '',
      purchase_price: '',
      sale_price: '',
      wholesale_price: '',
      tax_rate: 20,
      currency: 'XOF'
    })
    setFormErrors({})
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs dans le formulaire', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        product_id: id,
        warehouse_id: parseInt(formData.warehouse_id),
        purchase_price: parseFloat(formData.purchase_price),
        sale_price: parseFloat(formData.sale_price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        tax_rate: parseInt(formData.tax_rate) || 20,
        currency: formData.currency
      }

      await AxiosInstance.post('/product-prices/set_price/', payload)
      
      showNotification(editingId ? 'Prix modifié avec succès' : 'Prix enregistré avec succès', 'success')
      setShowForm(false)
      resetForm()
      fetchData()
    } catch (err) {
      console.error('Erreur:', err)
      showNotification(err.response?.data?.error || 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (price) => {
    setEditingId(price.id)
    setFormData({
      warehouse_id: price.warehouse,
      purchase_price: price.purchase_price,
      sale_price: price.sale_price,
      wholesale_price: price.wholesale_price || '',
      tax_rate: price.tax_rate || 20,
      currency: price.currency || 'XOF'
    })
    setShowForm(true)
    setFormErrors({})
  }

  const handleDelete = async (price) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le prix pour "${price.warehouse_name}" ?`)) return
    
    setSubmitting(true)
    try {
      await AxiosInstance.post('/product-prices/set_price/', {
        product_id: id,
        warehouse_id: price.warehouse,
        purchase_price: 0,
        sale_price: 0,
        tax_rate: 20,
        currency: 'XOF'
      })
      showNotification('Prix supprimé avec succès', 'success')
      fetchData()
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const formatPrice = (price, currency = 'XOF') => {
    if (!price && price !== 0) return '0 FCFA'
    const symbols = { XOF: 'FCFA', GNF: 'GNF' }
    const symbol = symbols[currency] || currency
    return `${formatNumber(price)} ${symbol}`
  }

  const calculateMargin = (purchasePrice, salePrice) => {
    const margin = salePrice - purchasePrice
    const marginPercent = purchasePrice > 0 ? (margin / purchasePrice * 100) : 0
    return { margin, marginPercent }
  }

  // Filtrage et tri
  const filteredPrices = React.useMemo(() => {
    let filtered = prices.filter(price => {
      const matchesSearch = searchTerm === '' || 
        price.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesWarehouse = selectedWarehouse === 'all' || price.warehouse === parseInt(selectedWarehouse)
      return matchesSearch && matchesWarehouse
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (['purchase_price', 'sale_price', 'wholesale_price'].includes(sortField)) {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      
      if (sortField === 'warehouse_name') {
        aVal = (a.warehouse_name || '').toLowerCase()
        bVal = (b.warehouse_name || '').toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [prices, searchTerm, selectedWarehouse, sortField, sortDirection])

  const totalPages = Math.ceil(filteredPrices.length / itemsPerPage)
  const paginatedPrices = filteredPrices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-error/10 flex items-center justify-center">
            <Package className="w-12 h-12 text-error" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Produit non trouvé</h2>
            <p className="text-base-content/60 mt-2">Le produit que vous recherchez n'existe pas</p>
          </div>
          <button onClick={() => navigate('/produits')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-base-200 to-base-100 min-h-screen">
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
            onClick={() => navigate(`/produits/${id}`)} 
            className="btn btn-ghost btn-circle btn-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gestion des prix
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-outline gap-1">
                <Tag className="w-3 h-3" /> {product.name}
              </span>
              <span className="badge badge-ghost gap-1">
                <Hash className="w-3 h-3" /> {product.reference}
              </span>
              {product.category && (
                <span className="badge badge-info gap-1">
                  <Folder className="w-3 h-3" /> {product.category.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={refreshData} 
            disabled={refreshing} 
            className="btn btn-outline gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="btn btn-primary gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Annuler' : 'Nouveau prix'}
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{editingId ? 'Modifier le prix' : 'Définir un prix'}</h3>
                <p className="text-sm text-base-content/60">Pour le produit {product.name}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entrepôt */}
              <div className="form-control">
                <label className="label font-medium">
                  Entrepôt <span className="text-error">*</span>
                </label>
                <select
                  className={`select select-bordered w-full ${formErrors.warehouse_id ? 'select-error' : ''}`}
                  value={formData.warehouse_id}
                  onChange={(e) => {
                    setFormData({ ...formData, warehouse_id: e.target.value })
                    setFormErrors({ ...formErrors, warehouse_id: '' })
                  }}
                  disabled={!!editingId}
                >
                  <option value="">Sélectionner un entrepôt</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.agence_nom}
                    </option>
                  ))}
                </select>
                {formErrors.warehouse_id && (
                  <span className="text-error text-xs mt-1">{formErrors.warehouse_id}</span>
                )}
              </div>

              {/* Devise */}
              <div className="form-control">
                <label className="label font-medium">Devise</label>
                <select
                  className="select select-bordered w-full"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="GNF">Franc guinéen (GNF)</option>
                </select>
              </div>

              {/* Prix d'achat */}
              <div className="form-control">
                <label className="label font-medium">
                  Prix d'achat ({formData.currency === 'XOF' ? 'FCFA' : 'GNF'}) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input input-bordered w-full ${formErrors.purchase_price ? 'input-error' : ''}`}
                  value={formData.purchase_price}
                  onChange={(e) => {
                    setFormData({ ...formData, purchase_price: e.target.value })
                    setFormErrors({ ...formErrors, purchase_price: '' })
                  }}
                  placeholder="0"
                />
                {formErrors.purchase_price && (
                  <span className="text-error text-xs mt-1">{formErrors.purchase_price}</span>
                )}
              </div>

              {/* Prix de vente */}
              <div className="form-control">
                <label className="label font-medium">
                  Prix de vente ({formData.currency === 'XOF' ? 'FCFA' : 'GNF'}) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input input-bordered w-full ${formErrors.sale_price ? 'input-error' : ''}`}
                  value={formData.sale_price}
                  onChange={(e) => {
                    setFormData({ ...formData, sale_price: e.target.value })
                    setFormErrors({ ...formErrors, sale_price: '' })
                  }}
                  placeholder="0"
                />
                {formErrors.sale_price && (
                  <span className="text-error text-xs mt-1">{formErrors.sale_price}</span>
                )}
              </div>

              {/* Prix de gros */}
              <div className="form-control">
                <label className="label font-medium">
                  Prix de gros ({formData.currency === 'XOF' ? 'FCFA' : 'GNF'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input input-bordered w-full ${formErrors.wholesale_price ? 'input-error' : ''}`}
                  value={formData.wholesale_price}
                  onChange={(e) => {
                    setFormData({ ...formData, wholesale_price: e.target.value })
                    setFormErrors({ ...formErrors, wholesale_price: '' })
                  }}
                  placeholder="Optionnel"
                />
                {formErrors.wholesale_price && (
                  <span className="text-error text-xs mt-1">{formErrors.wholesale_price}</span>
                )}
              </div>

              {/* TVA */}
              <div className="form-control">
                <label className="label font-medium">TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={`input input-bordered w-full ${formErrors.tax_rate ? 'input-error' : ''}`}
                  value={formData.tax_rate}
                  onChange={(e) => {
                    setFormData({ ...formData, tax_rate: e.target.value })
                    setFormErrors({ ...formErrors, tax_rate: '' })
                  }}
                />
                {formErrors.tax_rate && (
                  <span className="text-error text-xs mt-1">{formErrors.tax_rate}</span>
                )}
              </div>
            </div>

            {/* Aperçu des marges */}
            {formData.purchase_price && formData.sale_price && (
              <div className="mt-6 p-4 bg-base-200 rounded-xl border border-base-300">
                <p className="text-sm font-semibold text-base-content mb-3">Aperçu des marges</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <span className="text-base-content/60">Marge brute</span>
                    <span className="font-bold text-success">
                      {formatPrice(parseFloat(formData.sale_price) - parseFloat(formData.purchase_price), formData.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <span className="text-base-content/60">Taux de marge</span>
                    <span className="font-bold text-info">
                      {((parseFloat(formData.sale_price) - parseFloat(formData.purchase_price)) / parseFloat(formData.purchase_price) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300">
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary gap-2" 
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><Warehouse className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Entrepôts</div>
          <div className="stat-value text-3xl font-black">{stats.total}</div>
          <div className="stat-desc">sur {warehouses.length} disponibles</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix moyen (vente)</div>
          <div className="stat-value text-2xl font-black">{formatNumber(Math.round(stats.avgSale))}</div>
          <div className="stat-desc">moyenne toutes devises</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><TrendingUp className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Marge moyenne</div>
          <div className="stat-value text-2xl font-black text-success">{formatNumber(Math.round(stats.avgMargin))}</div>
          <div className="stat-desc">moyenne toutes devises</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><Percent className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Taux de marge</div>
          <div className="stat-value text-2xl font-black text-info">{stats.avgMarginPercent.toFixed(1)}%</div>
          <div className="stat-desc">moyen</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un entrepôt..."
                className="input input-bordered w-full pl-12"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="select select-bordered min-w-[180px]"
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">Tous les entrepôts</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setSearchTerm('')
                setSelectedWarehouse('all')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des prix */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {prices.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">Aucun prix défini</p>
            <p className="text-base text-base-content/40 mt-2">
              Ce produit n'a pas encore de prix configuré pour les entrepôts
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4" />
              Définir un prix
            </button>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">Aucun résultat</p>
            <p className="text-base text-base-content/40 mt-2">
              Aucun prix ne correspond à vos critères de recherche
            </p>
            <button 
              className="btn btn-outline mt-4 gap-2"
              onClick={() => {
                setSearchTerm('')
                setSelectedWarehouse('all')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* Vue Liste */
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('warehouse_name')}>
                      Entrepôt <SortIcon field="warehouse_name" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('purchase_price')}>
                      Prix achat <SortIcon field="purchase_price" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('sale_price')}>
                      Prix vente <SortIcon field="sale_price" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('wholesale_price')}>
                      Prix gros <SortIcon field="wholesale_price" />
                    </button>
                  </th>
                  <th>TVA</th>
                  <th>Marge</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrices.map((price) => {
                  const { margin, marginPercent } = calculateMargin(price.purchase_price, price.sale_price)
                  
                  return (
                    <tr key={price.id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Warehouse className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{price.warehouse_name}</div>
                            <div className="text-xs text-base-content/50 font-mono">{price.warehouse_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{formatPrice(price.purchase_price, price.currency)}</td>
                      <td className="font-bold text-primary">{formatPrice(price.sale_price, price.currency)}</td>
                      <td>{price.wholesale_price ? formatPrice(price.wholesale_price, price.currency) : '-'}</td>
                      <td>{price.tax_rate}%</td>
                      <td>
                        <div className="flex flex-col">
                          <span className={`font-semibold ${margin >= 0 ? 'text-success' : 'text-error'}`}>
                            {formatPrice(margin, price.currency)}
                          </span>
                          <span className="text-xs text-base-content/50">{marginPercent.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDelete(price)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Vue Grille */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPrices.map((price) => {
                const { margin, marginPercent } = calculateMargin(price.purchase_price, price.sale_price)
                
                return (
                  <div key={price.id} className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Warehouse className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base-content">{price.warehouse_name}</h3>
                          <p className="text-xs text-base-content/50 font-mono">{price.warehouse_code}</p>
                        </div>
                      </div>
                      <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm btn-circle">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                          <li><button onClick={() => handleEdit(price)}><Edit className="w-4 h-4" /> Modifier</button></li>
                          <li><button className="text-error" onClick={() => handleDelete(price)}><Trash2 className="w-4 h-4" /> Supprimer</button></li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-base-100 rounded-lg">
                        <span className="text-sm text-base-content/60">Prix d'achat</span>
                        <span className="font-semibold">{formatPrice(price.purchase_price, price.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-sm text-base-content/60">Prix de vente</span>
                        <span className="font-bold text-primary">{formatPrice(price.sale_price, price.currency)}</span>
                      </div>
                      {price.wholesale_price && (
                        <div className="flex items-center justify-between p-2 bg-base-100 rounded-lg">
                          <span className="text-sm text-base-content/60">Prix de gros</span>
                          <span className="font-semibold">{formatPrice(price.wholesale_price, price.currency)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-base-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Marge</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${margin >= 0 ? 'text-success' : 'text-error'}`}>
                            {formatPrice(margin, price.currency)}
                          </span>
                          <span className="badge badge-ghost">{marginPercent.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-base-content/60">TVA</span>
                        <span className="font-medium">{price.tax_rate}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-base-content/60">Devise</span>
                        <span className="font-medium">{price.currency}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredPrices.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredPrices.length)} sur{' '}
                {filteredPrices.length} prix
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="select select-bordered select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  <option value="10">10 par page</option>
                  <option value="25">25 par page</option>
                  <option value="50">50 par page</option>
                </select>
                
                <div className="join">
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={i}
                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="text-center text-sm text-base-content/50">
        <p className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Les prix sont définis par entrepôt. Chaque agence peut avoir ses propres prix.
        </p>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ProductPricingManager