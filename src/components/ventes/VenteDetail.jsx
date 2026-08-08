// src/components/ventes/VenteDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import Livraison from './Livraison'
import TicketPOS from './TicketPOS' 
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  AlertCircle,
  RefreshCw,
  Building2,
  Package,
  Truck,
  FileText,
  Eye,
  Info,
  Send,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  X,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Mail,
  Phone,
  Hash,
  Layers,
  ClipboardList,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck,
  AlertTriangle
} from 'lucide-react'

const VenteDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [vente, setVente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingBl, setGeneratingBl] = useState(false)
  const [generatingTicket, setGeneratingTicket] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [currentUser, setCurrentUser] = useState(null)
  const [userRoles, setUserRoles] = useState({ est_pdg: false, est_chef_agence: false, est_commercial: false })
  
  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [paymentData, setPaymentData] = useState({ montant: '', methode: 'especes', reference: '' })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  // Récupérer l'utilisateur connecté
  const fetchCurrentUser = async () => {
    try {
      const response = await AxiosInstance.get('/users/me/')
      const userData = response.data
      setCurrentUser(userData)

      const isPDG = userData.role_global === 'pdg' || userData.is_superuser === true
      const isChefAgence = userData.roles_agence?.some(r => r.role === 'chef_agence') || false
      const isCommercial = userData.roles_agence?.some(r => r.role === 'commercial') || false

      setUserRoles({
        est_pdg: isPDG,
        est_chef_agence: isChefAgence,
        est_commercial: isCommercial
      })
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error)
    }
  }

  const fetchVente = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/ventes/${id}/`)
      setVente(response.data)
    } catch (error) {
      console.error('❌ Erreur:', error)
      showNotification('Erreur de chargement de la vente', 'error')
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/ventes'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  // Générer le bon de livraison PDF
  const handleGenerateBonLivraison = async () => {
    if (!vente || (vente.status !== 'approved' && vente.status !== 'completed')) {
      showNotification('Seules les ventes approuvées ou complétées peuvent générer un bon de livraison', 'error')
      return
    }

    setGeneratingBl(true)
    try {
      const venteData = vente
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
      setGeneratingBl(false)
    }
  }

  // Générer le ticket POS
  const handleGenerateTicket = async () => {
    if (!vente) {
      showNotification('Aucune donnée de vente disponible', 'error')
      return
    }

    setGeneratingTicket(true)
    try {
      const ticketData = {
        ...vente,
        items_data: vente.items || [],
        client: vente.client || {},
        payment_method: vente.paiements?.[0]?.methode || 'Espèces',
        paid_amount: vente.montant_paye || 0,
        remaining_amount: vente.reste_a_payer || 0
      }

      await TicketPOS(ticketData)
      showNotification(`Ticket POS généré pour ${vente.reference}`, 'success')
    } catch (error) {
      console.error('❌ Erreur génération ticket:', error)
      showNotification('Erreur lors de la génération du ticket', 'error')
    } finally {
      setGeneratingTicket(false)
    }
  }

  // Imprimer directement le ticket
  const handlePrintTicket = async () => {
    if (!vente) {
      showNotification('Aucune donnée de vente disponible', 'error')
      return
    }

    setGeneratingTicket(true)
    try {
      const ticketData = {
        ...vente,
        items_data: vente.items || [],
        client: vente.client || {},
        payment_method: vente.paiements?.[0]?.methode || 'Espèces',
        paid_amount: vente.montant_paye || 0,
        remaining_amount: vente.reste_a_payer || 0
      }

      const doc = await TicketPOS(ticketData)
      
      const pdfBlob = doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(pdfUrl, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }
      
      showNotification(`Ticket POS prêt pour impression`, 'success')
    } catch (error) {
      console.error('❌ Erreur impression ticket:', error)
      showNotification('Erreur lors de l\'impression du ticket', 'error')
    } finally {
      setGeneratingTicket(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchVente()
  }, [id])

  // Vérifier les permissions
  const canApprove = () => userRoles.est_pdg || userRoles.est_chef_agence
  const canSubmit = () => vente?.status === 'draft' && (userRoles.est_commercial || userRoles.est_pdg || userRoles.est_chef_agence)
  const canComplete = () => vente?.status === 'approved' && vente?.montant_paye >= vente?.total
  const canAddPayment = () => vente?.status === 'approved' && vente?.montant_paye < vente?.total
  const canEdit = () => vente?.status === 'draft' && (userRoles.est_commercial || userRoles.est_pdg || userRoles.est_chef_agence)
  const canCancel = () => vente?.status !== 'completed' && vente?.status !== 'cancelled'
  const canGenerateBonLivraison = () => vente && (vente.status === 'approved' || vente.status === 'completed')
  const canGenerateTicket = () => vente && (vente.status === 'approved' || vente.status === 'completed')

  // Actions
  const handleSubmit = async () => {
    try {
      await AxiosInstance.post(`/ventes/${id}/submit/`)
      showNotification('Vente soumise pour approbation avec succès', 'success')
      fetchVente()
      setShowSubmitModal(false)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de la soumission', 'error')
    }
  }

  const handleApprove = async () => {
    try {
      await AxiosInstance.post(`/ventes/${id}/approve/`)
      showNotification('Vente approuvée avec succès', 'success')
      fetchVente()
      setShowApproveModal(false)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'approbation', 'error')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showNotification('Veuillez saisir un motif de rejet', 'error')
      return
    }
    try {
      await AxiosInstance.post(`/ventes/${id}/reject/`, { motif: rejectReason })
      showNotification('Vente rejetée', 'success')
      fetchVente()
      setShowRejectModal(false)
      setRejectReason('')
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors du rejet', 'error')
    }
  }

  const handleComplete = async () => {
    try {
      await AxiosInstance.post(`/ventes/${id}/complete/`)
      showNotification('Vente complétée avec succès', 'success')
      fetchVente()
      setShowCompleteModal(false)
    } catch (error) {
      showNotification('Erreur lors de la complétion', 'error')
    }
  }

  const handlePayment = async () => {
    if (!paymentData.montant || parseFloat(paymentData.montant) <= 0) {
      showNotification('Montant invalide', 'error')
      return
    }
    if (parseFloat(paymentData.montant) > (vente?.reste_a_payer || 0)) {
      showNotification(`Le montant dépasse le reste à payer (${formatPrice(vente?.reste_a_payer)})`, 'error')
      return
    }
    try {
      await AxiosInstance.post('/paiements/', {
        vente: parseInt(id),
        montant: parseFloat(paymentData.montant),
        methode: paymentData.methode,
        reference: paymentData.reference,
        notes: `Paiement du ${new Date().toLocaleString()}`
      })
      showNotification('Paiement enregistré avec succès', 'success')
      setShowPaymentModal(false)
      setPaymentData({ montant: '', methode: 'especes', reference: '' })
      fetchVente()
    } catch (error) {
      showNotification('Erreur lors de l\'enregistrement', 'error')
    }
  }

  const handleCancel = async () => {
    try {
      await AxiosInstance.post(`/ventes/${id}/cancel/`)
      showNotification('Vente annulée avec succès', 'success')
      fetchVente()
      setShowCancelModal(false)
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erreur lors de l\'annulation', 'error')
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusConfig = {
    draft: { 
      label: 'Brouillon', 
      icon: Clock, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    },
    pending_approval: { 
      label: 'En attente', 
      icon: Clock, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    },
    approved: { 
      label: 'Approuvée', 
      icon: CheckCircle, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    rejected: { 
      label: 'Rejetée', 
      icon: XCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    completed: { 
      label: 'Complétée', 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    cancelled: { 
      label: 'Annulée', 
      icon: XCircle, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la vente...
          </p>
        </div>
      </div>
    )
  }

  if (!vente) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-error/10 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-error" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Vente non trouvée</h2>
            <p className="text-base-content/60 mt-2">La vente que vous recherchez n'existe pas</p>
          </div>
          <button 
            onClick={() => navigate('/ventes')} 
            className="btn btn-primary gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux ventes
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[vente.status] || statusConfig.draft
  const StatusIcon = status.icon
  const items = vente.items || []
  const paiements = vente.paiements || []

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-base-200 to-base-100 min-h-screen">
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/ventes')} 
            className="btn btn-ghost btn-circle btn-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vente {vente.reference}
            </h1>
            <p className="text-base text-base-content/60">
              Créée le {formatDate(vente.date_vente)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={fetchVente}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          {canGenerateTicket() && (
            <div className="dropdown dropdown-end">
              <button 
                className="btn btn-secondary gap-2"
                disabled={generatingTicket}
              >
                {generatingTicket ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                Ticket POS
              </button>
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                <li>
                  <button onClick={handleGenerateTicket}>
                    <Download className="w-4 h-4" />
                    Télécharger le ticket
                  </button>
                </li>
                <li>
                  <button onClick={handlePrintTicket}>
                    <Printer className="w-4 h-4" />
                    Imprimer le ticket
                  </button>
                </li>
              </ul>
            </div>
          )}

          {canGenerateBonLivraison() && (
            <button
              onClick={handleGenerateBonLivraison}
              className="btn btn-info gap-2"
              disabled={generatingBl}
            >
              {generatingBl ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              Bon de livraison
            </button>
          )}
          <button className="btn btn-outline gap-2">
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Statut et actions */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${status.bgColor} ${status.color} border ${status.borderColor}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-bold">Statut: {status.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span>Total:</span>
              <span className="font-bold text-primary text-lg">{formatPrice(vente.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {vente.status === 'draft' && canSubmit() && (
              <button 
                onClick={() => setShowSubmitModal(true)} 
                className="btn btn-primary gap-2"
              >
                <Send className="w-4 h-4" /> 
                Soumettre
              </button>
            )}

            {vente.status === 'pending_approval' && canApprove() && (
              <>
                <button 
                  onClick={() => setShowApproveModal(true)} 
                  className="btn btn-success gap-2"
                >
                  <ThumbsUp className="w-4 h-4" /> 
                  Approuver
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)} 
                  className="btn btn-error gap-2"
                >
                  <ThumbsDown className="w-4 h-4" /> 
                  Rejeter
                </button>
              </>
            )}

            {vente.status === 'approved' && (
              <>
                {canComplete() && (
                  <button 
                    onClick={() => setShowCompleteModal(true)} 
                    className="btn btn-primary gap-2"
                  >
                    <CheckSquare className="w-4 h-4" /> 
                    Compléter
                  </button>
                )}
                {canAddPayment() && (
                  <button 
                    onClick={() => setShowPaymentModal(true)} 
                    className="btn btn-secondary gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> 
                    Paiement
                  </button>
                )}
              </>
            )}

            {canCancel() && vente.status !== 'cancelled' && vente.status !== 'completed' && (
              <button 
                onClick={() => setShowCancelModal(true)} 
                className="btn btn-outline btn-error gap-2"
              >
                <XCircle className="w-4 h-4" /> 
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Indicateur de paiement */}
        {vente.status === 'approved' && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Payé:</span>
                <span className="font-bold text-success">{formatPrice(vente.montant_paye)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base-content/60">Reste:</span>
                <span className={`font-bold ${vente.reste_a_payer > 0 ? 'text-error' : 'text-success'}`}>
                  {formatPrice(vente.reste_a_payer)}
                </span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((vente.montant_paye / vente.total) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-base-content/50">
                {Math.round((vente.montant_paye / vente.total) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Articles et paiements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Articles</h2>
                  <p className="text-sm text-base-content/60">{items.length} produit{items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <p className="text-base-content/50">Aucun article dans cette vente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr className="bg-base-200">
                        <th>Produit</th>
                        <th className="text-center">Qté</th>
                        <th className="text-right">Prix unitaire</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover">
                          <td>
                            <div>
                              <div className="font-semibold">{item.product_name}</div>
                              {item.product_reference && (
                                <div className="text-xs text-base-content/50 font-mono">{item.product_reference}</div>
                              )}
                            </div>
                          </td>
                          <td className="text-center font-bold">{item.quantity}</td>
                          <td className="text-right">{formatPrice(item.prix_unitaire)}</td>
                          <td className="text-right font-bold">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-base-200">
                      <tr>
                        <td colSpan="3" className="text-right font-semibold">Sous-total</td>
                        <td className="text-right font-semibold">{formatPrice(vente.sous_total)}</td>
                      </tr>
                      {/* LIGNE TVA SUPPRIMÉE */}
                      <tr className="border-t border-base-300">
                        <td colSpan="3" className="text-right font-bold text-lg">Total</td>
                        <td className="text-right font-bold text-primary text-lg">{formatPrice(vente.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Paiements */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-secondary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Paiements</h2>
                  <p className="text-sm text-base-content/60">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {paiements.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <p className="text-base-content/50">Aucun paiement enregistré</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paiements.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <div className="font-semibold capitalize">{p.methode}</div>
                          <div className="text-xs text-base-content/50">{formatDate(p.date_paiement)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">{formatPrice(p.montant)}</div>
                        {p.reference && (
                          <div className="text-xs text-base-content/50 font-mono">{p.reference}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-base-300">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary text-lg">{formatPrice(vente.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Payé</span>
                    <span className="font-bold text-success">{formatPrice(vente.montant_paye)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="font-semibold">Reste à payer</span>
                    <span className={`font-bold text-lg ${vente.reste_a_payer > 0 ? 'text-error' : 'text-success'}`}>
                      {formatPrice(vente.reste_a_payer)}
                    </span>
                  </div>
                </div>
              )}
              
              {vente.status === 'approved' && vente.reste_a_payer > 0 && (
                <button 
                  onClick={() => setShowPaymentModal(true)} 
                  className="btn btn-secondary w-full mt-4 gap-2"
                >
                  <CreditCard className="w-4 h-4" /> 
                  Ajouter un paiement
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Informations */}
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
            <div className="p-5 border-b border-base-300 bg-gradient-to-r from-info/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-info" />
                </div>
                <h2 className="text-lg font-bold">Informations</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Client</p>
                  <p className="font-semibold">
                    {vente.client?.nom || 'Anonyme'} {vente.client?.prenom || ''}
                  </p>
                  {vente.client?.email && (
                    <p className="text-sm text-base-content/60 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {vente.client.email}
                    </p>
                  )}
                  {vente.client?.telephone && (
                    <p className="text-sm text-base-content/60 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {vente.client.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Agence</p>
                  <p className="font-semibold">{vente.agence?.nom || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Date de création</p>
                  <p className="font-semibold">{formatDate(vente.date_vente)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Type de vente</p>
                  <p className="font-semibold capitalize">{vente.type_vente || 'Standard'}</p>
                </div>
              </div>

              {vente.type_vente === 'livraison' && vente.client?.adresse && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50">Adresse de livraison</p>
                    <p className="font-semibold">{vente.client.adresse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {vente.notes && (
            <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
              <div className="p-5 border-b border-base-300 bg-gradient-to-r from-warning/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning" />
                  </div>
                  <h2 className="text-lg font-bold">Notes</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-base-content/70 whitespace-pre-wrap">{vente.notes}</p>
              </div>
            </div>
          )}

          {/* Motif de rejet */}
          {vente.motif_rejet && (
            <div className="bg-error/10 rounded-xl shadow-xl border border-error/20 overflow-hidden">
              <div className="p-5 border-b border-error/20 bg-gradient-to-r from-error/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  <h2 className="text-lg font-bold text-error">Motif du rejet</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-error/80 whitespace-pre-wrap">{vente.motif_rejet}</p>
              </div>
            </div>
          )}

          {/* Approbation */}
          {vente.approved_by && (
            <div className="bg-success/10 rounded-xl shadow-xl border border-success/20 overflow-hidden">
              <div className="p-5 border-b border-success/20 bg-gradient-to-r from-success/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <h2 className="text-lg font-bold text-success">Approbation</h2>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <p className="text-sm">
                  <span className="text-base-content/50">Approuvée par :</span>
                  <span className="font-semibold ml-2">{vente.approved_by?.email || 'N/A'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-base-content/50">Date :</span>
                  <span className="font-semibold ml-2">{formatDate(vente.date_approbation)}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Modal Soumission */}
      {showSubmitModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary/10 text-primary rounded-full w-20 h-20">
                  <Send className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Soumettre la vente</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment soumettre cette vente pour approbation ?
              </p>
              <p className="font-bold text-primary mt-4 text-lg">{vente.reference}</p>
              <p className="text-sm text-base-content/60">Montant: {formatPrice(vente.total)}</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowSubmitModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Soumettre</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approbation */}
      {showApproveModal && (
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
              <p className="font-bold text-primary mt-4 text-lg">{vente.reference}</p>
              <p className="text-sm text-base-content/60">Montant: {formatPrice(vente.total)}</p>
              <div className="mt-4 p-3 bg-warning/10 rounded-xl text-warning text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Le stock sera automatiquement déduit.
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowApproveModal(false)}>Annuler</button>
              <button className="btn btn-success" onClick={handleApprove}>Approuver</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejectModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <ThumbsDown className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Rejeter la vente</h3>
              <p className="text-base-content/70">Vente: {vente.reference}</p>
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
              <button className="btn btn-ghost" onClick={() => { setShowRejectModal(false); setRejectReason('') }}>Annuler</button>
              <button className="btn btn-error" onClick={handleReject}>Rejeter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Complétion */}
      {showCompleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-success/10 text-success rounded-full w-20 h-20">
                  <CheckSquare className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Compléter la vente</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment marquer cette vente comme complétée ?
              </p>
              <p className="font-bold text-primary mt-4 text-lg">{vente.reference}</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowCompleteModal(false)}>Annuler</button>
              <button className="btn btn-success" onClick={handleComplete}>Compléter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Annulation */}
      {showCancelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-20 h-20">
                  <XCircle className="w-10 h-10" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-2">Annuler la vente</h3>
              <p className="text-base-content/70">
                Voulez-vous vraiment annuler cette vente ?
              </p>
              <p className="font-bold text-error mt-4 text-lg">{vente.reference}</p>
              <p className="text-sm text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleCancel}>Annuler la vente</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaymentModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-secondary" />
              Enregistrer un paiement
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-base-200 rounded-xl">
              <div>
                <p className="text-xs text-base-content/50">Total</p>
                <p className="font-bold text-primary">{formatPrice(vente.total)}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50">Payé</p>
                <p className="font-bold text-success">{formatPrice(vente.montant_paye)}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50">Reste</p>
                <p className="font-bold text-error">{formatPrice(vente.reste_a_payer)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label font-medium">
                  Montant à payer <span className="text-error">*</span>
                </label>
                <input 
                  type="number" 
                  step="1" 
                  min="1" 
                  max={vente.reste_a_payer} 
                  className="input input-bordered w-full text-lg" 
                  placeholder="0"
                  value={paymentData.montant} 
                  onChange={(e) => setPaymentData({ ...paymentData, montant: e.target.value })} 
                />
              </div>

              <div className="form-control">
                <label className="label font-medium">
                  Mode de paiement <span className="text-error">*</span>
                </label>
                <select 
                  className="select select-bordered w-full" 
                  value={paymentData.methode} 
                  onChange={(e) => setPaymentData({ ...paymentData, methode: e.target.value })}
                >
                  <option value="especes">Espèces</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label font-medium">Référence (optionnel)</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="N° chèque, référence virement..." 
                  value={paymentData.reference} 
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })} 
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowPaymentModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handlePayment}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

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

export default VenteDetail