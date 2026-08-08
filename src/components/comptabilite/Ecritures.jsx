// src/components/comptabilite/Ecritures.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { pdf } from '@react-pdf/renderer'
import EcriturePdf from './EcriturePdf'
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
  Notebook,
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
  Loader2,
  Download
} from 'lucide-react'

const Ecritures = () => {
  const navigate = useNavigate()

  const [ecritures, setEcritures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterJournal, setFilterJournal] = useState('')
  const [journaux, setJournaux] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ecritureToDelete, setEcritureToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [sortField, setSortField] = useState('date_ecriture')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    brouillon: 0,
    valide: 0,
    annulee: 0,
    cloturee: 0,
    totalDebit: 0,
    totalCredit: 0
  })
  const [pdfLoading, setPdfLoading] = useState({})

  // Configuration des statuts
  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'warning', icon: FileText },
    valide: { label: 'Validée', color: 'success', icon: CheckCircle },
    annulee: { label: 'Annulée', color: 'error', icon: XCircle },
    cloturee: { label: 'Clôturée', color: 'neutral', icon: Clock }
  }

  const statusColors = {
    brouillon: 'badge-warning',
    valide: 'badge-success',
    annulee: 'badge-error',
    cloturee: 'badge-neutral'
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

      // Récupérer les écritures
      let response
      try {
        response = await AxiosInstance.get('/ecritures/')
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get('/comptabilite/ecritures/')
        } else {
          throw err
        }
      }
      
      const data = response.data || []
      setEcritures(data)

      // Récupérer les journaux pour le filtre
      try {
        const journauxRes = await AxiosInstance.get('/journaux/')
        setJournaux(journauxRes.data || [])
      } catch (err) {
        console.error('Erreur chargement journaux:', err)
      }

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
      console.error('❌ Erreur chargement écritures:', error)
      setError('Erreur de chargement des écritures')
      showNotification('Erreur de chargement des écritures', 'error')
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

  const handleDeleteEcriture = async () => {
    if (!ecritureToDelete) return
    try {
      await AxiosInstance.delete(`/ecritures/${ecritureToDelete.id}/`)
      showNotification(`Écriture ${ecritureToDelete.reference} supprimée avec succès`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setEcritureToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleValiderEcriture = async (id) => {
    try {
      await AxiosInstance.post(`/ecritures/${id}/valider/`)
      showNotification('Écriture validée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
  }

  const handleAnnulerEcriture = async (id) => {
    try {
      await AxiosInstance.post(`/ecritures/${id}/annuler/`)
      showNotification('Écriture annulée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de l\'annulation', 'error')
    }
  }

  const handleDownloadPDF = async (ecriture) => {
    setPdfLoading(prev => ({ ...prev, [ecriture.id]: true }))
    try {
      // Récupérer les données complètes
      const response = await AxiosInstance.get(`/ecritures/${ecriture.id}/`)
      const data = response.data
      
      // Générer le PDF
      const blob = await pdf(<EcriturePdf ecriture={data} />).toBlob()
      
      // Télécharger
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ecriture_${ecriture.reference}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showNotification('PDF téléchargé avec succès', 'success')
    } catch (error) {
      console.error('Erreur PDF:', error)
      showNotification('Erreur lors du téléchargement du PDF', 'error')
    } finally {
      setPdfLoading(prev => ({ ...prev, [ecriture.id]: false }))
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
  const filteredAndSortedEcritures = useMemo(() => {
    let filtered = ecritures.filter(ecriture => {
      const search = searchTerm.toLowerCase()
      const matchesSearch = ecriture.reference.toLowerCase().includes(search) || 
                           ecriture.libelle.toLowerCase().includes(search)
      const matchesStatus = filterStatus === '' || ecriture.status === filterStatus
      const matchesJournal = filterJournal === '' || ecriture.journal === parseInt(filterJournal)
      return matchesSearch && matchesStatus && matchesJournal
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
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [ecritures, searchTerm, filterStatus, filterJournal, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEcritures.length / itemsPerPage)
  const paginatedEcritures = filteredAndSortedEcritures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Ajuster itemsPerPage selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(8)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(12)
      } else {
        setItemsPerPage(15)
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
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des écritures...
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-success to-info bg-clip-text text-transparent">
            Écritures comptables
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gérez toutes les écritures comptables ({stats.total} au total)
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
            onClick={() => navigate('/ecritures/nouveau')}
            className="btn btn-sm sm:btn-md btn-success gap-1 sm:gap-2 shadow-lg shadow-success/20 hover:shadow-success/30 transition-all"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouvelle écriture</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Notebook className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning"><FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Brouillons</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.brouillon}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Validées</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.valide}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><XCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Annulées</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black">{stats.annulee}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Volume</div>
          <div className="stat-value text-xs sm:text-sm lg:text-base font-black truncate">{formatCurrency(stats.totalDebit)}</div>
          <div className="stat-desc text-[10px] text-base-content/50">Total débit</div>
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
              {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
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
              
              <select 
                className="select select-bordered w-full sm:w-40 text-sm"
                value={filterJournal}
                onChange={(e) => {
                  setFilterJournal(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Tous journaux</option>
                {journaux.map(j => (
                  <option key={j.id} value={j.id}>{j.code} - {j.nom}</option>
                ))}
              </select>
              
              <button 
                className="btn btn-outline gap-2"
                onClick={() => {
                  setFilterStatus('')
                  setFilterJournal('')
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

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedEcritures.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Notebook className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg sm:text-xl font-semibold text-base-content/50">Aucune écriture trouvée</p>
            <p className="text-sm sm:text-base text-base-content/40 mt-2">Commencez par créer votre première écriture</p>
            <button className="btn btn-success mt-6 gap-2" onClick={() => navigate('/ecritures/nouveau')}>
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
                      <button className="flex items-center gap-1 hover:text-success" onClick={() => handleSort('reference')}>
                        Réf. <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-success" onClick={() => handleSort('libelle')}>
                        Libellé <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Journal</th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-success" onClick={() => handleSort('date_ecriture')}>
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-success" onClick={() => handleSort('total_debit')}>
                        Débit <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-success" onClick={() => handleSort('total_credit')}>
                        Crédit <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEcritures.map((ecriture) => {
                    const isPdfLoading = pdfLoading[ecriture.id]
                    return (
                      <tr key={ecriture.id} className="hover">
                        <td className="font-mono text-xs text-success">{ecriture.reference}</td>
                        <td>
                          <div className="font-medium text-sm truncate max-w-[150px]">
                            {ecriture.libelle}
                          </div>
                          {ecriture.created_by_email && (
                            <div className="text-[10px] text-base-content/40 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {ecriture.created_by_email}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-xs">{ecriture.journal_code || ecriture.journal}</span>
                        </td>
                        <td>{formatDate(ecriture.date_ecriture)}</td>
                        <td className="font-mono text-xs text-success">{formatCurrency(ecriture.total_debit)}</td>
                        <td className="font-mono text-xs text-error">{formatCurrency(ecriture.total_credit)}</td>
                        <td>{getStatusBadge(ecriture.status)}</td>
                        <td className="text-center">
                          <div className="flex justify-center gap-1 flex-wrap">
                            <button
                              onClick={() => navigate(`/ecritures/${ecriture.id}`)}
                              className="btn btn-ghost btn-xs text-info hover:bg-info/10"
                              title="Voir le détail"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => navigate(`/ecritures/${ecriture.id}/modifier`)}
                              className="btn btn-ghost btn-xs text-success hover:bg-success/10"
                              title="Modifier"
                              disabled={ecriture.status !== 'brouillon'}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            {/* ✅ Bouton PDF */}
                            <button
                              onClick={() => handleDownloadPDF(ecriture)}
                              className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                              title="Télécharger PDF"
                              disabled={isPdfLoading}
                            >
                              {isPdfLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </button>
                            {ecriture.status === 'brouillon' && (
                              <>
                                <button
                                  onClick={() => handleValiderEcriture(ecriture.id)}
                                  className="btn btn-success btn-xs"
                                  title="Valider"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleAnnulerEcriture(ecriture.id)}
                                  className="btn btn-warning btn-xs"
                                  title="Annuler"
                                >
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setEcritureToDelete(ecriture)
                                setShowDeleteModal(true)
                              }}
                              className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                              title="Supprimer"
                              disabled={ecriture.status !== 'brouillon'}
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
                      <option value="8">8</option>
                      <option value="12">12</option>
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
                            className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-success' : ''}`}
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
      {showDeleteModal && ecritureToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer cette écriture ?</p>
              <p className="text-base font-bold text-error mt-2">"{ecritureToDelete.reference} - {ecritureToDelete.libelle}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1" onClick={handleDeleteEcriture}>Supprimer</button>
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

export default Ecritures