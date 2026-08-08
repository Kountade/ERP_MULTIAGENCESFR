// src/components/comptabilite/PlanComptableForm.jsx
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
  FolderOpen,
  Shield,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Info,
  Building2
} from 'lucide-react'

const PlanComptableForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [comptesParents, setComptesParents] = useState([])
  
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_compte: 'actif',
    parent: '',
    niveau: 1,
    classe: '',
    sous_classe: '',
    solde_normal: 'debiteur',
    is_active: true,
    is_analytique: false,
    description: ''
  })

  const typeOptions = [
    { value: 'actif', label: 'Actif', icon: FolderOpen, color: 'text-blue-500' },
    { value: 'passif', label: 'Passif', icon: Shield, color: 'text-orange-500' },
    { value: 'capitaux', label: 'Capitaux propres', icon: PiggyBank, color: 'text-purple-500' },
    { value: 'charges', label: 'Charges', icon: TrendingDown, color: 'text-red-500' },
    { value: 'produits', label: 'Produits', icon: TrendingUp, color: 'text-green-500' }
  ]

  const soldeOptions = [
    { value: 'debiteur', label: 'Débiteur' },
    { value: 'crediteur', label: 'Créditeur' }
  ]

  const niveauOptions = [
    { value: 1, label: 'Classe' },
    { value: 2, label: 'Compte' },
    { value: 3, label: 'Sous-compte' },
    { value: 4, label: 'Sous-sous-compte' }
  ]

  const typeLabels = {
    actif: 'Actif',
    passif: 'Passif',
    capitaux: 'Capitaux propres',
    charges: 'Charges',
    produits: 'Produits'
  }

  useEffect(() => {
    fetchComptesParents()
    if (isEditing) {
      fetchCompte()
    }
  }, [id])

  const fetchCompte = async () => {
    setLoading(true)
    try {
      // ✅ URL CORRECTE
      const response = await AxiosInstance.get(`/plan-comptable/${id}/`)
      const data = response.data
      setFormData({
        code: data.code || '',
        nom: data.nom || '',
        type_compte: data.type_compte || 'actif',
        parent: data.parent || '',
        niveau: data.niveau || 1,
        classe: data.classe || '',
        sous_classe: data.sous_classe || '',
        solde_normal: data.solde_normal || 'debiteur',
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_analytique: data.is_analytique || false,
        description: data.description || ''
      })
    } catch (error) {
      console.error('Erreur chargement compte:', error)
      setError('Erreur de chargement du compte')
    } finally {
      setLoading(false)
    }
  }

  const fetchComptesParents = async () => {
    try {
      // ✅ URL CORRECTE
      const response = await AxiosInstance.get('/plan-comptable/?is_active=true')
      const data = response.data || []
      const parents = data.filter(c => c.niveau < 4 && c.id !== parseInt(id))
      setComptesParents(parents)
    } catch (error) {
      console.error('Erreur chargement comptes parents:', error)
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

    try {
      const dataToSend = { ...formData }
      if (dataToSend.parent === '' || dataToSend.parent === 'null') {
        dataToSend.parent = null
      }

      if (isEditing) {
        // ✅ URL CORRECTE
        await AxiosInstance.put(`/plan-comptable/${id}/`, dataToSend)
      } else {
        // ✅ URL CORRECTE
        await AxiosInstance.post('/plan-comptable/', dataToSend)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/plan-comptable')
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
            Chargement du compte...
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
            onClick={() => navigate('/plan-comptable')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEditing ? 'Modifier le compte' : 'Nouveau compte'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditing 
                ? 'Modifiez les informations du compte comptable'
                : 'Créez un nouveau compte dans le plan comptable'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/plan-comptable')}
            className="btn btn-ghost gap-2 btn-sm sm:btn-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            form="compte-form"
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
              {isEditing ? 'Compte modifié' : 'Compte créé'} avec succès !
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
      <form id="compte-form" onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Code et Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Code du compte
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="code"
                placeholder="Ex: 411, 701, 601..."
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
                  Nom du compte
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="nom"
                placeholder="Ex: Clients, Ventes, Achats..."
                value={formData.nom}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Type et Niveau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  Type de compte
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="type_compte"
                value={formData.type_compte}
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
                  <Info className="w-4 h-4 text-primary" />
                  Niveau
                </span>
              </label>
              <select
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
              >
                {niveauOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Parent et Solde */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Compte parent
                </span>
              </label>
              <select
                name="parent"
                value={formData.parent || ''}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
              >
                <option value="">Aucun (compte racine)</option>
                {comptesParents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.nom} ({typeLabels[c.type_compte] || c.type_compte})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Solde normal
                </span>
              </label>
              <select
                name="solde_normal"
                value={formData.solde_normal}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
              >
                {soldeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                <span className="label-text font-medium">Compte actif</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="is_analytique"
                  checked={formData.is_analytique}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-medium">Compte analytique</span>
              </label>
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
              placeholder="Description détaillée du compte..."
              value={formData.description || ''}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-24 focus:textarea-primary transition-all resize-none"
            />
          </div>

          {/* Type de compte actuel */}
          <div className="bg-base-200/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-primary/10`}>
                {typeOptions.find(t => t.value === formData.type_compte)?.icon && 
                  React.createElement(
                    typeOptions.find(t => t.value === formData.type_compte).icon,
                    { className: `w-5 h-5 ${typeOptions.find(t => t.value === formData.type_compte).color}` }
                  )
                }
              </div>
              <div>
                <p className="text-sm font-medium">
                  {typeOptions.find(t => t.value === formData.type_compte)?.label || formData.type_compte}
                </p>
                <p className="text-xs text-base-content/40">
                  Solde normal: {soldeOptions.find(s => s.value === formData.solde_normal)?.label || formData.solde_normal}
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

export default PlanComptableForm