// src/components/comptabilite/EcritureForm.jsx - Version corrigée

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  FileText,
  Hash,
  Building2,
  DollarSign,
  User,
  Notebook,
  Info,
  HelpCircle,
  Minus,
  PlusCircle,
  Search as SearchIcon
} from 'lucide-react'

const EcritureForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  // États
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [errorDetails, setErrorDetails] = useState(null)
  const [success, setSuccess] = useState(false)
  const [journaux, setJournaux] = useState([])
  const [comptes, setComptes] = useState([])
  const [agences, setAgences] = useState([])
  const [userAgenceId, setUserAgenceId] = useState(null)
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [estEquilibree, setEstEquilibree] = useState(true)

  // Données du formulaire
  const [formData, setFormData] = useState({
    journal: '',
    agence: '', // ✅ Ce champ stocke l'ID de l'agence (nombre)
    date_ecriture: new Date().toISOString().split('T')[0],
    date_comptable: new Date().toISOString().split('T')[0],
    libelle: '',
    piece_justificative: '',
    notes: '',
    lignes: [
      { compte: '', debit: '', credit: '', libelle: '' }
    ]
  })

  // ============================================================
  // 1. RÉCUPÉRATION DE L'AGENCE DE L'UTILISATEUR
  // ============================================================
  useEffect(() => {
    const getUserAgence = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('User') || '{}')
        console.log('👤 Données utilisateur:', userData)

        let agenceId = null

        // Cas 1: agence_principale
        if (userData.agence_principale) {
          agenceId = userData.agence_principale.id || userData.agence_principale
        }
        // Cas 2: agence directe
        else if (userData.agence) {
          agenceId = userData.agence.id || userData.agence
        }
        // Cas 3: liste d'agences
        else if (userData.agences && userData.agences.length > 0) {
          agenceId = userData.agences[0].id || userData.agences[0]
        }
        // Cas 4: agence_id direct
        else if (userData.agence_id) {
          agenceId = userData.agence_id
        }

        if (agenceId) {
          const id = parseInt(agenceId)
          if (!isNaN(id) && id > 0) {
            setUserAgenceId(id)
            // ✅ Stocker l'ID (nombre) dans formData.agence
            setFormData(prev => ({ 
              ...prev, 
              agence: id // ✅ C'est un nombre, pas un objet !
            }))
            console.log('✅ Agence définie avec ID:', id)
          }
        } else {
          console.warn('⚠️ Aucune agence trouvée, chargement de la liste...')
          fetchAgences()
        }
      } catch (error) {
        console.error('❌ Erreur lecture localStorage:', error)
        fetchAgences()
      }
    }

    getUserAgence()
  }, [])

  // ============================================================
  // 2. CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    fetchJournaux()
    fetchComptes()
    if (isEditing) {
      fetchEcriture()
    }
  }, [id])

  // ============================================================
  // 3. FONCTIONS API
  // ============================================================
  
  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/')
      setAgences(response.data || [])
      
      if (response.data && response.data.length === 1) {
        const agence = response.data[0]
        setUserAgenceId(agence.id)
        // ✅ Stocker l'ID (nombre)
        setFormData(prev => ({ 
          ...prev, 
          agence: agence.id // ✅ Nombre, pas objet
        }))
        console.log('✅ Agence unique sélectionnée ID:', agence.id)
      }
    } catch (error) {
      console.error('❌ Erreur chargement agences:', error)
    }
  }

  const fetchJournaux = async () => {
    try {
      const response = await AxiosInstance.get('/journaux/')
      setJournaux(response.data || [])
    } catch (error) {
      console.error('❌ Erreur chargement journaux:', error)
    }
  }

  const fetchComptes = async () => {
    try {
      const response = await AxiosInstance.get('/plan-comptable/?is_active=true')
      setComptes(response.data || [])
    } catch (error) {
      console.error('❌ Erreur chargement comptes:', error)
    }
  }

  const fetchEcriture = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(`/ecritures/${id}/`)
      const data = response.data
      
      // ✅ Récupérer l'ID de l'agence (nombre)
      const agenceId = data.agence || userAgenceId || null
      
      setFormData({
        journal: data.journal || '',
        agence: agenceId, // ✅ Nombre
        date_ecriture: data.date_ecriture || new Date().toISOString().split('T')[0],
        date_comptable: data.date_comptable || new Date().toISOString().split('T')[0],
        libelle: data.libelle || '',
        piece_justificative: data.piece_justificative || '',
        notes: data.notes || '',
        lignes: data.lignes && data.lignes.length > 0 
          ? data.lignes.map(l => ({ 
              compte: l.compte || '', 
              debit: l.debit !== undefined && l.debit !== null ? l.debit.toString() : '', 
              credit: l.credit !== undefined && l.credit !== null ? l.credit.toString() : '', 
              libelle: l.libelle || '' 
            }))
          : [{ compte: '', debit: '', credit: '', libelle: '' }]
      })
      calculateTotals(data.lignes || [])
    } catch (error) {
      console.error('❌ Erreur chargement écriture:', error)
      setError('Erreur de chargement de l\'écriture')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // 4. CALCUL DES TOTAUX
  // ============================================================
  
  const calculateTotals = (lignes) => {
    let debit = 0
    let credit = 0
    lignes.forEach(l => {
      debit += parseFloat(l.debit) || 0
      credit += parseFloat(l.credit) || 0
    })
    setTotalDebit(debit)
    setTotalCredit(credit)
    setEstEquilibree(debit === credit)
  }

  // ============================================================
  // 5. GESTION DES LIGNES
  // ============================================================
  
  const handleLigneChange = (index, field, value) => {
    const newLignes = [...formData.lignes]
    newLignes[index][field] = value
    setFormData(prev => ({ ...prev, lignes: newLignes }))
    
    let debit = 0
    let credit = 0
    newLignes.forEach(l => {
      debit += parseFloat(l.debit) || 0
      credit += parseFloat(l.credit) || 0
    })
    setTotalDebit(debit)
    setTotalCredit(credit)
    setEstEquilibree(debit === credit)
  }

  const addLigne = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, { compte: '', debit: '', credit: '', libelle: '' }]
    }))
  }

  const removeLigne = (index) => {
    if (formData.lignes.length <= 1) return
    const newLignes = formData.lignes.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, lignes: newLignes }))
    
    let debit = 0
    let credit = 0
    newLignes.forEach(l => {
      debit += parseFloat(l.debit) || 0
      credit += parseFloat(l.credit) || 0
    })
    setTotalDebit(debit)
    setTotalCredit(credit)
    setEstEquilibree(debit === credit)
  }

  // ============================================================
  // 6. SOUMISSION DU FORMULAIRE - CORRIGÉE
  // ============================================================
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setErrorDetails(null)
    setSuccess(false)

    // ✅ VALIDATION 1: Journal
    if (!formData.journal) {
      setError('Le journal est requis')
      setSaving(false)
      return
    }

    // ✅ VALIDATION 2: Libellé
    if (!formData.libelle || formData.libelle.trim() === '') {
      setError('Le libellé est requis')
      setSaving(false)
      return
    }

    // ✅ VALIDATION 3: Agence (CRITIQUE - doit être un nombre)
    if (!formData.agence) {
      setError('L\'agence est requise. Veuillez sélectionner une agence.')
      setSaving(false)
      return
    }

    // ✅ S'assurer que agence est un nombre, pas un objet
    const agenceId = typeof formData.agence === 'object' 
      ? formData.agence.id 
      : parseInt(formData.agence)
    
    if (isNaN(agenceId) || agenceId <= 0) {
      setError('L\'agence sélectionnée n\'est pas valide.')
      setSaving(false)
      return
    }

    // ✅ VALIDATION 4: Au moins une ligne valide
    const hasValidLine = formData.lignes.some(l => l.compte && (l.debit || l.credit))
    if (!hasValidLine) {
      setError('Au moins une ligne d\'écriture avec un compte et un montant est requise')
      setSaving(false)
      return
    }

    // ✅ VALIDATION 5: Chaque ligne avec montant doit avoir un compte
    for (let i = 0; i < formData.lignes.length; i++) {
      const ligne = formData.lignes[i]
      if ((parseFloat(ligne.debit) > 0 || parseFloat(ligne.credit) > 0) && !ligne.compte) {
        setError(`La ligne ${i + 1} a un montant mais pas de compte sélectionné`)
        setSaving(false)
        return
      }
    }

    // ✅ VALIDATION 6: Équilibre
    if (!estEquilibree) {
      setError('L\'écriture n\'est pas équilibrée. Total débit ≠ Total crédit')
      setSaving(false)
      return
    }

    if (totalDebit === 0 && totalCredit === 0) {
      setError('L\'écriture doit avoir au moins un montant')
      setSaving(false)
      return
    }

    // ✅ CONSTRUCTION DES DONNÉES AVEC agence EN NOMBRE
    try {
      const dataToSend = {
        journal: parseInt(formData.journal),
        agence: agenceId, // ✅ ICI c'est un nombre, pas un objet !
        date_ecriture: formData.date_ecriture,
        date_comptable: formData.date_comptable,
        libelle: formData.libelle.trim(),
        piece_justificative: formData.piece_justificative || '',
        notes: formData.notes || '',
        lignes: formData.lignes
          .filter(l => l.compte || parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)
          .map(l => ({
            compte: parseInt(l.compte),
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            libelle: l.libelle || ''
          }))
      }

      console.log('📤 Données envoyées:', JSON.stringify(dataToSend, null, 2))
      console.log('📤 Type de agence:', typeof dataToSend.agence, 'Valeur:', dataToSend.agence)

      let response
      if (isEditing) {
        response = await AxiosInstance.put(`/ecritures/${id}/`, dataToSend)
      } else {
        response = await AxiosInstance.post('/ecritures/', dataToSend)
      }

      console.log('✅ Succès:', response.data)
      setSuccess(true)
      setTimeout(() => {
        navigate('/ecritures')
      }, 1500)
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      
      if (error.response?.data) {
        const errors = error.response.data
        console.log('📋 Détails erreur:', errors)
        
        if (typeof errors === 'object') {
          const messages = Object.entries(errors)
            .map(([key, value]) => {
              if (key === 'lignes' && Array.isArray(value)) {
                return `Lignes: ${value.join(', ')}`
              }
              return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            })
            .join('\n')
          setError(messages)
          setErrorDetails(errors)
        } else if (typeof errors === 'string') {
          setError(errors)
        } else {
          setError('Erreur lors de la sauvegarde')
        }
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Erreur de connexion au serveur')
      }
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // 7. RENDU
  // ============================================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de l'écriture...
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
            onClick={() => navigate('/ecritures')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {isEditing ? 'Modifier l\'écriture' : 'Nouvelle écriture'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditing 
                ? 'Modifiez les informations de l\'écriture comptable'
                : 'Créez une nouvelle écriture comptable'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/ecritures')}
            className="btn btn-ghost gap-2 btn-sm sm:btn-md"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            form="ecriture-form"
            className="btn btn-success gap-2 btn-sm sm:btn-md shadow-lg shadow-success/20 hover:shadow-success/30 transition-all"
            disabled={saving || !estEquilibree}
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
              {isEditing ? 'Écriture modifiée' : 'Écriture créée'} avec succès !
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
            {errorDetails && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-base-content/60">Détails techniques</summary>
                <pre className="mt-1 p-2 bg-base-200 rounded overflow-auto max-h-40">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => { setError(null); setErrorDetails(null) }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulaire */}
      <form id="ecriture-form" onSubmit={handleSubmit} className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Journal, Agence, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Journal */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Journal
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="journal"
                value={formData.journal}
                onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                className="select select-bordered w-full focus:select-primary transition-all"
                required
                disabled={isEditing}
              >
                <option value="">Sélectionner un journal</option>
                {journaux.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.code} - {j.nom} {j.agence_nom ? `(${j.agence_nom})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Agence - Affichage en lecture seule avec ID */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Agence
                  <span className="text-error">*</span>
                </span>
              </label>
              
              {userAgenceId ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {agences.find(a => a.id === userAgenceId)?.nom || `Agence ${userAgenceId}`}
                  </span>
                  <span className="text-xs text-base-content/50 ml-auto">
                    ID: {userAgenceId}
                  </span>
                  <input 
                    type="hidden" 
                    name="agence" 
                    value={userAgenceId} // ✅ Valeur = ID (nombre)
                  />
                </div>
              ) : (
                <select
                  name="agence"
                  value={formData.agence || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) {
                      setUserAgenceId(parseInt(value))
                      setFormData(prev => ({ ...prev, agence: parseInt(value) }))
                    }
                  }}
                  className="select select-bordered w-full focus:select-primary transition-all"
                  required
                >
                  <option value="">Sélectionner une agence</option>
                  {agences.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nom} {a.code ? `(${a.code})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date d'écriture */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date d'écriture
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="date_ecriture"
                value={formData.date_ecriture}
                onChange={(e) => setFormData(prev => ({ ...prev, date_ecriture: e.target.value }))}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Libellé et Pièce justificative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Notebook className="w-4 h-4 text-primary" />
                  Libellé
                  <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="libelle"
                placeholder="Libellé de l'écriture..."
                value={formData.libelle}
                onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
                className="input input-bordered w-full focus:input-primary transition-all"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Pièce justificative
                </span>
              </label>
              <input
                type="text"
                name="piece_justificative"
                placeholder="N° de pièce..."
                value={formData.piece_justificative}
                onChange={(e) => setFormData(prev => ({ ...prev, piece_justificative: e.target.value }))}
                className="input input-bordered w-full focus:input-primary transition-all"
              />
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
              placeholder="Notes supplémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="textarea textarea-bordered w-full h-20 focus:textarea-primary transition-all resize-none"
            />
          </div>

          {/* Lignes d'écriture */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Lignes d'écriture
                <span className="badge badge-ghost badge-xs">
                  {formData.lignes.length} ligne(s)
                </span>
              </h3>
              <button
                type="button"
                onClick={addLigne}
                className="btn btn-primary btn-sm gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {/* En-tête du tableau */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-2">
              <div className="col-span-5 text-xs font-semibold text-base-content/60">Compte</div>
              <div className="col-span-2 text-xs font-semibold text-base-content/60 text-right">Débit</div>
              <div className="col-span-2 text-xs font-semibold text-base-content/60 text-right">Crédit</div>
              <div className="col-span-2 text-xs font-semibold text-base-content/60">Libellé</div>
              <div className="col-span-1"></div>
            </div>

            {/* Lignes */}
            {formData.lignes.map((ligne, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <select
                    value={ligne.compte}
                    onChange={(e) => handleLigneChange(index, 'compte', parseInt(e.target.value))}
                    className="select select-bordered w-full select-sm focus:select-primary transition-all"
                  >
                    <option value="">Sélectionner un compte</option>
                    {comptes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={ligne.debit}
                    onChange={(e) => handleLigneChange(index, 'debit', e.target.value)}
                    className="input input-bordered w-full input-sm text-right focus:input-primary transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={ligne.credit}
                    onChange={(e) => handleLigneChange(index, 'credit', e.target.value)}
                    className="input input-bordered w-full input-sm text-right focus:input-primary transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Libellé"
                    value={ligne.libelle}
                    onChange={(e) => handleLigneChange(index, 'libelle', e.target.value)}
                    className="input input-bordered w-full input-sm focus:input-primary transition-all"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeLigne(index)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    disabled={formData.lignes.length <= 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Total et équilibre */}
            <div className="mt-4 p-3 bg-base-200/50 rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-base-content/60">Total débit</p>
                  <p className="text-lg font-bold text-success">{totalDebit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Total crédit</p>
                  <p className="text-lg font-bold text-error">{totalCredit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Statut</p>
                  <div className="flex items-center gap-2">
                    {estEquilibree ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {totalDebit > 0 ? 'Équilibrée' : 'Aucun montant'}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-error" />
                        <span className="text-sm font-medium text-error">Non équilibrée</span>
                      </>
                    )}
                  </div>
                </div>
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

export default EcritureForm