// src/components/comptabilite/FacturesComptables.jsx
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
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Receipt,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckSquare,
  XCircle,
  BookOpen,
  Hash,
  Tag,
  MoreVertical,
  Settings,
  Shield,
  Layers,
  User,
  Info,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Truck,
  CreditCard,
  Wallet,
  Banknote,
  AlertTriangle,
  Send  // ✅ AJOUT DE L'ICÔNE MANQUANTE
} from 'lucide-react'

const FacturesComptables = () => {
  const navigate = useNavigate()

  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [factureToDelete, setFactureToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState('date_facture')
  const [sortDirection, setSortDirection] = useState('desc')
  const [stats, setStats] = useState({
    total: 0,
    client: 0,
    fournisseur: 0,
    brouillon: 0,
    envoyee: 0,
    recue: 0,
    payee: 0,
    partielle: 0,
    impayee: 0,
    annulee: 0,
    totalMontant: 0,
    totalImpaye: 0
  })

  // Configuration des types
  const typeConfig = {
    client: { label: 'Client', color: 'success', icon: Users },
    fournisseur: { label: 'Fournisseur', color: 'warning', icon: Truck }
  }

  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'neutral', icon: FileText },
    envoyee: { label: 'Envoyée', color: 'info', icon: Send },
    recue: { label: 'Reçue', color: 'info', icon: Download },
    payee: { label: 'Payée', color: 'success', icon: CheckCircle },
    partielle: { label: 'Partiellement payée', color: 'warning', icon: CreditCard },
    impayee: { label: 'Impayée', color: 'error', icon: AlertTriangle },
    annulee: { label: 'Annulée', color: 'neutral', icon: XCircle }
  }

  const typeColors = {
    client: 'badge-success',
    fournisseur: 'badge-warning'
  }

  const statusColors = {
    brouillon: 'badge-neutral',
    envoyee: 'badge-info',
    recue: 'badge-info',
    payee: 'badge-success',
    partielle: 'badge-warning',
    impayee: 'badge-error',
    annulee: 'badge-neutral'
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

      // Récupérer les factures comptables
      let response
      try {
        response = await AxiosInstance.get('/factures-comptables/')
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/comptabilite/factures-comptables/')
        } else {
          throw err
        }
      }
      
      const data = response.data || []
      setFactures(data)

      // Calculer les statistiques
      const total = data.length
      const client = data.filter(f => f.type_facture === 'client').length
      const fournisseur = data.filter(f => f.type_facture === 'fournisseur').length
      const brouillon = data.filter(f => f.status === 'brouillon').length
      const envoyee = data.filter(f => f.status === 'envoyee').length
      const recue = data.filter(f => f.status === 'recue').length
      const payee = data.filter(f => f.status === 'payee').length
      const partielle = data.filter(f => f.status === 'partielle').length
      const impayee = data.filter(f => f.status === 'impayee').length
      const annulee = data.filter(f => f.status === 'annulee').length
      const totalMontant = data.reduce((sum, f) => sum + (parseFloat(f.montant_ttc) || 0), 0)
      const totalImpaye = data.filter(f => f.status === 'impayee' || f.status === 'partielle')
        .reduce((sum, f) => sum + (parseFloat(f.montant_restant) || 0), 0)

      setStats({ total, client, fournisseur, brouillon, envoyee, recue, payee, partielle, impayee, annulee, totalMontant, totalImpaye })

    } catch (error) {
      console.error('❌ Erreur chargement factures comptables:', error)
      setError('Erreur de chargement des factures comptables')
      showNotification('Erreur de chargement des factures comptables', 'error')
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

  const handleDeleteFacture = async () => {
    if (!factureToDelete) return
    try {
      await AxiosInstance.delete(`/factures-comptables/${factureToDelete.id}/`)
      showNotification(`Facture ${factureToDelete.reference} supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setFactureToDelete(null)
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

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.client
    return (
      <span className={`badge ${typeColors[type] || 'badge-ghost'} gap-1 text-xs border-0`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.brouillon
    const Icon = config.icon
    return (
      <span className={`badge ${statusColors[status] || 'badge-ghost'} gap-1 text-xs border-0`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return 'N/A'
    }
  }

  // Filtrer et trier
  const filteredAndSortedFactures = useMemo(() => {
    let filtered = factures.filter(facture => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = facture.reference?.toLowerCase().includes(search) || 
                           facture.client_nom?.toLowerCase().includes(search) ||
                           facture.fournisseur_nom?.toLowerCase().includes(search)
      const matchesType = filterType === '' || facture.type_facture === filterType
      const matchesStatus = filterStatus === '' || facture.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'montant_ttc' || sortField === 'montant_restant') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (sortField === 'date_facture' || sortField === 'date_echeance') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [factures, searchTerm, filterType, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFactures.length / itemsPerPage)
  const paginatedFactures = filteredAndSortedFactures.slice(
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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des factures comptables...
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
            Factures comptables
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos factures clients et fournisseurs ({stats.total} au total)
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
            onClick={() => navigate('/factures-comptables/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle facture</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Receipt className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Clients</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.client}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Truck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Fournisseurs</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.fournisseur}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Payées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.payee}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><CreditCard className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Partielles</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.partielle}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Impayées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.impayee}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Impayé</div>
          <div className="stat-value text-xs sm:text-sm lg:text-base font-black truncate">{formatCurrency(stats.totalImpaye)}</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par référence, client ou fournisseur..."
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
                <option value="client">Client</option>
                <option value="fournisseur">Fournisseur</option>
              </select>
              
              <select 
                className="select select-bordered w-full sm:w-40 text-sm"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="envoyee">Envoyée</option>
                <option value="recue">Reçue</option>
                <option value="payee">Payée</option>
                <option value="partielle">Partiellement payée</option>
                <option value="impayee">Impayée</option>
                <option value="annulee">Annulée</option>
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterType('')
                  setFilterStatus('')
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedFactures.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Receipt className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune facture trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par créer votre première facture comptable</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/factures-comptables/nouveau')}>
              <Plus className="w-4 h-4" /> Nouvelle facture
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-xs sm:table-sm lg:table-md w-full">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>
                        Réf. <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('type_facture')}>
                        Type <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Client/Fournisseur</th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_facture')}>
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant_ttc')}>
                        Montant <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant_restant')}>
                        Restant <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFactures.map((facture) => (
                    <tr key={facture.id} className="hover">
                      <td className="font-mono text-xs text-primary">{facture.reference}</td>
                      <td>{getTypeBadge(facture.type_facture)}</td>
                      <td>
                        <div className="font-medium text-sm truncate max-w-[150px]">
                          {facture.client_nom || facture.fournisseur_nom || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3 text-base-content/40" />
                          {formatDate(facture.date_facture)}
                        </div>
                      </td>
                      <td className="font-semibold text-sm">{formatCurrency(facture.montant_ttc)}</td>
                      <td className={`font-semibold text-sm ${facture.montant_restant > 0 ? 'text-error' : 'text-success'}`}>
                        {formatCurrency(facture.montant_restant)}
                      </td>
                      <td>{getStatusBadge(facture.status)}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1 flex-wrap">
                          <button
                            onClick={() => navigate(`/factures-comptables/${facture.id}`)}
                            className="btn btn-ghost btn-xs text-info hover:bg-info/10"
                            title="Voir le détail"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => navigate(`/factures-comptables/${facture.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                            title="Modifier"
                            disabled={facture.status === 'payee' || facture.status === 'annulee'}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => navigate(`/factures-comptables/${facture.id}/paiement`)}
                            className="btn btn-ghost btn-xs text-success hover:bg-success/10"
                            title="Enregistrer un paiement"
                            disabled={facture.status === 'payee' || facture.status === 'annulee'}
                          >
                            <Wallet className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setFactureToDelete(facture)
                              setShowDeleteModal(true)
                            }}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            title="Supprimer"
                            disabled={facture.status !== 'brouillon'}
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

            {/* Pagination */}
            {filteredAndSortedFactures.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedFactures.length)} sur {filteredAndSortedFactures.length}
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
                      {[...Array(Math.min(3, totalPages))].map((_, i) => {
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
          </>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && factureToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer cette facture ?</p>
              <p className="text-base font-bold text-error mt-2">"{factureToDelete.reference}"</p>
              {factureToDelete.status !== 'brouillon' && (
                <p className="text-xs text-warning mt-2">
                  ⚠️ Seules les factures en brouillon peuvent être supprimées.
                </p>
              )}
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button 
                className="btn btn-error flex-1" 
                onClick={handleDeleteFacture}
                disabled={factureToDelete.status !== 'brouillon'}
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

export default FacturesComptables