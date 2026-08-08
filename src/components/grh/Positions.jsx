// src/components/drh/Positions.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Briefcase,
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
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  TrendingDown,
  Grid3x3,
  Table2,
  Clock
} from 'lucide-react'

const Positions = () => {
  const navigate = useNavigate()

  const [positions, setPositions] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [positionToToggle, setPositionToToggle] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departments: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        showNotification('Veuillez vous connecter', 'error')
        setLoading(false)
        return
      }
      
      const [positionsRes, departmentsRes] = await Promise.all([
        AxiosInstance.get('/positions/'),
        AxiosInstance.get('/departments/')
      ])
      
      const positionsData = positionsRes.data || []
      const departmentsData = departmentsRes.data || []
      
      setPositions(positionsData)
      setDepartments(departmentsData)
      
      const total = positionsData.length
      const active = positionsData.filter(p => p.is_active).length
      const inactive = total - active
      const departmentsCount = departmentsData.length
      
      setStats({ total, active, inactive, departments: departmentsCount })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des postes', 'error')
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

  const handleDeletePosition = async () => {
    if (!positionToDelete) return
    try {
      await AxiosInstance.delete(`/positions/${positionToDelete.id}/`)
      showNotification('Poste supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setPositionToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleToggleStatus = async () => {
    if (!positionToToggle) return
    try {
      await AxiosInstance.patch(`/positions/${positionToToggle.id}/`, { 
        is_active: !positionToToggle.is_active 
      })
      showNotification(`Poste ${positionToToggle.is_active ? 'désactivé' : 'activé'} avec succès`, 'success')
      fetchData()
      setShowStatusModal(false)
      setPositionToToggle(null)
    } catch (error) {
      showNotification('Erreur lors de la modification', 'error')
    }
  }

  const formatSalary = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-FR').format(amount) + ' €'
  }

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept ? dept.name : '-'
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

  // Filtrage
  const filteredPositions = React.useMemo(() => {
    return positions.filter(pos => {
      const search = searchTerm.toLowerCase()
      const title = (pos.title || '').toLowerCase()
      const departmentName = getDepartmentName(pos.department).toLowerCase()
      
      const matchesSearch = title.includes(search) || departmentName.includes(search)
      const matchesDepartment = filterDepartment === '' || pos.department?.toString() === filterDepartment
      const matchesStatus = filterStatus === '' || pos.is_active === (filterStatus === 'true')
      
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [positions, searchTerm, filterDepartment, filterStatus, departments])

  // Pagination
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage)
  const paginatedPositions = filteredPositions.slice(
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
            Chargement des postes...
          </p>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            Postes
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez les postes de l'entreprise ({stats.total} au total)
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
            onClick={() => navigate('/positions/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau poste</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
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
          <div className="stat-figure text-base-content/40">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Inactifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.inactive}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-accent">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Départements</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.departments}</div>
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
                placeholder="Rechercher par titre, département..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          {/* Bouton toggle filtres sur mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm sm:hidden gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
          
          {/* Filtres */}
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-48 text-sm"
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Départements</option>
              {departments.filter(d => d.is_active !== false).map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-36 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterDepartment('')
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
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {filteredPositions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Briefcase className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">
              Aucun poste trouvé
            </p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez un nouveau poste
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/positions/new')}
            >
              <Plus className="w-4 h-4" />
              Créer un poste
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Vue Grille */
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginatedPositions.map((pos) => {
                const departmentName = getDepartmentName(pos.department)
                const hasSalary = pos.min_salary || pos.max_salary
                
                return (
                  <div 
                    key={pos.id} 
                    className="bg-base-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-base-content line-clamp-1">
                            {pos.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <div className="badge badge-sm bg-accent/10 text-accent gap-1">
                              <Building2 className="w-3 h-3" />
                              {departmentName}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown dropdown-end">
                        <button className="btn btn-ghost btn-xs btn-circle">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                          <li>
                            <Link to={`/positions/${pos.id}`} className="text-sm">
                              <Eye className="w-4 h-4" />
                              Détails
                            </Link>
                          </li>
                          <li>
                            <Link to={`/positions/${pos.id}/edit`} className="text-sm">
                              <Edit className="w-4 h-4" />
                              Modifier
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="text-sm"
                              onClick={() => {
                                setPositionToToggle(pos)
                                setShowStatusModal(true)
                              }}
                            >
                              {pos.is_active ? (
                                <><Clock className="w-4 h-4" /> Désactiver</>
                              ) : (
                                <><CheckCircle className="w-4 h-4" /> Activer</>
                              )}
                            </button>
                          </li>
                          <li>
                            <button 
                              className="text-error text-sm"
                              onClick={() => {
                                setPositionToDelete(pos)
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
                    
                    {pos.description && (
                      <p className="text-xs text-base-content/60 mb-3 line-clamp-2">
                        {pos.description}
                      </p>
                    )}
                    
                    {hasSalary && (
                      <div className="bg-base-100 rounded-lg p-2 mb-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-base-content/50">Salaire</span>
                          <div className="flex gap-3">
                            {pos.min_salary && (
                              <div className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3 text-info" />
                                <span className="font-medium">{formatSalary(pos.min_salary)}</span>
                              </div>
                            )}
                            {pos.max_salary && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-success" />
                                <span className="font-medium">{formatSalary(pos.max_salary)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-3 flex items-center justify-between">
                      {getStatusBadge(pos.is_active)}
                      <span className="text-xs text-base-content/40">
                        ID: {pos.id}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Vue Tableau */
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm bg-base-200">
                  <th>Titre</th>
                  <th>Département</th>
                  <th className="hidden sm:table-cell">Salaire min</th>
                  <th className="hidden sm:table-cell">Salaire max</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {paginatedPositions.map((pos) => {
                  const departmentName = getDepartmentName(pos.department)
                  
                  return (
                    <tr key={pos.id} className="hover:bg-base-200 transition-colors">
                      <td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="avatar placeholder w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-primary/10">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{pos.title}</div>
                            {pos.description && (
                              <div className="text-xs text-base-content/50 hidden sm:block max-w-xs truncate">
                                {pos.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="badge badge-sm bg-accent/10 text-accent gap-1">
                          <Building2 className="w-3 h-3" />
                          {departmentName}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">{formatSalary(pos.min_salary)}</td>
                      <td className="hidden sm:table-cell">{formatSalary(pos.max_salary)}</td>
                      <td>{getStatusBadge(pos.is_active)}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Link 
                            to={`/positions/${pos.id}`}
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            title="Détails"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <Link 
                            to={`/positions/${pos.id}/edit`}
                            className="btn btn-ghost btn-xs sm:btn-sm text-primary"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            onClick={() => {
                              setPositionToToggle(pos)
                              setShowStatusModal(true)
                            }}
                            title={pos.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {pos.is_active ? <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs sm:btn-sm text-error"
                            onClick={() => {
                              setPositionToDelete(pos)
                              setShowDeleteModal(true)
                            }}
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
        {filteredPositions.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPositions.length)} sur {filteredPositions.length}
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
      {showDeleteModal && positionToDelete && (
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
                Voulez-vous vraiment supprimer le poste ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{positionToDelete.title}"
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
                onClick={handleDeletePosition}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation changement statut */}
      {showStatusModal && positionToToggle && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className={`${positionToToggle.is_active ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} rounded-full w-16 h-16 sm:w-20 sm:h-20`}>
                  {positionToToggle.is_active ? (
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
                  ) : (
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                {positionToToggle.is_active ? 'Désactiver' : 'Activer'} le poste
              </h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment {positionToToggle.is_active ? 'désactiver' : 'activer'} le poste ?
              </p>
              <p className="text-base font-bold mt-2">
                "{positionToToggle.title}"
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
                className={`btn flex-1 ${positionToToggle.is_active ? 'btn-warning' : 'btn-success'}`}
                onClick={handleToggleStatus}
              >
                {positionToToggle.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Positions