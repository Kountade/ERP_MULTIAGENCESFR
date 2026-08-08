// src/components/purchases/PriceHistory.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  History,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Hash,
  Eye,
  MoreVertical,
  Download,
  Printer,
  BarChart3,
  LineChart,
  Clock,
  Award,
  Users,
  FileText
} from 'lucide-react'

const PriceHistory = () => {
  const navigate = useNavigate()
  
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('-date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [stats, setStats] = useState({
    total: 0,
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    suppliers: 0,
    products: 0
  })

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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [historyRes, suppliersRes, productsRes] = await Promise.all([
        AxiosInstance.get('/price-history/'),
        AxiosInstance.get('/suppliers/'),
        AxiosInstance.get('/products/')
      ])
      
      const historyData = historyRes.data || []
      const suppliersData = suppliersRes.data || []
      const productsData = productsRes.data || []
      
      setPriceHistory(historyData)
      setSuppliers(suppliersData)
      setProducts(productsData)
      
      // Calculer les statistiques
      const prices = historyData.map(h => parseFloat(h.price) || 0)
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
      
      setStats({
        total: historyData.length,
        avgPrice: avgPrice,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        suppliers: new Set(historyData.map(h => h.supplier)).size,
        products: new Set(historyData.map(h => h.product)).size
      })
      
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

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier?.company_name || 'Inconnu'
  }

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Inconnu'
  }

  const getProductRef = (productId) => {
    const product = products.find(p => p.id === productId)
    return product?.reference || '-'
  }

  const getPriceTrend = (history, index) => {
    if (index === 0) return null
    const current = parseFloat(history[index].price)
    const previous = parseFloat(history[index - 1].price)
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'stable'
  }

  const filteredAndSortedHistory = React.useMemo(() => {
    let filtered = priceHistory.filter(h => {
      const search = searchTerm.toLowerCase()
      const productName = getProductName(h.product).toLowerCase()
      const supplierName = getSupplierName(h.supplier).toLowerCase()
      const price = h.price.toString()
      
      const matchesSearch = productName.includes(search) || 
                           supplierName.includes(search) || 
                           price.includes(search)
      
      const matchesSupplier = !filterSupplier || h.supplier === parseInt(filterSupplier)
      const matchesProduct = !filterProduct || h.product === parseInt(filterProduct)
      
      return matchesSearch && matchesSupplier && matchesProduct
    })

    // Trier par date (par défaut)
    if (sortField === '-date' || sortField === 'date') {
      const isDesc = sortField === '-date' || (sortField === 'date' && sortDirection === 'desc')
      filtered.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return isDesc ? dateB - dateA : dateA - dateB
      })
    } else {
      filtered.sort((a, b) => {
        let aVal = a[sortField] || ''
        let bVal = b[sortField] || ''
        
        if (sortField === 'price') {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [priceHistory, searchTerm, filterSupplier, filterProduct, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedHistory.length / itemsPerPage)
  const paginatedHistory = filteredAndSortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de l'historique des prix...
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
            Historique des prix d'achat
          </h1>
          <p className="text-base text-base-content/60">
            Suivez l'évolution des prix d'achat par fournisseur
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
          <button className="btn btn-outline gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="btn btn-outline gap-2">
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><History className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Enregistrements</div>
          <div className="stat-value text-3xl font-black">{stats.total}</div>
          <div className="stat-desc">Historique total</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix moyen</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.avgPrice)}</div>
          <div className="stat-desc">Tous produits confondus</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><TrendingUp className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix max</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.maxPrice)}</div>
          <div className="stat-desc">Plus élevé</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning"><TrendingDown className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Prix min</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.minPrice)}</div>
          <div className="stat-desc">Plus bas</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><Building2 className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Fournisseurs</div>
          <div className="stat-value text-3xl font-black">{stats.suppliers}</div>
          <div className="stat-desc">Différents</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-accent"><Package className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Produits</div>
          <div className="stat-value text-3xl font-black">{stats.products}</div>
          <div className="stat-desc">Suivis</div>
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
                placeholder="Rechercher par produit, fournisseur, prix..."
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
              className="select select-bordered min-w-[160px]"
              value={filterSupplier}
              onChange={(e) => {
                setFilterSupplier(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous fournisseurs</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.company_name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered min-w-[160px]"
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous produits</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterSupplier('')
                setFilterProduct('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal - Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedHistory.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">
              Aucun historique trouvé
            </p>
            <p className="text-base text-base-content/40 mt-2">
              Les prix d'achat seront enregistrés automatiquement lors des réceptions de commandes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-lg">
              <thead>
                <tr>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('product')}>
                      Produit <SortIcon field="product" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('supplier')}>
                      Fournisseur <SortIcon field="supplier" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('price')}>
                      Prix <SortIcon field="price" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('quantity')}>
                      Quantité <SortIcon field="quantity" />
                    </button>
                  </th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('-date')}>
                      Date <SortIcon field="-date" />
                    </button>
                  </th>
                  <th>Commande</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((item, index) => {
                  const actualIndex = (currentPage - 1) * itemsPerPage + index
                  const trend = getPriceTrend(filteredAndSortedHistory, actualIndex)
                  
                  return (
                    <tr key={item.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                              <Package className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{getProductName(item.product)}</div>
                            <div className="text-xs text-base-content/50 font-mono">
                              {getProductRef(item.product)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-base-content/50" />
                          <span>{getSupplierName(item.supplier)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                          {trend === 'up' && (
                            <TrendingUp className="w-4 h-4 text-success" />
                          )}
                          {trend === 'down' && (
                            <TrendingDown className="w-4 h-4 text-error" />
                          )}
                          {trend === 'stable' && (
                            <span className="text-base-content/30">—</span>
                          )}
                        </div>
                        <div className="text-xs text-base-content/50">
                          Devise: {item.currency || 'XOF'}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold">{formatNumber(item.quantity)}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-base-content/50" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                      <td>
                        {item.purchase_order ? (
                          <Link 
                            to={`/purchase-orders/${item.purchase_order}`}
                            className="text-primary hover:underline text-sm"
                          >
                            {item.purchase_order}
                          </Link>
                        ) : (
                          <span className="text-base-content/30">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/price-history/${item.id}`}
                            className="btn btn-ghost btn-xs"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="btn btn-ghost btn-xs">
                            <MoreVertical className="w-4 h-4" />
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
        {filteredAndSortedHistory.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedHistory.length)} sur{' '}
                {filteredAndSortedHistory.length} enregistrements
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
                  <option value="15">15 par page</option>
                  <option value="25">25 par page</option>
                  <option value="50">50 par page</option>
                  <option value="100">100 par page</option>
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

export default PriceHistory