// src/components/comptabilite/JournalForm.jsx
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
  Hash,
  Tag,
  BookOpen,
  Building2,
  Info,
  FileText,
  Settings,
  Layers,
  Calendar,
  Shield,
  LayoutGrid
} from 'lucide-react'

const JournalForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [agences, setAgences] = useState([])
  
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_journal: 'od',
    agence: '',
    is_active: true,
    is_default: false,
    description: ''
  })

  const typeOptions = [
    { value: 'achats', label: 'Achats', icon: FileText },
    { value: 'ventes', label: 'Ventes', icon: FileText },
    { value: 'banque', label: 'Banque', icon: Building2 },
    { value: 'caisse', label: 'Caisse', icon: Layers },
    { value: 'od', label: 'Opérations diverses', icon: Settings },
    { value: 'inventaire', label: 'Inventaire', icon: LayoutGrid },
    { value: 'paie', label: 'Paie', icon: Calendar },
    { value: 'immobilisations', label: 'Immobilisations', icon: Shield }
  ]

  useEffect(() => {
    fetchAgences()
    if (isEditing) {
      fetchJournal()
    }
  }, [id])

  const fetchJournal = async () => {
    setLoading(true)
    try {
      // ✅ URL CORRECTE - SANS /comptabilite/
      const response = await AxiosInstance.get(`/journaux/${id}/`)
      const data = response.data
      setFormData({
        code: data.code || '',
        nom: data.nom || '',
        type_journal: data.type_journal || 'od',
        agence: data.agence || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_default: data.is_default || false,
        description: data.description || ''
      })
    } catch (error) {
      console.error('Erreur chargement journal:', error)
      setError('Erreur de chargement du journal')
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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    if (!formData.code) {
      setError('Le code est requis')
      setSaving(false)
      return
    }
    if (!formData.nom) {
      setError('Le nom est requis')
      setSaving(false)
      return
    }
    if (!formData.agence) {
      setError('L\'agence est requise')
      setSaving(false)
      return
    }

    try {
      if (isEditing) {
        // ✅ URL CORRECTE - SANS /comptabilite/
        await AxiosInstance.put(`/journaux/${id}/`, formData)
      } else {
        // ✅ URL CORRECTE - SANS /comptabilite/
        await AxiosInstance.post('/journaux/', formData)
      }

      setSuccess(true)
      setTimeout(() => {
        // ✅ RETOUR VERS /journaux
        navigate('/journaux')
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

  // ✅ RETOUR VERS LA LISTE
  const handleCancel = () => {
    navigate('/journaux')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du journal...
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
            onClick={handleCancel}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEditing ? 'Modifier le journal' : 'Nouveau journal'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditing 
                ? 'Modifiez les informations du journal comptable'
                : 'Créez un nouveau journal comptable'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-ghost gap-2 btn-sm sm:btn-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            form="journal-form"
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
              {isEditing ? 'Journal modifié' : 'Journal créé'} avec succès !
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
      <form id="journal-form" onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Code et Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Code du journal
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="code"
                placeholder="Ex: ACH, VEN, BAN, CAI, OD..."
                value={formData.code}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all font-mono"
                required
                disabled={isEditing}
              />
              {isEditing && (
                <p className="text-xs text-base-content/40 mt-1">Le code ne peut pas être modifié</p>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Nom du journal
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="nom"
                placeholder="Ex: Journal des achats..."
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Type et Agence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Type de journal
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="type_journal"
                value={formData.type_journal}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
                required
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-medium">Journal actif</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-medium">Journal par défaut</span>
              </label>
              <p className="text-xs text-base-content/40 mt-1">Un seul journal par défaut par agence</p>
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Description
              </span>
            </label>
            <textarea
              name="description"
              placeholder="Description détaillée du journal..."
              value={formData.description || ''}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-24 focus:textarea-primary transition-all resize-none"
            />
          </div>

          {/* Type de journal actuel (affichage) */}
          <div className="bg-base-200/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-primary/10`}>
                {typeOptions.find(t => t.value === formData.type_journal)?.icon && 
                  React.createElement(
                    typeOptions.find(t => t.value === formData.type_journal).icon,
                    { className: 'w-5 h-5 text-primary' }
                  )
                }
              </div>
              <div>
                <p className="text-sm font-medium">
                  {typeOptions.find(t => t.value === formData.type_journal)?.label || formData.type_journal}
                </p>
                <p className="text-xs text-base-content/40">
                  Journal {formData.is_active ? 'actif' : 'inactif'}
                  {formData.is_default && ' - Journal par défaut'}
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

export default JournalForm