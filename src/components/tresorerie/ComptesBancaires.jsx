// src/components/tresorerie/ComptesBancaires.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  Eye, MoreVertical, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, List,
  PiggyBank, Building2, DollarSign, Clock, Calendar, CreditCard, Banknote,
  Globe, Hash, User, Settings, Shield, TrendingUp, TrendingDown, Loader2
} from 'lucide-react'

const ComptesBancaires = () => {
  const navigate = useNavigate()
  const [comptes, setComptes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [compteToDelete, setCompteToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('nom')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 })

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

      const response = await AxiosInstance.get('/comptes-bancaires/')
      const data = response.data || []
      setComptes(data)

      const total = data.length
      const actifs = data.filter(c => c.is_active).length
      setStats({ total, actifs, inactifs: total - actifs })

    } catch (error) {
      console.error('Erreur chargement comptes bancaires:', error)
      setError('Erreur de chargement des comptes bancaires')
      showNotification('Erreur de chargement des comptes bancaires', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ DELETE avec confirmation
  const handleDelete = async () => {
    if (!compteToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/comptes-bancaires/${compteToDelete.id}/`)
      showNotification(`Compte "${compteToDelete.nom}" supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setCompteToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ✅ TOGGLE STATUS (Activer/Désactiver)
  const handleToggleStatus = async (compte) => {
    try {
      await AxiosInstance.patch(`/comptes-bancaires/${compte.id}/`, {
        is_active: !compte.is_active
      })
      showNotification(`Compte ${compte.is_active ? 'désactivé' : 'activé'} avec succès`, 'success')
      fetchData()
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

  const getTypeBadge = (type) => {
    const types = {
      courant: 'badge-primary',
      epargne: 'badge-success',
      bloque: 'badge-warning'
    }
    return (
      <span className={`badge ${types[type] || 'badge-ghost'} badge-sm`}>
        {type || 'Non défini'}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-success badge-sm gap-1">
        <CheckCircle className="w-3 h-3" />
        Actif
      </span>
    ) : (
      <span className="badge badge-ghost badge-sm gap-1">
        <Clock className="w-3 h-3" />
        Inactif
      </span>
    )
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

  const filteredAndSorted = React.useMemo(() => {
    let filtered = comptes.filter(c => {
      const search = searchTerm.toLowerCase()
      const nom = (c.nom || '').toLowerCase()
      const banque = (c.banque || '').toLowerCase()
      const numero = (c.numero_compte || '').toLowerCase()
      const code = (c.code || '').toLowerCase()
      
      const matchesSearch = nom.includes(search) || banque.includes(search) || 
                           numero.includes(search) || code.includes(search)
      const matchesType = filterType === '' || c.type_compte === filterType
      const matchesStatus = filterStatus === '' || c.is_active === (filterStatus === 'true')
      
      return matchesSearch && matchesType && matchesStatus
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
  }, [comptes, searchTerm, filterType, filterStatus, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(6)
      else if (window.innerWidth < 1024) setItemsPerPage(9)
      else setItemsPerPage(12)
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
            Chargement des comptes bancaires...
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
            🏦 Comptes bancaires
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos comptes bancaires ({stats.total} au total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <Link to="/comptes-bancaires/nouveau" className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau compte</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Actifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.actifs}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Inactifs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.inactifs}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par nom, banque, numéro..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden gap-2">
            <Filter className="w-4 h-4" /> Filtres {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-3`}>
            <select className="select select-bordered w-full sm:w-40 text-sm" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
              <option value="">Tous types</option>
              <option value="courant">Compte courant</option>
              <option value="epargne">Compte épargne</option>
              <option value="bloque">Compte bloqué</option>
            </select>
            <select className="select select-bordered w-full sm:w-32 text-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Statut</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            <div className="join ml-auto">
              <button className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('table')}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="btn btn-outline gap-2" onClick={() => { setFilterType(''); setFilterStatus(''); setSearchTerm(''); setCurrentPage(1) }}>
              <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <PiggyBank className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucun compte bancaire trouvé</p>
            <Link to="/comptes-bancaires/nouveau" className="btn btn-primary mt-6 gap-2">
              <Plus className="w-4 h-4" /> Créer un compte
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {paginatedItems.map((compte) => (
              <div key={compte.id} className="bg-base-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 border border-base-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-xl w-12 h-12 flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base truncate max-w-[140px]">{compte.nom}</h3>
                      <p className="text-xs text-base-content/50">{compte.banque}</p>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-xs btn-circle">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                      <li>
                        <Link to={`/comptes-bancaires/${compte.id}`} className="text-sm">
                          <Eye className="w-4 h-4" /> Détails
                        </Link>
                      </li>
                      <li>
                        <Link to={`/comptes-bancaires/${compte.id}/edit`} className="text-sm">
                          <Edit className="w-4 h-4" /> Modifier
                        </Link>
                      </li>
                      <li>
                        <button onClick={() => handleToggleStatus(compte)} className="text-sm">
                          {compte.is_active ? (
                            <><X className="w-4 h-4" /> Désactiver</>
                          ) : (
                            <><CheckCircle className="w-4 h-4" /> Activer</>
                          )}
                        </button>
                      </li>
                      <li>
                        <button onClick={() => { setCompteToDelete(compte); setShowDeleteModal(true) }} className="text-sm text-error">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="font-bold">{formatMontant(compte.solde_actuel)}</span>
                  </div>
                  <div className="text-xs text-base-content/50">
                    <span className="font-mono">{compte.numero_compte}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getTypeBadge(compte.type_compte)}
                    {getStatusBadge(compte.is_active)}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/40">
                  <span>Ouvert le {formatDate(compte.date_ouverture)}</span>
                  {compte.iban && <span className="font-mono text-[10px]">IBAN: {compte.iban}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm">
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('code')}>Code <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('nom')}>Nom <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('banque')}>Banque <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Type</th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('solde_actuel')}>Solde <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((compte) => (
                  <tr key={compte.id} className="hover">
                    <td className="font-mono text-xs text-primary">{compte.code}</td>
                    <td className="font-medium">{compte.nom}</td>
                    <td>{compte.banque}</td>
                    <td>{getTypeBadge(compte.type_compte)}</td>
                    <td className="font-bold text-success">{formatMontant(compte.solde_actuel)}</td>
                    <td>{getStatusBadge(compte.is_active)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <Link to={`/comptes-bancaires/${compte.id}`} className="btn btn-ghost btn-xs text-info">
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link to={`/comptes-bancaires/${compte.id}/edit`} className="btn btn-ghost btn-xs text-primary">
                          <Edit className="w-3 h-3" />
                        </Link>
                        <button onClick={() => handleToggleStatus(compte)} className="btn btn-ghost btn-xs">
                          {compte.is_active ? <X className="w-3 h-3 text-warning" /> : <CheckCircle className="w-3 h-3 text-success" />}
                        </button>
                        <button onClick={() => { setCompteToDelete(compte); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error">
                          <Trash2 className="w-3 h-3" />
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
        {filteredAndSorted.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur {filteredAndSorted.length}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <select className="select select-bordered select-xs sm:select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                </select>
                <div className="join">
                  <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    let pageNum = totalPages <= 3 ? i + 1 : currentPage <= 2 ? i + 1 : currentPage >= totalPages - 1 ? totalPages - 2 + i : currentPage - 1 + i
                    return (
                      <button key={i} className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    )
                  })}
                  <button className="join-item btn btn-xs sm:btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && compteToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce compte bancaire ?</p>
              <p className="text-base font-bold text-error mt-2">"{compteToDelete.nom}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComptesBancaires