// src/components/inventaire/ProductDetails.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Edit,
  ArrowLeft,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hash,
  Warehouse,
  Plus,
  RefreshCw,
  Building2,
  Box,
  X,
  Eye,
  MoreVertical,
  Trash2,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Info,
  FileText,
  CreditCard,
  Layers,
  Grid,
  Printer,
  Download,
  AlertTriangle,
  Check,
  Loader2,
  Folder,
  Tag,
  Barcode
} from 'lucide-react'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [pricesByWarehouse, setPricesByWarehouse] = useState([])
  const [stocksByWarehouse, setStocksByWarehouse] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('warehouse_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR').format(number)
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price) + ' FCFA'
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
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

  const fetchData = async () => {
    setLoading(true)
    try {
      // Récupérer le produit
      const prodRes = await AxiosInstance.get(`/products/${id}/`)
      setProduct(prodRes.data)
      
      // Récupérer les prix par entrepôt
      try {
        const pricesRes = await AxiosInstance.get(`/products/${id}/prices/`)
        setPricesByWarehouse(pricesRes.data || [])
      } catch (err) {
        console.log('Pas de prix trouvés', err)
        setPricesByWarehouse([])
      }
      
      // Récupérer les stocks par entrepôt
      try {
        const stocksRes = await AxiosInstance.get(`/warehouse-stocks/by_product/?product_id=${id}`)
        setStocksByWarehouse(stocksRes.data || [])
      } catch (err) {
        console.log('Pas de stocks trouvés', err)
        setStocksByWarehouse([])
      }
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement du produit', 'error')
    } finally { 
      setLoading(false) 
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    showNotification('Données actualisées', 'success')
  }

  useEffect(() => { 
    fetchData() 
  }, [id])

  // Filtrage et tri des stocks
  const filteredAndSortedStocks = React.useMemo(() => {
    let filtered = stocksByWarehouse.filter(stock => {
      const warehouseName = (stock.warehouse_name || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      return warehouseName.includes(search)
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'quantity') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [stocksByWarehouse, searchTerm, sortField, sortDirection])

  const totalStock = stocksByWarehouse.reduce((sum, s) => sum + (s.quantity || 0), 0)
  const totalValue = stocksByWarehouse.reduce((sum, s) => {
    const price = pricesByWarehouse.find(p => p.warehouse_id === s.warehouse_id)
    const salePrice = price?.sale_price || 0
    return sum + (s.quantity * salePrice)
  }, 0)

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { label: 'Rupture', color: 'text-error', bgColor: 'bg-error/10', icon: <XCircle className="w-4 h-4" /> }
    }
    if (quantity <= 5) {
      return { label: 'Stock faible', color: 'text-warning', bgColor: 'bg-warning/10', icon: <AlertTriangle className="w-4 h-4" /> }
    }
    return { label: 'Normal', color: 'text-success', bgColor: 'bg-success/10', icon: <CheckCircle className="w-4 h-4" /> }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du produit...
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
          <button 
            onClick={() => navigate('/produits')} 
            className="btn btn-primary gap-2"
          >
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
            onClick={() => navigate('/produits')} 
            className="btn btn-ghost btn-circle btn-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-outline gap-1">
                <Hash className="w-3 h-3" /> Réf: {product.reference}
              </span>
              {product.category && (
                <span className="badge badge-info gap-1">
                  <Folder className="w-3 h-3" /> {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="badge badge-secondary gap-1">
                  <Award className="w-3 h-3" /> {product.brand.name}
                </span>
              )}
              {!product.is_active && (
                <span className="badge badge-error gap-1">
                  <XCircle className="w-3 h-3" /> Inactif
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
            onClick={() => navigate(`/produits/${id}/prix`)}
            className="btn btn-outline btn-primary gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Prix
          </button>
          <button 
            onClick={() => navigate(`/produits/${id}/modifier`)}
            className="btn btn-primary gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><Package className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Stock total</div>
          <div className="stat-value text-3xl font-black">{formatNumber(totalStock)}</div>
          <div className="stat-desc">Unités</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><Warehouse className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Entrepôts</div>
          <div className="stat-value text-3xl font-black">{stocksByWarehouse.length}</div>
          <div className="stat-desc">Avec stock</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Valeur totale</div>
          <div className="stat-value text-2xl font-black">{formatPrice(totalValue)}</div>
          <div className="stat-desc">Stock estimé</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning"><TrendingDown className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix d'achat</div>
          <div className="stat-value text-2xl font-black">
            {pricesByWarehouse.length > 0 ? formatPrice(pricesByWarehouse[0]?.purchase_price) : '-'}
          </div>
          <div className="stat-desc">Moyen</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><TrendingUp className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix de vente</div>
          <div className="stat-value text-2xl font-black">
            {pricesByWarehouse.length > 0 ? formatPrice(pricesByWarehouse[0]?.sale_price) : '-'}
          </div>
          <div className="stat-desc">Moyen</div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Image et description */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">Image</h2>
              </div>
            </div>
            <div className="p-6">
              {product.main_image ? (
                <div className="relative group">
                  <img 
                    src={product.main_image} 
                    alt={product.name}
                    className="w-full h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(product.main_image)}
                  />
                  <button 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage(product.main_image)}
                  >
                    <div className="bg-base-100/80 rounded-full p-3">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="w-full h-64 bg-base-200 rounded-xl flex flex-col items-center justify-center">
                  <Package className="w-16 h-16 text-base-content/30 mb-2" />
                  <p className="text-base-content/50 text-sm">Aucune image</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-info/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg font-bold">Description</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
                {product.description || 'Aucune description disponible'}
              </p>
            </div>
          </div>

          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-secondary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-lg font-bold">Informations</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Référence</p>
                  <p className="font-mono font-semibold">{product.reference}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Folder className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Catégorie</p>
                  <p className="font-semibold">{product.category?.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Marque</p>
                  <p className="font-semibold">{product.brand?.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Box className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Unité</p>
                  <p className="font-semibold">{product.unit?.abbreviation || '-'}</p>
                </div>
              </div>

              {product.barcode && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Barcode className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50">Code-barres</p>
                    <p className="font-mono">{product.barcode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Prix et stocks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prix par entrepôt */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-success/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Prix par entrepôt</h2>
                    <p className="text-sm text-base-content/60">{pricesByWarehouse.length} prix défini{pricesByWarehouse.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm gap-2"
                  onClick={() => navigate(`/produits/${id}/prix`)}
                >
                  <Plus className="w-4 h-4" />
                  Gérer
                </button>
              </div>
            </div>
            <div className="p-6">
              {pricesByWarehouse.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <p className="text-base-content/50">Aucun prix défini</p>
                  <button 
                    className="btn btn-outline btn-primary mt-4 gap-2"
                    onClick={() => navigate(`/produits/${id}/prix`)}
                  >
                    <Plus className="w-4 h-4" />
                    Définir un prix
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricesByWarehouse.map((price) => (
                    <div key={price.id} className="bg-base-200 rounded-xl p-4 border border-base-300 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Warehouse className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold">{price.warehouse_name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-base-content/60">Achat</span>
                          <span className="font-semibold">{formatPrice(price.purchase_price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-base-content/60">Vente</span>
                          <span className="font-bold text-primary text-lg">{formatPrice(price.sale_price)}</span>
                        </div>
                        {price.purchase_price > 0 && price.sale_price > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-base-300">
                            <span className="text-sm text-base-content/60">Marge</span>
                            <span className={`font-semibold ${price.sale_price > price.purchase_price ? 'text-success' : 'text-error'}`}>
                              {((price.sale_price - price.purchase_price) / price.purchase_price * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock par entrepôt */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-secondary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Stock par entrepôt</h2>
                    <p className="text-sm text-base-content/60">{stocksByWarehouse.length} entrepôt{stocksByWarehouse.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="text"
                      placeholder="Filtrer..."
                      className="input input-bordered input-sm pl-9 w-40"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="join">
                    <button 
                      className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-3 h-3" />
                    </button>
                    <button 
                      className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setViewMode('table')}
                    >
                      <List className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {stocksByWarehouse.length === 0 ? (
                <div className="text-center py-12">
                  <Box className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <p className="text-base-content/50">Aucun stock disponible</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedStocks.map((stock) => {
                    const status = getStockStatus(stock.quantity)
                    const price = pricesByWarehouse.find(p => p.warehouse_id === stock.warehouse_id)
                    const value = (stock.quantity || 0) * (price?.sale_price || 0)
                    
                    return (
                      <div key={stock.warehouse_id} className="bg-base-200 rounded-xl p-4 border border-base-300 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="font-bold">{stock.warehouse_name}</span>
                          </div>
                          <div className={`badge ${status.bgColor} ${status.color} gap-1`}>
                            {status.icon}
                            {status.label}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-base-content/60">Quantité</span>
                            <span className="text-2xl font-bold">{formatNumber(stock.quantity)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-base-content/60">Valeur</span>
                            <span className="font-semibold text-success">{formatPrice(value)}</span>
                          </div>
                          {stock.location_code && (
                            <div className="flex items-center justify-between pt-2 border-t border-base-300">
                              <span className="text-sm text-base-content/60">Emplacement</span>
                              <span className="text-sm font-mono">{stock.location_code}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
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
                          <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('quantity')}>
                            Quantité <SortIcon field="quantity" />
                          </button>
                        </th>
                        <th>Statut</th>
                        <th className="text-right">Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedStocks.map((stock) => {
                        const status = getStockStatus(stock.quantity)
                        const price = pricesByWarehouse.find(p => p.warehouse_id === stock.warehouse_id)
                        const value = (stock.quantity || 0) * (price?.sale_price || 0)
                        
                        return (
                          <tr key={stock.warehouse_id} className="hover">
                            <td className="font-semibold">{stock.warehouse_name}</td>
                            <td className="text-2xl font-bold">{formatNumber(stock.quantity)}</td>
                            <td>
                              <div className={`badge ${status.bgColor} ${status.color} gap-1`}>
                                {status.icon}
                                {status.label}
                              </div>
                            </td>
                            <td className="text-right font-semibold text-success">{formatPrice(value)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal image */}
      {selectedImage && (
        <div className="modal modal-open" onClick={() => setSelectedImage(null)}>
          <div className="modal-box max-w-4xl p-2" onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10" 
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={selectedImage} 
              alt="Aperçu" 
              className="w-full h-auto max-h-[80vh] object-contain" 
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ProductDetails