// src/components/tresorerie/FraisTresorerie.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle,
  Eye, MoreVertical, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, List,
  Receipt, DollarSign, Clock, Calendar, User, Building2, FileText,
  TrendingUp, TrendingDown, Loader2, Truck, Utensils, Briefcase,
  Phone, Home, BookOpen, Award, Shield, Wrench, Coffee, Plane,
  GraduationCap, Stethoscope, Landmark, ShoppingBag, Smartphone
} from 'lucide-react'

const FraisTresorerie = () => {
  const navigate = useNavigate()
  const [frais, setFrais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fraisToDelete, setFraisToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('date_frais')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({ 
    total: 0, 
    brouillon: 0, 
    en_attente: 0, 
    valide: 0, 
    paye: 0,
    total_montant: 0
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

      const response = await AxiosInstance.get('/frais/')
      const data = response.data || []
      setFrais(data)

      const total = data.length
      const brouillon = data.filter(f => f.status === 'brouillon').length
      const en_attente = data.filter(f => f.status === 'en_attente').length
      const valide = data.filter(f => f.status === 'valide').length
      const paye = data.filter(f => f.status === 'paye').length
      const total_montant = data.reduce((sum, f) => sum + (parseFloat(f.montant) || 0), 0)
      
      setStats({ total, brouillon, en_attente, valide, paye, total_montant })

    } catch (error) {
      console.error('Erreur chargement frais:', error)
      setError('Erreur de chargement des frais')
      showNotification('Erreur de chargement des frais', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ DELETE
  const handleDelete = async () => {
    if (!fraisToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/frais/${fraisToDelete.id}/`)
      showNotification(`Frais "${fraisToDelete.titre}" supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setFraisToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ✅ VALIDER
  const handleValider = async (frais) => {
    try {
      await AxiosInstance.post(`/frais/${frais.id}/valider/`)
      showNotification('Frais validé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  // ✅ PAYER
  const handlePayer = async (frais) => {
    try {
      await AxiosInstance.post(`/frais/${frais.id}/payer/`)
      showNotification('Frais payé avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors du paiement', 'error')
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

  const getCategoryIcon = (category) => {
    const icons = {
      transport: <Truck className="w-4 h-4" />,
      restauration: <Utensils className="w-4 h-4" />,
      fournitures: <Briefcase className="w-4 h-4" />,
      communication: <Phone className="w-4 h-4" />,
      entretien: <Wrench className="w-4 h-4" />,
      formation: <GraduationCap className="w-4 h-4" />,
      mission: <Plane className="w-4 h-4" />,
      representations: <Coffee className="w-4 h-4" />,
      assurances: <Shield className="w-4 h-4" />,
      impots: <Landmark className="w-4 h-4" />,
      loyer: <Home className="w-4 h-4" />,
      services: <ShoppingBag className="w-4 h-4" />,
      autre: <FileText className="w-4 h-4" />
    }
    return icons[category] || <FileText className="w-4 h-4" />
  }

  const getCategoryBadge = (category) => {
    const categories = {
      transport: 'badge-info',
      restauration: 'badge-warning',
      fournitures: 'badge-primary',
      communication: 'badge-secondary',
      entretien: 'badge-neutral',
      formation: 'badge-accent',
      mission: 'badge-info',
      representations: 'badge-warning',
      assurances: 'badge-success',
      impots: 'badge-error',
      loyer: 'badge-primary',
      services: 'badge-secondary',
      autre: 'badge-ghost'
    }
    return (
      <span className={`badge ${categories[category] || 'badge-ghost'} badge-sm gap-1`}>
        {getCategoryIcon(category)}
        {category || 'Autre'}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      brouillon: <span className="badge badge-ghost badge-sm">Brouillon</span>,
      en_attente: <span className="badge badge-warning badge-sm gap-1"><Clock className="w-3 h-3" /> En attente</span>,
      valide: <span className="badge badge-info badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Validé</span>,
      paye: <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" /> Payé</span>,
      refuse: <span className="badge badge-error badge-sm gap-1"><X className="w-3 h-3" /> Refusé</span>,
      annule: <span className="badge badge-ghost badge-sm gap-1"><X className="w-3 h-3" /> Annulé</span>
    }
    return statusMap[status] || <span className="badge badge-ghost badge-sm">{status || 'Inconnu'}</span>
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
    let filtered = frais.filter(f => {
      const search = searchTerm.toLowerCase()
      const titre = (f.titre || '').toLowerCase()
      const reference = (f.reference || '').toLowerCase()
      const beneficiaire = (f.beneficiaire || '').toLowerCase()
      
      const matchesSearch = titre.includes(search) || reference.includes(search) || beneficiaire.includes(search)
      const matchesCategory = filterCategory === '' || f.categorie === filterCategory
      const matchesStatus = filterStatus === '' || f.status === filterStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'date_frais') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (sortField === 'montant') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [frais, searchTerm, filterCategory, filterStatus, sortField, sortDirection])

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
            Chargement des frais...
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
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
            📄 Frais
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos frais et dépenses ({stats.total} au total - {formatMontant(stats.total_montant)})
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={fetchData} className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <Link to="/frais/nouveau" className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau frais</span>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En attente</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-warning">{stats.en_attente}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Validés</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">{stats.valide}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Payés</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.paye}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Brouillons</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-error">{stats.brouillon}</div>
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
                placeholder="Rechercher par titre, référence, bénéficiaire..."
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
            <select className="select select-bordered w-full sm:w-44 text-sm" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1) }}>
              <option value="">Toutes catégories</option>
              <option value="transport">Transport</option>
              <option value="restauration">Restauration</option>
              <option value="fournitures">Fournitures de bureau</option>
              <option value="communication">Communication</option>
              <option value="entretien">Entretien</option>
              <option value="formation">Formation</option>
              <option value="mission">Mission</option>
              <option value="representations">Représentation</option>
              <option value="assurances">Assurances</option>
              <option value="impots">Impôts et taxes</option>
              <option value="loyer">Loyer</option>
              <option value="services">Services</option>
              <option value="autre">Autre</option>
            </select>
            <select className="select select-bordered w-full sm:w-36 text-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option value="">Statut</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
              <option value="paye">Payé</option>
              <option value="refuse">Refusé</option>
              <option value="annule">Annulé</option>
            </select>
            <div className="join ml-auto">
              <button className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('table')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Receipt className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucun frais trouvé</p>
            <Link to="/frais/nouveau" className="btn btn-primary mt-6 gap-2">
              <Plus className="w-4 h-4" /> Créer un frais
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {paginatedItems.map((f) => (
              <div key={f.id} className="bg-base-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 border border-base-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-xl w-12 h-12 flex items-center justify-center">
                      {getCategoryIcon(f.categorie)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base truncate max-w-[140px]">{f.titre}</h3>
                      <p className="text-xs text-base-content/50">{f.reference}</p>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-xs btn-circle">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
                      <li>
                        <Link to={`/frais/${f.id}`} className="text-sm">
                          <Eye className="w-4 h-4" /> Détails
                        </Link>
                      </li>
                      <li>
                        <Link to={`/frais/${f.id}/edit`} className="text-sm">
                          <Edit className="w-4 h-4" /> Modifier
                        </Link>
                      </li>
                      {f.status === 'en_attente' && (
                        <li>
                          <button onClick={() => handleValider(f)} className="text-sm text-info">
                            <CheckCircle className="w-4 h-4" /> Valider
                          </button>
                        </li>
                      )}
                      {f.status === 'valide' && (
                        <li>
                          <button onClick={() => handlePayer(f)} className="text-sm text-success">
                            <DollarSign className="w-4 h-4" /> Payer
                          </button>
                        </li>
                      )}
                      <li>
                        <button onClick={() => { setFraisToDelete(f); setShowDeleteModal(true) }} className="text-sm text-error">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="font-bold">{formatMontant(f.montant)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getCategoryBadge(f.categorie)}
                    {getStatusBadge(f.status)}
                  </div>
                  {f.beneficiaire && (
                    <div className="text-xs text-base-content/50 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {f.beneficiaire}
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs text-base-content/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(f.date_frais)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr className="text-xs sm:text-sm">
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>Réf. <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('titre')}>Titre <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Catégorie</th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant')}>Montant <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Bénéficiaire</th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_frais')}>Date <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((f) => (
                  <tr key={f.id} className="hover">
                    <td className="font-mono text-xs text-primary">{f.reference}</td>
                    <td className="font-medium max-w-[120px] truncate">{f.titre}</td>
                    <td>{getCategoryBadge(f.categorie)}</td>
                    <td className="font-bold text-success">{formatMontant(f.montant)}</td>
                    <td className="text-sm max-w-[100px] truncate">{f.beneficiaire || '-'}</td>
                    <td className="text-xs">{formatDate(f.date_frais)}</td>
                    <td>{getStatusBadge(f.status)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <Link to={`/frais/${f.id}`} className="btn btn-ghost btn-xs text-info">
                          <Eye className="w-3 h-3" />
                        </Link>
                        <Link to={`/frais/${f.id}/edit`} className="btn btn-ghost btn-xs text-primary">
                          <Edit className="w-3 h-3" />
                        </Link>
                        {f.status === 'en_attente' && (
                          <button onClick={() => handleValider(f)} className="btn btn-ghost btn-xs text-info">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        {f.status === 'valide' && (
                          <button onClick={() => handlePayer(f)} className="btn btn-ghost btn-xs text-success">
                            <DollarSign className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => { setFraisToDelete(f); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error">
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
      {showDeleteModal && fraisToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce frais ?</p>
              <p className="text-base font-bold text-error mt-2">"{fraisToDelete.titre}"</p>
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

export default FraisTresorerie