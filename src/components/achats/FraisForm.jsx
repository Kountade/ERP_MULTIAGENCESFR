// src/components/achats/FraisForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Receipt,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  Calendar,
  Building2,
  Users,
  RefreshCw
} from 'lucide-react'

const FraisForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [receipts, setReceipts] = useState([])
  const [receiptDetail, setReceiptDetail] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    receipt: '',
    cost_type: 'other',
    description: '',
    amount: '',
    currency: 'XOF',
    exchange_rate: 1,
    reference_number: '',
    is_billable: true,
    notes: ''
  })

  const fetchReceipts = async () => {
    try {
      const response = await AxiosInstance.get('/purchase-receipts/')
      setReceipts(response.data || [])
    } catch (error) {
      console.error('Erreur chargement réceptions:', error)
      showNotification('Erreur de chargement des réceptions', 'error')
    }
  }

  const fetchFrais = async () => {
    if (!isEditMode) return
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/receipt-costs/${id}/`)
      const data = response.data
      setFormData({
        receipt: data.receipt,
        cost_type: data.cost_type || 'other',
        description: data.description || '',
        amount: data.amount || '',
        currency: data.currency || 'XOF',
        exchange_rate: data.exchange_rate || 1,
        reference_number: data.reference_number || '',
        is_billable: data.is_billable !== undefined ? data.is_billable : true,
        notes: data.notes || ''
      })
      if (data.receipt) {
        const receiptRes = await AxiosInstance.get(`/purchase-receipts/${data.receipt}/`)
        setReceiptDetail(receiptRes.data)
      }
    } catch (error) {
      console.error('Erreur chargement frais:', error)
      showNotification('Erreur lors du chargement', 'error')
      navigate('/frais')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
    if (isEditMode) fetchFrais()
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleReceiptChange = async (e) => {
    const receiptId = e.target.value
    setFormData(prev => ({ ...prev, receipt: receiptId }))
    if (receiptId) {
      try {
        const res = await AxiosInstance.get(`/purchase-receipts/${receiptId}/`)
        setReceiptDetail(res.data)
      } catch { setReceiptDetail(null) }
    } else {
      setReceiptDetail(null)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.receipt) newErrors.receipt = 'La réception est requise'
    if (!formData.cost_type) newErrors.cost_type = 'Le type de frais est requis'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      exchange_rate: parseFloat(formData.exchange_rate)
    }

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/receipt-costs/${id}/`, data)
        showNotification('Frais modifié avec succès !', 'success')
      } else {
        await AxiosInstance.post('/receipt-costs/', data)
        showNotification('Frais créé avec succès !', 'success')
      }
      setTimeout(() => navigate('/frais'), 1500)
    } catch (error) {
      console.error('Erreur:', error)
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat().join(', ')
        showNotification(`Erreur: ${errorMessages}`, 'error')
      } else {
        showNotification('Erreur lors de l\'enregistrement', 'error')
      }
    } finally {
      setSubmitting(false)
    }
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
            {isEditMode ? 'Modifier le frais' : 'Nouveau frais'}
          </h1>
          <p className="text-base text-base-content/60">
            {isEditMode ? 'Modifiez les informations du frais' : 'Ajoutez un frais supplémentaire à une réception'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/frais')} className="btn btn-outline gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Réception */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Réception <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="receipt"
              className={`select select-bordered w-full ${errors.receipt ? 'select-error' : ''}`}
              value={formData.receipt}
              onChange={handleReceiptChange}
              disabled={isEditMode || submitting}
            >
              <option value="">-- Sélectionner une réception --</option>
              {receipts.map(r => (
                <option key={r.id} value={r.id}>
                  {r.receipt_number} - {r.supplier_name || r.purchase_order?.supplier?.company_name || 'Fournisseur'}
                </option>
              ))}
            </select>
            {errors.receipt && (
              <span className="label-text-alt text-error">{errors.receipt}</span>
            )}
            {receiptDetail && (
              <div className="mt-2 p-3 bg-base-200 rounded-lg text-sm">
                <div className="flex flex-wrap gap-4">
                  <span><span className="text-base-content/50">N° commande:</span> {receiptDetail.order_number}</span>
                  <span><span className="text-base-content/50">Date:</span> {new Date(receiptDetail.receipt_date).toLocaleDateString()}</span>
                  <span><span className="text-base-content/50">Valeur:</span> {receiptDetail.total_value?.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
          </div>

          {/* Type et description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Type <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="cost_type"
                className={`select select-bordered w-full ${errors.cost_type ? 'select-error' : ''}`}
                value={formData.cost_type}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="transport">Transport</option>
                <option value="customs_duty">Droits de douane</option>
                <option value="customs_clearance">Frais de dédouanement</option>
                <option value="insurance">Assurance</option>
                <option value="handling">Manutention</option>
                <option value="storage">Stockage</option>
                <option value="port_fees">Frais portuaires</option>
                <option value="transit_fees">Frais de transit</option>
                <option value="other">Autres frais</option>
              </select>
              {errors.cost_type && (
                <span className="label-text-alt text-error">{errors.cost_type}</span>
              )}
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Description
                </span>
              </label>
              <input
                type="text"
                name="description"
                placeholder="Ex: Frais de dédouanement Maroc"
                className="input input-bordered w-full"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Montant et devise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Montant <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                className={`input input-bordered w-full ${errors.amount ? 'input-error' : ''}`}
                value={formData.amount}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.amount && (
                <span className="label-text-alt text-error">{errors.amount}</span>
              )}
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Devise</span>
              </label>
              <select
                name="currency"
                className="select select-bordered w-full"
                value={formData.currency}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Taux de change (1 {formData.currency} en FCFA)</span>
              </label>
              <input
                type="number"
                name="exchange_rate"
                step="0.0001"
                className="input input-bordered w-full"
                value={formData.exchange_rate}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Référence et facturable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  N° de référence
                </span>
              </label>
              <input
                type="text"
                name="reference_number"
                placeholder="Facture, BL, etc."
                className="input input-bordered w-full"
                value={formData.reference_number}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            <div className="form-control w-full">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="is_billable"
                  className="checkbox checkbox-primary"
                  checked={formData.is_billable}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <span className="label-text font-semibold">Facturable au client</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes
              </span>
            </label>
            <textarea
              name="notes"
              rows="3"
              className="textarea textarea-bordered w-full"
              placeholder="Informations complémentaires..."
              value={formData.notes}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
            <button type="submit" className="btn btn-primary flex-1 gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Modifier' : 'Créer'} le frais
                </>
              )}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/frais')} disabled={submitting}>
              Annuler
            </button>
          </div>
        </form>
      </div>

      {/* Informations supplémentaires en mode édition */}
      {isEditMode && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Informations du frais
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-base-content/60">N° frais</label>
              <p className="font-mono font-bold">{id}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/60">Type</label>
              <p className="font-medium">{formData.cost_type_display || formData.cost_type}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/60">Montant</label>
              <p className="font-bold text-primary">{formatCurrency(formData.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-base-content/60">Facturable</label>
              <p className="font-medium">{formData.is_billable ? 'Oui' : 'Non'}</p>
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

export default FraisForm