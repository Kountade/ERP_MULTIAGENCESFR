// src/components/drh/Employees.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Users,
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
  Building2,
  DollarSign,
  Grid3x3,
  Table2,
  Clock,
  User,
  Mail,
  QrCode,
  Calendar
} from 'lucide-react'

const Employees = () => {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('table')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showFilters, setShowFilters] = useState(false)

  const statusConfig = {
    active: { label: 'Actif', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    inactive: { label: 'Inactif', icon: X, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/50' },
    on_leave: { label: 'En congé', icon: Calendar, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    sick: { label: 'Maladie', icon: AlertCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    remote: { label: 'Télétravail', icon: Clock, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    suspended: { label: 'Suspendu', icon: X, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    terminated: { label: 'Licencié', icon: X, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/50' },
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number)
  }

  const fetchData = () => {
    setLoading(true)
    Promise.all([AxiosInstance.get('/employees/'), AxiosInstance.get('/departments/')])
      .then(([employeesRes, departmentsRes]) => {
        setEmployees(employeesRes.data || [])
        setDepartments(departmentsRes.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching data:', err)
        showNotification('Erreur de chargement des données', 'error')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return
    try {
      await AxiosInstance.delete(`/employees/${employeeToDelete.id}/`)
      showNotification('Employé supprimé avec succès', 'success')
      fetchData()
      setShowDeleteModal(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Error:', error)
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      (emp.full_name?.toLowerCase() || '').includes(search) ||
      (emp.employee_number?.toLowerCase() || '').includes(search) ||
      (emp.email?.toLowerCase() || '').includes(search)
    const matchesDepartment = !filterDepartment || emp.department?.toString() === filterDepartment
    const matchesStatus = !filterStatus || emp.work_status === filterStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.work_status === 'active').length,
    onLeave: employees.filter((e) => e.work_status === 'on_leave').length,
    sick: employees.filter((e) => e.work_status === 'sick').length,
  }

  // Ajuster itemsPerPage selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(5)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(8)
      } else {
        setItemsPerPage(10)
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
            Chargement des employés...
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
            Employés
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez les employés de l'entreprise ({stats.total} au total)
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
            onClick={() => navigate('/employees/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvel employé</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
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
          <div className="stat-figure text-warning">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Congés</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.onLeave}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Maladie</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.sick}</div>
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
                placeholder="Rechercher par nom, matricule, email..."
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
              {departments.filter(d => d.is_active).map(dept => (
                <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Statuts</option>
              <option value="active">Actif</option>
              <option value="on_leave">En congé</option>
              <option value="sick">Maladie</option>
              <option value="remote">Télétravail</option>
              <option value="suspended">Suspendu</option>
              <option value="terminated">Licencié</option>
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
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('card')}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">
              Aucun employé trouvé
            </p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez un nouvel employé
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/employees/new')}
            >
              <Plus className="w-4 h-4" />
              Créer un employé
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Vue Tableau */
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm bg-base-200">
                  <th>MATRICULE</th>
                  <th>NOM COMPLET</th>
                  <th>EMAIL</th>
                  <th className="hidden md:table-cell">DÉPARTEMENT</th>
                  <th>STATUT</th>
                  <th className="hidden sm:table-cell">SALAIRE</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((emp) => {
                  const status = statusConfig[emp.work_status] || statusConfig.active
                  const StatusIcon = status.icon
                  return (
                    <tr key={emp.id} className="hover:bg-base-200 transition-colors">
                      <td>
                        <div className="badge bg-primary/10 text-primary font-mono">
                          {emp.employee_number}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="avatar placeholder w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-primary/10">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{emp.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[150px] truncate">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-base-content/40" />
                          <span className="text-sm">{emp.email}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <div className="badge badge-sm bg-accent/10 text-accent gap-1">
                          <Building2 className="w-3 h-3" />
                          {emp.department_name || '-'}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-primary" />
                          <span className="font-medium">{formatNumber(emp.base_salary)} €</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Link 
                            to={`/employees/${emp.id}`}
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            title="Détails"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <Link 
                            to={`/employees/${emp.id}/qr`}
                            className="btn btn-ghost btn-xs sm:btn-sm text-primary"
                            title="QR Code"
                          >
                            <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <Link 
                            to={`/employees/${emp.id}/edit`}
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-xs sm:btn-sm text-error"
                            onClick={() => {
                              setEmployeeToDelete(emp)
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
        ) : (
          /* Vue Cartes */
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginatedEmployees.map((emp) => {
                const status = statusConfig[emp.work_status] || statusConfig.active
                const StatusIcon = status.icon
                return (
                  <div 
                    key={emp.id} 
                    className="bg-base-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-base-content line-clamp-1">
                            {emp.full_name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <div className="badge badge-sm bg-primary/10 text-primary font-mono">
                              {emp.employee_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span>{emp.department_name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="font-medium">{formatNumber(emp.base_salary)} €</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 flex items-center justify-between border-t border-base-300">
                      <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                      <div className="flex gap-1">
                        <Link 
                          to={`/employees/${emp.id}`}
                          className="btn btn-ghost btn-xs"
                          title="Détails"
                        >
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link 
                          to={`/employees/${emp.id}/qr`}
                          className="btn btn-ghost btn-xs text-primary"
                          title="QR Code"
                        >
                          <QrCode className="w-3 h-3" />
                        </Link>
                        <Link 
                          to={`/employees/${emp.id}/edit`}
                          className="btn btn-ghost btn-xs"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </Link>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setEmployeeToDelete(emp)
                            setShowDeleteModal(true)
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredEmployees.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} sur {filteredEmployees.length}
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
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
      {showDeleteModal && employeeToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer l'employé ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{employeeToDelete.full_name}"
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
                onClick={handleDeleteEmployee}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees