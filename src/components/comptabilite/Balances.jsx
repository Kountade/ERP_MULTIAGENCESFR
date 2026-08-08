// src/components/comptabilite/Balances.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { pdf } from '@react-pdf/renderer'
import BalancePdf from './BalancePdf'
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
  Scale,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckSquare,
  XCircle,
  BookOpen,
  Hash,
  Tag,
  MoreVertical,
  Settings,
  Shield,
  Layers,
  User,
  Info,
  Download,
  Printer,
  FileSpreadsheet,
  Loader2
} from 'lucide-react'

const Balances = () => {
  const navigate = useNavigate()

  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [balanceToDelete, setBalanceToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [pdfLoading, setPdfLoading] = useState({})
  const [stats, setStats] = useState({
    total: 0,
    generale: 0,
    comptes: 0,
    agee: 0,
    brouillon: 0,
    valide: 0,
    archive: 0
  })

  // Configuration des types de balance
  const typeConfig = {
    generale: { label: 'Balance générale', color: 'primary', icon: Scale },
    comptes: { label: 'Balance des comptes', color: 'info', icon: BookOpen },
    agee: { label: 'Balance âgée', color: 'warning', icon: Calendar }
  }

  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'warning', icon: FileText },
    valide: { label: 'Validée', color: 'success', icon: CheckCircle },
    archive: { label: 'Archivée', color: 'neutral', icon: Clock }
  }

  const typeColors = {
    generale: 'badge-primary',
    comptes: 'badge-info',
    agee: 'badge-warning'
  }

  const statusColors = {
    brouillon: 'badge-warning',
    valide: 'badge-success',
    archive: 'badge-neutral'
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

      // Récupérer les balances - URL CORRECTE
      let response
      try {
        response = await AxiosInstance.get('/balances/')
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/comptabilite/balances/')
        } else {
          throw err
        }
      }
      
      const data = response.data || []
      setBalances(data)

      // Calculer les statistiques
      const total = data.length
      const generale = data.filter(b => b.type_balance === 'generale').length
      const comptes = data.filter(b => b.type_balance === 'comptes').length
      const agee = data.filter(b => b.type_balance === 'agee').length
      const brouillon = data.filter(b => b.status === 'brouillon').length
      const valide = data.filter(b => b.status === 'valide').length
      const archive = data.filter(b => b.status === 'archive').length

      setStats({ total, generale, comptes, agee, brouillon, valide, archive })

    } catch (error) {
      console.error('❌ Erreur chargement balances:', error)
      setError('Erreur de chargement des balances')
      showNotification('Erreur de chargement des balances', 'error')
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

  const handleDeleteBalance = async () => {
    if (!balanceToDelete) return
    try {
      await AxiosInstance.delete(`/balances/${balanceToDelete.id}/`)
      showNotification(`Balance ${balanceToDelete.reference} supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setBalanceToDelete(null)
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

  const handleDownloadPDF = async (balance) => {
    setPdfLoading(prev => ({ ...prev, [balance.id]: true }))
    try {
      // Récupérer les données complètes avec les lignes
      const response = await AxiosInstance.get(`/balances/${balance.id}/`)
      const data = response.data
      
      // Générer le PDF
      const blob = await pdf(<BalancePdf balance={data} />).toBlob()
      
      // Télécharger
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `balance_${balance.reference}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showNotification('PDF téléchargé avec succès', 'success')
    } catch (error) {
      console.error('Erreur PDF:', error)
      showNotification('Erreur lors du téléchargement du PDF', 'error')
    } finally {
      setPdfLoading(prev => ({ ...prev, [balance.id]: false }))
    }
  }

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.generale
    return (
      <span className={`badge ${typeColors[type] || 'badge-ghost'} gap-1 text-xs border-0`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.brouillon
    const Icon = config.icon
    return (
      <span className={`badge ${statusColors[status] || 'badge-ghost'} gap-1 text-xs border-0`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return 'N/A'
    }
  }

  // Filtrer et trier
  const filteredAndSortedBalances = useMemo(() => {
    let filtered = balances.filter(balance => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = balance.reference?.toLowerCase().includes(search) || false
      const matchesType = filterType === '' || balance.type_balance === filterType
      const matchesStatus = filterStatus === '' || balance.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'created_at' || sortField === 'date_debut' || sortField === 'date_fin') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [balances, searchTerm, filterType, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBalances.length / itemsPerPage)
  const paginatedBalances = filteredAndSortedBalances.slice(
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
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des balances...
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
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Balances comptables
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos balances comptables ({stats.total} au total)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/balances/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Générer une balance</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Scale className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Scale className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Générale</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.generale}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Comptes</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.comptes}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Âgée</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.agee}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Brouillons</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.brouillon}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Validées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.valide}</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par référence..."
                  className="input input-bordered w-full pl-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline btn-sm sm:hidden gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            
            <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-3`}>
              <select 
                className="select select-bordered w-full sm:w-40 text-sm"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous types</option>
                <option value="generale">Balance générale</option>
                <option value="comptes">Balance des comptes</option>
                <option value="agee">Balance âgée</option>
              </select>
              
              <select 
                className="select select-bordered w-full sm:w-36 text-sm"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="valide">Validée</option>
                <option value="archive">Archivée</option>
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterType('')
                  setFilterStatus('')
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des balances */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedBalances.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Scale className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune balance trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par générer votre première balance</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/balances/nouveau')}>
              <Plus className="w-4 h-4" /> Générer une balance
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>
                        Réf. <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('type_balance')}>
                        Type <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_debut')}>
                        Période <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('status')}>
                        Statut <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('created_at')}>
                        Créé le <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBalances.map((balance) => {
                    const isPdfLoading = pdfLoading[balance.id]
                    return (
                      <tr key={balance.id} className="hover">
                        <td className="font-mono text-xs text-primary">{balance.reference}</td>
                        <td>{getTypeBadge(balance.type_balance)}</td>
                        <td>
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3 text-base-content/40" />
                            {formatDate(balance.date_debut)} → {formatDate(balance.date_fin)}
                          </div>
                        </td>
                        <td>{getStatusBadge(balance.status)}</td>
                        <td className="text-xs">{formatDate(balance.created_at)}</td>
                        <td className="text-center">
                          <div className="flex justify-center gap-1 flex-wrap">
                            {/* Lien vers le détail */}
                            <button
                              onClick={() => navigate(`/balances/${balance.id}`)}
                              className="btn btn-ghost btn-xs text-info hover:bg-info/10"
                              title="Voir le détail de la balance"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            
                            {/* ✅ Bouton PDF */}
                            <button
                              onClick={() => handleDownloadPDF(balance)}
                              className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                              title="Télécharger PDF"
                              disabled={isPdfLoading}
                            >
                              {isPdfLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </button>
                            
                            <button
                              className="btn btn-ghost btn-xs text-success"
                              title="Exporter en Excel"
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setBalanceToDelete(balance)
                                setShowDeleteModal(true)
                              }}
                              className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                              title="Supprimer"
                              disabled={balance.status === 'valide'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedBalances.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedBalances.length)} sur {filteredAndSortedBalances.length}
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <select 
                      className="select select-bordered select-xs sm:select-sm" 
                      value={itemsPerPage} 
                      onChange={(e) => { 
                        setItemsPerPage(parseInt(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value="6">6</option>
                      <option value="9">9</option>
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                    </select>
                    <div className="join">
                      <button 
                        className="join-item btn btn-xs sm:btn-sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {[...Array(Math.min(3, totalPages))].map((_, i) => {
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
            )}
          </>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && balanceToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer cette balance ?</p>
              <p className="text-base font-bold text-error mt-2">"{balanceToDelete.reference}"</p>
              {balanceToDelete.status === 'valide' && (
                <p className="text-xs text-warning mt-2">
                  ⚠️ Cette balance est validée. Vous ne pouvez pas la supprimer.
                </p>
              )}
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button 
                className="btn btn-error flex-1" 
                onClick={handleDeleteBalance}
                disabled={balanceToDelete.status === 'valide'}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Balances