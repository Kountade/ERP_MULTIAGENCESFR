// src/components/tresorerie/Rapprochements.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  Eye, MoreVertical, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, List,
  PiggyBank, Building2, DollarSign, Clock, Calendar, User, Building,
  FileText, Loader2, Check, AlertTriangle, TrendingUp, TrendingDown,
  ArrowLeftRight, Scale, Banknote, CreditCard, Smartphone
} from 'lucide-react'

const Rapprochements = () => {
  const navigate = useNavigate()
  const [rapprochements, setRapprochements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [rapprochementToDelete, setRapprochementToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('date_fin')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    brouillon: 0,
    en_cours: 0,
    partiel: 0,
    complete: 0,
    ecart: 0,
    total_ecart: 0
  })

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

      const response = await AxiosInstance.get('/rapprochements/')
      const data = response.data || []
      setRapprochements(data)

      const total = data.length
      const brouillon = data.filter(r => r.status === 'brouillon').length
      const en_cours = data.filter(r => r.status === 'en_cours').length
      const partiel = data.filter(r => r.status === 'partiel').length
      const complete = data.filter(r => r.status === 'complete').length
      const ecart = data.filter(r => r.status === 'ecart').length
      const total_ecart = data.reduce((sum, r) => sum + (parseFloat(r.ecart) || 0), 0)
      
      setStats({ total, brouillon, en_cours, partiel, complete, ecart, total_ecart })

    } catch (error) {
      console.error('Erreur chargement rapprochements:', error)
      setError('Erreur de chargement des rapprochements')
      showNotification('Erreur de chargement des rapprochements', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ DELETE
  const handleDelete = async () => {
    if (!rapprochementToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/rapprochements/${rapprochementToDelete.id}/`)
      showNotification(`Rapprochement supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setRapprochementToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ✅ VALIDER
  const handleValider = async (rapprochement) => {
    try {
      await AxiosInstance.post(`/rapprochements/${rapprochement.id}/valider/`)
      showNotification('Rapprochement validé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
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

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-sm">Brouillon</span>,
      en_cours: <span className="badge badge-warning badge-sm gap-1"><Clock className="w-3 h-3" /> En cours</span>,
      partiel: <span className="badge badge-info badge-sm gap-1"><AlertTriangle className="w-3 h-3" /> Partiel</span>,
      complete: <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Complet</span>,
      ecart: <span className="badge badge-error badge-sm gap-1"><AlertTriangle className="w-3 h-3" /> Écart</span>
    }
    return statusMap[status] || <span className="badge badge-ghost badge-sm">{status || 'Inconnu'}</span>
  }

  const getEcartBadge = (ecart) => {
    if (!ecart && ecart !== 0) return null
    if (Math.abs(ecart) < 1) {
      return <span className="badge badge-success badge-sm">✓ Rapproché</span>
    }
    return (
      <span className={`badge badge-sm ${ecart > 0 ? 'badge-error' : 'badge-warning'}`}>
        {ecart > 0 ? '+' : ''}{formatMontant(ecart)}
      </span>
    )
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
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const filteredAndSorted = React.useMemo(() => {
    let filtered = rapprochements.filter(r => {
      const search = searchTerm.toLowerCase()
      const reference = (r.reference || '').toLowerCase()
      const compteNom = (r.compte_bancaire_nom || '').toLowerCase()
      const banque = (r.compte_bancaire?.banque || '').toLowerCase()
      
      const matchesSearch = reference.includes(search) || compteNom.includes(search) || banque.includes(search)
      const matchesStatus = filterStatus === '' || r.status === filterStatus
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'date_debut' || sortField === 'date_fin') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (sortField === 'ecart') {
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
  }, [rapprochements, searchTerm, filterStatus, sortField, sortDirection])

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
            Chargement des rapprochements...
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
            ✅ Rapprochements bancaires
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos rapprochements bancaires ({stats.total} au total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <Link to="/rapprochements/nouveau" className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau rapprochement</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Scale className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En cours</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-warning">{stats.en_cours}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Complets</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.complete}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Écarts</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{stats.ecart}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Partiels</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">{stats.partiel}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total écarts</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{formatMontant(stats.total_ecart)}</div>
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
                placeholder="Rechercher par référence, compte bancaire..."
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
            <select className="select select-bordered w-full sm:w-44 text-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Statut</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="partiel">Partiel</option>
              <option value="complete">Complet</option>
              <option value="ecart">Écart</option>
            </select>
            <div className="join ml-auto">
              <button className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('table')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Scale className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucun rapprochement trouvé</p>
            <Link to="/rapprochements/nouveau" className="btn btn-primary mt-6 gap-2">
              <Plus className="w-4 h-4" /> Créer un rapprochement
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {paginatedItems.map((r) => (
              <div key={r.id} className="bg-base-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 border border-base-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl w-12 h-12 flex items-center justify-center ${
                      r.status === 'complete' ? 'bg-success/10' : 
                      r.status === 'ecart' ? 'bg-error/10' : 'bg-warning/10'
                    }`}>
                      {r.status === 'complete' ? <CheckCircle className="w-6 h-6 text-success" /> : 
                       r.status === 'ecart' ? <AlertTriangle className="w-6 h-6 text-error" /> : 
                       <Scale className="w-6 h-6 text-warning" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-base truncate max-w-[140px]">{r.reference}</h3>
                      <p className="text-xs text-base-content/50">{r.compte_bancaire?.banque || 'Compte'}</p>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-xs btn-circle">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                      <li>
                        <Link to={`/rapprochements/${r.id}`} className="text-sm">
                          <Eye className="w-4 h-4" /> Détails
                        </Link>
                      </li>
                      <li>
                        <Link to={`/rapprochements/${r.id}/edit`} className="text-sm">
                          <Edit className="w-4 h-4" /> Modifier
                        </Link>
                      </li>
                      {r.status !== 'complete' && (
                        <li>
                          <button onClick={() => handleValider(r)} className="text-sm text-info">
                            <CheckCircle className="w-4 h-4" /> Valider
                          </button>
                        </li>
                      )}
                      <li>
                        <button onClick={() => { setRapprochementToDelete(r); setShowDeleteModal(true) }} className="text-sm text-error">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <PiggyBank className="w-4 h-4 text-primary" />
                    <span className="font-medium">{r.compte_bancaire?.nom || 'Compte'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getStatusBadge(r.status)}
                    {getEcartBadge(r.ecart)}
                  </div>
                  <div className="flex justify-between text-xs text-base-content/50">
                    <span>Solde comptable: {formatMontant(r.solde_comptable)}</span>
                    <span>Solde bancaire: {formatMontant(r.solde_bancaire)}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(r.date_debut)} → {formatDate(r.date_fin)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm">
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>Réf. <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Compte bancaire</th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_debut')}>Période <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('solde_comptable')}>Solde comptable <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('solde_bancaire')}>Solde bancaire <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('ecart')}>Écart <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((r) => (
                  <tr key={r.id} className="hover">
                    <td className="font-mono text-xs text-primary">{r.reference}</td>
                    <td className="text-sm max-w-[120px] truncate">{r.compte_bancaire?.nom || '-'}</td>
                    <td className="text-xs">{formatDate(r.date_debut)} → {formatDate(r.date_fin)}</td>
                    <td className="font-mono text-sm">{formatMontant(r.solde_comptable)}</td>
                    <td className="font-mono text-sm">{formatMontant(r.solde_bancaire)}</td>
                    <td className={`font-mono text-sm font-bold ${r.ecart >= 0 ? 'text-success' : 'text-error'}`}>
                      {r.ecart >= 0 ? '+' : ''}{formatMontant(r.ecart)}
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <Link to={`/rapprochements/${r.id}`} className="btn btn-ghost btn-xs text-info">
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link to={`/rapprochements/${r.id}/edit`} className="btn btn-ghost btn-xs text-primary">
                          <Edit className="w-3 h-3" />
                        </Link>
                        {r.status !== 'complete' && (
                          <button onClick={() => handleValider(r)} className="btn btn-ghost btn-xs text-success">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => { setRapprochementToDelete(r); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
      {showDeleteModal && rapprochementToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce rapprochement ?</p>
              <p className="text-base font-bold text-error mt-2">"{rapprochementToDelete.reference}"</p>
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

export default Rapprochements