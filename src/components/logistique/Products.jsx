// src/components/Products.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Barcode,
  Hash,
  Folder,
  DollarSign,
  List,
  LayoutGrid,
  MoreVertical,
  Award,
  XCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  ShoppingCart,
  FileText,
  Info,
  Loader2,
  Check,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Tag,
  Layers,
  Grid,
  Printer,
  Download
} from 'lucide-react'

const Products = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState('grid')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    totalValue: 0,
    categories: 0,
    brands: 0
  })

  const productTypes = {
    simple: { label: 'Simple', color: 'badge-primary' },
    variable: { label: 'Variable', color: 'badge-secondary' },
    service: { label: 'Service', color: 'badge-info' },
    digital: { label: 'Numérique', color: 'badge-accent' }
  }

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0'
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        AxiosInstance.get('/products/'),
        AxiosInstance.get('/categories/'),
        AxiosInstance.get('/brands/')
      ])
      
      const productsData = prodRes.data || []
      const categoriesData = catRes.data || []
      const brandsData = brandRes.data || []
      
      setProducts(productsData)
      setCategories(categoriesData)
      setBrands(brandsData)
      
      const total = productsData.length
      const active = productsData.filter(p => p.is_active).length
      const inactive = total - active
      const lowStock = productsData.filter(p => p.is_low_stock).length
      const totalValue = productsData.reduce((sum, p) => 
        sum + ((p.stock_quantity || 0) * (p.purchase_price || 0)), 0
      )
      
      setStats({ 
        total, 
        active, 
        inactive,
        lowStock, 
        totalValue,
        categories: categoriesData.length,
        brands: brandsData.length
      })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des produits', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      await AxiosInstance.delete(`/products/${productToDelete.id}/`)
      showNotification(`Produit "${productToDelete.name}" supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
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
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-success gap-1 px-3 py-2 text-xs">
        <CheckCircle className="w-3 h-3" />
        Actif
      </span>
    ) : (
      <span className="badge badge-ghost gap-1 px-3 py-2 text-xs">
        <XCircle className="w-3 h-3" />
        Inactif
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const config = productTypes[type] || productTypes.simple
    return (
      <span className={`badge ${config.color} badge-xs`}>
        {config.label}
      </span>
    )
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { label: 'Rupture', color: 'text-error', bgColor: 'bg-error/10', icon: <AlertTriangle className="w-3 h-3" /> }
    }
    if (quantity <= 5) {
      return { label: 'Faible', color: 'text-warning', bgColor: 'bg-warning/10', icon: <AlertTriangle className="w-3 h-3" /> }
    }
    return { label: 'Normal', color: 'text-success', bgColor: 'bg-success/10', icon: <CheckCircle className="w-3 h-3" /> }
  }

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(p => {
      const search = searchTerm.toLowerCase()
      const name = (p.name || '').toLowerCase()
      const ref = (p.reference || '').toLowerCase()
      const barcode = (p.barcode || '').toLowerCase()
      const matchesSearch = name.includes(search) || ref.includes(search) || barcode.includes(search)
      const matchesCategory = !filterCategory || p.category === parseInt(filterCategory)
      const matchesBrand = !filterBrand || p.brand === parseInt(filterBrand)
      const matchesActive = filterActive === '' || p.is_active === (filterActive === 'true')
      return matchesSearch && matchesCategory && matchesBrand && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (['purchase_price', 'sale_price', 'stock_quantity'].includes(sortField)) {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      
      if (sortField === 'category_name') {
        aVal = (a.category_name || '').toLowerCase()
        bVal = (b.category_name || '').toLowerCase()
      }
      
      if (sortField === 'brand_name') {
        aVal = (a.brand_name || '').toLowerCase()
        bVal = (b.brand_name || '').toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [products, searchTerm, filterCategory, filterBrand, filterActive, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des produits...
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
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Produits
          </h1>
          <p className="text-base text-base-content/60">
            Gérez votre catalogue produits
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/produits/nouveau')}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><Package className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Total</div>
          <div className="stat-value text-3xl font-black">{stats.total}</div>
          <div className="stat-desc">Produits</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><CheckCircle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Actifs</div>
          <div className="stat-value text-3xl font-black">{stats.active}</div>
          <div className="stat-desc">{stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% du total</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-error"><XCircle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Inactifs</div>
          <div className="stat-value text-3xl font-black">{stats.inactive}</div>
          <div className="stat-desc">Désactivés</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning"><AlertTriangle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Stock faible</div>
          <div className="stat-value text-3xl font-black">{stats.lowStock}</div>
          <div className="stat-desc">À réapprovisionner</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Valeur stock</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.totalValue)}</div>
          <div className="stat-desc">Estimation</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><Folder className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Catégories</div>
          <div className="stat-value text-3xl font-black">{stats.categories}</div>
          <div className="stat-desc">Actives</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-accent"><Award className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Marques</div>
          <div className="stat-value text-3xl font-black">{stats.brands}</div>
          <div className="stat-desc">Actives</div>
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
                placeholder="Rechercher par nom, référence, code-barres..."
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
              className="select select-bordered min-w-[150px]"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered min-w-[140px]"
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Toutes marques</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered min-w-[130px]"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterCategory('')
                setFilterBrand('')
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">
              Aucun produit trouvé
            </p>
            <p className="text-base text-base-content/40 mt-2">
              {searchTerm || filterCategory || filterBrand || filterActive
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier produit'}
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/produits/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Créer un produit
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity || 0)
                const typeConfig = productTypes[product.product_type] || productTypes.simple
                
                return (
                  <Link
                    key={product.id}
                    to={`/produits/${product.id}`}
                    className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-xl w-14 h-14 flex items-center justify-center">
                            {product.main_image ? (
                              <img src={product.main_image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package className="w-7 h-7" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-base-content line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="badge badge-ghost badge-xs font-mono">
                              <Hash className="w-3 h-3 mr-1" />
                              {product.reference}
                            </span>
                            <span className={`badge ${typeConfig.color} badge-xs`}>
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm btn-circle">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <Link to={`/produits/${product.id}`}>
                              <Eye className="w-4 h-4" />
                              Voir détails
                            </Link>
                          </li>
                          <li>
                            <Link to={`/produits/${product.id}/modifier`}>
                              <Edit className="w-4 h-4" />
                              Modifier
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="text-error"
                              onClick={() => {
                                setProductToDelete(product)
                                setShowDeleteModal(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Catégorie</span>
                        <span className="text-sm font-medium">{product.category_name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Marque</span>
                        <span className="text-sm font-medium">{product.brand_name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Prix de vente</span>
                        <span className="font-bold text-primary">{formatPrice(product.sale_price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Stock</span>
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${stockStatus.color}`}>
                            {formatNumber(product.stock_quantity || 0)}
                          </span>
                          <span className={`badge ${stockStatus.bgColor} ${stockStatus.color} gap-1`}>
                            {stockStatus.icon}
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-base-300 flex items-center justify-between">
                      <span className="text-sm text-base-content/60">
                        <DollarSign className="w-3 h-3 inline" />
                        Achat: {formatPrice(product.purchase_price)}
                      </span>
                      {getStatusBadge(product.is_active)}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>
                      Référence <SortIcon field="reference" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('name')}>
                      Nom <SortIcon field="name" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('category_name')}>
                      Catégorie <SortIcon field="category_name" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('brand_name')}>
                      Marque <SortIcon field="brand_name" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('sale_price')}>
                      Prix <SortIcon field="sale_price" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('stock_quantity')}>
                      Stock <SortIcon field="stock_quantity" />
                    </button>
                  </th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity || 0)
                  const typeConfig = productTypes[product.product_type] || productTypes.simple
                  
                  return (
                    <tr key={product.id} className="hover">
                      <td>
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-lg">
                            {product.main_image ? (
                              <img src={product.main_image} alt={product.name} className="object-cover" />
                            ) : (
                              <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-mono font-semibold text-sm">{product.reference}</div>
                        {product.barcode && (
                          <div className="text-xs text-base-content/50 flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {product.barcode}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <span className={`badge ${typeConfig.color} badge-xs`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </td>
                      <td>{product.category_name || '-'}</td>
                      <td>{product.brand_name || '-'}</td>
                      <td>
                        <div className="font-bold text-primary">{formatPrice(product.sale_price)}</div>
                        <div className="text-xs text-base-content/50">Achat: {formatPrice(product.purchase_price)}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${stockStatus.color}`}>
                            {formatNumber(product.stock_quantity || 0)}
                          </span>
                          <span className={`badge ${stockStatus.bgColor} ${stockStatus.color} gap-1`}>
                            {stockStatus.icon}
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(product.is_active)}</td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Link to={`/produits/${product.id}`} className="btn btn-ghost btn-xs">
                            <Eye className="w-3 h-3" />
                          </Link>
                          <Link to={`/produits/${product.id}/modifier`} className="btn btn-ghost btn-xs">
                            <Edit className="w-3 h-3" />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => {
                              setProductToDelete(product)
                              setShowDeleteModal(true)
                            }}
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
        )}

        {/* Pagination */}
        {filteredAndSortedProducts.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} sur{' '}
                {filteredAndSortedProducts.length} produits
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
                  <option value="12">12 par page</option>
                  <option value="24">24 par page</option>
                  <option value="48">48 par page</option>
                  <option value="96">96 par page</option>
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

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment supprimer ce produit ?
              </p>
              <p className="text-xl font-bold text-error mt-4">
                "{productToDelete?.name}"
              </p>
              <p className="text-sm text-base-content/50 mt-1">
                Réf: {productToDelete?.reference}
              </p>
              <p className="text-sm text-base-content/50 mt-3">
                Cette action est irréversible. Toutes les données associées seront supprimées.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteProduct}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
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

export default Products