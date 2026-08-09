// src/components/tresorerie/CaissesForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft, Save, X, AlertCircle, CheckCircle, Loader2,
  Coins, Wallet, User, Building2, DollarSign, Shield,
  RefreshCw, Trash2
} from 'lucide-react'

const CaissesForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [agences, setAgences] = useState([])
  const [users, setUsers] = useState([])
  const [autresCaisses, setAutresCaisses] = useState([])
  const [caisseOriginale, setCaisseOriginale] = useState(null)

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_caisse: 'principale',
    agence: '',
    responsable: '',
    solde_initial: 0,
    seuil_min: 0,
    seuil_max: 0,
    is_active: true,
    is_default: false,
    description: ''
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

        // Charger les utilisateurs
        const usersRes = await AxiosInstance.get('/users/')
        setUsers(usersRes.data || [])

        // Si édition, charger les données de la caisse
        if (isEdit) {
          const caisseRes = await AxiosInstance.get(`/caisses/${id}/`)
          const data = caisseRes.data
          setCaisseOriginale(data)
          
          setFormData({
            code: data.code || '',
            nom: data.nom || '',
            type_caisse: data.type_caisse || 'principale',
            agence: data.agence || '',
            responsable: data.responsable || '',
            solde_initial: parseFloat(data.solde_initial) || 0,
            seuil_min: parseFloat(data.seuil_min) || 0,
            seuil_max: parseFloat(data.seuil_max) || 0,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_default: data.is_default || false,
            description: data.description || ''
          })

          // Charger les autres caisses de la même agence
          if (data.agence) {
            const caissesRes = await AxiosInstance.get(`/caisses/?agence=${data.agence}`)
            setAutresCaisses(caissesRes.data.filter(c => c.id !== parseInt(id)) || [])
          }
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

  // Recharger les autres caisses quand l'agence change
  useEffect(() => {
    const fetchAutresCaisses = async () => {
      if (formData.agence && !isEdit) {
        try {
          const caissesRes = await AxiosInstance.get(`/caisses/?agence=${formData.agence}`)
          setAutresCaisses(caissesRes.data || [])
        } catch (error) {
          console.error('Erreur chargement caisses:', error)
        }
      }
    }
    fetchAutresCaisses()
  }, [formData.agence, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // ✅ Si on change l'agence, réinitialiser is_default si nécessaire
    if (name === 'agence') {
      const hasDefaultInNewAgence = autresCaisses.some(c => c.is_default === true)
      setFormData(prev => ({
        ...prev,
        agence: value,
        is_default: hasDefaultInNewAgence ? false : prev.is_default
      }))
      return
    }

    // ✅ Si on active/désactive is_default
    if (name === 'is_default') {
      // Si on coche "par défaut", on doit s'assurer qu'il n'y a pas de conflit
      if (checked) {
        // Désactiver is_default sur toutes les autres caisses de la même agence
        setAutresCaisses(prev => 
          prev.map(c => ({ ...c, is_default: false }))
        )
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ✅ Vérifier si c'est la seule caisse active de l'agence
  const estSeuleCaisseActive = () => {
    if (!isEdit) return false
    const autresActives = autresCaisses.filter(c => c.is_active === true)
    return autresActives.length === 0 && formData.is_active === true
  }

  // ✅ Vérifier si c'est la seule caisse par défaut
  const estSeuleCaisseParDefaut = () => {
    if (!isEdit) return false
    const autresParDefaut = autresCaisses.filter(c => c.is_default === true)
    return autresParDefaut.length === 0 && formData.is_default === true
  }

  // ✅ Vérifier si on peut désactiver is_default
  const peutDesactiverParDefaut = () => {
    if (!isEdit) return true
    // Si c'est la seule caisse par défaut, on ne peut pas la désactiver
    if (estSeuleCaisseParDefaut()) return false
    // Sinon, on peut la désactiver
    return true
  }

  // ✅ Vérifier si on peut désactiver la caisse
  const peutDesactiverCaisse = () => {
    if (!isEdit) return true
    // Si c'est la seule caisse active, on ne peut pas la désactiver
    if (estSeuleCaisseActive()) return false
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validation
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

      // ✅ Vérifier qu'il y a au moins une caisse par défaut
      const hasDefault = formData.is_default || autresCaisses.some(c => c.is_default === true)
      if (!hasDefault && formData.is_active) {
        setError('⚠️ Attention : Il doit y avoir au moins une caisse par défaut active par agence')
        setSaving(false)
        return
      }

      const dataToSend = {
        ...formData,
        solde_initial: parseFloat(formData.solde_initial) || 0,
        seuil_min: parseFloat(formData.seuil_min) || 0,
        seuil_max: parseFloat(formData.seuil_max) || 0
      }

      let response
      if (isEdit) {
        response = await AxiosInstance.put(`/caisses/${id}/`, dataToSend)
        showNotification('✅ Caisse modifiée avec succès', 'success')
      } else {
        response = await AxiosInstance.post('/caisses/', dataToSend)
        showNotification('✅ Caisse créée avec succès', 'success')
      }

      setTimeout(() => navigate('/caisses'), 1500)

    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      
      let msg = 'Erreur lors de la sauvegarde'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = Object.values(error.response.data).flat()
          msg = errors.join(', ')
        } else {
          msg = error.response.data.message || error.response.data
        }
      }
      
      setError(msg)
      showNotification('❌ ' + msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            {isEdit ? 'Chargement de la caisse...' : 'Préparation du formulaire...'}
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
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/caisses')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEdit ? '✏️ Modifier la caisse' : '💰 Nouvelle caisse'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEdit ? 'Modifiez les informations de la caisse' : 'Créez une nouvelle caisse'}
            </p>
          </div>
        </div>
        
        {/* Indicateur de statut par défaut */}
        {isEdit && (
          <div className="flex items-center gap-2">
            {formData.is_default && (
              <div className="badge badge-primary badge-lg gap-2">
                <Shield className="w-4 h-4" />
                Caisse par défaut
              </div>
            )}
            {!formData.is_default && estSeuleCaisseActive() && (
              <div className="badge badge-warning badge-lg gap-2">
                <AlertCircle className="w-4 h-4" />
                Seule caisse active
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4 sm:p-6">
        {error && (
          <div className="alert alert-error mb-4 shadow-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Coins className="w-4 h-4 text-primary" />
                Code <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: CAI-001"
              className="input input-bordered w-full"
              required
              disabled={isEdit}
            />
            {isEdit && (
              <span className="text-xs text-base-content/50 mt-1">Le code ne peut pas être modifié</span>
            )}
          </div>

          {/* Nom */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Wallet className="w-4 h-4 text-primary" />
                Nom <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Caisse Principale"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Type de caisse */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Type de caisse</span>
            </label>
            <select
              name="type_caisse"
              value={formData.type_caisse}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="principale">🏦 Principale</option>
              <option value="secondaire">🏢 Secondaire</option>
              <option value="mobile">📱 Mobile</option>
              <option value="virtuelle">💻 Virtuelle</option>
            </select>
          </div>

          {/* Agence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Building2 className="w-4 h-4 text-primary" />
                Agence <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="agence"
              value={formData.agence}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
              disabled={isEdit}
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>{agence.nom}</option>
              ))}
            </select>
            {isEdit && (
              <span className="text-xs text-base-content/50 mt-1">L'agence ne peut pas être modifiée</span>
            )}
          </div>

          {/* Responsable */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <User className="w-4 h-4 text-primary" />
                Responsable
              </span>
            </label>
            <select
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Sélectionner un responsable</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Solde initial */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-primary" />
                Solde initial
              </span>
            </label>
            <input
              type="number"
              name="solde_initial"
              value={formData.solde_initial}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              min="0"
            />
          </div>

          {/* Seuil min */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                ⬇️ Seuil minimum
              </span>
            </label>
            <input
              type="number"
              name="seuil_min"
              value={formData.seuil_min}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              min="0"
            />
            <span className="text-xs text-base-content/50 mt-1">
              Alerte si le solde descend en dessous
            </span>
          </div>

          {/* Seuil max */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                ⬆️ Seuil maximum
              </span>
            </label>
            <input
              type="number"
              name="seuil_max"
              value={formData.seuil_max}
              onChange={handleChange}
              placeholder="0"
              className="input input-bordered w-full"
              step="0.01"
              min="0"
            />
            <span className="text-xs text-base-content/50 mt-1">
              Alerte si le solde dépasse ce seuil
            </span>
          </div>

          {/* Options */}
          <div className="form-control col-span-1 md:col-span-2">
            <div className="flex flex-wrap gap-6 mt-2 p-4 bg-base-200/50 rounded-xl">
              <label className="label cursor-pointer gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                  disabled={!peutDesactiverCaisse()}
                />
                <div>
                  <span className="label-text font-medium">Caisse active</span>
                  {!peutDesactiverCaisse() && (
                    <p className="text-xs text-warning">
                      ⚠️ Seule caisse active - ne peut pas être désactivée
                    </p>
                  )}
                </div>
              </label>

              <label className="label cursor-pointer gap-3">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                  disabled={!peutDesactiverParDefaut()}
                />
                <div>
                  <span className="label-text font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4 text-primary" />
                    Caisse par défaut
                  </span>
                  {!peutDesactiverParDefaut() && (
                    <p className="text-xs text-warning">
                      ⚠️ Seule caisse par défaut - ne peut pas être désactivée
                    </p>
                  )}
                  {formData.is_default && (
                    <p className="text-xs text-success">
                      ✅ Utilisée par défaut pour les paiements
                    </p>
                  )}
                  {!formData.is_default && autresCaisses.some(c => c.is_default === true) && (
                    <p className="text-xs text-info">
                      ℹ️ Une autre caisse est déjà définie comme par défaut
                    </p>
                  )}
                  {!formData.is_default && !autresCaisses.some(c => c.is_default === true) && formData.is_active && (
                    <p className="text-xs text-warning">
                      ⚠️ Aucune caisse par défaut - cochez cette option si c'est la seule caisse active
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-control col-span-1 md:col-span-2">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de la caisse..."
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>
        </div>

        {/* Résumé des caisses de l'agence */}
        {formData.agence && (autresCaisses.length > 0 || isEdit) && (
          <div className="mt-6 p-4 bg-base-200/30 rounded-xl border border-base-200">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Caisses de cette agence
            </h4>
            <div className="flex flex-wrap gap-2">
              {isEdit && (
                <div className={`badge badge-lg ${formData.is_active ? 'badge-primary' : 'badge-ghost'}`}>
                  {formData.nom} {formData.is_default && '⭐'} {!formData.is_active && '(inactive)'}
                  <span className="ml-1 text-xs opacity-50">(en cours)</span>
                </div>
              )}
              {autresCaisses.map(c => (
                <div key={c.id} className={`badge badge-lg ${c.is_active ? 'badge-secondary' : 'badge-ghost'}`}>
                  {c.nom} {c.is_default && '⭐'} {!c.is_active && '(inactive)'}
                </div>
              ))}
              {autresCaisses.length === 0 && !isEdit && (
                <span className="text-xs text-base-content/50">Aucune autre caisse dans cette agence</span>
              )}
            </div>
            <p className="text-xs text-base-content/50 mt-2">
              ⭐ = Caisse par défaut
            </p>
          </div>
        )}

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
            onClick={() => navigate('/caisses')}
            className="btn btn-ghost gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          {isEdit && formData.is_active && (
            <button
              type="button"
              className="btn btn-error btn-outline gap-2 ml-auto"
              onClick={() => {
                if (window.confirm(`⚠️ Êtes-vous sûr de vouloir désactiver la caisse "${formData.nom}" ?\n\nSi c'est la seule caisse active, cette action sera refusée.`)) {
                  setFormData(prev => ({
                    ...prev,
                    is_active: false
                  }))
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Désactiver
            </button>
          )}
        </div>
      </form>

      {/* Style pour l'animation */}
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

export default CaissesForm