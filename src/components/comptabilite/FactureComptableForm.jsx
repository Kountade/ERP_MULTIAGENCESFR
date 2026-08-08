// src/components/comptabilite/FactureComptableForm.jsx
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
  Calendar,
  Building2,
  Users,
  Truck,
  DollarSign,
  Receipt,
  Info,
  FileText,
  User,
  Building,
  Hash,
  Tag
} from 'lucide-react'

const FactureComptableForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [agences, setAgences] = useState([])
  const [clients, setClients] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [agenceId, setAgenceId] = useState(null)
  
  const [formData, setFormData] = useState({
    type_facture: 'client',
    agence: '',
    client: '',
    fournisseur: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    montant_ht: '',
    montant_tva: '',
    notes: ''
  })

  const typeOptions = [
    { value: 'client', label: 'Client', icon: Users, color: 'text-success' },
    { value: 'fournisseur', label: 'Fournisseur', icon: Truck, color: 'text-warning' }
  ]

  // Récupérer l'agence courante
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('User') || '{}')
    if (userData.agence_principale) {
      setAgenceId(userData.agence_principale.id)
      setFormData(prev => ({ ...prev, agence: userData.agence_principale.id }))
    }
  }, [])

  useEffect(() => {
    fetchAgences()
    fetchClients()
    fetchFournisseurs()
    if (isEditing) {
      fetchFacture()
    }
  }, [id])

  const fetchFacture = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/factures-comptables/${id}/`)
      const data = response.data
      setFormData({
        type_facture: data.type_facture || 'client',
        agence: data.agence || agenceId || '',
        client: data.client || '',
        fournisseur: data.fournisseur || '',
        date_facture: data.date_facture || new Date().toISOString().split('T')[0],
        date_echeance: data.date_echeance || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        montant_ht: data.montant_ht || '',
        montant_tva: data.montant_tva || '',
        notes: data.notes || ''
      })
    } catch (error) {
      console.error('Erreur chargement facture:', error)
      setError('Erreur de chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/')
      setAgences(response.data || [])
    } catch (error) {
      console.error('Erreur chargement agences:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await AxiosInstance.get('/clients/')
      setClients(response.data || [])
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    }
  }

  const fetchFournisseurs = async () => {
    try {
      const response = await AxiosInstance.get('/fournisseurs/')
      setFournisseurs(response.data || [])
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const calculerMontantTTC = () => {
    const ht = parseFloat(formData.montant_ht) || 0
    const tva = parseFloat(formData.montant_tva) || 0
    return ht + tva
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    if (!formData.agence) {
      setError('L\'agence est requise')
      setSaving(false)
      return
    }
    if (!formData.date_facture) {
      setError('La date de facture est requise')
      setSaving(false)
      return
    }
    if (!formData.date_echeance) {
      setError('La date d\'échéance est requise')
      setSaving(false)
      return
    }
    if (!formData.montant_ht || parseFloat(formData.montant_ht) <= 0) {
      setError('Le montant HT est requis et doit être supérieur à 0')
      setSaving(false)
      return
    }

    if (formData.type_facture === 'client' && !formData.client) {
      setError('Un client est requis pour une facture client')
      setSaving(false)
      return
    }

    if (formData.type_facture === 'fournisseur' && !formData.fournisseur) {
      setError('Un fournisseur est requis pour une facture fournisseur')
      setSaving(false)
      return
    }

    try {
      const dataToSend = {
        ...formData,
        montant_ht: parseFloat(formData.montant_ht),
        montant_tva: parseFloat(formData.montant_tva) || 0
      }

      if (isEditing) {
        await AxiosInstance.put(`/factures-comptables/${id}/`, dataToSend)
      } else {
        await AxiosInstance.post('/factures-comptables/', dataToSend)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/factures-comptables')
      }, 1500)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      if (error.response?.data) {
        const errors = error.response.data
        if (typeof errors === 'object') {
          const messages = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')
          setError(messages)
        } else {
          setError('Erreur lors de la sauvegarde')
        }
      } else {
        setError('Erreur de connexion au serveur')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la facture...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/factures-comptables')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEditing ? 'Modifier la facture' : 'Nouvelle facture comptable'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditing 
                ? 'Modifiez les informations de la facture comptable'
                : 'Créez une nouvelle facture comptable client ou fournisseur'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/factures-comptables')}
            className="btn btn-ghost gap-2 btn-sm sm:btn-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            form="facture-form"
            className="btn btn-primary gap-2 btn-sm sm:btn-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Succès */}
      {success && (
        <div className="alert alert-success shadow-lg animate-slideDown">
          <CheckCircle className="w-5 h-5" />
          <div>
            <span className="font-bold">
              {isEditing ? 'Facture modifiée' : 'Facture créée'} avec succès !
            </span>
            <p className="text-sm opacity-80">Redirection vers la liste...</p>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setSuccess(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="alert alert-error shadow-lg animate-slideDown">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Erreur</span>
            <pre className="text-sm whitespace-pre-wrap mt-1">{error}</pre>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulaire */}
      <form id="facture-form" onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Type de facture */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Type de facture
                <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type_facture === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type_facture: type.value, client: '', fournisseur: '' }))}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-base-200 hover:border-primary/50 hover:bg-base-200/50'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-base-200'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : type.color}`} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-base-content'}`}>
                      {type.label}
                    </span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Agence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Agence
                <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="agence"
              value={formData.agence}
              onChange={handleChange}
              className="select select-bordered w-full focus:select-primary transition-all"
              required
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>
                  {agence.nom} ({agence.ville || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Client ou Fournisseur */}
          {formData.type_facture === 'client' ? (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Client
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom ? client.prenom : ''} {client.raison_sociale ? `(${client.raison_sociale})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Fournisseur
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="fournisseur"
                value={formData.fournisseur}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
                required
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map(fournisseur => (
                  <option key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.company_name} ({fournisseur.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date facture
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="date_facture"
                value={formData.date_facture}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date échéance
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="date_echeance"
                value={formData.date_echeance}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Montant HT
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="montant_ht"
                placeholder="0.00"
                value={formData.montant_ht}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  TVA (18%)
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="montant_tva"
                placeholder="0.00"
                value={formData.montant_tva}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Total TTC
                </span>
              </label>
              <div className="input input-bordered w-full bg-base-200/50 font-bold text-lg text-center">
                {calculerMontantTTC().toFixed(2)} FCFA
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Notes
              </span>
            </label>
            <textarea
              name="notes"
              placeholder="Informations complémentaires..."
              value={formData.notes || ''}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-20 focus:textarea-primary transition-all resize-none"
            />
          </div>

          {/* Résumé */}
          <div className="bg-base-200/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {typeOptions.find(t => t.value === formData.type_facture)?.label || 'Facture'}
                </p>
                <p className="text-xs text-base-content/40">
                  {formData.type_facture === 'client' ? 'Client' : 'Fournisseur'}: {
                    formData.type_facture === 'client' 
                      ? clients.find(c => c.id === parseInt(formData.client))?.nom || 'Non sélectionné'
                      : fournisseurs.find(f => f.id === parseInt(formData.fournisseur))?.company_name || 'Non sélectionné'
                  }
                </p>
                <p className="text-xs text-base-content/40">
                  Montant TTC: {calculerMontantTTC().toFixed(2)} FCFA
                </p>
              </div>
            </div>
          </div>
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

export default FactureComptableForm