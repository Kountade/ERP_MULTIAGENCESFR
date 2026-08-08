// src/components/inventaire/Lots.jsx - Version Professionnelle
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Package,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  Building2,
  Hash,
  MoreVertical,
  Download,
  Printer,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  MapPin,
  QrCode,
  FileText,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  XCircle   // ← AJOUTÉ
} from 'lucide-react'

const Lots = () => {
  const navigate = useNavigate()
  
  const [lots, setLots] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [filterQuality, setFilterQuality] = useState('')
  const [filterExpiry, setFilterExpiry] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [sortField, setSortField] = useState('-created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [stats, setStats] = useState({
    total: 0,
    totalQuantity: 0,
    expired: 0,
    expiringSoon: 0,
    damaged: 0,
    warehouses: 0
  })

  const qualityOptions = [
    { value: 'good', label: 'Bon', color: 'text-success' },
    { value: 'damaged', label: 'Endommagé', color: 'text-error' },
    { value: 'expired', label: 'Expiré', color: 'text-error' },
    { value: 'quarantine', label: 'Quarantaine', color: 'text-warning' }
  ]

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0'
    return new Intl.NumberFormat('fr-FR').format(number)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { label: 'Expiré', color: 'text-error', bg: 'bg-error/10', icon: <XCircle className="w-3 h-3" /> }
    }
    if (diffDays <= 30) {
      return { label: `Expire dans ${diffDays}j`, color: 'text-warning', bg: 'bg-warning/10', icon: <AlertTriangle className="w-3 h-3" /> }
    }
    return { label: `Valide (${diffDays}j)`, color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle className="w-3 h-3" /> }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lotsRes, warehousesRes, productsRes] = await Promise.all([
        AxiosInstance.get('/lots/'),
        AxiosInstance.get('/warehouses/'),
        AxiosInstance.get('/products/')
      ])
      
      const lotsData = lotsRes.data || []
      const warehousesData = warehousesRes.data || []
      const productsData = productsRes.data || []
      
      setLots(lotsData)
      setWarehouses(warehousesData)
      setProducts(productsData)
      
      // Calculer les statistiques
      const totalQuantity = lotsData.reduce((sum, l) => sum + (l.quantity || 0), 0)
      const expired = lotsData.filter(l => l.is_expired || l.quality_status === 'expired').length
      const expiringSoon = lotsData.filter(l => {
        if (!l.expiry_date || l.is_expired) return false
        const diffDays = Math.ceil((new Date(l.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      }).length
      const damaged = lotsData.filter(l => l.quality_status === 'damaged').length
      
      setStats({
        total: lotsData.length,
        totalQuantity,
        expired,
        expiringSoon,
        damaged,
        warehouses: new Set(lotsData.map(l => l.warehouse)).size
      })
      
    } catch (error) {
      console.error(error)
      showMessage('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ===================== NOUVELLE FONCTION SUPPRESSION =====================
  const handleDelete = async (lotId, lotNumber) => {
    // Demander confirmation
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le lot ${lotNumber || 'sans numéro'} ?`)) {
      return
    }

    try {
      await AxiosInstance.delete(`/lots/${lotId}/`)
      showMessage(`Lot ${lotNumber || 'sans numéro'} supprimé avec succès`, 'success')
      
      // Recharger les données et remettre la page à 1
      await fetchData()
      setCurrentPage(1)
    } catch (error) {
      console.error('Erreur lors de la suppression :', error)
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la suppression du lot'
      showMessage(errorMsg, 'error')
    }
  }
  // ========================================================================

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

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return 'Inconnu'
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse?.name || 'Inconnu'
  }

  const getProductName = (productId) => {
    if (!productId) return 'Inconnu'
    const product = products.find(p => p.id === productId)
    return product?.name || 'Inconnu'
  }

  const getProductRef = (productId) => {
    if (!productId) return '-'
    const product = products.find(p => p.id === productId)
    return product?.reference || '-'
  }

  const getQualityBadge = (qualityStatus) => {
    const config = qualityOptions.find(q => q.value === qualityStatus)
    if (!config) return <span className="badge badge-ghost">Inconnu</span>
    
    const colorMap = {
      'good': 'badge-success',
      'damaged': 'badge-error',
      'expired': 'badge-error',
      'quarantine': 'badge-warning'
    }
    
    return (
      <span className={`badge ${colorMap[qualityStatus] || 'badge-ghost'} gap-1`}>
        {config.label}
      </span>
    )
  }

  const filteredAndSortedLots = React.useMemo(() => {
    let filtered = lots.filter(l => {
      const search = searchTerm.toLowerCase()
      const productName = getProductName(l.product).toLowerCase()
      const productRef = getProductRef(l.product).toLowerCase()
      const lotNumber = (l.lot_number || '').toLowerCase()
      const serialNumber = (l.serial_number || '').toLowerCase()
      const warehouseName = getWarehouseName(l.warehouse).toLowerCase()
      
      const matchesSearch = productName.includes(search) || 
                           productRef.includes(search) || 
                           lotNumber.includes(search) ||
                           serialNumber.includes(search) ||
                           warehouseName.includes(search)
      
      const matchesWarehouse = !filterWarehouse || l.warehouse === parseInt(filterWarehouse)
      const matchesQuality = !filterQuality || l.quality_status === filterQuality
      
      let matchesExpiry = true
      if (filterExpiry === 'expired') {
        matchesExpiry = l.is_expired || l.quality_status === 'expired'
      } else if (filterExpiry === 'expiring') {
        if (l.is_expired || l.quality_status === 'expired') {
          matchesExpiry = false
        } else if (l.expiry_date) {
          const diffDays = Math.ceil((new Date(l.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
          matchesExpiry = diffDays <= 30
        } else {
          matchesExpiry = false
        }
      } else if (filterExpiry === 'good') {
        matchesExpiry = !l.is_expired && l.quality_status !== 'expired' && l.quantity > 0
      }
      
      return matchesSearch && matchesWarehouse && matchesQuality && matchesExpiry
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'product_name') {
        aVal = getProductName(a.product)
        bVal = getProductName(b.product)
      } else if (sortField === 'warehouse_name') {
        aVal = getWarehouseName(a.warehouse)
        bVal = getWarehouseName(b.warehouse)
      } else if (sortField === 'quantity') {
        aVal = a.quantity || 0
        bVal = b.quantity || 0
      } else if (sortField === '-created_at' || sortField === 'created_at') {
        const isDesc = sortField === '-created_at'
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return isDesc ? dateB - dateA : dateA - dateB
      } else if (sortField === 'expiry_date') {
        aVal = a.expiry_date || ''
        bVal = b.expiry_date || ''
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [lots, searchTerm, filterWarehouse, filterQuality, filterExpiry, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedLots.length / itemsPerPage)
  const paginatedLots = filteredAndSortedLots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des lots...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to="/stocks" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            <div className="divider divider-horizontal mx-0 h-6 hidden sm:flex"></div>
            <Package className="w-6 h-6 text-primary hidden sm:flex" />
            <h1 className="text-xl font-semibold">Gestion des lots</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={fetchData}
              className="btn btn-ghost btn-sm gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button 
              onClick={() => navigate('/lots/nouveau')}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau lot
            </button>
            <button className="btn btn-ghost btn-sm gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="btn btn-ghost btn-sm gap-2 hidden sm:flex">
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg py-2 px-4`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span className="text-sm">{message.text}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-6 py-6">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-primary"><Package className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Total lots</div>
            <div className="stat-value text-2xl font-black">{stats.total}</div>
            <div className="stat-desc">Lots enregistrés</div>
          </div>
          
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-secondary"><Layers className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Quantité totale</div>
            <div className="stat-value text-2xl font-black">{formatNumber(stats.totalQuantity)}</div>
            <div className="stat-desc">Unités en stock</div>
          </div>
          
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-error"><XCircle className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Expirés</div>
            <div className="stat-value text-2xl font-black">{stats.expired}</div>
            <div className="stat-desc">À éliminer</div>
          </div>
          
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-warning"><AlertTriangle className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Expire bientôt</div>
            <div className="stat-value text-2xl font-black">{stats.expiringSoon}</div>
            <div className="stat-desc">Dans 30 jours</div>
          </div>
          
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-error"><AlertCircle className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Endommagés</div>
            <div className="stat-value text-2xl font-black">{stats.damaged}</div>
            <div className="stat-desc">Qualité défectueuse</div>
          </div>
          
          <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
            <div className="stat-figure text-info"><Building2 className="w-6 h-6" /></div>
            <div className="stat-title text-sm font-semibold">Entrepôts</div>
            <div className="stat-value text-2xl font-black">{stats.warehouses}</div>
            <div className="stat-desc">Sites actifs</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par produit, lot, numéro de série..."
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
                value={filterQuality}
                onChange={(e) => {
                  setFilterQuality(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Toute qualité</option>
                {qualityOptions.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
              
              <select 
                className="select select-bordered min-w-[150px]"
                value={filterExpiry}
                onChange={(e) => {
                  setFilterExpiry(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous statuts</option>
                <option value="good">Valides</option>
                <option value="expiring">Expire bientôt</option>
                <option value="expired">Expirés</option>
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterWarehouse('')
                  setFilterQuality('')
                  setFilterExpiry('')
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

        {/* Tableau principal */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          {filteredAndSortedLots.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
              <p className="text-xl font-semibold text-base-content/50">
                Aucun lot trouvé
              </p>
              <p className="text-base text-base-content/40 mt-2">
                Les lots sont créés automatiquement lors des réceptions de commandes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg">
                <thead>
                  <tr className="bg-base-200">
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('product_name')}>
                        Produit <SortIcon field="product_name" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('lot_number')}>
                        Lot <SortIcon field="lot_number" />
                      </button>
                    </th>
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
                    <th>Qualité</th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('expiry_date')}>
                        Expiration <SortIcon field="expiry_date" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('-created_at')}>
                        Créé le <SortIcon field="-created_at" />
                      </button>
                    </th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLots.map((lot) => {
                    const expiryStatus = getExpiryStatus(lot.expiry_date)
                    
                    return (
                      <tr key={lot.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center">
                                <Package className="w-5 h-5" />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold">{getProductName(lot.product)}</div>
                              <div className="text-xs text-base-content/50 font-mono">
                                {getProductRef(lot.product)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-semibold">{lot.lot_number || '-'}</span>
                            {lot.serial_number && (
                              <span className="text-xs text-base-content/50 flex items-center gap-1">
                                <QrCode className="w-3 h-3" />
                                SN: {lot.serial_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-base-content/50" />
                            <span>{getWarehouseName(lot.warehouse)}</span>
                          </div>
                          {lot.location && (
                            <div className="text-xs text-base-content/50 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lot.location}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="font-bold text-lg">{formatNumber(lot.quantity)}</span>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            {getQualityBadge(lot.quality_status)}
                            {lot.is_expired && (
                              <span className="badge badge-error badge-xs">Expiré</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span>{formatDate(lot.expiry_date)}</span>
                            {expiryStatus && (
                              <span className={`text-xs flex items-center gap-1 ${expiryStatus.color}`}>
                                {expiryStatus.icon}
                                {expiryStatus.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-base-content/50" />
                            <span>{formatDateTime(lot.created_at)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Link 
                              to={`/lots/${lot.id}`}
                              className="btn btn-ghost btn-xs"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link 
                              to={`/lots/${lot.id}/modifier`}
                              className="btn btn-ghost btn-xs"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            {/* ===== BOUTON SUPPRIMER AMÉLIORÉ ===== */}
                            <button 
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDelete(lot.id, lot.lot_number)}
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
          {filteredAndSortedLots.length > 0 && (
            <div className="p-4 border-t border-base-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-base-content/60">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedLots.length)} sur{' '}
                  {filteredAndSortedLots.length} lots
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
                    <option value="20">20 par page</option>
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
      </div>
    </div>
  )
}

export default Lots