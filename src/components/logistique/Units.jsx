// src/components/Units.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Weight,
  Droplet,
  Ruler,
  Square,
  Package,
  Clock,
  Thermometer,
  Box,
  Filter
} from 'lucide-react'

const Units = () => {
  const navigate = useNavigate()

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [stats, setStats] = useState({ 
    total: 0, 
    weightUnits: 0, 
    volumeUnits: 0, 
    pieceUnits: 0,
    lengthUnits: 0,
    otherUnits: 0
  })

  const getUnitIconAndColor = (name, abbreviation) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbreviation || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids') || lowerName.includes('masse')) {
      return { icon: Weight, color: 'primary' }
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerAbbr.includes('cl') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { icon: Droplet, color: 'info' }
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerAbbr.includes('km') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { icon: Ruler, color: 'secondary' }
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { icon: Square, color: 'success' }
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { icon: Package, color: 'warning' }
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { icon: Clock, color: 'accent' }
    }
    if (lowerName.includes('température') || lowerAbbr.includes('°c') || lowerAbbr.includes('°f')) {
      return { icon: Thermometer, color: 'error' }
    }
    return { icon: Box, color: 'neutral' }
  }

  const getUnitCategory = (name, abbreviation) => {
    const lowerName = (name || '').toLowerCase()
    const lowerAbbr = (abbreviation || '').toLowerCase()

    if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme') || lowerName.includes('poids') || lowerName.includes('masse')) {
      return { label: 'Poids / Masse', color: 'badge-primary' }
    }
    if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerAbbr.includes('cl') || lowerName.includes('litre') || lowerName.includes('volume')) {
      return { label: 'Volume / Capacité', color: 'badge-info' }
    }
    if (lowerAbbr.includes('m') && !lowerAbbr.includes('m²') && !lowerAbbr.includes('m³') || lowerAbbr.includes('cm') || lowerAbbr.includes('mm') || lowerName.includes('mètre') || lowerName.includes('longueur')) {
      return { label: 'Longueur / Distance', color: 'badge-secondary' }
    }
    if (lowerAbbr.includes('m²') || lowerAbbr.includes('m2') || lowerName.includes('surface') || lowerName.includes('aire')) {
      return { label: 'Surface / Aire', color: 'badge-success' }
    }
    if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerAbbr.includes('unité') || lowerName.includes('pièce') || lowerName.includes('unité')) {
      return { label: 'Quantité / Pièce', color: 'badge-warning' }
    }
    if (lowerAbbr.includes('h') || lowerAbbr.includes('min') || lowerName.includes('heure') || lowerName.includes('temps')) {
      return { label: 'Temps / Durée', color: 'badge-accent' }
    }
    return { label: 'Autre', color: 'badge-ghost' }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await AxiosInstance.get('/units/')
      const data = res.data
      setUnits(data)
      
      let weightCount = 0, volumeCount = 0, pieceCount = 0, lengthCount = 0, otherCount = 0
      data.forEach(u => {
        const lowerName = (u.name || '').toLowerCase()
        const lowerAbbr = (u.abbreviation || '').toLowerCase()
        if (lowerAbbr.includes('kg') || lowerAbbr.includes('g') || lowerName.includes('kilo') || lowerName.includes('gramme')) weightCount++
        else if (lowerAbbr.includes('l') || lowerAbbr.includes('ml') || lowerName.includes('litre')) volumeCount++
        else if (lowerAbbr.includes('pcs') || lowerAbbr.includes('pc') || lowerName.includes('pièce')) pieceCount++
        else if (lowerAbbr.includes('m') || lowerAbbr.includes('cm') || lowerName.includes('mètre')) lengthCount++
        else otherCount++
      })
      
      setStats({
        total: data.length,
        weightUnits: weightCount,
        volumeUnits: volumeCount,
        pieceUnits: pieceCount,
        lengthUnits: lengthCount,
        otherUnits: otherCount
      })
    } catch (error) {
      console.error(error)
      showNotification('Erreur de chargement des unités', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return
    try {
      await AxiosInstance.delete(`/units/${unitToDelete.id}/`)
      showNotification(`Unité "${unitToDelete.name}" supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setUnitToDelete(null)
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

  const filteredAndSortedUnits = React.useMemo(() => {
    let filtered = units.filter(u => {
      const search = searchTerm.toLowerCase()
      const name = (u.name || '').toLowerCase()
      const abbreviation = (u.abbreviation || '').toLowerCase()
      return name.includes(search) || abbreviation.includes(search)
    })

    filtered.sort((a, b) => {
      let aVal = (a[sortField] || '').toLowerCase()
      let bVal = (b[sortField] || '').toLowerCase()
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [units, searchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedUnits.length / itemsPerPage)
  const paginatedUnits = filteredAndSortedUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
            Chargement des unités...
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
            Unités de mesure
          </h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Gérez les unités physiques et commerciales
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
            onClick={() => navigate('/units/nouveau')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouvelle unité</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-primary p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Box className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-blue-500 p-2 lg:p-4">
          <div className="stat-figure text-blue-500">
            <Weight className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Poids</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.weightUnits}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-info p-2 lg:p-4">
          <div className="stat-figure text-info">
            <Droplet className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Volume</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.volumeUnits}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-secondary p-2 lg:p-4">
          <div className="stat-figure text-secondary">
            <Ruler className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Longueur</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.lengthUnits}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-warning p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <Package className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Pièce</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.pieceUnits}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border-l-4 border-neutral p-2 lg:p-4">
          <div className="stat-figure text-neutral">
            <Box className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Autre</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.otherUnits}</div>
        </div>
      </div>

      {/* Filtres - Desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou abréviation..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
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

        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300">
            <button 
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
                setShowMobileFilters(false)
              }}
            >
              Réinitialiser la recherche
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
                <th className="w-16"></th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('name')}
                  >
                    Nom de l'unité
                    <SortIcon field="name" />
                  </button>
                </th>
                <th>
                  <button 
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('abbreviation')}
                  >
                    Abréviation
                    <SortIcon field="abbreviation" />
                  </button>
                </th>
                <th>Catégorie</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUnits.map((unit) => {
                const { icon: IconComponent, color: iconColor } = getUnitIconAndColor(unit.name, unit.abbreviation)
                const category = getUnitCategory(unit.name, unit.abbreviation)
                return (
                  <tr key={unit.id} className="hover">
                    <td>
                      <div className={`avatar placeholder`}>
                        <div className={`bg-${iconColor}/10 rounded-lg w-10 h-10`}>
                          <IconComponent className={`w-5 h-5 text-${iconColor}`} />
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{unit.name}</td>
                    <td>
                      <span className={`badge badge-lg font-bold bg-${iconColor}/10 text-${iconColor}`}>
                        {unit.abbreviation}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${category.color}`}>
                        {category.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button 
                          className="btn btn-ghost btn-xs"
                          onClick={() => navigate(`/units/${unit.id}/modifier`)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setUnitToDelete(unit)
                            setShowDeleteModal(true)
                          }}
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

        {filteredAndSortedUnits.length === 0 && (
          <div className="p-12 text-center">
            <Box className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-base font-medium text-base-content/50">
              Aucune unité trouvée
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            <button 
              className="btn btn-primary btn-sm mt-4"
              onClick={() => navigate('/units/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer une unité
            </button>
          </div>
        )}
      </div>

      {/* Liste - Mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedUnits.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <Box className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucune unité trouvée
            </p>
            <button 
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/units/nouveau')}
            >
              <Plus className="w-3 h-3" />
              Créer
            </button>
          </div>
        ) : (
          paginatedUnits.map((unit) => {
            const { icon: IconComponent, color: iconColor } = getUnitIconAndColor(unit.name, unit.abbreviation)
            const category = getUnitCategory(unit.name, unit.abbreviation)
            return (
              <div key={unit.id} className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-${iconColor}/10 rounded-lg`}>
                    <IconComponent className={`w-5 h-5 text-${iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{unit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge badge-sm font-bold bg-${iconColor}/10 text-${iconColor}`}>
                        {unit.abbreviation}
                      </span>
                      <span className={`badge ${category.color} badge-xs`}>
                        {category.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => navigate(`/units/${unit.id}/modifier`)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="text-xs">Modifier</span>
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      setUnitToDelete(unit)
                      setShowDeleteModal(true)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="text-xs">Supprimer</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedUnits.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedUnits.length)} sur {filteredAndSortedUnits.length} unités
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
                Voulez-vous vraiment supprimer l'unité
              </p>
              <p className="text-lg font-bold text-error mt-2">
                "{unitToDelete?.name} ({unitToDelete?.abbreviation})" ?
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible. Les produits utilisant cette unité pourraient être affectés.
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
                onClick={handleDeleteUnit}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Units