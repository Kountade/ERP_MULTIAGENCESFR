// src/components/inventaire/Stocks.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  Warehouse,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
  Grid,
  FileText,
  MapPin,
  Hash,
  Layers
} from 'lucide-react'

const Stocks = () => {
  const navigate = useNavigate()

  const [warehouseStocks, setWarehouseStocks] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [stockToDelete, setStockToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('product_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    lowStock: 0,
    outOfStock: 0,
    warehouses: 0,
    totalValue: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [stocksRes, warehousesRes, productsRes] = await Promise.all([
        AxiosInstance.get('/warehouse-stocks/'),
        AxiosInstance.get('/warehouses/'),
        AxiosInstance.get('/products/')
      ])
      
      const stocksData = stocksRes.data || []
      const warehousesData = warehousesRes.data || []
      const productsData = productsRes.data || []
      
      setWarehouseStocks(stocksData)
      setWarehouses(warehousesData)
      setProducts(productsData)

      // Calculer les statistiques
      const totalQuantity = stocksData.reduce((sum, s) => sum + (s.quantity || 0), 0)
      const lowStock = stocksData.filter(s => s.quantity > 0 && s.quantity <= (s.minimum_stock || 5)).length
      const outOfStock = stocksData.filter(s => s.quantity === 0).length
      
      // Calcul de la valeur totale estimée
      const totalValue = stocksData.reduce((sum, stock) => {
        const product = productsData.find(p => p.id === stock.product)
        const price = product?.price || 0
        return sum + (stock.quantity * price)
      }, 0)

      setStats({
        totalProducts: stocksData.length,
        totalQuantity,
        lowStock,
        outOfStock,
        warehouses: warehousesData.length,
        totalValue
      })

    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des stocks', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleDeleteStock = async () => {
    if (!stockToDelete) return
    try {
      await AxiosInstance.delete(`/warehouse-stocks/${stockToDelete.id}/`)
      showNotification(`Stock supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setStockToDelete(null)
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

  const getStatusBadge = (quantity, minStock) => {
    if (quantity === 0) {
      return (
        <div className="badge badge-error gap-1">
          <XCircle className="w-3 h-3" />
          Rupture
        </div>
      )
    }
    if (quantity <= (minStock || 5)) {
      return (
        <div className="badge badge-warning gap-1">
          <AlertTriangle className="w-3 h-3" />
          Stock faible
        </div>
      )
    }
    return (
      <div className="badge badge-success gap-1">
        <CheckCircle className="w-3 h-3" />
        Normal
      </div>
    )
  }

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Produit inconnu'
  }

  const getProductRef = (productId) => {
    const product = products.find(p => p.id === productId)
    return product?.reference || '-'
  }

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === productId)
    return product?.price || 0
  }

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse?.name || 'Entrepôt inconnu'
  }

  const getAgenceName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse?.agence_nom || '-'
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount || 0) + ' FCFA'
  }

  // Filtrage et tri
  const filteredAndSortedStocks = React.useMemo(() => {
    let filtered = warehouseStocks.filter(stock => {
      const productName = getProductName(stock.product).toLowerCase()
      const productRef = getProductRef(stock.product).toLowerCase()
      const warehouseName = getWarehouseName(stock.warehouse).toLowerCase()
      const search = searchTerm.toLowerCase()
      
      const matchesSearch = productName.includes(search) || 
                           productRef.includes(search) || 
                           warehouseName.includes(search)
      
      const matchesWarehouse = filterWarehouse === '' || 
        stock.warehouse === parseInt(filterWarehouse)
      
      const matchesStatus = filterStatus === '' ||
        (filterStatus === 'normal' && stock.quantity > (stock.minimum_stock || 5)) ||
        (filterStatus === 'low' && stock.quantity > 0 && stock.quantity <= (stock.minimum_stock || 5)) ||
        (filterStatus === 'out' && stock.quantity === 0)
      
      return matchesSearch && matchesWarehouse && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'product_name':
          aVal = getProductName(a.product)
          bVal = getProductName(b.product)
          break
        case 'reference':
          aVal = getProductRef(a.product)
          bVal = getProductRef(b.product)
          break
        case 'warehouse':
          aVal = getWarehouseName(a.warehouse)
          bVal = getWarehouseName(b.warehouse)
          break
        case 'quantity':
          aVal = a.quantity || 0
          bVal = b.quantity || 0
          break
        case 'value':
          aVal = (a.quantity || 0) * getProductPrice(a.product)
          bVal = (b.quantity || 0) * getProductPrice(b.product)
          break
        default:
          aVal = a[sortField] || ''
          bVal = b[sortField] || ''
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [warehouseStocks, searchTerm, filterWarehouse, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStocks.length / itemsPerPage)
  const paginatedStocks = filteredAndSortedStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des stocks...
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
            Gestion des stocks
          </h1>
          <p className="text-base text-base-content/60">
            Gérez vos stocks par entrepôt
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
            onClick={() => navigate('/stocks/ajouter')}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter du stock
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><Package className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Produits</div>
          <div className="stat-value text-3xl font-black">{stats.totalProducts}</div>
          <div className="stat-desc">Références en stock</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><Layers className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Unités</div>
          <div className="stat-value text-3xl font-black">{formatNumber(stats.totalQuantity)}</div>
          <div className="stat-desc">Articles en stock</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning"><AlertTriangle className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Stock faible</div>
          <div className="stat-value text-3xl font-black">{stats.lowStock}</div>
          <div className="stat-desc">À réapprovisionner</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-error"><XCircle className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Rupture</div>
          <div className="stat-value text-3xl font-black">{stats.outOfStock}</div>
          <div className="stat-desc">Produits indisponibles</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><Warehouse className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Entrepôts</div>
          <div className="stat-value text-3xl font-black">{stats.warehouses}</div>
          <div className="stat-desc">Sites actifs</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-base font-semibold">Valeur</div>
          <div className="stat-value text-2xl font-black">{formatCurrency(stats.totalValue)}</div>
          <div className="stat-desc">Stock estimé</div>
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
                placeholder="Rechercher par produit, référence, entrepôt..."
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
              value={filterWarehouse}
              onChange={(e) => {
                setFilterWarehouse(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous entrepôts</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered min-w-[140px]"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous statuts</option>
              <option value="normal">Normal</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
            </select>
            
            <button 
              className="btn btn-outline"
              onClick={() => {
                setFilterWarehouse('')
                setFilterStatus('')
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
        {filteredAndSortedStocks.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">
              Aucun stock trouvé
            </p>
            <p className="text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou ajoutez du stock
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/stocks/ajouter')}
            >
              <Plus className="w-4 h-4" />
              Ajouter du stock
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Vue Grille */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedStocks.map((stock) => {
                const productName = getProductName(stock.product)
                const productRef = getProductRef(stock.product)
                const warehouseName = getWarehouseName(stock.warehouse)
                const agenceName = getAgenceName(stock.warehouse)
                const status = getStatusBadge(stock.quantity, stock.minimum_stock)
                const value = (stock.quantity || 0) * getProductPrice(stock.product)
                
                return (
                  <div
                    key={stock.id}
                    className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-xl w-14 h-14">
                            <Package className="w-7 h-7" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-base-content line-clamp-1">
                            {productName}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {status}
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm btn-circle">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <button onClick={() => navigate(`/stocks/${stock.id}/modifier`)}>
                              <Edit className="w-4 h-4" />
                              Modifier
                            </button>
                          </li>
                          <li>
                            <button 
                              className="text-error"
                              onClick={() => {
                                setStockToDelete(stock)
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
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono">Réf: {productRef}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <Warehouse className="w-4 h-4" />
                        <span>{warehouseName}</span>
                      </div>
                      {agenceName !== '-' && (
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <Building2 className="w-4 h-4" />
                          <span>{agenceName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <Package className="w-4 h-4" />
                        <span className="font-bold text-lg">{formatNumber(stock.quantity)}</span>
                        <span className="text-xs">unités</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{formatCurrency(value)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-base-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Stock min.</span>
                        <span className="badge">{stock.minimum_stock || 5}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Vue Tableau */
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button className="flex items-center gap-1" onClick={() => handleSort('product_name')}>
                      Produit
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1" onClick={() => handleSort('reference')}>
                      Référence
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1" onClick={() => handleSort('warehouse')}>
                      Entrepôt
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>Agence</th>
                  <th>
                    <button className="flex items-center gap-1" onClick={() => handleSort('quantity')}>
                      Quantité
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1" onClick={() => handleSort('value')}>
                      Valeur
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocks.map((stock) => {
                  const productName = getProductName(stock.product)
                  const productRef = getProductRef(stock.product)
                  const warehouseName = getWarehouseName(stock.warehouse)
                  const agenceName = getAgenceName(stock.warehouse)
                  const status = getStatusBadge(stock.quantity, stock.minimum_stock)
                  const value = (stock.quantity || 0) * getProductPrice(stock.product)
                  
                  return (
                    <tr key={stock.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                              <Package className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{productName}</div>
                            <div className="text-xs text-base-content/50 font-mono">{productRef}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{productRef}</td>
                      <td>{warehouseName}</td>
                      <td>{agenceName}</td>
                      <td>
                        <span className="font-bold text-lg">{formatNumber(stock.quantity)}</span>
                      </td>
                      <td>
                        <span className="font-semibold">{formatCurrency(value)}</span>
                      </td>
                      <td>{status}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/stocks/${stock.id}/modifier`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => {
                              setStockToDelete(stock)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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
        {filteredAndSortedStocks.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedStocks.length)} sur{' '}
                {filteredAndSortedStocks.length} stocks
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
                Voulez-vous vraiment supprimer ce stock ?
              </p>
              <p className="text-xl font-bold text-error mt-2">
                "{getProductName(stockToDelete?.product)}" - {formatNumber(stockToDelete?.quantity)} unités
              </p>
              <p className="text-sm text-base-content/50 mt-4">
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
                onClick={handleDeleteStock}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stocks