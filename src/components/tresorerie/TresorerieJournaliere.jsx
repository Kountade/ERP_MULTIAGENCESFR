// src/components/tresorerie/TresorerieJournaliere.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Calendar, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, Eye,
  Wallet, TrendingUp, TrendingDown, DollarSign, Clock,
  Building2, User, FileText, Loader2, ArrowLeftRight,
  Download, Printer, BarChart3, LineChart, PieChart,
  Activity, ArrowUpRight, ArrowDownLeft, AlertTriangle
} from 'lucide-react'

const TresorerieJournaliere = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total_jours: 0,
    solde_moyen: 0,
    total_entrees: 0,
    total_sorties: 0,
    flux_total: 0,
    meilleur_jour: null,
    pire_jour: null
  })
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [agenceId, setAgenceId] = useState('')
  const [agences, setAgences] = useState([])

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

      // Construire les paramètres de requête
      let params = new URLSearchParams()
      if (dateDebut) params.append('date_debut', dateDebut)
      if (dateFin) params.append('date_fin', dateFin)
      if (agenceId) params.append('agence_id', agenceId)

      const queryString = params.toString()
      const url = `/tresorerie-journaliere/${queryString ? `?${queryString}` : ''}`

      const response = await AxiosInstance.get(url)
      const results = response.data || []
      setData(results)

      // Calculer les statistiques
      if (results.length > 0) {
        const total_jours = results.length
        const total_entrees = results.reduce((sum, r) => sum + (parseFloat(r.total_entrees) || 0), 0)
        const total_sorties = results.reduce((sum, r) => sum + (parseFloat(r.total_sorties) || 0), 0)
        const solde_moyen = results.reduce((sum, r) => sum + (parseFloat(r.solde_fermeture) || 0), 0) / total_jours
        
        // Meilleur et pire jour (par flux)
        const sortedByFlux = [...results].sort((a, b) => {
          const fluxA = (parseFloat(a.total_entrees) || 0) - (parseFloat(a.total_sorties) || 0)
          const fluxB = (parseFloat(b.total_entrees) || 0) - (parseFloat(b.total_sorties) || 0)
          return fluxB - fluxA
        })

        setStats({
          total_jours,
          solde_moyen,
          total_entrees,
          total_sorties,
          flux_total: total_entrees - total_sorties,
          meilleur_jour: sortedByFlux.length > 0 ? sortedByFlux[0] : null,
          pire_jour: sortedByFlux.length > 1 ? sortedByFlux[sortedByFlux.length - 1] : null
        })
      }

      // Charger les agences pour le filtre
      if (agences.length === 0) {
        const agencesRes = await AxiosInstance.get('/agences/')
        setAgences(agencesRes.data || [])
      }

    } catch (error) {
      console.error('Erreur chargement trésorerie journalière:', error)
      setError('Erreur de chargement des données')
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = () => {
    fetchData()
  }

  const handleReset = () => {
    setDateDebut('')
    setDateFin('')
    setAgenceId('')
    setSearchTerm('')
    setCurrentPage(1)
    setTimeout(fetchData, 100)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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

  const getFluxColor = (flux) => {
    if (!flux && flux !== 0) return 'text-base-content/40'
    if (flux > 0) return 'text-success'
    if (flux < 0) return 'text-error'
    return 'text-base-content/40'
  }

  const getFluxIcon = (flux) => {
    if (!flux && flux !== 0) return null
    if (flux > 0) return <ArrowUpRight className="w-4 h-4 text-success" />
    if (flux < 0) return <ArrowDownLeft className="w-4 h-4 text-error" />
    return null
  }

  // Filtrer et trier les données
  const filteredAndSorted = React.useMemo(() => {
    let filtered = [...data]

    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item => {
        const dateStr = formatDate(item.date).toLowerCase()
        const agenceNom = (item.agence_nom || '').toLowerCase()
        return dateStr.includes(search) || agenceNom.includes(search)
      })
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (sortField === 'date') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (sortField === 'solde_fermeture' || sortField === 'total_entrees' || 
                 sortField === 'total_sorties') {
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
  }, [data, searchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(8)
      else if (window.innerWidth < 1024) setItemsPerPage(12)
      else setItemsPerPage(15)
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
            Chargement de la trésorerie journalière...
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
            📅 Trésorerie journalière
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Suivi quotidien des flux financiers ({stats.total_jours} jours enregistrés)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
          <button className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Imprimer</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Jours</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total_jours}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total entrées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">
            {formatMontant(stats.total_entrees)}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total sorties</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">
            {formatMontant(stats.total_sorties)}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Flux total</div>
          <div className={`stat-value text-lg sm:text-2xl lg:text-3xl font-black ${stats.flux_total >= 0 ? 'text-success' : 'text-error'}`}>
            {stats.flux_total >= 0 ? '+' : ''}{formatMontant(stats.flux_total)}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><Wallet className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Solde moyen</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">
            {formatMontant(stats.solde_moyen)}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Meilleur jour</div>
          <div className="stat-value text-sm sm:text-base lg:text-lg font-bold truncate">
            {stats.meilleur_jour ? formatDate(stats.meilleur_jour.date) : '-'}
          </div>
          {stats.meilleur_jour && (
            <div className="stat-desc text-xs text-success">
              +{formatMontant((stats.meilleur_jour.total_entrees || 0) - (stats.meilleur_jour.total_sorties || 0))}
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par date, agence..."
                  className="input input-bordered w-full pl-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                />
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="btn btn-outline btn-sm sm:hidden gap-2"
            >
              <Filter className="w-4 h-4" /> Filtres
            </button>
          </div>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-3 items-end`}>
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-xs">Date début</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-xs">Date fin</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text text-xs">Agence</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={agenceId}
                onChange={(e) => setAgenceId(e.target.value)}
              >
                <option value="">Toutes les agences</option>
                {agences.map((agence) => (
                  <option key={agence.id} value={agence.id}>{agence.nom}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSearch} className="btn btn-primary btn-sm gap-1">
              <Search className="w-3 h-3" />
              Filtrer
            </button>
            <button onClick={handleReset} className="btn btn-ghost btn-sm gap-1">
              <X className="w-3 h-3" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Calendar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune donnée trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">
              Aucun enregistrement de trésorerie journalière
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date')}>
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('agence_nom')}>
                        Agence <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('solde_ouverture')}>
                        Solde ouverture <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_entrees')}>
                        Entrées <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_sorties')}>
                        Sorties <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('solde_fermeture')}>
                        Solde fermeture <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Nb opérations</th>
                    <th>Flux</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item, index) => {
                    const flux = (parseFloat(item.total_entrees) || 0) - (parseFloat(item.total_sorties) || 0)
                    return (
                      <tr key={index} className="hover">
                        <td className="font-medium text-sm">{formatDate(item.date)}</td>
                        <td className="text-sm">{item.agence_nom || '-'}</td>
                        <td className="font-mono text-sm text-primary">
                          {formatMontant(item.solde_ouverture)}
                        </td>
                        <td className="font-mono text-sm text-success">
                          +{formatMontant(item.total_entrees)}
                        </td>
                        <td className="font-mono text-sm text-error">
                          -{formatMontant(item.total_sorties)}
                        </td>
                        <td className={`font-mono text-sm font-bold ${(item.solde_fermeture || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                          {formatMontant(item.solde_fermeture)}
                        </td>
                        <td className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-success">{item.nb_entrees || 0}</span>
                            <span className="text-base-content/30">/</span>
                            <span className="text-error">{item.nb_sorties || 0}</span>
                            <span className="text-xs text-base-content/40">({item.nb_operations || 0})</span>
                          </div>
                        </td>
                        <td>
                          <div className={`flex items-center gap-1 font-bold ${getFluxColor(flux)}`}>
                            {getFluxIcon(flux)}
                            {flux >= 0 ? '+' : ''}{formatMontant(flux)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-base-200/70 font-bold border-t-2 border-base-300">
                    <td colSpan="2" className="text-right">TOTAUX</td>
                    <td className="text-primary font-mono">
                      {formatMontant(data.reduce((sum, r) => sum + (parseFloat(r.solde_ouverture) || 0), 0))}
                    </td>
                    <td className="text-success font-mono">
                      +{formatMontant(data.reduce((sum, r) => sum + (parseFloat(r.total_entrees) || 0), 0))}
                    </td>
                    <td className="text-error font-mono">
                      -{formatMontant(data.reduce((sum, r) => sum + (parseFloat(r.total_sorties) || 0), 0))}
                    </td>
                    <td className={`font-mono ${stats.flux_total >= 0 ? 'text-success' : 'text-error'}`}>
                      {formatMontant(data.reduce((sum, r) => sum + (parseFloat(r.solde_fermeture) || 0), 0))}
                    </td>
                    <td colSpan="2">
                      <div className={`flex items-center gap-1 font-bold ${stats.flux_total >= 0 ? 'text-success' : 'text-error'}`}>
                        {stats.flux_total >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        {stats.flux_total >= 0 ? '+' : ''}{formatMontant(stats.flux_total)}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 sm:p-4 border-t border-base-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur {filteredAndSorted.length}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <select 
                    className="select select-bordered select-xs sm:select-sm" 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
                  >
                    <option value="8">8</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                  </select>
                  <div className="join">
                    <button 
                      className="join-item btn btn-xs sm:btn-sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 3) {
                        pageNum = i + 1
                      } else if (currentPage <= 2) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 2 + i
                      } else {
                        pageNum = currentPage - 1 + i
                      }
                      return (
                        <button
                          key={i}
                          className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button 
                      className="join-item btn btn-xs sm:btn-sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Graphique simplifié (statistiques supplémentaires) */}
      {filteredAndSorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-base-content/60 mb-3">📊 Meilleur jour</h3>
            {stats.meilleur_jour ? (
              <div>
                <p className="text-lg font-bold">{formatDate(stats.meilleur_jour.date)}</p>
                <p className="text-sm text-success">+{formatMontant((stats.meilleur_jour.total_entrees || 0) - (stats.meilleur_jour.total_sorties || 0))}</p>
                <p className="text-xs text-base-content/40">
                  Entrées: +{formatMontant(stats.meilleur_jour.total_entrees)} | Sorties: -{formatMontant(stats.meilleur_jour.total_sorties)}
                </p>
              </div>
            ) : (
              <p className="text-base-content/40">Aucune donnée</p>
            )}
          </div>

          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-base-content/60 mb-3">📉 Pire jour</h3>
            {stats.pire_jour ? (
              <div>
                <p className="text-lg font-bold">{formatDate(stats.pire_jour.date)}</p>
                <p className="text-sm text-error">{formatMontant((stats.pire_jour.total_entrees || 0) - (stats.pire_jour.total_sorties || 0))}</p>
                <p className="text-xs text-base-content/40">
                  Entrées: +{formatMontant(stats.pire_jour.total_entrees)} | Sorties: -{formatMontant(stats.pire_jour.total_sorties)}
                </p>
              </div>
            ) : (
              <p className="text-base-content/40">Aucune donnée</p>
            )}
          </div>

          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-base-content/60 mb-3">📈 Ratio entrées/sorties</h3>
            {stats.total_sorties > 0 ? (
              <div>
                <p className="text-lg font-bold text-primary">
                  {(stats.total_entrees / stats.total_sorties).toFixed(2)}
                </p>
                <p className="text-sm text-base-content/60">
                  Pour 1 FCFA de sortie, {stats.total_entrees > 0 ? (stats.total_entrees / stats.total_sorties).toFixed(2) : '0'} FCFA d'entrée
                </p>
                <div className="mt-2 w-full bg-base-300 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.total_entrees / Math.max(stats.total_sorties, 1)) * 50, 100)}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-base-content/40">Aucune sortie enregistrée</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TresorerieJournaliere