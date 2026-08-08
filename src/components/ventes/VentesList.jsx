// src/components/ventes/VentesList.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import Livraison from './Livraison'
import TicketPOS from './TicketPOS'
import {
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  CreditCard,
  X,
  Download,
  Printer,
  Plus,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Trash2,
  UserCheck,
  UserX,
  Truck,
  Loader2,
  Package,
  Building2,
  User,
  Check,
  MoreVertical,
  LayoutGrid,
  List,
  Grid,
  EyeOff,
  Ban,
  Send,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  Mail,
  Phone,
  MapPin,
  Hash,
  Layers,
  ClipboardList,
  Receipt,
  FileCheck,
  Info
} from 'lucide-react'

const VentesList = () => {
  const navigate = useNavigate()

  // États
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingBl, setGeneratingBl] = useState(null)
  const [generatingTicket, setGeneratingTicket] = useState(null)  // ✅ État pour le ticket
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState('table')
  const [sortField, setSortField] = useState('date_vente')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentUser, setCurrentUser] = useState(null)
  const [userRoles, setUserRoles] = useState({ est_pdg: false, est_chef_agence: false })
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [venteToDelete, setVenteToDelete] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [venteToApprove, setVenteToApprove] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedVente, setSelectedVente] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    totalCA: 0,
    totalPaid: 0
  })

  // Configuration des statuts
  const statusConfig = {
    draft: { label: 'Brouillon', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
    pending_approval: { label: 'En attente', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
    approved: { label: 'Approuvée', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
    rejected: { label: 'Rejetée', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
    completed: { label: 'Complétée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' }
  }

  // ============================================================
  // 1. Chargement des données
  // ============================================================
  const fetchCurrentUser = async () => {
    try {
      const response = await AxiosInstance.get('/users/me/')
      const userData = response.data
      setCurrentUser(userData)
      const isPDG = userData.role_global === 'pdg' || userData.is_superuser === true
      const isChefAgence = userData.roles_agence?.some(r => r.role === 'chef_agence') || false
      setUserRoles({ est_pdg: isPDG, est_chef_agence: isChefAgence })
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error)
    }
  }

  const fetchVentes = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('/ventes/')
      const data = response.data || []
      setVentes(data)

      // Calcul des statistiques
      const total = data.length
      const pending = data.filter(v => v.status === 'pending_approval').length
      const approved = data.filter(v => v.status === 'approved').length
      const completed = data.filter(v => v.status === 'completed').length
      const rejected = data.filter(v => v.status === 'rejected').length
      const cancelled = data.filter(v => v.status === 'cancelled').length
      const totalCA = data.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)
      const totalPaid = data.reduce((sum, v) => sum + (parseFloat(v.montant_paye) || 0), 0)
      
      setStats({ total, pending, approved, completed, rejected, cancelled, totalCA, totalPaid })
    } catch (error) {
      console.error('Erreur chargement ventes:', error)
      showNotification('Erreur de chargement des ventes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchVentes()
  }, [])

  // ============================================================
  // 2. Notifications
  // ============================================================
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000)
  }

  // ============================================================
  // 3. Actions
  // ============================================================
  
  // ✅ Générer le ticket POS
  const handleGenerateTicket = async (vente) => {
    if (!vente || (vente.status !== 'approved' && vente.status !== 'completed')) {
      showNotification('Seules les ventes approuvées ou complétées peuvent générer un ticket', 'error')
      return
    }
    
    setGeneratingTicket(vente.id)
    try {
      // Récupérer les détails complets de la vente
      const response = await AxiosInstance.get(`/ventes/${vente.id}/`)
      const venteData = response.data
      
      // Préparer les données pour le ticket
      const ticketData = {
        ...venteData,
        items_data: venteData.items || [],
        client: venteData.client || {},
        payment_method: 'Especes',
        paid_amount: parseFloat(venteData.montant_paye) || 0,
        remaining_amount: parseFloat(venteData.reste_a_payer) || 0
      }
      
      await TicketPOS(ticketData)
      showNotification(`Ticket POS généré pour ${vente.reference}`, 'success')
    } catch (error) {
      console.error('Erreur génération ticket:', error)
      showNotification('Erreur lors de la génération du ticket', 'error')
    } finally {
      setGeneratingTicket(null)
    }
  }

  const handleGenerateBonLivraison = async (vente) => {
    if (!vente || (vente.status !== 'approved' && vente.status !== 'completed')) {
      showNotification('Seules les ventes approuvées ou complétées peuvent générer un bon de livraison', 'error')
      return
    }
    setGeneratingBl(vente.id)
    try {
      const response = await AxiosInstance.get(`/ventes/${vente.id}/`)
      const venteData = response.data
      const options = {
        date_livraison: new Date().toISOString().split('T')[0],
        adresse_livraison: venteData.client?.adresse || '',
        contact_livraison: venteData.client?.telephone || '',
        instructions: ''
      }
      await Livraison(venteData, options)
      showNotification(`Bon de livraison généré pour ${vente.reference}`, 'success')
    } catch (error) {
      console.error('Erreur génération bon de livraison:', error)
      showNotification('Erreur lors de la génération du bon de livraison', 'error')
    } finally {
      setGeneratingBl(null)
    }
  }

  const handleApprove = async () => {
    if (!venteToApprove) return
    try {
      await AxiosInstance.post(`/ventes/${venteToApprove.id}/approve/`)
      showNotification(`Vente "${venteToApprove.reference}" approuvée avec succès`, 'success')
      fetchVentes()
      setShowApproveModal(false)
      setVenteToApprove(null)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'approbation', 'error')
    }
  }

  const handleReject = async () => {
    if (!venteToApprove) return
    if (!rejectReason.trim()) {
      showNotification('Veuillez saisir un motif de rejet', 'error')
      return
    }
    try {
      await AxiosInstance.post(`/ventes/${venteToApprove.id}/reject/`, { motif: rejectReason })
      showNotification(`Vente "${venteToApprove.reference}" rejetée`, 'success')
      fetchVentes()
      setShowRejectModal(false)
      setVenteToApprove(null)
      setRejectReason('')
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors du rejet', 'error')
    }
  }

  const handleDeleteVente = async () => {
    if (!venteToDelete) return
    try {
      await AxiosInstance.delete(`/ventes/${venteToDelete.id}/`)
      showNotification(`Vente "${venteToDelete.reference}" supprimée avec succès`, 'success')
      fetchVentes()
      setShowDeleteModal(false)
      setVenteToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  // ============================================================
  // 4. Permissions
  // ============================================================
  const canApprove = () => userRoles.est_pdg || userRoles.est_chef_agence
  const canGenerateBonLivraison = (vente) => vente.status === 'approved' || vente.status === 'completed'
  const canGenerateTicket = (vente) => vente.status === 'approved' || vente.status === 'completed'
  const canDelete = (vente) => vente.status === 'draft' || vente.status === 'cancelled'

  // ============================================================
  // 5. Tri et filtrage
  // ============================================================
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  const filteredAndSortedVentes = useMemo(() => {
    let filtered = ventes.filter(vente => {
      const search = searchTerm.toLowerCase()
      const reference = (vente.reference || '').toLowerCase()
      const clientNom = (vente.client_nom || '').toLowerCase()
      const matchesSearch = reference.includes(search) || clientNom.includes(search)
      const matchesStatus = !filterStatus || vente.status === filterStatus
      const matchesType = !filterType || vente.type_vente === filterType
      const matchesDateStart = !dateRange.start || new Date(vente.date_vente) >= new Date(dateRange.start)
      const matchesDateEnd = !dateRange.end || new Date(vente.date_vente) <= new Date(dateRange.end)
      return matchesSearch && matchesStatus && matchesType && matchesDateStart && matchesDateEnd
    })

    filtered.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      if (sortField === 'total' || sortField === 'montant_paye') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      if (sortField === 'date_vente') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      if (sortField === 'client_nom') {
        aVal = (a.client_nom || '').toLowerCase()
        bVal = (b.client_nom || '').toLowerCase()
      }
      if (sortField === 'reference') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [ventes, searchTerm, filterStatus, filterType, dateRange, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedVentes.length / itemsPerPage)
  const paginatedVentes = filteredAndSortedVentes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // ============================================================
  // 6. Utilitaires d'affichage
  // ============================================================
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    return (
      <span className={`badge ${config.bgColor} ${config.color} gap-1 px-3 py-2 text-xs border ${config.borderColor}`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (vente) => {
    if (vente.est_paye) {
      return <span className="badge badge-success gap-1 px-3 py-2 text-xs"><CheckCircle className="w-3 h-3" /> Payé</span>
    }
    if (vente.montant_paye > 0) {
      return <span className="badge badge-warning gap-1 px-3 py-2 text-xs"><Clock className="w-3 h-3" /> Partiel</span>
    }
    return <span className="badge badge-error gap-1 px-3 py-2 text-xs"><AlertCircle className="w-3 h-3" /> Impayé</span>
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'livraison': return <Truck className="w-4 h-4" />
      case 'comptoir': return <ShoppingCart className="w-4 h-4" />
      case 'en_ligne': return <Users className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  // ============================================================
  // 7. Rendu
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des ventes...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold whitespace-pre-line">{notification.message}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Modal Approbation */}
      {showApproveModal && venteToApprove && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-success/10 text-success rounded-full w-20 h-20">
                  <ThumbsUp className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Approuver la vente</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment approuver cette vente ?
              </p>
              <p className="font-bold text-primary mt-4 text-lg">{venteToApprove.reference}</p>
              <p className="text-sm text-base-content/60">Montant: {formatPrice(venteToApprove.total)}</p>
              <div className="mt-4 p-3 bg-warning/10 rounded-xl text-warning text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Le stock sera automatiquement déduit.
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => { setShowApproveModal(false); setVenteToApprove(null) }}>Annuler</button>
              <button className="btn btn-success gap-2" onClick={handleApprove}>
                <CheckCircle className="w-4 h-4" /> Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejectModal && venteToApprove && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <ThumbsDown className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Rejeter la vente</h3>
              <p className="text-base-content/70">Vente: <span className="font-semibold">{venteToApprove.reference}</span></p>
            </div>
            <div className="form-control">
              <label className="label font-medium">
                Motif du rejet <span className="text-error">*</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 resize-none"
                placeholder="Expliquez la raison du rejet..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => { setShowRejectModal(false); setVenteToApprove(null); setRejectReason('') }}>Annuler</button>
              <button className="btn btn-error gap-2" onClick={handleReject}>
                <XCircle className="w-4 h-4" /> Rejeter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && venteToDelete && (
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
                Voulez-vous vraiment supprimer cette vente ?
              </p>
              <p className="font-bold text-error mt-4 text-lg">"{venteToDelete.reference}"</p>
              <p className="text-sm text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error gap-2" onClick={handleDeleteVente}>
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && selectedVente && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Détails de la vente
              </h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowDetailsModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-base-content/50">Référence</p>
                  <p className="font-mono font-bold text-lg">{selectedVente.reference}</p>
                </div>
                {getStatusBadge(selectedVente.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-base-content/50">Client</p>
                  <p className="font-semibold">{selectedVente.client_nom || 'Anonyme'}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Vendeur</p>
                  <p>{selectedVente.vendeur_nom}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Date</p>
                  <p>{formatDate(selectedVente.date_vente)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Agence</p>
                  <p>{selectedVente.agence_nom}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Type</p>
                  <p className="capitalize flex items-center gap-1">
                    {getTypeIcon(selectedVente.type_vente)}
                    {selectedVente.type_vente}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Paiement</p>
                  {getPaymentStatusBadge(selectedVente)}
                </div>
              </div>

              <div className="divider my-2"></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-base-content/50">Sous-total</p>
                  <p className="font-medium">{formatPrice(selectedVente.sous_total)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">TVA (18%)</p>
                  <p className="font-medium">{formatPrice(selectedVente.tva)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Total</p>
                  <p className="font-bold text-primary text-lg">{formatPrice(selectedVente.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Montant payé</p>
                  <p className="font-semibold text-success">{formatPrice(selectedVente.montant_paye)}</p>
                </div>
              </div>

              {selectedVente.montant_du > 0 && (
                <div className="bg-error/10 rounded-xl p-3 border border-error/20">
                  <p className="text-sm text-error flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Reste à payer: <span className="font-bold">{formatPrice(selectedVente.montant_du)}</span>
                  </p>
                </div>
              )}

              {selectedVente.notes && (
                <div className="bg-base-200 rounded-xl p-3">
                  <p className="text-xs text-base-content/50">Notes</p>
                  <p className="text-sm mt-1">{selectedVente.notes}</p>
                </div>
              )}

              {selectedVente.motif_rejet && (
                <div className="bg-error/10 rounded-xl p-3 border border-error/20">
                  <p className="text-xs text-error/70">Motif du rejet</p>
                  <p className="text-sm text-error mt-1">{selectedVente.motif_rejet}</p>
                </div>
              )}
            </div>

            <div className="modal-action flex-wrap gap-2">
              {/* ✅ Bouton Ticket POS */}
              {canGenerateTicket(selectedVente) && (
                <button
                  className="btn btn-secondary gap-2"
                  onClick={() => { setShowDetailsModal(false); handleGenerateTicket(selectedVente) }}
                  disabled={generatingTicket === selectedVente.id}
                >
                  {generatingTicket === selectedVente.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  Ticket POS
                </button>
              )}
              {canGenerateBonLivraison(selectedVente) && (
                <button
                  className="btn btn-info gap-2"
                  onClick={() => { setShowDetailsModal(false); handleGenerateBonLivraison(selectedVente) }}
                  disabled={generatingBl === selectedVente.id}
                >
                  {generatingBl === selectedVente.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Bon de livraison
                </button>
              )}
              <button 
                className="btn btn-primary gap-2" 
                onClick={() => { setShowDetailsModal(false); navigate(`/ventes/${selectedVente.id}`) }}
              >
                <Eye className="w-4 h-4" /> Voir détails complets
              </button>
              <button className="btn btn-ghost" onClick={() => setShowDetailsModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EN-TÊTE ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ventes
          </h1>
          <p className="text-base text-base-content/60">
            Gérez toutes vos ventes
            {currentUser && (
              <span className="ml-2 badge badge-primary">
                {userRoles.est_pdg ? 'PDG' : userRoles.est_chef_agence ? 'Chef d\'agence' : 'Utilisateur'}
              </span>
            )}
            {canApprove() && <span className="ml-2 badge badge-success gap-1"><Check className="w-3 h-3" /> Peut approuver</span>}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchVentes} 
            className="btn btn-outline gap-2" 
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/ventes/nouveau')} 
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" /> 
            Nouvelle vente
          </button>
        </div>
      </div>

      {/* ===== STATISTIQUES ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-primary"><ShoppingCart className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Total</div>
          <div className="stat-value text-3xl font-black">{stats.total}</div>
          <div className="stat-desc">Ventes</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-warning"><Clock className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">En attente</div>
          <div className="stat-value text-3xl font-black text-warning">{stats.pending}</div>
          <div className="stat-desc">À approuver</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-info"><CheckCircle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Approuvées</div>
          <div className="stat-value text-3xl font-black text-info">{stats.approved}</div>
          <div className="stat-desc">Validées</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><CheckCircle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Complétées</div>
          <div className="stat-value text-3xl font-black text-success">{stats.completed}</div>
          <div className="stat-desc">Finalisées</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-error"><XCircle className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Rejetées</div>
          <div className="stat-value text-3xl font-black text-error">{stats.rejected}</div>
          <div className="stat-desc">Refusées</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-secondary"><DollarSign className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">CA total</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.totalCA)}</div>
          <div className="stat-desc">Chiffre d'affaires</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="stat-figure text-success"><CreditCard className="w-8 h-8" /></div>
          <div className="stat-title text-sm font-semibold">Payé</div>
          <div className="stat-value text-2xl font-black">{formatPrice(stats.totalPaid)}</div>
          <div className="stat-desc">Montant encaissé</div>
        </div>
      </div>

      {/* ===== FILTRES ===== */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par référence ou client..."
                className="input input-bordered w-full pl-12"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="select select-bordered min-w-[150px]"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending_approval">En attente</option>
              <option value="approved">Approuvée</option>
              <option value="completed">Complétée</option>
              <option value="rejected">Rejetée</option>
              <option value="cancelled">Annulée</option>
            </select>

            <select
              className="select select-bordered min-w-[150px]"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous types</option>
              <option value="comptoir">Comptoir</option>
              <option value="livraison">Livraison</option>
              <option value="en_ligne">En ligne</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                className="input input-bordered"
                placeholder="Date début"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <input
                type="date"
                className="input input-bordered"
                placeholder="Date fin"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>

            <button
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterStatus('')
                setFilterType('')
                setSearchTerm('')
                setDateRange({ start: '', end: '' })
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>

            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSortedVentes.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
            <p className="text-xl font-semibold text-base-content/50">Aucune vente trouvée</p>
            <p className="text-base text-base-content/40 mt-2">
              {searchTerm || filterStatus || filterType || dateRange.start || dateRange.end
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre première vente'}
            </p>
            <button 
              className="btn btn-primary mt-6 gap-2" 
              onClick={() => navigate('/ventes/nouveau')}
            >
              <Plus className="w-4 h-4" /> Créer une vente
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ===== VUE TABLEAU ===== */
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>
                        Référence <SortIcon field="reference" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('client_nom')}>
                        Client <SortIcon field="client_nom" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_vente')}>
                        Date <SortIcon field="date_vente" />
                      </button>
                    </th>
                    <th>
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('total')}>
                        Montant <SortIcon field="total" />
                      </button>
                    </th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVentes.map((vente) => (
                    <tr key={vente.id} className="hover">
                      <td className="font-mono font-semibold">{vente.reference}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-full w-8 h-8">
                              <User className="w-4 h-4" />
                            </div>
                          </div>
                          <span>{vente.client_nom || 'Anonyme'}</span>
                        </div>
                      </td>
                      <td className="text-sm">{formatDate(vente.date_vente)}</td>
                      <td className="font-bold text-primary">{formatPrice(vente.total)}</td>
                      <td>{getStatusBadge(vente.status)}</td>
                      <td>{getPaymentStatusBadge(vente)}</td>
                      <td>
                        <div className="flex justify-end gap-1 flex-wrap">
                          {/* ✅ Ticket POS */}
                          {canGenerateTicket(vente) && (
                            <button
                              className="btn btn-ghost btn-xs text-secondary"
                              onClick={() => handleGenerateTicket(vente)}
                              disabled={generatingTicket === vente.id}
                              title="Ticket POS"
                            >
                              {generatingTicket === vente.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Receipt className="w-3 h-3" />
                              )}
                            </button>
                          )}

                          {/* Bon de livraison */}
                          {canGenerateBonLivraison(vente) && (
                            <button
                              className="btn btn-ghost btn-xs text-info"
                              onClick={() => handleGenerateBonLivraison(vente)}
                              disabled={generatingBl === vente.id}
                              title="Bon de livraison"
                            >
                              {generatingBl === vente.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Truck className="w-3 h-3" />
                              )}
                            </button>
                          )}

                          {/* Actions d'approbation */}
                          {vente.status === 'pending_approval' && canApprove() && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs text-success"
                                onClick={() => { setVenteToApprove(vente); setShowApproveModal(true) }}
                                title="Approuver"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => { setVenteToApprove(vente); setRejectReason(''); setShowRejectModal(true) }}
                                title="Rejeter"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          {/* Détails */}
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => { setSelectedVente(vente); setShowDetailsModal(true) }}
                            title="Détails"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Supprimer */}
                          {canDelete(vente) && (
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => { setVenteToDelete(vente); setShowDeleteModal(true) }}
                              title="Supprimer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* ===== VUE GRILLE ===== */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVentes.map((vente) => (
                <div
                  key={vente.id}
                  className="bg-base-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-base-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-xl w-12 h-12">
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                        </div>
                        <div>
                          <p className="font-mono font-bold text-sm">{vente.reference}</p>
                          <p className="text-sm text-base-content/60">{vente.client_nom || 'Anonyme'}</p>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(vente.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-base-content/60">Montant</span>
                      <span className="font-bold text-primary">{formatPrice(vente.total)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-base-content/60">Date</span>
                      <span className="text-sm">{formatDate(vente.date_vente)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-base-content/60">Type</span>
                      <span className="text-sm capitalize flex items-center gap-1">
                        {getTypeIcon(vente.type_vente)}
                        {vente.type_vente}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-base-content/60">Paiement</span>
                      {getPaymentStatusBadge(vente)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-base-300 flex items-center justify-between">
                    <span className="text-sm text-base-content/60">
                      {vente.items?.length || 0} article{(vente.items?.length || 0) > 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-1">
                      {/* ✅ Ticket POS */}
                      {canGenerateTicket(vente) && (
                        <button
                          className="btn btn-ghost btn-xs text-secondary"
                          onClick={() => handleGenerateTicket(vente)}
                          disabled={generatingTicket === vente.id}
                          title="Ticket POS"
                        >
                          {generatingTicket === vente.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Receipt className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      {canGenerateBonLivraison(vente) && (
                        <button
                          className="btn btn-ghost btn-xs text-info"
                          onClick={() => handleGenerateBonLivraison(vente)}
                          disabled={generatingBl === vente.id}
                          title="Bon de livraison"
                        >
                          {generatingBl === vente.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      {vente.status === 'pending_approval' && canApprove() && (
                        <>
                          <button
                            className="btn btn-ghost btn-xs text-success"
                            onClick={() => { setVenteToApprove(vente); setShowApproveModal(true) }}
                            title="Approuver"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => { setVenteToApprove(vente); setRejectReason(''); setShowRejectModal(true) }}
                            title="Rejeter"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setSelectedVente(vente); setShowDetailsModal(true) }}
                        title="Détails"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {canDelete(vente) && (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => { setVenteToDelete(vente); setShowDeleteModal(true) }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {filteredAndSortedVentes.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedVentes.length)} sur{' '}
                {filteredAndSortedVentes.length} ventes
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}
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

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default VentesList