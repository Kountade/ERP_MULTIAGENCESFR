// src/components/fournisseurs/Fournisseurs.jsx
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
  Building2,
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
  Mail,
  Phone,
  MapPin,
  Clock,
  XCircle
} from 'lucide-react'

const Fournisseurs = () => {
  const navigate = useNavigate()

  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [fournisseurToToggle, setFournisseurToToggle] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('company_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)

  // Statistiques (basées sur les champs existants)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
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
      
      // Essayer d'abord avec /fournisseurs/ puis /suppliers/
      let response
      try {
        response = await AxiosInstance.get('/fournisseurs/')
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/suppliers/')
        } else {
          throw err
        }
      }
      
      const suppliers = response.data || []
      setFournisseurs(suppliers)
      
      const total = suppliers.length
      const active = suppliers.filter(s => s.is_active).length
      const inactive = total - active
      
      setStats({ total, active, inactive })
      
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
      setError('Erreur de chargement des fournisseurs')
      showNotification('Erreur de chargement des fournisseurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteFournisseur = async () => {
    if (!fournisseurToDelete) return
    try {
      await AxiosInstance.delete(`/fournisseurs/${fournisseurToDelete.id}/`)
      showNotification(`Fournisseur "${fournisseurToDelete.company_name}" supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setFournisseurToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleToggleStatus = async () => {
    if (!fournisseurToToggle) return
    try {
      await AxiosInstance.patch(`/fournisseurs/${fournisseurToToggle.id}/`, {
        is_active: !fournisseurToToggle.is_active
      })
      showNotification(`Fournisseur ${fournisseurToToggle.is_active ? 'désactivé' : 'activé'} avec succès`, 'success')
      fetchData()
      setShowStatusModal(false)
      setFournisseurToToggle(null)
    } catch (error) {
      showNotification('Erreur lors de la modification', 'error')
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

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <div className="badge badge-success gap-1 text-xs">
        <CheckCircle className="w-3 h-3" />
        Actif
      </div>
    ) : (
      <div className="badge badge-ghost gap-1 text-xs">
        <Clock className="w-3 h-3" />
        Inactif
      </div>
    )
  }

  // Filtrage et tri
  const filteredAndSortedSuppliers = React.useMemo(() => {
    let filtered = fournisseurs.filter(supplier => {
      const search = searchTerm.toLowerCase()
      const companyName = (supplier.company_name || '').toLowerCase()
      const email = (supplier.email || '').toLowerCase()
      const city = (supplier.city || '').toLowerCase()
      const phone = (supplier.phone || '').toLowerCase()
      const code = (supplier.code || '').toLowerCase()
      
      const matchesSearch = companyName.includes(search) || email.includes(search) || 
                           city.includes(search) || phone.includes(search) || code.includes(search)
      const matchesStatus = filterStatus === '' || supplier.is_active === (filterStatus === 'true')
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [fournisseurs, searchTerm, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredAndSortedSuppliers.slice(
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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des fournisseurs...
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
            Fournisseurs
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos fournisseurs ({stats.total} au total)
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
            onClick={() => navigate('/fournisseurs/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau fournisseur</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques simplifiées */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Actifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Inactifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.inactive}</div>
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
                placeholder="Rechercher par nom, code, email, téléphone, ville..."
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
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-32 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Statut</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterStatus('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
            
            <div className="join ml-auto">
              <button 
                className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedSuppliers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Building2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">
              Aucun fournisseur trouvé
            </p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez un nouveau fournisseur
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/fournisseurs/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Nouveau fournisseur
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginatedSuppliers.map((supplier) => (
                <div 
                  key={supplier.id} 
                  className="bg-base-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                          <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-base-content line-clamp-1">
                          {supplier.company_name}
                        </h3>
                        {supplier.code && (
                          <div className="text-xs text-base-content/50 mt-0.5">
                            {supplier.code}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                        <li>
                          <button 
                            onClick={() => navigate(`/fournisseurs/${supplier.id}`)}
                            className="text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Détails
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => navigate(`/fournisseurs/${supplier.id}/edit`)}
                            className="text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                        </li>
                        <li>
                          <button 
                            className="text-sm"
                            onClick={() => {
                              setFournisseurToToggle(supplier)
                              setShowStatusModal(true)
                            }}
                          >
                            {supplier.is_active ? (
                              <><XCircle className="w-4 h-4" /> Désactiver</>
                            ) : (
                              <><CheckCircle className="w-4 h-4" /> Activer</>
                            )}
                          </button>
                        </li>
                        <li>
                          <button 
                            className="text-error text-sm"
                            onClick={() => {
                              setFournisseurToDelete(supplier)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>
                    {supplier.city && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <span className="truncate">{supplier.city}, {supplier.country}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t border-base-300 flex items-center justify-between">
                    {getStatusBadge(supplier.is_active)}
                    {supplier.notes && (
                      <div className="text-xs text-base-content/40 truncate max-w-[60%]">
                        📝 {supplier.notes.substring(0, 30)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm">
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('company_name')}
                    >
                      Fournisseur
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Email / Téléphone</th>
                  <th className="hidden md:table-cell">Localisation</th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('is_active')}
                    >
                      Statut
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover">
                    <td>
                      <div>
                        <div className="font-semibold text-sm sm:text-base">{supplier.company_name}</div>
                        {supplier.code && (
                          <div className="text-xs text-base-content/50">{supplier.code}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[150px]">{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{supplier.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      {supplier.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-sm">{supplier.city}</span>
                        </div>
                      )}
                    </td>
                    <td>{getStatusBadge(supplier.is_active)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => navigate(`/fournisseurs/${supplier.id}`)}
                          className="btn btn-ghost btn-xs sm:btn-sm"
                          title="Détails"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/fournisseurs/${supplier.id}/edit`)}
                          className="btn btn-ghost btn-xs sm:btn-sm text-primary"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs sm:btn-sm"
                          onClick={() => {
                            setFournisseurToToggle(supplier)
                            setShowStatusModal(true)
                          }}
                          title={supplier.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {supplier.is_active ? <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs sm:btn-sm text-error"
                          onClick={() => {
                            setFournisseurToDelete(supplier)
                            setShowDeleteModal(true)
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
        {filteredAndSortedSuppliers.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedSuppliers.length)} sur {filteredAndSortedSuppliers.length}
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
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && fournisseurToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer le fournisseur ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{fournisseurToDelete.company_name}"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1"
                onClick={handleDeleteFournisseur}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal changement statut */}
      {showStatusModal && fournisseurToToggle && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className={`${fournisseurToToggle.is_active ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} rounded-full w-16 h-16 sm:w-20 sm:h-20`}>
                  {fournisseurToToggle.is_active ? (
                    <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  ) : (
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                {fournisseurToToggle.is_active ? 'Désactiver' : 'Activer'} le fournisseur
              </h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment {fournisseurToToggle.is_active ? 'désactiver' : 'activer'} le fournisseur ?
              </p>
              <p className="text-base font-bold mt-2">
                "{fournisseurToToggle.company_name}"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowStatusModal(false)}
              >
                Annuler
              </button>
              <button 
                className={`btn flex-1 ${fournisseurToToggle.is_active ? 'btn-warning' : 'btn-success'}`}
                onClick={handleToggleStatus}
              >
                {fournisseurToToggle.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fournisseurs