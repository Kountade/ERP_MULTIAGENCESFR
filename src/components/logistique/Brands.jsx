// src/components/Brands.jsx
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
  Building2,
  Globe,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Star,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Mail,
  Phone,
  MapPin,
  Link2,
  ExternalLink,
  Grid,
  List,
  LayoutGrid,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'

const Brands = () => {
  const navigate = useNavigate()

  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'table'
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withProducts: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/brands/')
      setBrands(response.data)
      
      // Calculer les statistiques
      const total = response.data.length
      const active = response.data.filter(b => b.is_active).length
      const inactive = total - active
      const withProducts = response.data.filter(b => (b.products_count || 0) > 0).length
      
      setStats({ total, active, inactive, withProducts })
      
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des marques', 'error')
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

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return
    try {
      await AxiosInstance.delete(`/brands/${brandToDelete.id}/`)
      showNotification(`Marque "${brandToDelete.name}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setBrandToDelete(null)
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

  // Filtrage et tri des marques
  const filteredAndSortedBrands = React.useMemo(() => {
    let filtered = brands.filter(brand => {
      const search = searchTerm.toLowerCase()
      const name = (brand.name || '').toLowerCase()
      const description = (brand.description || '').toLowerCase()
      const matchesSearch = name.includes(search) || description.includes(search)
      const matchesActive = filterActive === '' || brand.is_active === (filterActive === 'true')
      return matchesSearch && matchesActive
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'products_count') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [brands, searchTerm, filterActive, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBrands.length / itemsPerPage)
  const paginatedBrands = filteredAndSortedBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <div className="badge badge-success gap-1">
        <CheckCircle className="w-3 h-3" />
        Actif
      </div>
    ) : (
      <div className="badge badge-ghost gap-1">
        <Clock className="w-3 h-3" />
        Inactif
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des marques...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Marques
          </h1>
          <p className="text-base text-base-content/60">
            Gérez les marques de vos produits
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/brands/nouveau')}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle marque
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="stat-title text-base font-semibold">Total marques</div>
          <div className="stat-value text-3xl font-black">{stats.total}</div>
          <div className="stat-desc">Toutes les marques</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title text-base font-semibold">Actives</div>
          <div className="stat-value text-3xl font-black">{stats.active}</div>
          <div className="stat-desc">{((stats.active / stats.total) * 100).toFixed(1)}% du total</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning">
            <Package className="w-8 h-8" />
          </div>
          <div className="stat-title text-base font-semibold">Avec produits</div>
          <div className="stat-value text-3xl font-black">{stats.withProducts}</div>
          <div className="stat-desc">Marques actives</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info">
            <Award className="w-8 h-8" />
          </div>
          <div className="stat-title text-base font-semibold">Produits totaux</div>
          <div className="stat-value text-3xl font-black">
            {brands.reduce((sum, b) => sum + (b.products_count || 0), 0)}
          </div>
          <div className="stat-desc">Tous produits confondus</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                className="input input-bordered w-full pl-12"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="select select-bordered min-w-[150px]"
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
              className="btn btn-outline"
              onClick={() => {
                setFilterActive('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
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
        {filteredAndSortedBrands.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">
              Aucune marque trouvée
            </p>
            <p className="text-base text-base-content/40 mt-2">
              Essayez de modifier vos critères de recherche ou créez une nouvelle marque
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2"
              onClick={() => navigate('/brands/nouveau')}
            >
              <Plus className="w-4 h-4" />
              Créer une marque
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Vue Grille */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedBrands.map((brand) => (
                <div 
                  key={brand.id} 
                  className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-xl">
                            <img src={brand.logo} alt={brand.name} className="object-cover" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-xl w-14 h-14">
                            <Building2 className="w-7 h-7" />
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-base-content">{brand.name}</h3>
                        {getStatusBadge(brand.is_active)}
                      </div>
                    </div>
                    
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-ghost btn-sm btn-circle">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                          <button onClick={() => {
                            setSelectedBrand(brand)
                            setShowDetailsModal(true)
                          }}>
                            <Eye className="w-4 h-4" />
                            Voir détails
                          </button>
                        </li>
                        <li>
                          <button onClick={() => navigate(`/brands/${brand.id}/modifier`)}>
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                        </li>
                        <li>
                          <button 
                            className="text-error"
                            onClick={() => {
                              setBrandToDelete(brand)
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
                  
                  <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
                    {brand.description || 'Aucune description'}
                  </p>
                  
                  {brand.website && (
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-focus mb-3"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  
                  <div className="pt-3 border-t border-base-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-base-content/60">Produits</span>
                      <span className="badge badge-primary">
                        {brand.products_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Vue Tableau */
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('name')}
                    >
                      Nom
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Description</th>
                  <th>Site web</th>
                  <th>
                    <button 
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('products_count')}
                    >
                      Produits
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBrands.map((brand) => (
                  <tr key={brand.id} className="hover">
                    <td>
                      {brand.logo ? (
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-lg">
                            <img src={brand.logo} alt={brand.name} />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                            <Building2 className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{brand.name}</td>
                    <td className="max-w-xs truncate text-base-content/70">
                      {brand.description || '-'}
                    </td>
                    <td>
                      {brand.website ? (
                        <a 
                          href={brand.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link link-primary flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">
                            {brand.website.replace(/^https?:\/\//, '')}
                          </span>
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <span className="badge">
                        {brand.products_count || 0}
                      </span>
                    </td>
                    <td>{getStatusBadge(brand.is_active)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setSelectedBrand(brand)
                            setShowDetailsModal(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => navigate(`/brands/${brand.id}/modifier`)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setBrandToDelete(brand)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
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
        {filteredAndSortedBrands.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedBrands.length)} sur{' '}
                {filteredAndSortedBrands.length} marques
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  className="select select-bordered select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                >
                  <option value="12">12 par page</option>
                  <option value="24">24 par page</option>
                  <option value="48">48 par page</option>
                  <option value="96">96 par page</option>
                </select>
                
                <div className="join">
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button 
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment supprimer la marque
              </p>
              <p className="text-xl font-bold text-error mt-2">
                "{brandToDelete?.name}" ?
              </p>
              <p className="text-sm text-base-content/50 mt-4">
                Cette action est irréversible. Les produits associés à cette marque pourraient être affectés.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteBrand}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedBrand && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Détails de la marque</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                {selectedBrand.logo ? (
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-xl">
                      <img src={selectedBrand.logo} alt={selectedBrand.name} />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-xl w-24 h-24">
                      <Building2 className="w-12 h-12" />
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-2xl mb-2">{selectedBrand.name}</h4>
                  {getStatusBadge(selectedBrand.is_active)}
                </div>
              </div>
              
              <div className="divider">Informations</div>
              
              <div className="space-y-3">
                {selectedBrand.description && (
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Description</label>
                    <p className="mt-1">{selectedBrand.description}</p>
                  </div>
                )}
                
                {selectedBrand.website && (
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Site web</label>
                    <a 
                      href={selectedBrand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-2 link link-primary"
                    >
                      <Globe className="w-4 h-4" />
                      {selectedBrand.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Produits associés</label>
                    <p className="text-2xl font-bold mt-1">{selectedBrand.products_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-base-content/60">Date de création</label>
                    <p className="mt-1">
                      {selectedBrand.created_at ? new Date(selectedBrand.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsModal(false)
                  navigate(`/brands/${selectedBrand.id}/modifier`)
                }}
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button 
                className="btn btn-ghost"
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

export default Brands