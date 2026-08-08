// src/components/achats/FraisDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  Receipt,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Package,
  RefreshCw
} from 'lucide-react'

const FraisDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [frais, setFrais] = useState(null)
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await AxiosInstance.get(`/receipt-costs/${id}/`)
      const data = response.data
      setFrais(data)

      // Récupérer les allocations si disponibles
      if (data.allocations) {
        setAllocations(data.allocations)
      } else {
        try {
          const allocRes = await AxiosInstance.get(`/receipt-costs/${id}/allocations/`)
          setAllocations(allocRes.data)
        } catch {
          setAllocations([])
        }
      }
    } catch (error) {
      console.error('Erreur chargement détail frais:', error)
      setError('Frais introuvable ou erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000)
  }

  const handleDelete = async () => {
    try {
      await AxiosInstance.delete(`/receipt-costs/${id}/`)
      showNotification('Frais supprimé avec succès', 'success')
      setTimeout(() => navigate('/frais'), 1500)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

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
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch { return 'N/A' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du frais...
          </p>
        </div>
      </div>
    )
  }

  if (error || !frais) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur</h2>
          <p className="text-base-content/60">{error || 'Frais introuvable'}</p>
          <button onClick={() => navigate('/frais')} className="btn btn-primary mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
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

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {frais.description || frais.cost_type_display || 'Frais'}
          </h1>
          <p className="text-base text-base-content/60">
            #{frais.id} · {formatDate(frais.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/frais" className="btn btn-outline gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <button onClick={() => navigate(`/frais/${id}/modifier`)} className="btn btn-info gap-2">
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-error gap-2">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Montant
          </h3>
          <div className="text-4xl font-black text-primary">{formatCurrency(frais.amount)}</div>
          <div className="mt-2 text-sm text-base-content/60">
            Devise: {frais.currency} · Taux: {frais.exchange_rate} · 
            En FCFA: {formatCurrency(frais.amount_in_local_currency || frais.amount)}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="badge badge-lg badge-primary">{frais.cost_type_display || frais.cost_type}</span>
            {frais.is_billable ? (
              <span className="badge badge-success">Facturable</span>
            ) : (
              <span className="badge badge-ghost">Non facturable</span>
            )}
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Réception associée
          </h3>
          <Link to={`/receptions/${frais.receipt}`} className="link link-primary text-xl font-semibold">
            {frais.receipt_number || `#${frais.receipt}`}
          </Link>
          {frais.reference_number && (
            <div className="mt-2">
              <span className="text-sm text-base-content/60">N° de référence</span>
              <p className="font-medium">{frais.reference_number}</p>
            </div>
          )}
          {frais.notes && (
            <div className="mt-4">
              <span className="text-sm text-base-content/60">Notes</span>
              <p className="font-medium whitespace-pre-wrap">{frais.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Allocations */}
      {allocations.length > 0 && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Allocations aux produits
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th className="text-right">Montant alloué</th>
                  <th>Méthode</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc, idx) => (
                  <tr key={idx}>
                    <td>{alloc.product_name || alloc.product}</td>
                    <td>{alloc.quantity}</td>
                    <td className="text-right font-semibold">{formatCurrency(alloc.allocated_amount)}</td>
                    <td>{alloc.allocation_method_display || alloc.allocation_method}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-base-100 border-t-2">
                <tr className="font-bold">
                  <td colSpan="2" className="text-right">Total alloué</td>
                  <td className="text-right">{formatCurrency(allocations.reduce((s, a) => s + (parseFloat(a.allocated_amount) || 0), 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmer la suppression</h3>
            <p className="py-4">
              Voulez-vous vraiment supprimer ce frais ?
            </p>
            <p className="font-semibold text-error">
              "{frais.description || frais.cost_type_display}" - {formatCurrency(frais.amount)}
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error" onClick={handleDelete}>Supprimer</button>
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

export default FraisDetail