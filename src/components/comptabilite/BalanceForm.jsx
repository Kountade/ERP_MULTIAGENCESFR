// src/components/comptabilite/BalanceForm.jsx
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
  Scale,
  BookOpen,
  Clock,
  Info,
  FileText
} from 'lucide-react'

const BalanceForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [agences, setAgences] = useState([])
  const [agenceId, setAgenceId] = useState(null)
  
  const [formData, setFormData] = useState({
    type_balance: 'generale',
    agence: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0]
  })

  const typeOptions = [
    { value: 'generale', label: 'Balance générale', icon: Scale, description: 'Tous les comptes' },
    { value: 'comptes', label: 'Balance des comptes', icon: BookOpen, description: 'Détail par compte' },
    { value: 'agee', label: 'Balance âgée', icon: Clock, description: 'Par âge des créances' }
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
    if (isEditing) {
      fetchBalance()
    }
  }, [id])

  const fetchBalance = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/balances/${id}/`)
      const data = response.data
      setFormData({
        type_balance: data.type_balance || 'generale',
        agence: data.agence || agenceId || '',
        date_debut: data.date_debut || new Date().toISOString().split('T')[0],
        date_fin: data.date_fin || new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Erreur chargement balance:', error)
      setError('Erreur de chargement de la balance')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
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
    if (!formData.date_debut) {
      setError('La date de début est requise')
      setSaving(false)
      return
    }
    if (!formData.date_fin) {
      setError('La date de fin est requise')
      setSaving(false)
      return
    }

    try {
      if (isEditing) {
        await AxiosInstance.put(`/balances/${id}/`, formData)
      } else {
        await AxiosInstance.post('/balances/', formData)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/balances')
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
          setError('Erreur lors de la génération')
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
            Chargement de la balance...
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
            onClick={() => navigate('/balances')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEditing ? 'Modifier la balance' : 'Générer une balance'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditing 
                ? 'Modifiez les informations de la balance'
                : 'Générez une nouvelle balance comptable'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/balances')}
            className="btn btn-ghost gap-2 btn-sm sm:btn-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            form="balance-form"
            className="btn btn-primary gap-2 btn-sm sm:btn-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Mettre à jour' : 'Générer'}
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
              {isEditing ? 'Balance modifiée' : 'Balance générée'} avec succès !
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
      <form id="balance-form" onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Type de balance */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                Type de balance
                <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {typeOptions.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type_balance === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type_balance: type.value }))}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-base-200 hover:border-primary/50 hover:bg-base-200/50'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-base-200'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-base-content/40'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-base-content'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-base-content/40">{type.description}</p>
                    </div>
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
              disabled={isEditing}
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>
                  {agence.nom} ({agence.ville || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date début
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date fin
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-base-200/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {typeOptions.find(t => t.value === formData.type_balance)?.label || 'Balance'}
                </p>
                <p className="text-xs text-base-content/40">
                  Période du {new Date(formData.date_debut).toLocaleDateString('fr-FR')} 
                  {' '}au {new Date(formData.date_fin).toLocaleDateString('fr-FR')}
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

export default BalanceForm