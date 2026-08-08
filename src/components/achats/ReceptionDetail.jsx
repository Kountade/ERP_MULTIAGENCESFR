// src/components/achats/ReceptionDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Edit, Printer, Download, CheckCircle, XCircle,
  Package, Truck, DollarSign, Calendar, Building2, 
  FileText, AlertCircle, Receipt, Users, Clock,
  MapPin, Phone, Mail, Hash, Tag, Box, X
} from 'lucide-react'

const ReceptionDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [reception, setReception] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
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
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const fetchReception = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setError('Veuillez vous connecter')
        setLoading(false)
        return
      }
      
      // Essayer plusieurs endpoints
      let response
      try {
        response = await AxiosInstance.get(`/purchase-receipts/${id}/`)
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get(`/receptions/${id}/`)
        } else {
          throw err
        }
      }
      
      const data = response.data
      
      // S'assurer que les champs nécessaires existent
      const formattedData = {
        ...data,
        total_value: data.total_value || 0,
        total_costs: data.total_costs || 0,
        order_number: data.order_number || data.purchase_order_number || data.purchase_order?.order_number,
        supplier_name: data.supplier_name || data.purchase_order?.supplier?.company_name,
        items: data.items || [],
        costs: data.costs || []
      }
      
      setReception(formattedData)
    } catch (error) {
      console.error('Erreur chargement réception:', error)
      if (error.response?.status === 404) {
        setError('Réception non trouvée')
      } else if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.')
      } else {
        setError('Erreur lors du chargement des données')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchReception()
    }
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des détails de la réception...</p>
        </div>
      </div>
    )
  }

  if (error || !reception) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">{error || 'Réception non trouvée'}</h2>
          <p className="text-base-content/60 mb-4">La réception que vous recherchez n'existe pas ou a été supprimée.</p>
          <button onClick={() => navigate('/receptions')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const totalWithCosts = (reception.total_value || 0) + (reception.total_costs || 0)

  return (
    <div className="min-h-screen bg-base-200 py-4 sm:py-6 px-3 sm:px-4">
      
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        
        {/* Bouton retour et actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Link to="/receptions" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={handlePrint} className="btn btn-sm btn-outline gap-1"><Printer className="w-4 h-4" /> Imprimer</button>
            <button className="btn btn-sm btn-outline gap-1"><Download className="w-4 h-4" /> Exporter</button>
          </div>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">{reception.receipt_number}</h1>
                  <p className="text-white/80 text-sm">Réception du {formatDate(reception.receipt_date)}</p>
                </div>
              </div>
              <div className="badge bg-white/20 text-white border-none gap-1">
                <CheckCircle className="w-3 h-3" />
                Réception validée
              </div>
            </div>
          </div>
        </div>

        {/* Grille des informations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          
          {/* Carte Commande associée */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Commande associée
            </h3>
            <p className="font-medium text-lg">{reception.order_number || reception.purchase_order_number || '-'}</p>
            <p className="text-sm text-base-content/60 mt-1">Fournisseur: {reception.supplier_name || reception.purchase_order?.supplier?.company_name || '-'}</p>
            {reception.purchase_order?.id && (
              <Link to={`/commandes-fournisseurs/${reception.purchase_order.id}`} className="text-primary text-sm hover:underline mt-2 inline-flex items-center gap-1">
                Voir la commande →
              </Link>
            )}
          </div>

          {/* Carte Dates */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Dates
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-base-content/50 text-xs">Date de réception</span>
                <p className="font-medium">{formatDate(reception.receipt_date)}</p>
              </div>
              {reception.purchase_order?.order_date && (
                <div>
                  <span className="text-base-content/50 text-xs">Date commande</span>
                  <p>{formatDate(reception.purchase_order.order_date)}</p>
                </div>
              )}
              {reception.purchase_order?.expected_date && (
                <div>
                  <span className="text-base-content/50 text-xs">Livraison prévue</span>
                  <p className={new Date(reception.purchase_order.expected_date) < new Date(reception.receipt_date) ? 'text-warning font-medium' : ''}>
                    {formatDate(reception.purchase_order.expected_date)}
                    {new Date(reception.purchase_order.expected_date) < new Date(reception.receipt_date) && (
                      <span className="ml-2 badge badge-warning badge-xs">Retard</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Carte Récapitulatif financier */}
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Récapitulatif financier
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base-content/50">Valeur des marchandises</span>
                <span className="font-semibold">{formatCurrency(reception.total_value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/50">Frais annexes</span>
                <span className="text-warning font-semibold">{formatCurrency(reception.total_costs)}</span>
              </div>
              <div className="border-t border-base-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total réception</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(totalWithCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles reçus */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
          <div className="p-4 border-b border-base-200 bg-base-100">
            <h3 className="text-md font-semibold text-primary flex items-center gap-2">
              <Package className="w-5 h-5" /> Articles reçus
              <span className="badge badge-primary badge-sm ml-2">{reception.items?.length || 0} article(s)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr className="text-sm">
                  <th>Produit</th>
                  <th>Référence</th>
                  <th className="text-center">Quantité reçue</th>
                  <th className="text-right">Prix unit.</th>
                  <th className="text-right">Total HT</th>
                  <th>Lot / Série</th>
                  <th className="text-center">Contrôle qualité</th>
                </tr>
              </thead>
              <tbody>
                {reception.items?.map((item, idx) => (
                  <tr key={idx} className="hover">
                    <td className="font-medium">{item.product_name || item.order_item?.product?.name || '-'}</td>
                    <td className="text-xs text-base-content/60">{item.product_reference || item.order_item?.product?.reference || '-'}</td>
                    <td className="text-center">
                      <span className="badge badge-neutral">{item.quantity}</span>
                    </td>
                    <td className="text-right">{formatCurrency(item.order_item?.unit_price || item.unit_price || 0)}</td>
                    <td className="text-right font-semibold">{formatCurrency((item.order_item?.unit_price || item.unit_price || 0) * (item.quantity || 0))}</td>
                    <td className="font-mono text-xs">{item.lot_number || '-'}</td>
                    <td className="text-center">
                      {item.quality_ok !== undefined ? (
                        <div className={`badge badge-${item.quality_ok ? 'success' : 'error'} gap-1`}>
                          {item.quality_ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {item.quality_ok ? 'Conforme' : 'Non conforme'}
                        </div>
                      ) : (
                        <div className="badge badge-ghost gap-1">
                          <CheckCircle className="w-3 h-3" /> Accepté
                        </div>
                      )}
                     </td>
                   </tr>
                ))}
              </tbody>
              <tfoot className="bg-base-100 border-t-2">
                <tr>
                  <td colSpan="4" className="text-right font-bold">Total articles</td>
                  <td colSpan="3" className="font-bold">{reception.items?.length || 0} article(s)</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Frais annexes */}
        {reception.costs && reception.costs.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 overflow-hidden">
            <div className="p-4 border-b border-base-200">
              <h3 className="text-md font-semibold text-primary flex items-center gap-2">
                <Truck className="w-5 h-5" /> Frais annexes
                <span className="badge badge-info badge-sm ml-2">{reception.costs.length} frais</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200">
                  <tr className="text-sm">
                    <th>Type</th>
                    <th>Description</th>
                    <th className="text-right">Montant</th>
                    <th>N° référence</th>
                    <th>Document</th>
                   </tr>
                </thead>
                <tbody>
                  {reception.costs.map((cost, idx) => (
                    <tr key={idx} className="hover">
                      <td><span className="badge badge-primary/10 text-primary">{cost.cost_type_display || cost.cost_type}</span></td>
                      <td>{cost.description || '-'}</td>
                      <td className="text-right font-semibold text-warning">{formatCurrency(cost.amount)}</td>
                      <td className="text-xs font-mono">{cost.reference_number || '-'}</td>
                      <td>
                        {cost.document && (
                          <a href={cost.document} target="_blank" rel="noopener noreferrer" className="link link-primary text-sm flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Voir
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-base-100 border-t-2">
                  <tr>
                    <td colSpan="2" className="text-right font-bold">Total des frais</td>
                    <td className="text-right font-bold text-warning text-lg">{formatCurrency(reception.total_costs)}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {reception.notes && (
          <div className="bg-base-100 rounded-xl shadow-md border border-base-200 mb-6 p-4">
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h3>
            <div className="bg-base-200/50 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{reception.notes}</p>
            </div>
          </div>
        )}

        {/* Métadonnées */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Métadonnées
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-base-content/50 text-xs uppercase tracking-wide">Créée le</label>
              <p className="font-medium">{formatDateTime(reception.created_at)}</p>
            </div>
            <div>
              <label className="text-base-content/50 text-xs uppercase tracking-wide">Reçue par</label>
              <p>{reception.received_by_name || 'Système'}</p>
            </div>
            {reception.created_by && (
              <div>
                <label className="text-base-content/50 text-xs uppercase tracking-wide">Créée par</label>
                <p>{reception.created_by?.email || reception.created_by}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ReceptionDetail