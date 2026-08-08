// src/components/comptabilite/PlanComptable.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FolderOpen,
  FileText,
  FolderTree,
  ChevronDown,
  ChevronUp,
  List,
  Shield,
  TrendingUp,
  TrendingDown,
  PiggyBank
} from 'lucide-react'

const PlanComptable = () => {
  const navigate = useNavigate()

  const [comptes, setComptes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterNiveau, setFilterNiveau] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [compteToDelete, setCompteToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('tree')
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [sortField, setSortField] = useState('code')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    actif: 0,
    passif: 0,
    capitaux: 0,
    charges: 0,
    produits: 0
  })

  const typeIcons = {
    actif: <FolderOpen className="w-4 h-4 text-blue-500" />,
    passif: <Shield className="w-4 h-4 text-orange-500" />,
    capitaux: <PiggyBank className="w-4 h-4 text-purple-500" />,
    charges: <TrendingDown className="w-4 h-4 text-red-500" />,
    produits: <TrendingUp className="w-4 h-4 text-green-500" />
  }

  const typeColors = {
    actif: 'badge-info',
    passif: 'badge-warning',
    capitaux: 'badge-secondary',
    charges: 'badge-error',
    produits: 'badge-success'
  }

  const typeLabels = {
    actif: 'Actif',
    passif: 'Passif',
    capitaux: 'Capitaux propres',
    charges: 'Charges',
    produits: 'Produits'
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

      // ✅ URL CORRECTE - SANS /comptabilite/
      const response = await AxiosInstance.get('/plan-comptable/')
      
      const data = response.data || []
      setComptes(data)

      const total = data.length
      const actif = data.filter(c => c.type_compte === 'actif').length
      const passif = data.filter(c => c.type_compte === 'passif').length
      const capitaux = data.filter(c => c.type_compte === 'capitaux').length
      const charges = data.filter(c => c.type_compte === 'charges').length
      const produits = data.filter(c => c.type_compte === 'produits').length

      setStats({ total, actif, passif, capitaux, charges, produits })

      const firstLevel = data.filter(c => c.niveau === 1).map(c => c.id)
      setExpandedNodes(new Set(firstLevel))

    } catch (error) {
      console.error('❌ Erreur chargement plan comptable:', error)
      setError('Erreur de chargement du plan comptable')
      showNotification('Erreur de chargement du plan comptable', 'error')
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

  const handleDeleteCompte = async () => {
    if (!compteToDelete) return
    try {
      // ✅ URL CORRECTE
      await AxiosInstance.delete(`/plan-comptable/${compteToDelete.id}/`)
      showNotification(`Compte ${compteToDelete.code} supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setCompteToDelete(null)
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

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const getIconForType = (type) => {
    return typeIcons[type] || <FileText className="w-4 h-4 text-base-content/40" />
  }

  const getTypeBadge = (type) => {
    return (
      <span className={`badge ${typeColors[type]} gap-1 text-xs border-0`}>
        {typeLabels[type]}
      </span>
    )
  }

  const getNiveauLabel = (niveau) => {
    const labels = {
      1: 'Classe',
      2: 'Compte',
      3: 'Sous-compte',
      4: 'Sous-sous-compte'
    }
    return labels[niveau] || `Niveau ${niveau}`
  }

  const filteredAndSortedComptes = useMemo(() => {
    let filtered = comptes.filter(compte => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = compte.code.toLowerCase().includes(search) || 
                           compte.nom.toLowerCase().includes(search)
      const matchesType = filterType === '' || compte.type_compte === filterType
      const matchesNiveau = filterNiveau === '' || compte.niveau === parseInt(filterNiveau)
      return matchesSearch && matchesType && matchesNiveau
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
  }, [comptes, searchTerm, filterType, filterNiveau, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedComptes.length / itemsPerPage)
  const paginatedComptes = filteredAndSortedComptes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderTree = (items, level = 0, parentId = null) => {
    const children = items
      .filter(item => item.parent === parentId)
      .sort((a, b) => a.code.localeCompare(b.code))
    
    if (children.length === 0) return null

    return (
      <ul className={`space-y-0.5 ${level > 0 ? 'ml-4 sm:ml-6 border-l-2 border-base-200 pl-2 sm:pl-4' : ''}`}>
        {children.map((compte) => {
          const hasChildren = items.filter(c => c.parent === compte.id).length > 0
          const isExpanded = expandedNodes.has(compte.id)

          return (
            <li key={compte.id}>
              <div 
                className={`
                  flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg 
                  hover:bg-base-200/70 transition-all cursor-pointer group
                  ${level === 0 ? 'bg-base-200/30 font-semibold' : ''}
                `}
                onClick={() => navigate(`/plan-comptable/${compte.id}/modifier`)}
              >
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleNode(compte.id)
                    }}
                    className="btn btn-ghost btn-xs btn-square"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                )}
                {!hasChildren && <span className="w-3 sm:w-4" />}

                <div className={`p-1 rounded ${level === 0 ? 'bg-primary/10' : ''}`}>
                  {getIconForType(compte.type_compte)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-mono font-medium text-primary">
                      {compte.code}
                    </span>
                    <span className={`text-xs sm:text-sm ${level === 0 ? 'font-bold' : 'font-medium'} truncate`}>
                      {compte.nom}
                    </span>
                    {level === 0 && (
                      <span className="badge badge-ghost badge-xs text-[10px] sm:text-xs">
                        {getNiveauLabel(compte.niveau)}
                      </span>
                    )}
                  </div>
                  {compte.description && (
                    <p className="text-[10px] sm:text-xs text-base-content/40 truncate">
                      {compte.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {getTypeBadge(compte.type_compte)}
                  {compte.sous_comptes_count > 0 && (
                    <span className="badge badge-ghost badge-xs text-[10px]">
                      {compte.sous_comptes_count}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/plan-comptable/${compte.id}/modifier`)
                    }}
                    className="btn btn-ghost btn-xs text-primary"
                    title="Modifier"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCompteToDelete(compte)
                      setShowDeleteModal(true)
                    }}
                    className="btn btn-ghost btn-xs text-error"
                    title="Supprimer"
                    disabled={compte.sous_comptes_count > 0}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {hasChildren && isExpanded && renderTree(items, level + 1, compte.id)}
            </li>
          )
        })}
      </ul>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du plan comptable...
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
            Plan comptable
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez la structure de vos comptes comptables ({stats.total} comptes)
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
            onClick={() => navigate('/plan-comptable/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau compte</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Actif</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.actif}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Passif</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.passif}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Charges</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.charges}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Produits</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.produits}</div>
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
                  placeholder="Rechercher par code ou nom..."
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
                className="select select-bordered w-full sm:w-36 text-sm"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous types</option>
                <option value="actif">Actif</option>
                <option value="passif">Passif</option>
                <option value="capitaux">Capitaux propres</option>
                <option value="charges">Charges</option>
                <option value="produits">Produits</option>
              </select>
              
              <select 
                className="select select-bordered w-full sm:w-32 text-sm"
                value={filterNiveau}
                onChange={(e) => {
                  setFilterNiveau(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Niveau</option>
                <option value="1">Classe</option>
                <option value="2">Compte</option>
                <option value="3">Sous-compte</option>
                <option value="4">Sous-sous-compte</option>
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterType('')
                  setFilterNiveau('')
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            </div>

            <div className="join">
              <button 
                className={`join-item btn btn-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('tree')}
              >
                <FolderTree className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Arbre</span>
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Liste</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {comptes.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FolderOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucun compte trouvé</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par créer votre premier compte</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/plan-comptable/nouveau')}>
              <Plus className="w-4 h-4" /> Nouveau compte
            </button>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="text-xs text-base-content/40 mb-3 flex items-center gap-2">
              <span>Cliquez sur un compte pour le modifier</span>
              <span className="w-px h-4 bg-base-300"></span>
              <span>Utilisez les flèches pour développer/contracter</span>
            </div>
            {renderTree(comptes)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('code')}>
                        Code <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('nom')}>
                        Nom <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('type_compte')}>
                        Type <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('niveau')}>
                        Niveau <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComptes.map((compte) => (
                    <tr key={compte.id} className="hover">
                      <td className="font-mono text-sm font-medium text-primary">{compte.code}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getIconForType(compte.type_compte)}
                          <span className="font-medium truncate max-w-[200px]">{compte.nom}</span>
                        </div>
                      </td>
                      <td>{getTypeBadge(compte.type_compte)}</td>
                      <td>
                        <span className="badge badge-ghost badge-xs">
                          {getNiveauLabel(compte.niveau)}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => navigate(`/plan-comptable/${compte.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-primary"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setCompteToDelete(compte)
                              setShowDeleteModal(true)
                            }}
                            className="btn btn-ghost btn-xs text-error"
                            title="Supprimer"
                            disabled={compte.sous_comptes_count > 0}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedComptes.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedComptes.length)} sur {filteredAndSortedComptes.length}
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
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <div className="join">
                      <button 
                        className="join-item btn btn-xs sm:btn-sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
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
      {showDeleteModal && compteToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce compte ?</p>
              <p className="text-base font-bold text-error mt-2">"{compteToDelete.code} - {compteToDelete.nom}"</p>
              {compteToDelete.sous_comptes_count > 0 && (
                <p className="text-xs text-warning mt-2">
                  ⚠️ Ce compte a {compteToDelete.sous_comptes_count} sous-compte(s). Supprimez-les d'abord.
                </p>
              )}
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button 
                className="btn btn-error flex-1" 
                onClick={handleDeleteCompte}
                disabled={compteToDelete.sous_comptes_count > 0}
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

export default PlanComptable