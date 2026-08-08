// src/components/tresorerie/PrevisionsTresorerie.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  Eye, MoreVertical, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, List,
  TrendingUp, TrendingDown, Calendar, Clock, DollarSign, User, Building2,
  FileText, Loader2, PieChart, BarChart3, LineChart, Activity,
  ArrowUpRight, ArrowDownLeft, AlertTriangle, Check, Target
} from 'lucide-react'

const PrevisionsTresorerie = () => {
  const navigate = useNavigate()
  const [previsions, setPrevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [previsionToDelete, setPrevisionToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('date_debut')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    entree: 0,
    sortie: 0,
    brouillon: 0,
    valide: 0,
    realise: 0,
    ecart: 0,
    total_prevu: 0,
    total_reel: 0
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

      const response = await AxiosInstance.get('/previsions/')
      const data = response.data || []
      setPrevisions(data)

      const total = data.length
      const entree = data.filter(p => p.type_prevision === 'entree').length
      const sortie = data.filter(p => p.type_prevision === 'sortie').length
      const brouillon = data.filter(p => p.statut === 'brouillon').length
      const valide = data.filter(p => p.statut === 'valide').length
      const realise = data.filter(p => p.statut === 'realise').length
      const ecart = data.filter(p => p.statut === 'ecart').length
      const total_prevu = data.reduce((sum, p) => sum + (parseFloat(p.montant_prevu) || 0), 0)
      const total_reel = data.reduce((sum, p) => sum + (parseFloat(p.montant_reel) || 0), 0)
      
      setStats({ total, entree, sortie, brouillon, valide, realise, ecart, total_prevu, total_reel })

    } catch (error) {
      console.error('Erreur chargement prévisions:', error)
      setError('Erreur de chargement des prévisions')
      showNotification('Erreur de chargement des prévisions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ DELETE
  const handleDelete = async () => {
    if (!previsionToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/previsions/${previsionToDelete.id}/`)
      showNotification(`Prévision "${previsionToDelete.titre}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setPrevisionToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ✅ VALIDER
  const handleValider = async (prevision) => {
    try {
      await AxiosInstance.patch(`/previsions/${prevision.id}/`, { statut: 'valide' })
      showNotification('Prévision validée avec succès', 'success')
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

  const getTypeBadge = (type) => {
    if (type === 'entree') {
      return <span className="badge badge-success badge-sm gap-1"><TrendingUp className="w-3 h-3" /> Entrée</span>
    } else if (type === 'sortie') {
      return <span className="badge badge-error badge-sm gap-1"><TrendingDown className="w-3 h-3" /> Sortie</span>
    }
    return <span className="badge badge-ghost badge-sm">{type || 'Inconnu'}</span>
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-sm">Brouillon</span>,
      en_cours: <span className="badge badge-warning badge-sm gap-1"><Clock className="w-3 h-3" /> En cours</span>,
      valide: <span className="badge badge-info badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Validée</span>,
      realise: <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Réalisée</span>,
      annule: <span className="badge badge-ghost badge-sm gap-1"><X className="w-3 h-3" /> Annulée</span>,
      ecart: <span className="badge badge-error badge-sm gap-1"><AlertTriangle className="w-3 h-3" /> Écart</span>
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
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const getEcartColor = (ecart) => {
    if (!ecart) return 'text-base-content/40'
    if (ecart > 0) return 'text-success'
    if (ecart < 0) return 'text-error'
    return 'text-base-content/40'
  }

  const getEcartIcon = (ecart) => {
    if (!ecart) return null
    if (ecart > 0) return <ArrowUpRight className="w-3 h-3" />
    if (ecart < 0) return <ArrowDownLeft className="w-3 h-3" />
    return null
  }

  const filteredAndSorted = React.useMemo(() => {
    let filtered = previsions.filter(p => {
      const search = searchTerm.toLowerCase()
      const titre = (p.titre || '').toLowerCase()
      const reference = (p.reference || '').toLowerCase()
      const categorie = (p.categorie || '').toLowerCase()
      
      const matchesSearch = titre.includes(search) || reference.includes(search) || categorie.includes(search)
      const matchesType = filterType === '' || p.type_prevision === filterType
      const matchesStatus = filterStatus === '' || p.statut === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'date_debut' || sortField === 'date_fin') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (sortField === 'montant_prevu' || sortField === 'montant_reel') {
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
  }, [previsions, searchTerm, filterType, filterStatus, sortField, sortDirection])

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
            Chargement des prévisions...
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
            📊 Prévisions de trésorerie
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Planifiez vos flux financiers ({stats.total} prévisions - {formatMontant(stats.total_prevu)} prévu)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <Link to="/previsions/nouveau" className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle prévision</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Entrées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.entree}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Sorties</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{stats.sortie}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Validées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">{stats.valide}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><Check className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Réalisées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.realise}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Écarts</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{stats.ecart}</div>
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
                placeholder="Rechercher par titre, référence..."
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
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </select>
            <select className="select select-bordered w-full sm:w-40 text-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Statut</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="valide">Validée</option>
              <option value="realise">Réalisée</option>
              <option value="annule">Annulée</option>
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
            <Target className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune prévision trouvée</p>
            <Link to="/previsions/nouveau" className="btn btn-primary mt-6 gap-2">
              <Plus className="w-4 h-4" /> Créer une prévision
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {paginatedItems.map((p) => (
              <div key={p.id} className="bg-base-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 border border-base-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl w-12 h-12 flex items-center justify-center ${p.type_prevision === 'entree' ? 'bg-success/10' : 'bg-error/10'}`}>
                      {p.type_prevision === 'entree' ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-error" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-base truncate max-w-[140px]">{p.titre}</h3>
                      <p className="text-xs text-base-content/50">{p.reference}</p>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-xs btn-circle">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                      <li>
                        <Link to={`/previsions/${p.id}`} className="text-sm">
                          <Eye className="w-4 h-4" /> Détails
                        </Link>
                      </li>
                      <li>
                        <Link to={`/previsions/${p.id}/edit`} className="text-sm">
                          <Edit className="w-4 h-4" /> Modifier
                        </Link>
                      </li>
                      {p.statut === 'brouillon' && (
                        <li>
                          <button onClick={() => handleValider(p)} className="text-sm text-info">
                            <CheckCircle className="w-4 h-4" /> Valider
                          </button>
                        </li>
                      )}
                      <li>
                        <button onClick={() => { setPrevisionToDelete(p); setShowDeleteModal(true) }} className="text-sm text-error">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="font-bold">{formatMontant(p.montant_prevu)}</span>
                    {p.montant_reel > 0 && (
                      <span className="text-xs text-base-content/40">
                        Réel: {formatMontant(p.montant_reel)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getTypeBadge(p.type_prevision)}
                    {getStatusBadge(p.statut)}
                    {p.probabilite && (
                      <span className="badge badge-ghost badge-sm">{p.probabilite}%</span>
                    )}
                  </div>
                  {p.categorie && (
                    <div className="text-xs text-base-content/50 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {p.categorie}
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.date_debut)} → {formatDate(p.date_fin)}
                  </span>
                  {p.ecart !== 0 && (
                    <span className={`flex items-center gap-1 ${getEcartColor(p.ecart)}`}>
                      {getEcartIcon(p.ecart)}
                      {formatMontant(p.ecart)}
                    </span>
                  )}
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
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('titre')}>Titre <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Type</th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant_prevu')}>Prévu <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant_reel')}>Réel <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p) => (
                  <tr key={p.id} className="hover">
                    <td className="font-mono text-xs text-primary">{p.reference}</td>
                    <td className="font-medium max-w-[120px] truncate">{p.titre}</td>
                    <td>{getTypeBadge(p.type_prevision)}</td>
                    <td className="font-bold text-success">{formatMontant(p.montant_prevu)}</td>
                    <td className="font-medium">{p.montant_reel > 0 ? formatMontant(p.montant_reel) : '-'}</td>
                    <td className="text-xs">{formatDate(p.date_debut)} → {formatDate(p.date_fin)}</td>
                    <td>{getStatusBadge(p.statut)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <Link to={`/previsions/${p.id}`} className="btn btn-ghost btn-xs text-info">
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link to={`/previsions/${p.id}/edit`} className="btn btn-ghost btn-xs text-primary">
                          <Edit className="w-3 h-3" />
                        </Link>
                        {p.statut === 'brouillon' && (
                          <button onClick={() => handleValider(p)} className="btn btn-ghost btn-xs text-info">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => { setPrevisionToDelete(p); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error">
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
      {showDeleteModal && previsionToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer cette prévision ?</p>
              <p className="text-base font-bold text-error mt-2">"{previsionToDelete.titre}"</p>
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

export default PrevisionsTresorerie