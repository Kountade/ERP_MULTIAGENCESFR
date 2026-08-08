// src/components/achats/Receptions.jsx
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
  Package,
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
  Truck,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  XCircle,
  CheckSquare,
  Receipt,
  TrendingUp,
  Users
} from 'lucide-react'

const Receptions = () => {
  const navigate = useNavigate()

  const [receptions, setReceptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [receptionToDelete, setReceptionToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('table')
  const [sortField, setSortField] = useState('receipt_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    totalCosts: 0,
    thisMonth: 0,
    avgValue: 0
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setError('Veuillez vous connecter')
        setLoading(false)
        return
      }
      
      let response
      try {
        response = await AxiosInstance.get('/purchase-receipts/')
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/receptions/')
        } else {
          throw err
        }
      }
      
      const receipts = response.data || []
      setReceptions(receipts)
      
      // Calculer les statistiques à partir des données reçues
      const total = receipts.length
      const totalValue = receipts.reduce((sum, r) => sum + (parseFloat(r.total_value) || 0), 0)
      const totalCosts = receipts.reduce((sum, r) => sum + (parseFloat(r.total_costs) || 0), 0)
      const thisMonth = receipts.filter(r => {
        const date = new Date(r.receipt_date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length
      const avgValue = total > 0 ? totalValue / total : 0
      
      setStats({ total, totalValue, totalCosts, thisMonth, avgValue })
      
    } catch (error) {
      console.error('Erreur chargement réceptions:', error)
      setError('Erreur de chargement des réceptions')
      showNotification('Erreur de chargement des réceptions', 'error')
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

  const handleDeleteReception = async () => {
    if (!receptionToDelete) return
    try {
      await AxiosInstance.delete(`/purchase-receipts/${receptionToDelete.id}/`)
      showNotification(`Réception ${receptionToDelete.receipt_number} supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setReceptionToDelete(null)
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

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  // Filtrage et tri
  const filteredAndSortedReceipts = React.useMemo(() => {
    let filtered = receptions.filter(receipt => {
      const search = searchTerm.toLowerCase()
      const receiptNumber = (receipt.receipt_number || '').toLowerCase()
      const orderNumber = (receipt.order_number || receipt.purchase_order?.order_number || '').toLowerCase()
      const supplierName = (receipt.supplier_name || receipt.purchase_order?.supplier?.company_name || '').toLowerCase()
      
      const matchesSearch = receiptNumber.includes(search) || orderNumber.includes(search) || supplierName.includes(search)
      
      let matchesDate = true
      if (dateRange.start) {
        const receiptDate = new Date(receipt.receipt_date)
        const startDate = new Date(dateRange.start)
        matchesDate = matchesDate && receiptDate >= startDate
      }
      if (dateRange.end) {
        const receiptDate = new Date(receipt.receipt_date)
        const endDate = new Date(dateRange.end)
        matchesDate = matchesDate && receiptDate <= endDate
      }
      
      return matchesSearch && matchesDate
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'total_value') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (sortField === 'receipt_date') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [receptions, searchTerm, sortField, sortDirection, dateRange])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReceipts.length / itemsPerPage)
  const paginatedReceipts = filteredAndSortedReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Ajuster itemsPerPage selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(9)
      } else {
        setItemsPerPage(12)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des réceptions...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="font-semibold">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Réceptions
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos réceptions de marchandises ({stats.total} au total)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button onClick={() => navigate('/receptions/nouveau')} className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle réception</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Valeur totale</div>
          <div className="stat-value text-xs sm:text-sm lg:text-base font-black truncate">{formatCurrency(stats.totalValue)}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Truck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Frais totaux</div>
          <div className="stat-value text-xs sm:text-sm lg:text-base font-black truncate">{formatCurrency(stats.totalCosts)}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Ce mois-ci</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.thisMonth}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-secondary"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Valeur moyenne</div>
          <div className="stat-value text-xs sm:text-sm lg:text-base font-black truncate">{formatCurrency(stats.avgValue)}</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par numéro de réception, commande ou fournisseur..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-2">
            <Filter className="w-4 h-4" /> Filtres {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <div className="flex gap-2">
              <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="input input-bordered text-sm w-36" placeholder="Date début" />
              <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="input input-bordered text-sm w-36" placeholder="Date fin" />
            </div>
            <button onClick={() => { setDateRange({ start: '', end: '' }); setSearchTerm(''); setCurrentPage(1) }} className="btn btn-outline gap-2">
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
            <div className="join ml-auto">
              <button className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('table')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des réceptions */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedReceipts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune réception trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par créer votre première réception</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/receptions/nouveau')}>
              <Plus className="w-4 h-4" /> Nouvelle réception
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('receipt_number')}>N° Réception<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Commande</th>
                    <th>Fournisseur</th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('receipt_date')}>Date<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Articles</th>
                    <th className="text-right"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_value')}>Valeur<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-right">Frais</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReceipts.map((reception) => (
                    <tr key={reception.id} className="hover">
                      <td className="font-mono text-sm font-semibold">{reception.receipt_number}</td>
                      <td>{reception.order_number || reception.purchase_order?.order_number}</td>
                      <td>{reception.supplier_name || reception.purchase_order?.supplier?.company_name}</td>
                      <td>{formatDate(reception.receipt_date)}</td>
                      <td className="text-center"><span className="badge badge-neutral">{reception.items?.length || 0}</span></td>
                      <td className="text-right font-semibold">{formatCurrency(reception.total_value)}</td>
                      <td className="text-right text-warning">{formatCurrency(reception.total_costs)}</td>
                      <td className="text-right font-bold text-primary">{formatCurrency((reception.total_value || 0) + (reception.total_costs || 0))}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button onClick={() => navigate(`/receptions/${reception.id}`)} className="btn btn-ghost btn-xs sm:btn-sm" title="Détails">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => { setReceptionToDelete(reception); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs sm:btn-sm text-error" title="Supprimer">
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="font-bold">
                    <td colSpan="5" className="text-right">Totaux</td>
                    <td className="text-right">{formatCurrency(filteredAndSortedReceipts.reduce((s, r) => s + (parseFloat(r.total_value) || 0), 0))}</td>
                    <td className="text-right text-warning">{formatCurrency(filteredAndSortedReceipts.reduce((s, r) => s + (parseFloat(r.total_costs) || 0), 0))}</td>
                    <td className="text-right text-primary">{formatCurrency(filteredAndSortedReceipts.reduce((s, r) => s + (parseFloat(r.total_value) || 0) + (parseFloat(r.total_costs) || 0), 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedReceipts.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedReceipts.length)} sur {filteredAndSortedReceipts.length}
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <select className="select select-bordered select-xs sm:select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                      <option value="6">6</option><option value="9">9</option><option value="12">12</option><option value="24">24</option><option value="48">48</option>
                    </select>
                    <div className="join">
                      <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                      {[...Array(Math.min(3, totalPages))].map((_, i) => {
                        let pageNum
                        if (totalPages <= 3) { pageNum = i + 1 }
                        else if (currentPage <= 2) { pageNum = i + 1 }
                        else if (currentPage >= totalPages - 1) { pageNum = totalPages - 2 + i }
                        else { pageNum = currentPage - 1 + i }
                        return (<button key={i} className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>)
                      })}
                      <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && receptionToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4"><div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20"><AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" /></div></div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer la réception ?</p>
              <p className="text-base font-bold text-error mt-2">"{receptionToDelete.receipt_number}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1" onClick={handleDeleteReception}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default Receptions