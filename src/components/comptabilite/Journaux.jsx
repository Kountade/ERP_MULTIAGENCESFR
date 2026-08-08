// src/components/comptabilite/Journaux.jsx
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
  Layers
} from 'lucide-react'

const Journaux = () => {
  const navigate = useNavigate()

  const [journaux, setJournaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterAgence, setFilterAgence] = useState('')
  const [agences, setAgences] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [journalToDelete, setJournalToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('grid')
  const [sortField, setSortField] = useState('code')
  const [sortDirection, setSortDirection] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    achats: 0,
    ventes: 0,
    banque: 0,
    caisse: 0,
    od: 0,
    inventaire: 0,
    paie: 0,
    immobilisations: 0
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

  const typeColors = {
    achats: 'badge-info',
    ventes: 'badge-success',
    banque: 'badge-primary',
    caisse: 'badge-warning',
    od: 'badge-secondary',
    inventaire: 'badge-neutral',
    paie: 'badge-error',
    immobilisations: 'badge-accent'
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
      let response
      try {
        response = await AxiosInstance.get('/journaux/')
      } catch (err) {
        // Fallback si l'URL ne fonctionne pas
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/comptabilite/journaux/')
        } else {
          throw err
        }
      }
      
      const data = response.data || []
      setJournaux(data)

      // Récupérer les agences pour le filtre
      try {
        const agencesRes = await AxiosInstance.get('/agences/')
        setAgences(agencesRes.data || [])
      } catch (err) {
        console.error('Erreur chargement agences:', err)
      }

      // Calculer les statistiques
      const total = data.length
      const achats = data.filter(j => j.type_journal === 'achats').length
      const ventes = data.filter(j => j.type_journal === 'ventes').length
      const banque = data.filter(j => j.type_journal === 'banque').length
      const caisse = data.filter(j => j.type_journal === 'caisse').length
      const od = data.filter(j => j.type_journal === 'od').length
      const inventaire = data.filter(j => j.type_journal === 'inventaire').length
      const paie = data.filter(j => j.type_journal === 'paie').length
      const immobilisations = data.filter(j => j.type_journal === 'immobilisations').length

      setStats({ total, achats, ventes, banque, caisse, od, inventaire, paie, immobilisations })

    } catch (error) {
      console.error('❌ Erreur chargement journaux:', error)
      setError('Erreur de chargement des journaux')
      showNotification('Erreur de chargement des journaux', 'error')
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

  const handleDeleteJournal = async () => {
    if (!journalToDelete) return
    try {
      // ✅ URL CORRECTE
      await AxiosInstance.delete(`/journaux/${journalToDelete.id}/`)
      showNotification(`Journal ${journalToDelete.code} supprimé avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setJournalToDelete(null)
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
    const config = typeConfig[type] || typeConfig.od
    return (
      <span className={`badge ${typeColors[type] || 'badge-ghost'} gap-1 text-xs border-0`}>
        {config.label}
      </span>
    )
  }

  const getTypeIcon = (type) => {
    const config = typeConfig[type] || typeConfig.od
    const Icon = config.icon || FileText
    return <Icon className="w-4 h-4" />
  }

  // Filtrer et trier
  const filteredAndSortedJournaux = useMemo(() => {
    let filtered = journaux.filter(journal => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = journal.code.toLowerCase().includes(search) || 
                           journal.nom.toLowerCase().includes(search)
      const matchesType = filterType === '' || journal.type_journal === filterType
      const matchesAgence = filterAgence === '' || journal.agence === parseInt(filterAgence)
      return matchesSearch && matchesType && matchesAgence
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
  }, [journaux, searchTerm, filterType, filterAgence, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedJournaux.length / itemsPerPage)
  const paginatedJournaux = filteredAndSortedJournaux.slice(
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
            Chargement des journaux...
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
            Journaux comptables
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez vos journaux comptables ({stats.total} au total)
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
            onClick={() => navigate('/journaux/nouveau')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau journal</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Achats</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.achats}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Ventes</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.ventes}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Banque</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.banque}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><Layers className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Caisse</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.caisse}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-secondary"><Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">OD</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.od}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Paie</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.paie}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-accent"><Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Immobilisations</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.immobilisations}</div>
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
                className="select select-bordered w-full sm:w-40 text-sm"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous types</option>
                <option value="achats">Achats</option>
                <option value="ventes">Ventes</option>
                <option value="banque">Banque</option>
                <option value="caisse">Caisse</option>
                <option value="od">Opérations diverses</option>
                <option value="inventaire">Inventaire</option>
                <option value="paie">Paie</option>
                <option value="immobilisations">Immobilisations</option>
              </select>
              
              <select 
                className="select select-bordered w-full sm:w-48 text-sm"
                value={filterAgence}
                onChange={(e) => {
                  setFilterAgence(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Toutes agences</option>
                {agences.map(agence => (
                  <option key={agence.id} value={agence.id}>{agence.nom}</option>
                ))}
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterType('')
                  setFilterAgence('')
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

      {/* Grille des journaux */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedJournaux.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucun journal trouvé</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par créer votre premier journal</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/journaux/nouveau')}>
              <Plus className="w-4 h-4" /> Nouveau journal
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
              {paginatedJournaux.map((journal) => (
                <div
                  key={journal.id}
                  className="bg-base-200/50 rounded-xl p-4 border border-base-300 hover:shadow-lg transition-all hover:border-primary/30 group"
                >
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getTypeIcon(journal.type_journal)}
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-primary text-sm">{journal.code}</h3>
                        <p className="text-xs text-base-content/60 truncate max-w-[150px]">{journal.nom}</p>
                      </div>
                    </div>
                    {journal.is_default && (
                      <span className="badge badge-primary badge-xs">Défaut</span>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/60">Type</span>
                      {getTypeBadge(journal.type_journal)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/60">Agence</span>
                      <span className="font-medium text-xs">{journal.agence_nom || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/60">Écritures</span>
                      <span className="font-bold text-primary">{journal.ecritures_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/60">Statut</span>
                      <span className={`badge ${journal.is_active ? 'badge-success' : 'badge-error'} badge-xs`}>
                        {journal.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-base-300">
                    <button
                      onClick={() => navigate(`/journaux/${journal.id}/modifier`)}
                      className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                      title="Modifier"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => navigate(`/journaux/${journal.id}/ecritures`)}
                      className="btn btn-ghost btn-xs text-info hover:bg-info/10"
                      title="Voir les écritures"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setJournalToDelete(journal)
                        setShowDeleteModal(true)
                      }}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      title="Supprimer"
                      disabled={journal.ecritures_count > 0}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredAndSortedJournaux.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-base-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedJournaux.length)} sur {filteredAndSortedJournaux.length}
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
      {showDeleteModal && journalToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer ce journal ?</p>
              <p className="text-base font-bold text-error mt-2">"{journalToDelete.code} - {journalToDelete.nom}"</p>
              {journalToDelete.ecritures_count > 0 && (
                <p className="text-xs text-warning mt-2">
                  ⚠️ Ce journal a {journalToDelete.ecritures_count} écriture(s). Supprimez-les d'abord.
                </p>
              )}
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button 
                className="btn btn-error flex-1" 
                onClick={handleDeleteJournal}
                disabled={journalToDelete.ecritures_count > 0}
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

export default Journaux