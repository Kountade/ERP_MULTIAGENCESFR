// src/components/tresorerie/MouvementsTresorerie.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowLeftRight, Wallet,
  Coins, PiggyBank, Clock, Calendar, DollarSign, TrendingUp, TrendingDown,
  User, Building2, Check, Loader2, FileText, MoreVertical, Receipt, Banknote,
  XCircle
} from 'lucide-react'

const MouvementsTresorerie = () => {
  const navigate = useNavigate()
  const [mouvements, setMouvements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mouvementToDelete, setMouvementToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('date_mouvement')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, encaissements: 0, decaissements: 0, transferts: 0, en_attente: 0 })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

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

      const response = await AxiosInstance.get('/mouvements/')
      const data = response.data || []
      setMouvements(data)

      const total = data.length
      const encaissements = data.filter(m => m.type_mouvement === 'encaissement').length
      const decaissements = data.filter(m => m.type_mouvement === 'decaissement').length
      const transferts = data.filter(m => m.type_mouvement === 'transfert').length
      const en_attente = data.filter(m => m.status === 'en_attente' || m.status === 'planifie').length
      setStats({ total, encaissements, decaissements, transferts, en_attente })

    } catch (error) {
      console.error('Erreur chargement mouvements:', error)
      setError('Erreur de chargement des mouvements')
      showNotification('Erreur de chargement des mouvements', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ DELETE
  const handleDelete = async () => {
    if (!mouvementToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/mouvements/${mouvementToDelete.id}/`)
      showNotification(`Mouvement supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setMouvementToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ✅ VALIDER un mouvement
  const handleValider = async (mouvement) => {
    try {
      await AxiosInstance.post(`/mouvements/${mouvement.id}/valider/`)
      showNotification('Mouvement validé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  // ✅ ANNULER un mouvement
  const handleAnnuler = async (mouvement) => {
    try {
      await AxiosInstance.post(`/mouvements/${mouvement.id}/annuler/`)
      showNotification('Mouvement annulé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error')
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

  const getTypeBadge = (type) => {
    if (type === 'encaissement') {
      return <span className="badge badge-success badge-sm gap-1"><TrendingUp className="w-3 h-3" /> Encaissement</span>
    } else if (type === 'decaissement') {
      return <span className="badge badge-error badge-sm gap-1"><TrendingDown className="w-3 h-3" /> Décaissement</span>
    } else if (type === 'transfert') {
      return <span className="badge badge-info badge-sm gap-1"><ArrowLeftRight className="w-3 h-3" /> Transfert</span>
    }
    return <span className="badge badge-ghost badge-sm">{type || 'Inconnu'}</span>
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      effectue: <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Effectué</span>,
      planifie: <span className="badge badge-warning badge-sm gap-1"><Clock className="w-3 h-3" /> Planifié</span>,
      en_attente: <span className="badge badge-info badge-sm gap-1"><Loader2 className="w-3 h-3 animate-spin" /> En attente</span>,
      annule: <span className="badge badge-ghost badge-sm gap-1"><X className="w-3 h-3" /> Annulé</span>,
      rejete: <span className="badge badge-error badge-sm gap-1"><XCircle className="w-3 h-3" /> Rejeté</span>
    }
    return statusMap[status] || <span className="badge badge-ghost badge-sm">{status || 'Inconnu'}</span>
  }

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const filteredAndSorted = React.useMemo(() => {
    let filtered = mouvements.filter(m => {
      const search = searchTerm.toLowerCase()
      const libelle = (m.libelle || '').toLowerCase()
      const reference = (m.reference || '').toLowerCase()
      const sourceRef = (m.source_reference || '').toLowerCase()
      
      const matchesSearch = libelle.includes(search) || reference.includes(search) || sourceRef.includes(search)
      const matchesType = filterType === '' || m.type_mouvement === filterType
      const matchesStatus = filterStatus === '' || m.status === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'date_mouvement') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (sortField === 'montant') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [mouvements, searchTerm, filterType, filterStatus, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(6)
      else if (window.innerWidth < 1024) setItemsPerPage(9)
      else setItemsPerPage(12)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des mouvements...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="font-semibold">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
            🔄 Mouvements de trésorerie
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez tous les mouvements financiers ({stats.total} au total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <Link to="/mouvements/nouveau" className="btn btn-sm sm:btn-md btn-success gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau mouvement</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Encaissements</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.encaissements}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Décaissements</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{stats.decaissements}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Transferts</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">{stats.transferts}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En attente</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-warning">{stats.en_attente}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par libellé, référence..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-2">
            <Filter className="w-4 h-4" /> Filtres {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-3`}>
            <select className="select select-bordered w-full sm:w-40 text-sm" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous types</option>
              <option value="encaissement">Encaissement</option>
              <option value="decaissement">Décaissement</option>
              <option value="transfert">Transfert</option>
            </select>
            <select className="select select-bordered w-full sm:w-36 text-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Statut</option>
              <option value="effectue">Effectué</option>
              <option value="planifie">Planifié</option>
              <option value="en_attente">En attente</option>
              <option value="annule">Annulé</option>
              <option value="rejete">Rejeté</option>
            </select>
            <button className="btn btn-outline gap-2" onClick={() => { setFilterType(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}>
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des mouvements */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-xs sm:table-sm lg:table-md w-full">
            <thead>
              <tr className="text-xs sm:text-sm">
                <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>Réf. <ArrowUpDown className="w-3 h-3" /></button></th>
                <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_mouvement')}>Date <ArrowUpDown className="w-3 h-3" /></button></th>
                <th>Type</th>
                <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('libelle')}>Libellé <ArrowUpDown className="w-3 h-3" /></button></th>
                <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant')}>Montant <ArrowUpDown className="w-3 h-3" /></button></th>
                <th>Source</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-base-content/60">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    Aucun mouvement trouvé
                  </td>
                </tr>
              ) : (
                paginatedItems.map((m) => (
                  <tr key={m.id} className="hover">
                    <td className="font-mono text-xs text-primary">{m.reference || '-'}</td>
                    <td className="text-xs">{formatDate(m.date_mouvement)}</td>
                    <td>{getTypeBadge(m.type_mouvement)}</td>
                    <td className="text-sm max-w-[150px] truncate">{m.libelle || '-'}</td>
                    <td className={`font-mono font-bold ${m.type_mouvement === 'encaissement' ? 'text-success' : 'text-error'}`}>
                      {m.type_mouvement === 'encaissement' ? '+' : '-'}{formatMontant(m.montant)}
                    </td>
                    <td className="text-xs">
                      {m.source_reference ? (
                        <span className="badge badge-ghost badge-xs">{m.source_reference}</span>
                      ) : '-'}
                    </td>
                    <td>{getStatusBadge(m.status)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <Link to={`/mouvements/${m.id}`} className="btn btn-ghost btn-xs text-info">
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link to={`/mouvements/${m.id}/edit`} className="btn btn-ghost btn-xs text-primary">
                          <Edit className="w-3 h-3" />
                        </Link>
                        {m.status === 'en_attente' && (
                          <button onClick={() => handleValider(m)} className="btn btn-ghost btn-xs text-success">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        {(m.status === 'en_attente' || m.status === 'planifie') && (
                          <button onClick={() => handleAnnuler(m)} className="btn btn-ghost btn-xs text-warning">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => { setMouvementToDelete(m); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSorted.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur {filteredAndSorted.length}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <select className="select select-bordered select-xs sm:select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
                <div className="join">
                  <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    let pageNum = totalPages <= 3 ? i + 1 : currentPage <= 2 ? i + 1 : currentPage >= totalPages - 1 ? totalPages - 2 + i : currentPage - 1 + i
                    return (
                      <button key={i} className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    )
                  })}
                  <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && mouvementToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce mouvement ?</p>
              <p className="text-base font-bold text-error mt-2">"{mouvementToDelete.reference || mouvementToDelete.libelle}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MouvementsTresorerie