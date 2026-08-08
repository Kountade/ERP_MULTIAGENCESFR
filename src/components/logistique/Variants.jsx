// src/components/Variants.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Layers,
  Tag,
  DollarSign,
  Box,
  Hash
} from 'lucide-react'

const Variants = () => {
  const navigate = useNavigate()

  const [variants, setVariants] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('sku')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    outOfStock: 0,
    totalValue: 0
  })

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0,00'
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(number)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [varRes, prodRes] = await Promise.all([
        AxiosInstance.get('/variants/'),
        AxiosInstance.get('/products/')
      ])
      
      const variantsData = varRes.data
      const productsData = prodRes.data
      const productMap = {}
      productsData.forEach(p => { productMap[p.id] = p.name })

      const enrichedVariants = variantsData.map(v => ({
        ...v,
        product_name: productMap[v.product] || `Produit #${v.product}`
      }))
      
      setVariants(enrichedVariants)
      setProducts(productsData)
      
      // Calculer les statistiques
      const total = enrichedVariants.length
      const active = enrichedVariants.filter(v => v.is_active).length
      const inactive = total - active
      const outOfStock = enrichedVariants.filter(v => (v.stock_quantity || 0) === 0).length
      const totalValue = enrichedVariants.reduce((sum, v) => 
        sum + ((v.stock_quantity || 0) * (v.purchase_price || 0)), 0
      )
      
      setStats({ total, active, inactive, outOfStock, totalValue })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des variantes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return
    try {
      await AxiosInstance.delete(`/variants/${variantToDelete.id}/`)
      showNotification(`Variante "${variantToDelete.sku}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setVariantToDelete(null)
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

  const filteredAndSortedVariants = React.useMemo(() => {
    let filtered = variants.filter(v => {
      const search = searchTerm.toLowerCase()
      const sku = (v.sku || '').toLowerCase()
      const productName = (v.product_name || '').toLowerCase()
      const matchesSearch = sku.includes(search) || productName.includes(search)
      const matchesProduct = !filterProduct || v.product === parseInt(filterProduct)
      const matchesActive = filterActive === '' || v.is_active === (filterActive === 'true')
      return matchesSearch && matchesProduct && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (['purchase_price', 'sale_price', 'stock_quantity'].includes(sortField)) {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [variants, searchTerm, filterProduct, filterActive, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedVariants.length / itemsPerPage)
  const paginatedVariants = filteredAndSortedVariants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-success badge-sm gap-1">
        <CheckCircle className="w-3 h-3" />
        Actif
      </span>
    ) : (
      <span className="badge badge-ghost badge-sm gap-1">
        <AlertCircle className="w-3 h-3" />
        Inactif
      </span>
    )
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des variantes...
          </p>
        </div>
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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
            Variantes de produits
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Gérez les déclinaisons (tailles, couleurs, etc.)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/variants/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouvelle variante</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Layers className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Actives</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-error">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Inactives</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.inactive}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Rupture</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.outOfStock}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4 col-span-2 lg:col-span-1">
          <div className="stat-figure text-info">
            <DollarSign className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Valeur stock</div>
          <div className="stat-value text-base lg:text-xl truncate">
            {formatNumber(stats.totalValue)} €
          </div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par SKU ou produit..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select 
            className="select select-bordered select-sm min-w-[200px]"
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous les produits</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <select 
            className="select select-bordered select-sm w-32"
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
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterProduct('')
              setFilterActive('')
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            <Filter className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered input-sm w-full pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3 h-3" />
            Filtres
          </button>
        </div>

        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select 
              className="select select-bordered select-sm w-full"
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les produits</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered select-sm w-full"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setFilterProduct('')
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th className="w-12"></th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('sku')}
                  >
                    SKU
                    <SortIcon field="sku" />
                  </button>
                </th>
                <th>Produit</th>
                <th>Attributs</th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('purchase_price')}
                  >
                    Prix achat
                    <SortIcon field="purchase_price" />
                  </button>
                </th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('sale_price')}
                  >
                    Prix vente
                    <SortIcon field="sale_price" />
                  </button>
                </th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('stock_quantity')}
                  >
                    Stock
                    <SortIcon field="stock_quantity" />
                  </button>
                </th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVariants.map((variant) => (
                <tr key={variant.id} className="hover">
                  <td>
                    {variant.image ? (
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-lg">
                          <img src={variant.image} alt={variant.sku} className="object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary rounded-lg w-8 h-8">
                          <Layers className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="font-mono font-medium text-sm">{variant.sku}</td>
                  <td className="text-sm max-w-xs truncate">{variant.product_name}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(variant.attributes || {}).map(([key, val]) => (
                        <span key={key} className="badge badge-outline badge-xs">
                          {key}: {val}
                        </span>
                      ))}
                      {Object.keys(variant.attributes || {}).length === 0 && (
                        <span className="text-base-content/40 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right text-sm">{formatNumber(variant.purchase_price)} €</td>
                  <td className="text-right text-sm font-semibold text-primary">
                    {formatNumber(variant.sale_price)} €
                  </td>
                  <td className="text-center">
                    <span className={`text-sm font-medium ${variant.stock_quantity === 0 ? 'text-error' : ''}`}>
                      {variant.stock_quantity || 0}
                    </span>
                  </td>
                  <td>{getStatusBadge(variant.is_active)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => navigate(`/variants/${variant.id}/modifier`)}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => {
                          setVariantToDelete(variant)
                          setShowDeleteModal(true)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedVariants.length === 0 && (
          <div className="p-12 text-center">
            <Layers className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-base font-medium text-base-content/50">
              Aucune variante trouvée
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            <button 
              className="btn btn-primary btn-sm mt-4"
              onClick={() => navigate('/variants/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer une variante
            </button>
          </div>
        )}
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedVariants.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <Layers className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucune variante trouvée
            </p>
            <button 
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/variants/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer
            </button>
          </div>
        ) : (
          paginatedVariants.map((variant) => (
            <div key={variant.id} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {variant.image ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={variant.image} alt={variant.sku} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-mono font-semibold text-sm">{variant.sku}</h3>
                      <p className="text-xs text-base-content/60 truncate">{variant.product_name}</p>
                    </div>
                    {getStatusBadge(variant.is_active)}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(variant.attributes || {}).map(([key, val]) => (
                      <span key={key} className="badge badge-outline badge-xs">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-base-content/60">Achat:</span>
                      <span className="ml-1 font-medium">{formatNumber(variant.purchase_price)} €</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Vente:</span>
                      <span className="ml-1 font-semibold text-primary">{formatNumber(variant.sale_price)} €</span>
                    </div>
                    <div>
                      <span className="text-base-content/60">Stock:</span>
                      <span className={`ml-1 font-medium ${variant.stock_quantity === 0 ? 'text-error' : ''}`}>
                        {variant.stock_quantity || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                <button 
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate(`/variants/${variant.id}/modifier`)}
                >
                  <Edit className="w-3 h-3" />
                  <span className="text-xs">Modifier</span>
                </button>
                <button 
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => {
                    setVariantToDelete(variant)
                    setShowDeleteModal(true)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-xs">Supprimer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedVariants.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedVariants.length)} sur {filteredAndSortedVariants.length} variantes
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="select select-bordered select-xs lg:select-sm w-20 lg:w-28"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            
            <div className="join">
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              
              <span className="join-item btn btn-xs lg:btn-sm no-animation">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70 text-sm">
                Voulez-vous vraiment supprimer la variante
              </p>
              <p className="text-lg font-bold text-error mt-2 font-mono">
                "{variantToDelete?.sku}"
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleDeleteVariant}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Variants