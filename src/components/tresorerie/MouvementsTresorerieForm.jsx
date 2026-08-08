// src/components/tresorerie/MouvementsTresorerieForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeftRight,
  Wallet,
  Coins,
  PiggyBank,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Building2,
  FileText,
  Clock,
  Banknote,
  CreditCard,
  Smartphone,
  Check
} from 'lucide-react'

const MouvementsTresorerieForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  
  // Données pour les sélecteurs
  const [caisses, setCaisses] = useState([])
  const [comptesBancaires, setComptesBancaires] = useState([])
  const [agences, setAgences] = useState([])

  const [formData, setFormData] = useState({
    type_mouvement: 'encaissement',
    agence: '',
    source_type: 'autre',
    source_id: '',
    source_reference: '',
    montant: '',
    mode_paiement: 'especes',
    caisse: '',
    compte_bancaire: '',
    date_mouvement: new Date().toISOString().slice(0, 16),
    date_valeur: new Date().toISOString().split('T')[0],
    date_prevue: '',
    status: 'planifie',
    reference_externe: '',
    piece_justificative: '',
    libelle: '',
    notes: ''
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Charger les agences
        const agencesRes = await AxiosInstance.get('/agences/')
        setAgences(agencesRes.data || [])

        // Charger les caisses
        const caissesRes = await AxiosInstance.get('/caisses/')
        setCaisses(caissesRes.data || [])

        // Charger les comptes bancaires
        const comptesRes = await AxiosInstance.get('/comptes-bancaires/')
        setComptesBancaires(comptesRes.data || [])

        // Si édition, charger les données du mouvement
        if (isEdit) {
          const mouvementRes = await AxiosInstance.get(`/mouvements/${id}/`)
          const data = mouvementRes.data
          setFormData({
            type_mouvement: data.type_mouvement || 'encaissement',
            agence: data.agence || '',
            source_type: data.source_type || 'autre',
            source_id: data.source_id || '',
            source_reference: data.source_reference || '',
            montant: data.montant || '',
            mode_paiement: data.mode_paiement || 'especes',
            caisse: data.caisse || '',
            compte_bancaire: data.compte_bancaire || '',
            date_mouvement: data.date_mouvement ? data.date_mouvement.slice(0, 16) : new Date().toISOString().slice(0, 16),
            date_valeur: data.date_valeur || new Date().toISOString().split('T')[0],
            date_prevue: data.date_prevue || '',
            status: data.status || 'planifie',
            reference_externe: data.reference_externe || '',
            piece_justificative: data.piece_justificative || '',
            libelle: data.libelle || '',
            notes: data.notes || ''
          })
        }
      } catch (error) {
        console.error('Erreur chargement:', error)
        setError('Erreur de chargement des données')
        showNotification('Erreur de chargement des données', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validation
      if (!formData.type_mouvement) {
        setError('Le type de mouvement est requis')
        setSaving(false)
        return
      }
      if (!formData.agence) {
        setError('L\'agence est requise')
        setSaving(false)
        return
      }
      if (!formData.montant || parseFloat(formData.montant) <= 0) {
        setError('Le montant doit être supérieur à 0')
        setSaving(false)
        return
      }
      if (!formData.libelle) {
        setError('Le libellé est requis')
        setSaving(false)
        return
      }
      if (!formData.caisse && !formData.compte_bancaire) {
        setError('Une caisse ou un compte bancaire est requis')
        setSaving(false)
        return
      }
      if (formData.type_mouvement === 'transfert' && (!formData.caisse || !formData.compte_bancaire)) {
        setError('Un transfert nécessite une caisse ET un compte bancaire')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        montant: parseFloat(formData.montant) || 0,
        agence: parseInt(formData.agence),
        caisse: formData.caisse ? parseInt(formData.caisse) : null,
        compte_bancaire: formData.compte_bancaire ? parseInt(formData.compte_bancaire) : null,
        source_id: formData.source_id ? parseInt(formData.source_id) : null
      }

      if (isEdit) {
        await AxiosInstance.put(`/mouvements/${id}/`, dataToSend)
        showNotification('Mouvement modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/mouvements/', dataToSend)
        showNotification('Mouvement créé avec succès', 'success')
      }

      // ✅ REDIRECTION VERS /mouvements-tresorerie
      setTimeout(() => navigate('/mouvements-tresorerie'), 1000)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors de la sauvegarde'
      setError(msg)
      showNotification(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  // ✅ REDIRECTION VERS /mouvements-tresorerie
  const handleRetour = () => {
    navigate('/mouvements-tresorerie')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            {isEdit ? 'Chargement du mouvement...' : 'Préparation du formulaire...'}
          </p>
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
            onClick={handleRetour}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier le mouvement' : '🔄 Nouveau mouvement'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations du mouvement' : 'Créez un nouveau mouvement de trésorerie'}
            </p>
          </div>
        </div>
        
        {isEdit && (
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm">ID: #{id}</span>
          </div>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-xl border border-base-200 p-4 sm:p-6">
        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type de mouvement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de mouvement <span className="text-error">*</span></span>
            </label>
            <div className="flex gap-2">
              <select
                name="type_mouvement"
                value={formData.type_mouvement}
                onChange={handleChange}
                className="select select-bordered flex-1"
                required
              >
                <option value="encaissement">💰 Encaissement</option>
                <option value="decaissement">💸 Décaissement</option>
                <option value="transfert">🔄 Transfert</option>
              </select>
              {formData.type_mouvement === 'encaissement' && <TrendingUp className="w-6 h-6 text-success mt-2" />}
              {formData.type_mouvement === 'decaissement' && <TrendingDown className="w-6 h-6 text-error mt-2" />}
              {formData.type_mouvement === 'transfert' && <ArrowLeftRight className="w-6 h-6 text-info mt-2" />}
            </div>
          </div>

          {/* Agence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Agence <span className="text-error">*</span></span>
            </label>
            <select
              name="agence"
              value={formData.agence}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>
                  <Building2 className="w-4 h-4 inline mr-1" />
                  {agence.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Montant <span className="text-error">*</span></span>
            </label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              required
            />
          </div>

          {/* Mode de paiement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Mode de paiement <span className="text-error">*</span></span>
            </label>
            <select
              name="mode_paiement"
              value={formData.mode_paiement}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="especes">💰 Espèces</option>
              <option value="carte">💳 Carte bancaire</option>
              <option value="cheque">📄 Chèque</option>
              <option value="virement">🏦 Virement</option>
              <option value="mobile_money">📱 Mobile Money</option>
              <option value="prelevement">🔄 Prélèvement</option>
              <option value="autre">📌 Autre</option>
            </select>
          </div>

          {/* Caisse */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Caisse</span>
            </label>
            <select
              name="caisse"
              value={formData.caisse}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Sélectionner une caisse</option>
              {caisses.map(caisse => (
                <option key={caisse.id} value={caisse.id}>
                  <Coins className="w-4 h-4 inline mr-1" />
                  {caisse.nom} ({caisse.code})
                </option>
              ))}
            </select>
          </div>

          {/* Compte bancaire */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Compte bancaire</span>
            </label>
            <select
              name="compte_bancaire"
              value={formData.compte_bancaire}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Sélectionner un compte</option>
              {comptesBancaires.map(compte => (
                <option key={compte.id} value={compte.id}>
                  <PiggyBank className="w-4 h-4 inline mr-1" />
                  {compte.nom} ({compte.banque})
                </option>
              ))}
            </select>
          </div>

          {/* Libellé */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Libellé <span className="text-error">*</span></span>
            </label>
            <input
              type="text"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              placeholder="Ex: Paiement fournisseur"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Statut */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Statut</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="planifie">📋 Planifié</option>
              <option value="en_attente">⏳ En attente</option>
              <option value="effectue">✅ Effectué</option>
            </select>
          </div>

          {/* Date du mouvement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date du mouvement</span>
            </label>
            <input
              type="datetime-local"
              name="date_mouvement"
              value={formData.date_mouvement}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Date de valeur */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date de valeur</span>
            </label>
            <input
              type="date"
              name="date_valeur"
              value={formData.date_valeur}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Date prévue */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date prévue</span>
            </label>
            <input
              type="date"
              name="date_prevue"
              value={formData.date_prevue}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Source type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de source</span>
            </label>
            <select
              name="source_type"
              value={formData.source_type}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="autre">📌 Autre</option>
              <option value="vente">🛒 Vente</option>
              <option value="achat">📦 Achat</option>
              <option value="facture_client">🧾 Facture client</option>
              <option value="facture_fournisseur">🧾 Facture fournisseur</option>
              <option value="reglement">💵 Règlement</option>
              <option value="ecriture">📝 Écriture comptable</option>
              <option value="salaire">👤 Salaire</option>
              <option value="frais">📄 Frais</option>
            </select>
          </div>

          {/* Source référence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Référence source</span>
            </label>
            <input
              type="text"
              name="source_reference"
              value={formData.source_reference}
              onChange={handleChange}
              placeholder="Ex: VENTE-001"
              className="input input-bordered w-full"
            />
          </div>

          {/* Référence externe */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Référence externe</span>
            </label>
            <input
              type="text"
              name="reference_externe"
              value={formData.reference_externe}
              onChange={handleChange}
              placeholder="Ex: N° chèque, N° virement..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Pièce justificative */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Pièce justificative</span>
            </label>
            <input
              type="text"
              name="piece_justificative"
              value={formData.piece_justificative}
              onChange={handleChange}
              placeholder="Ex: FACT-001"
              className="input input-bordered w-full"
            />
          </div>

          {/* Notes */}
          <div className="form-control col-span-1 md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Notes</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes supplémentaires..."
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-base-200">
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
          </button>
          <button
            type="button"
            onClick={handleRetour}
            className="btn btn-ghost gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>

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

export default MouvementsTresorerieForm