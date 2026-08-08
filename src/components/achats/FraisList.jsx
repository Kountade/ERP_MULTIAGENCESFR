// src/components/achats/FraisList.jsx
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
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  DollarSign,
  Calendar,
  Tag,
  Receipt,
  FileText
} from 'lucide-react'

const FraisList = () => {
  const navigate = useNavigate()
  const [frais, setFrais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fraisToDelete, setFraisToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ cost_type: '', min_amount: '', max_amount: '' })
  const [stats, setStats] = useState({ total: 0, totalAmount: 0, byType: {} })

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
      const response = await AxiosInstance.get('/receipt-costs/')
      const data = response.data || []
      setFrais(data)

      // Statistiques
      const total = data.length
      const totalAmount = data.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
      const byType = data.reduce((acc, f) => {
        const type = f.cost_type_display || f.cost_type || 'Autre'
        acc[type] = (acc[type] || 0) + (parseFloat(f.amount) || 0)
        return acc
      }, {})
      setStats({ total, totalAmount, byType })
    } catch (error) {
      console.error('Erreur chargement frais:', error)
      setError('Erreur de chargement des frais')
      showNotification('Erreur de chargement des frais', 'error')
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

  const handleDelete = async () => {
    if (!fraisToDelete) return
    try {
      await AxiosInstance.delete(`/receipt-costs/${fraisToDelete.id}/`)
      showNotification('Frais supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setFraisToDelete(null)
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
        day: '2-digit', month: 'short', year: 'numeric'
      })
    } catch { return 'N/A' }
  }

  // Filtrage et tri
  const filteredAndSorted = React.useMemo(() => {
    let filtered = frais.filter(f => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        (f.description || '').toLowerCase().includes(search) ||
        (f.receipt_number || '').toLowerCase().includes(search) ||
        (f.cost_type_display || '').toLowerCase().includes(search)
      const matchesType = !filters.cost_type || f.cost_type === filters.cost_type
      const matchesMin = !filters.min_amount || parseFloat(f.amount) >= parseFloat(filters.min_amount)
      const matchesMax = !filters.max_amount || parseFloat(f.amount) <= parseFloat(filters.max_amount)
      return matchesSearch && matchesType && matchesMin && matchesMax
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      if (sortField === 'amount') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (sortField === 'created_at') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return filtered
  }, [frais, searchTerm, sortField, sortDirection, filters])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginated = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des frais...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
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
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold whitespace-pre-line">{notification.message}</span>
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
            Frais de réception
          </h1>
          <p className="text-base text-base-content/60">
            Gestion des frais annexes (transport, douane, etc.)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchData} className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => navigate('/frais/nouveau')} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Nouveau frais
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-primary"><Receipt className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Total frais</div>
          <div className="stat-value text-2xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-success"><DollarSign className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Montant total</div>
          <div className="stat-value text-xl font-black truncate">{formatCurrency(stats.totalAmount)}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-warning"><Tag className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Types</div>
          <div className="stat-value text-2xl font-black">{Object.keys(stats.byType).length}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-info"><Calendar className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Moyenne</div>
          <div className="stat-value text-xl font-black truncate">
            {stats.total > 0 ? formatCurrency(stats.totalAmount / stats.total) : '0 FCFA'}
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par description, type, n° réception..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm lg:hidden gap-2">
            <Filter className="w-4 h-4" /> Filtres {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-3`}>
            <select
              className="select select-bordered select-sm w-40"
              value={filters.cost_type}
              onChange={(e) => setFilters({ ...filters, cost_type: e.target.value })}
            >
              <option value="">Tous les types</option>
              <option value="transport">Transport</option>
              <option value="customs_duty">Droits de douane</option>
              <option value="customs_clearance">Dédouanement</option>
              <option value="insurance">Assurance</option>
              <option value="handling">Manutention</option>
              <option value="storage">Stockage</option>
              <option value="port_fees">Frais portuaires</option>
              <option value="transit_fees">Frais de transit</option>
              <option value="other">Autres</option>
            </select>
            <input
              type="number"
              placeholder="Montant min"
              className="input input-bordered input-sm w-32"
              value={filters.min_amount}
              onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
            />
            <input
              type="number"
              placeholder="Montant max"
              className="input input-bordered input-sm w-32"
              value={filters.max_amount}
              onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })}
            />
            <button
              onClick={() => { setFilters({ cost_type: '', min_amount: '', max_amount: '' }); setSearchTerm('') }}
              className="btn btn-sm btn-ghost gap-1"
            >
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg font-semibold text-base-content/50">Aucun frais trouvé</p>
            <p className="text-sm text-base-content/40 mt-2">Ajoutez votre premier frais de réception</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/frais/nouveau')}>
              <Plus className="w-4 h-4" /> Nouveau frais
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200">
                  <tr>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('id')}>ID<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('cost_type')}>Type<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th>Description</th>
                    <th>Réception</th>
                    <th className="text-right"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('amount')}>Montant<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('created_at')}>Créé le<ArrowUpDown className="w-3 h-3" /></button></th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((f) => (
                    <tr key={f.id} className="hover">
                      <td className="font-mono text-sm">{f.id}</td>
                      <td><span className="badge badge-info">{f.cost_type_display || f.cost_type}</span></td>
                      <td>{f.description || '-'}</td>
                      <td>
                        <Link to={`/receptions/${f.receipt}`} className="link link-primary">
                          {f.receipt_number || f.receipt}
                        </Link>
                      </td>
                      <td className="text-right font-semibold">{formatCurrency(f.amount)}</td>
                      <td>{formatDate(f.created_at)}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => navigate(`/frais/${f.id}`)} className="btn btn-ghost btn-xs" title="Détails">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/frais/${f.id}/modifier`)} className="btn btn-ghost btn-xs text-info" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setFraisToDelete(f); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr className="font-bold">
                    <td colSpan="4" className="text-right">Totaux</td>
                    <td className="text-right">{formatCurrency(filteredAndSorted.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0))}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-base-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-base-content/60 order-2 sm:order-1">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur {filteredAndSorted.length}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <select className="select select-bordered select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <div className="join">
                    <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i
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
                    <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && fraisToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmer la suppression</h3>
            <p className="py-4">
              Voulez-vous vraiment supprimer ce frais ?
            </p>
            <p className="font-semibold text-error">
              "{fraisToDelete.description || fraisToDelete.cost_type_display}" - {formatCurrency(fraisToDelete.amount)}
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
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

export default FraisList