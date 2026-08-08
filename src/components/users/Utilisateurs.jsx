// src/components/users/Utilisateurs.jsx - Version Responsive
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
  Users,
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
  Shield,
  Crown,
  Store,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Building2,
  UserCircle,
  Menu,
  Grid3x3,
  Table2
} from 'lucide-react'

// Configuration des rôles
const ROLE_CONFIG = {
  pdg: { label: 'PDG', icon: Crown, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error', level: 100 },
  drh: { label: 'DRH', icon: Shield, color: 'secondary', bgColor: 'bg-secondary/10', textColor: 'text-secondary', level: 90 },
  chef_agence: { label: "Chef d'agence", icon: Store, color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary', level: 80 },
  gestionnaire_stock: { label: 'Gestionnaire stock', icon: Briefcase, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info', level: 70 },
  commercial: { label: 'Commercial', icon: Users, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning', level: 60 },
  autre: { label: 'Utilisateur', icon: UserCircle, color: 'neutral', bgColor: 'bg-base-200', textColor: 'text-base-content/70', level: 50 }
}

const Utilisateurs = () => {
  const navigate = useNavigate()

  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [userToToggle, setUserToToggle] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('last_name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pdg: 0,
    drh: 0,
    autre: 0
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
      
      const response = await AxiosInstance.get('/users/')
      const users = response.data || []
      setUtilisateurs(users)
      
      const total = users.length
      const active = users.filter(u => u.is_active).length
      const inactive = total - active
      const pdg = users.filter(u => u.role_global === 'pdg').length
      const drh = users.filter(u => u.role_global === 'drh').length
      const autre = users.filter(u => u.role_global === 'autre').length
      
      setStats({ total, active, inactive, pdg, drh, autre })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des utilisateurs', 'error')
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await AxiosInstance.delete(`/users/${userToDelete.id}/`)
      showNotification(`Utilisateur supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleToggleStatus = async () => {
    if (!userToToggle) return
    try {
      await AxiosInstance.patch(`/users/${userToToggle.id}/toggle_active/`)
      showNotification(`Utilisateur ${userToToggle.is_active ? 'désactivé' : 'activé'} avec succès`, 'success')
      fetchData()
      setShowStatusModal(false)
      setUserToToggle(null)
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

  const getInitials = (firstName, lastName, email) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) return firstName.charAt(0).toUpperCase()
    if (lastName) return lastName.charAt(0).toUpperCase()
    return email?.charAt(0).toUpperCase() || 'U'
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
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = utilisateurs.filter(user => {
      const search = searchTerm.toLowerCase()
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase()
      const email = (user.email || '').toLowerCase()
      const roleLabel = (ROLE_CONFIG[user.role_global]?.label || '').toLowerCase()
      
      const matchesSearch = fullName.includes(search) || email.includes(search) || roleLabel.includes(search)
      const matchesRole = filterRole === '' || user.role_global === filterRole
      const matchesStatus = filterStatus === '' || user.is_active === (filterStatus === 'true')
      
      return matchesSearch && matchesRole && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal, bVal
      
      if (sortField === 'full_name') {
        aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
        bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase()
      } else if (sortField === 'role') {
        const aRole = ROLE_CONFIG[a.role_global]?.level || 50
        const bRole = ROLE_CONFIG[b.role_global]?.level || 50
        aVal = aRole
        bVal = bRole
      } else {
        aVal = (a[sortField] || '').toLowerCase()
        bVal = (b[sortField] || '').toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [utilisateurs, searchTerm, filterRole, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
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
            Chargement des utilisateurs...
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Utilisateurs
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez les utilisateurs de la plateforme ({stats.total} au total)
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
            onClick={() => navigate('/utilisateurs/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvel utilisateur</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Actifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error">
            <UserX className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Inactifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.inactive}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">PDG</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.pdg}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-secondary">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">DRH</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.drh}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-neutral">
            <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Autres</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.autre}</div>
        </div>
      </div>

      {/* Filtres et recherche - Responsive avec toggle sur mobile */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          {/* Barre de recherche toujours visible */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
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
          
          {/* Filtres - conditionnels sur mobile */}
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Rôles</option>
              <option value="pdg">PDG</option>
              <option value="drh">DRH</option>
              <option value="autre">Autre</option>
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
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterRole('')
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

      {/* Contenu principal - Responsive */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">
              Aucun utilisateur trouvé
            </p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez un nouvel utilisateur
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/utilisateurs/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Créer un utilisateur
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Vue Grille - Responsive (1 colonne mobile, 2 tablette, 3/4 desktop) */
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {paginatedUsers.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role_global] || ROLE_CONFIG.autre
                const RoleIcon = roleConfig.icon
                const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur'
                const initials = getInitials(user.first_name, user.last_name, user.email)
                
                return (
                  <div 
                    key={user.id} 
                    className="bg-base-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className={`rounded-xl w-12 h-12 sm:w-14 sm:h-14 ${roleConfig.bgColor}`}>
                            <span className={`text-lg sm:text-2xl font-bold ${roleConfig.textColor}`}>
                              {initials}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-base-content line-clamp-1">
                            {fullName}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <div className={`badge badge-sm ${roleConfig.bgColor} ${roleConfig.textColor} gap-1`}>
                              <RoleIcon className="w-3 h-3" />
                              {roleConfig.label}
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
                            <Link to={`/utilisateurs/${user.id}`} className="text-sm">
                              <Eye className="w-4 h-4" />
                              Détails
                            </Link>
                          </li>
                          <li>
                            <Link to={`/utilisateurs/${user.id}/edit`} className="text-sm">
                              <Edit className="w-4 h-4" />
                              Modifier
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="text-sm"
                              onClick={() => {
                                setUserToToggle(user)
                                setShowStatusModal(true)
                              }}
                            >
                              {user.is_active ? (
                                <><UserX className="w-4 h-4" /> Désactiver</>
                              ) : (
                                <><UserCheck className="w-4 h-4" /> Activer</>
                              )}
                            </button>
                          </li>
                          <li>
                            <button 
                              className="text-error text-sm"
                              onClick={() => {
                                setUserToDelete(user)
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
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {user.roles_agence && user.roles_agence.length > 0 && (
                      <div className="pt-3 border-t border-base-300">
                        <div className="flex flex-wrap gap-1">
                          {user.roles_agence.slice(0, 2).map((role, idx) => (
                            <span key={idx} className="badge badge-xs badge-ghost">
                              {role.role_display.substring(0, 12)}
                            </span>
                          ))}
                          {user.roles_agence.length > 2 && (
                            <span className="badge badge-xs badge-ghost">
                              +{user.roles_agence.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-3 flex items-center justify-between">
                      {getStatusBadge(user.is_active)}
                      <span className="text-xs text-base-content/40">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Vue Tableau - Scroll horizontal sur mobile */
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm">
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th className="hidden sm:table-cell">Rôle</th>
                  <th className="hidden md:table-cell">Téléphone</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur'
                  const roleConfig = ROLE_CONFIG[user.role_global] || ROLE_CONFIG.autre
                  const RoleIcon = roleConfig.icon
                  
                  return (
                    <tr key={user.id} className="hover text-sm">
                      <td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`avatar placeholder w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${roleConfig.bgColor}`}>
                            <span className={`text-xs sm:text-sm font-bold ${roleConfig.textColor}`}>
                              {getInitials(user.first_name, user.last_name, user.email)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{fullName}</div>
                            {user.employee_id && (
                              <div className="text-xs text-base-content/50 hidden sm:block">{user.employee_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[120px] sm:max-w-none truncate">{user.email}</td>
                      <td className="hidden sm:table-cell">
                        <div className={`badge badge-sm ${roleConfig.bgColor} ${roleConfig.textColor} gap-1`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleConfig.label}
                        </div>
                      </td>
                      <td className="hidden md:table-cell">{user.phone || '-'}</td>
                      <td>{getStatusBadge(user.is_active)}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Link 
                            to={`/utilisateurs/${user.id}`}
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            title="Détails"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <Link 
                            to={`/utilisateurs/${user.id}/edit`}
                            className="btn btn-ghost btn-xs sm:btn-sm text-primary"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-xs sm:btn-sm"
                            onClick={() => {
                              setUserToToggle(user)
                              setShowStatusModal(true)
                            }}
                            title={user.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {user.is_active ? <UserX className="w-3 h-3 sm:w-4 sm:h-4" /> : <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs sm:btn-sm text-error"
                            onClick={() => {
                              setUserToDelete(user)
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

        {/* Pagination - Responsive */}
        {filteredAndSortedUsers.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} sur {filteredAndSortedUsers.length}
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

      {/* Modals - Responsive */}
      {showDeleteModal && userToDelete && (
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
                Voulez-vous vraiment supprimer l'utilisateur ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{userToDelete.email}"
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
                onClick={handleDeleteUser}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation changement statut - Responsive */}
      {showStatusModal && userToToggle && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className={`${userToToggle.is_active ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} rounded-full w-16 h-16 sm:w-20 sm:h-20`}>
                  {userToToggle.is_active ? (
                    <UserX className="w-8 h-8 sm:w-10 sm:h-10" />
                  ) : (
                    <UserCheck className="w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                {userToToggle.is_active ? 'Désactiver' : 'Activer'} l'utilisateur
              </h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment {userToToggle.is_active ? 'désactiver' : 'activer'} l'utilisateur ?
              </p>
              <p className="text-base font-bold mt-2">
                "{userToToggle.email}"
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
                className={`btn flex-1 ${userToToggle.is_active ? 'btn-warning' : 'btn-success'}`}
                onClick={handleToggleStatus}
              >
                {userToToggle.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Utilisateurs