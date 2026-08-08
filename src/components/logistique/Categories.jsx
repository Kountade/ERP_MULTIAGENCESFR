// src/components/Categories.jsx
import React, { useEffect, useState } from 'react'
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
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Layers,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'

const Categories = () => {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0,
    parentCategories: 0,
    subCategories: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/categories/')
      setCategories(response.data)
      
      const total = response.data.length
      const active = response.data.filter(c => c.is_active).length
      const inactive = total - active
      const withProducts = response.data.filter(c => (c.products_count || 0) > 0).length
      const parentCategories = response.data.filter(c => !c.parent).length
      const subCategories = total - parentCategories
      
      setStats({ 
        total, 
        active, 
        inactive, 
        withProducts, 
        parentCategories, 
        subCategories 
      })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des catégories', 'error')
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

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await AxiosInstance.delete(`/categories/${categoryToDelete.id}/`)
      showNotification(`Catégorie "${categoryToDelete.name}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setCategoryToDelete(null)
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

  // Filtrage et tri des catégories
  const filteredAndSortedCategories = React.useMemo(() => {
    let filtered = categories.filter(category => {
      const search = searchTerm.toLowerCase()
      const name = (category.name || '').toLowerCase()
      const description = (category.description || '').toLowerCase()
      const matchesSearch = name.includes(search) || description.includes(search)
      const matchesActive = filterActive === '' || category.is_active === (filterActive === 'true')
      return matchesSearch && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'products_count' || sortField === 'subcategories_count') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [categories, searchTerm, filterActive, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage)
  const paginatedCategories = filteredAndSortedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-success badge-sm gap-1">
        <CheckCircle className="w-3 h-3" />
        Actif
      </span>
    ) : (
      <span className="badge badge-ghost badge-sm gap-1">
        <AlertCircle className="w-3 h-3" />
        Inactif
      </span>
    )
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des catégories...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
            Catégories
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Organisez vos produits par catégories
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/categories/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouvelle catégorie</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Folder className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Actives</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.active}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4 hidden lg:block">
          <div className="stat-figure text-info">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm">Parents</div>
          <div className="stat-value text-2xl">{stats.parentCategories}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4 hidden lg:block">
          <div className="stat-figure text-secondary">
            <Layers className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm">Sous-cat.</div>
          <div className="stat-value text-2xl">{stats.subCategories}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <Package className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Avec produits</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.withProducts}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-accent">
            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Taux actif</div>
          <div className="stat-value text-lg lg:text-2xl">
            {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <select 
            className="select select-bordered select-sm w-36"
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">Tous statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterActive('')
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            <Filter className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres - Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered input-sm w-full pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3 h-3" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés mobile */}
        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select 
              className="select select-bordered select-sm w-full"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th className="w-12"></th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('name')}
                  >
                    Nom
                    <SortIcon field="name" />
                  </button>
                </th>
                <th>Description</th>
                <th>Catégorie parente</th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('products_count')}
                  >
                    Produits
                    <SortIcon field="products_count" />
                  </button>
                </th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('subcategories_count')}
                  >
                    Sous-cat.
                    <SortIcon field="subcategories_count" />
                  </button>
                </th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((category) => (
                <tr key={category.id} className="hover">
                  <td>
                    {category.image ? (
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-lg">
                          <img src={category.image} alt={category.name} className="object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary rounded-lg w-8 h-8">
                          {category.parent ? (
                            <Folder className="w-4 h-4" />
                          ) : (
                            <FolderOpen className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="font-medium">{category.name}</td>
                  <td className="max-w-xs truncate text-base-content/70">
                    {category.description || '-'}
                  </td>
                  <td className="text-sm">
                    {category.parent ? category.parent_name || `ID: ${category.parent}` : 
                      <span className="text-base-content/40">-</span>
                    }
                  </td>
                  <td className="text-center">
                    <span className="badge badge-sm">
                      {category.products_count || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-sm">
                      {category.subcategories_count || 0}
                    </span>
                  </td>
                  <td>{getStatusBadge(category.is_active)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setSelectedCategory(category)
                          setShowDetailsModal(true)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => navigate(`/categories/${category.id}/modifier`)}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => {
                          setCategoryToDelete(category)
                          setShowDeleteModal(true)
                        }}
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

        {filteredAndSortedCategories.length === 0 && (
          <div className="p-12 text-center">
            <Folder className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-base font-medium text-base-content/50">
              Aucune catégorie trouvée
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            <button 
              className="btn btn-primary btn-sm mt-4"
              onClick={() => navigate('/categories/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer une catégorie
            </button>
          </div>
        )}
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedCategories.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <Folder className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucune catégorie trouvée
            </p>
            <button 
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/categories/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer
            </button>
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <div key={category.id} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Image */}
                <div className="flex-shrink-0">
                  {category.image ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      {category.parent ? (
                        <Folder className="w-5 h-5" />
                      ) : (
                        <FolderOpen className="w-5 h-5" />
                      )}
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm truncate">{category.name}</h3>
                      {category.parent_name && (
                        <p className="text-xs text-base-content/60 mt-0.5">
                          Parent: {category.parent_name}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(category.is_active)}
                  </div>
                  
                  {category.description && (
                    <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Package className="w-3 h-3" />
                      {category.products_count || 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Layers className="w-3 h-3" />
                      {category.subcategories_count || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                <button 
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSelectedCategory(category)
                    setShowDetailsModal(true)
                  }}
                >
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">Voir</span>
                </button>
                <button 
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate(`/categories/${category.id}/modifier`)}
                >
                  <Edit className="w-3 h-3" />
                  <span className="text-xs">Modifier</span>
                </button>
                <button 
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => {
                    setCategoryToDelete(category)
                    setShowDeleteModal(true)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-xs">Supprimer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedCategories.length)} sur {filteredAndSortedCategories.length}
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="select select-bordered select-xs lg:select-sm w-20 lg:w-28"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            
            <div className="join">
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              
              <span className="join-item btn btn-xs lg:btn-sm no-animation">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70 text-sm">
                Voulez-vous vraiment supprimer la catégorie
              </p>
              <p className="text-lg font-bold text-error mt-2">
                "{categoryToDelete?.name}" ?
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleDeleteCategory}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedCategory && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Détails de la catégorie</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {selectedCategory.image ? (
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-lg">
                      <img src={selectedCategory.image} alt={selectedCategory.name} />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-lg w-16 h-16">
                      {selectedCategory.parent ? (
                        <Folder className="w-8 h-8" />
                      ) : (
                        <FolderOpen className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-lg">{selectedCategory.name}</h4>
                  {getStatusBadge(selectedCategory.is_active)}
                </div>
              </div>
              
              <div className="divider my-2"></div>
              
              {selectedCategory.description && (
                <div>
                  <label className="text-xs font-semibold text-base-content/60">Description</label>
                  <p className="text-sm mt-1">{selectedCategory.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-base-content/60">Catégorie parente</label>
                  <p className="text-sm mt-1">{selectedCategory.parent_name || 'Aucune'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/60">Produits</label>
                  <p className="text-lg font-bold">{selectedCategory.products_count || 0}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/60">Sous-catégories</label>
                  <p className="text-lg font-bold">{selectedCategory.subcategories_count || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowDetailsModal(false)
                  navigate(`/categories/${selectedCategory.id}/modifier`)
                }}
              >
                <Edit className="w-3 h-3" />
                Modifier
              </button>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories