// src/components/comptabilite/JournalDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Building2,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  Hash,
  Tag,
  MoreVertical,
  Settings,
  Shield,
  Layers,
  DollarSign,
  User,
  Info,
  Download,
  Printer,
  FileSpreadsheet,
  X,
  Loader2,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react'

const JournalDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [journal, setJournal] = useState(null)
  const [ecritures, setEcritures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState('date_ecriture')
  const [sortDirection, setSortDirection] = useState('desc')
  const [stats, setStats] = useState({
    total: 0,
    brouillon: 0,
    valide: 0,
    annulee: 0,
    cloturee: 0,
    totalDebit: 0,
    totalCredit: 0
  })

  // Configuration des types de journaux
  const typeConfig = {
    achats: { label: 'Achats', color: 'info', icon: FileText },
    ventes: { label: 'Ventes', color: 'success', icon: FileText },
    banque: { label: 'Banque', color: 'primary', icon: Building2 },
    caisse: { label: 'Caisse', color: 'warning', icon: Layers },
    od: { label: 'Opérations diverses', color: 'secondary', icon: Settings },
    inventaire: { label: 'Inventaire', color: 'neutral', icon: LayoutGrid },
    paie: { label: 'Paie', color: 'error', icon: Calendar },
    immobilisations: { label: 'Immobilisations', color: 'accent', icon: Shield }
  }

  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'warning', icon: FileText },
    valide: { label: 'Validée', color: 'success', icon: CheckCircle },
    annulee: { label: 'Annulée', color: 'error', icon: X },
    cloturee: { label: 'Clôturée', color: 'neutral', icon: Clock }
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

      // Récupérer le journal
      let journalResponse
      try {
        journalResponse = await AxiosInstance.get(`/journaux/${id}/`)
      } catch (err) {
        if (err.response?.status === 404) {
          journalResponse = await AxiosInstance.get(`/comptabilite/journaux/${id}/`)
        } else {
          throw err
        }
      }
      
      setJournal(journalResponse.data)

      // Récupérer les écritures du journal
      let ecrituresResponse
      try {
        ecrituresResponse = await AxiosInstance.get(`/journaux/${id}/ecritures/`)
      } catch (err) {
        if (err.response?.status === 404) {
          ecrituresResponse = await AxiosInstance.get(`/comptabilite/journaux/${id}/ecritures/`)
        } else {
          throw err
        }
      }
      
      const data = ecrituresResponse.data || []
      setEcritures(data)

      // Calculer les statistiques
      const total = data.length
      const brouillon = data.filter(e => e.status === 'brouillon').length
      const valide = data.filter(e => e.status === 'valide').length
      const annulee = data.filter(e => e.status === 'annulee').length
      const cloturee = data.filter(e => e.status === 'cloturee').length
      const totalDebit = data.reduce((sum, e) => sum + (parseFloat(e.total_debit) || 0), 0)
      const totalCredit = data.reduce((sum, e) => sum + (parseFloat(e.total_credit) || 0), 0)

      setStats({ total, brouillon, valide, annulee, cloturee, totalDebit, totalCredit })

    } catch (error) {
      console.error('❌ Erreur chargement journal:', error)
      setError('Erreur de chargement du journal')
      showNotification('Erreur de chargement du journal', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.od
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
      <span className={`badge badge-${config.color} gap-1 text-xs border-0`}>
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

  // Filtrer et trier les écritures
  const filteredAndSortedEcritures = React.useMemo(() => {
    let filtered = ecritures.filter(ecriture => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = ecriture.reference.toLowerCase().includes(search) || 
                           ecriture.libelle.toLowerCase().includes(search)
      const matchesStatus = filterStatus === '' || ecriture.status === filterStatus
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'total_debit' || sortField === 'total_credit') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (sortField === 'date_ecriture' || sortField === 'date_comptable') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [ecritures, searchTerm, filterStatus, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEcritures.length / itemsPerPage)
  const paginatedEcritures = filteredAndSortedEcritures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du journal...
          </p>
        </div>
      </div>
    )
  }

  if (error || !journal) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Journal non trouvé'}</p>
          <button onClick={() => navigate('/journaux')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
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
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/journaux')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {journal.code} - {journal.nom}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-2 flex-wrap">
              <span>{getTypeBadge(journal.type_journal)}</span>
              <span className="w-px h-4 bg-base-300"></span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {journal.agence_nom || 'Agence'}
              </span>
              <span className="w-px h-4 bg-base-300"></span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {stats.total} écriture(s)
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            className="btn btn-sm sm:btn-md btn-success gap-1"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
          <button 
            onClick={() => navigate(`/ecritures/nouveau?journal=${journal.id}`)}
            className="btn btn-sm sm:btn-md btn-primary gap-1"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle écriture</span>
          </button>
        </div>
      </div>

      {/* Informations du journal */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-base-content/60">Code</p>
            <p className="font-mono font-bold text-primary">{journal.code}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Nom</p>
            <p className="font-medium">{journal.nom}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Type</p>
            <p>{typeConfig[journal.type_journal]?.label || journal.type_journal}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Statut</p>
            <span className={`badge ${journal.is_active ? 'badge-success' : 'badge-error'} badge-sm`}>
              {journal.is_active ? 'Actif' : 'Inactif'}
            </span>
            {journal.is_default && (
              <span className="badge badge-primary badge-sm ml-1">Par défaut</span>
            )}
          </div>
        </div>
        {journal.description && (
          <div className="mt-4 pt-4 border-t border-base-200">
            <p className="text-xs text-base-content/60">Description</p>
            <p className="text-sm mt-1">{journal.description}</p>
          </div>
        )}
      </div>

      {/* Statistiques des écritures */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold">Total</div>
          <div className="stat-value text-lg font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold text-warning">Brouillons</div>
          <div className="stat-value text-lg font-black text-warning">{stats.brouillon}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold text-success">Validées</div>
          <div className="stat-value text-lg font-black text-success">{stats.valide}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold text-error">Annulées</div>
          <div className="stat-value text-lg font-black text-error">{stats.annulee}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold">Clôturées</div>
          <div className="stat-value text-lg font-black">{stats.cloturee}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold text-success">Débit</div>
          <div className="stat-value text-sm font-black text-success truncate">{formatCurrency(stats.totalDebit)}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-title text-xs font-semibold text-error">Crédit</div>
          <div className="stat-value text-sm font-black text-error truncate">{formatCurrency(stats.totalCredit)}</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par référence ou libellé..."
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
          </button>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-36 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tous statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="valide">Validée</option>
              <option value="annulee">Annulée</option>
              <option value="cloturee">Clôturée</option>
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterStatus('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des écritures */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedEcritures.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune écriture trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Ce journal ne contient aucune écriture</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate(`/ecritures/nouveau?journal=${journal.id}`)}>
              <Plus className="w-4 h-4" /> Nouvelle écriture
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
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('libelle')}>
                        Libellé <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_ecriture')}>
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_debit')}>
                        Débit <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total_credit')}>
                        Crédit <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEcritures.map((ecriture) => (
                    <tr key={ecriture.id} className="hover">
                      <td className="font-mono text-xs text-primary">{ecriture.reference}</td>
                      <td>
                        <div className="font-medium text-sm truncate max-w-[150px]">
                          {ecriture.libelle}
                        </div>
                      </td>
                      <td className="text-xs">{formatDate(ecriture.date_ecriture)}</td>
                      <td className="font-mono text-xs text-success">{formatCurrency(ecriture.total_debit)}</td>
                      <td className="font-mono text-xs text-error">{formatCurrency(ecriture.total_credit)}</td>
                      <td>{getStatusBadge(ecriture.status)}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => navigate(`/ecritures/${ecriture.id}`)}
                            className="btn btn-ghost btn-xs text-info"
                            title="Voir le détail"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => navigate(`/ecritures/${ecriture.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-primary"
                            title="Modifier"
                            disabled={ecriture.status !== 'brouillon'}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedEcritures.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedEcritures.length)} sur {filteredAndSortedEcritures.length}
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
                      <option value="25">25</option>
                      <option value="50">50</option>
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

export default JournalDetail