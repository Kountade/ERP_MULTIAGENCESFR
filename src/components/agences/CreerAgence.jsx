// src/components/agence/CreerAgence.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  Save,
  Store,
  Building,
  AlertCircle,
  ChevronRight,
  Globe,
  Home,
  Briefcase,
  Users,
  Shield,
  Sparkles,
  Clock,
  UserCheck,
  Package,
  Trophy,
  XCircle
} from 'lucide-react'

const CreerAgence = () => {
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    type_agence: 'secondaire',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    telephone: '',
    email: '',
    responsable: '',
    horaires: '',
    capacite_stock: '',
    description: ''
  })

  const steps = [
    { name: 'Informations', icon: Building2 },
    { name: 'Coordonnées', icon: MapPin },
    { name: 'Détails', icon: Briefcase },
    { name: 'Validation', icon: CheckCircle }
  ]

  const typeAgenceInfo = {
    principale: {
      label: 'Agence Principale',
      icon: Building,
      color: 'primary',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      borderColor: 'border-primary',
      roles: ['Chef d\'agence', 'Commercial', 'Gestionnaire stock', 'Comptable'],
      description: 'Agence mère avec gestion complète',
      features: ['Gestion multi-sites', 'Tableaux de bord consolidés', 'Reporting global']
    },
    secondaire: {
      label: 'Agence Secondaire',
      icon: Store,
      color: 'accent',
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      borderColor: 'border-accent',
      roles: ['Chef d\'agence', 'Gestionnaire de stock', 'Commercial'],
      description: 'Agence satellite avec gestion déléguée',
      features: ['Gestion locale', 'Stocks dédiés', 'Ventes locales']
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.nom.trim()) {
        setError('Le nom de l\'agence est requis')
        return false
      }
      if (formData.nom.length < 3) {
        setError('Le nom doit contenir au moins 3 caractères')
        return false
      }
    }
    
    if (activeStep === 1) {
      if (!formData.adresse.trim()) {
        setError('L\'adresse est requise')
        return false
      }
      if (!formData.ville.trim()) {
        setError('La ville est requise')
        return false
      }
      if (!formData.telephone.trim()) {
        setError('Le téléphone est requis')
        return false
      }
      if (!formData.email.trim()) {
        setError('L\'email est requis')
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Email invalide')
        return false
      }
    }
    
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await AxiosInstance.post('/agences/', formData)
      console.log('Succès:', response.data)
      setSuccess(`L'agence "${formData.nom}" a été créée avec succès !`)
      setTimeout(() => {
        navigate('/agences')
      }, 2000)
    } catch (err) {
      console.error('Erreur:', err)
      if (err.response?.status === 403) {
        setError('Vous n\'avez pas les droits pour créer une agence. Seul le PDG peut le faire.')
      } else if (err.response?.data?.nom) {
        setError('Une agence avec ce nom existe déjà')
      } else if (err.response?.data?.email) {
        setError('Cet email est déjà utilisé')
      } else {
        setError('Erreur lors de la création. Vérifiez que vous êtes connecté en tant que PDG.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Nom de l'agence <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  placeholder="Ex: Agence Centrale Paris"
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Type d'agence <span className="text-error">*</span>
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(typeAgenceInfo).map(([type, info]) => {
                  const Icon = info.icon
                  const isSelected = formData.type_agence === type
                  return (
                    <label
                      key={type}
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected 
                          ? `${info.borderColor} ${info.bgColor} shadow-md` 
                          : 'border-base-200 hover:border-base-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="type_agence"
                        value={type}
                        checked={isSelected}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? info.bgColor : 'bg-base-200'}`}>
                          <Icon className={`h-6 w-6 ${isSelected ? info.textColor : 'text-base-content/50'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isSelected ? info.textColor : 'text-base-content'}`}>
                            {info.label}
                          </h3>
                          <p className="text-xs text-base-content/50 mt-1">{info.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {info.roles.slice(0, 3).map((role, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-base-200 rounded-full text-base-content/70">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="textarea textarea-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                placeholder="Description de l'agence (optionnel)"
              />
            </div>
          </div>
        )
      
      case 1:
        return (
          <div className="space-y-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Adresse <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  rows="2"
                  className="textarea textarea-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  placeholder="Numéro et nom de rue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Code postal</span>
                </label>
                <input
                  type="text"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  placeholder="75001"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">
                    Ville <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Pays</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">
                    Téléphone <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Email <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  placeholder="contact@agence.com"
                />
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-5">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Responsable de l'agence</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  placeholder="Nom du responsable"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Horaires d'ouverture</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    name="horaires"
                    value={formData.horaires}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    placeholder="Lun-Ven: 9h-18h"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">Capacité de stock (m²)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="number"
                    name="capacite_stock"
                    value={formData.capacite_stock}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    placeholder="Surface en m²"
                  />
                </div>
              </div>
            </div>

            <div className="alert bg-info/10 border border-info/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-info-content">Informations importantes</p>
                  <p className="text-xs text-info-content/70 mt-1">
                    Les champs marqués d'un <span className="text-error">*</span> sont obligatoires. 
                    Vous pourrez ajouter des utilisateurs après la création.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 3:
        const currentType = typeAgenceInfo[formData.type_agence]
        const TypeIcon = currentType.icon
        return (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl p-5 border border-primary/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-base-200">
                <div className={`p-3 rounded-xl ${currentType.bgColor}`}>
                  <TypeIcon className={`h-7 w-7 ${currentType.textColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-base-content">{formData.nom}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${currentType.bgColor} ${currentType.textColor}`}>
                      {currentType.label}
                    </span>
                    {formData.responsable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-base-200 text-base-content/70">
                        <UserCheck className="w-3 h-3" />
                        {formData.responsable}
                      </span>
                    )}
                  </div>
                </div>
                <div className="badge badge-primary badge-md">Nouvelle</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </p>
                  <div className="bg-base-100 rounded-lg p-3 border border-base-200">
                    <p className="text-sm text-base-content">
                      {formData.adresse}<br />
                      {formData.code_postal && `${formData.code_postal} `}{formData.ville}<br />
                      {formData.pays}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact
                  </p>
                  <div className="bg-base-100 rounded-lg p-3 border border-base-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-base-content/50" />
                      <span className="text-base-content">{formData.telephone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-base-content/50" />
                      <span className="text-base-content">{formData.email || 'Non renseigné'}</span>
                    </div>
                    {formData.horaires && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-base-content/50" />
                        <span className="text-base-content">{formData.horaires}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-base-200">
                <p className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Rôles disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentType.roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-base-200 text-base-content/80 text-sm rounded-lg">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="alert bg-success/10 border border-success/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-success-content">Prêt à créer l'agence</h3>
                  <p className="text-xs text-success-content/70 mt-1">
                    Vérifiez que toutes les informations sont correctes avant la création.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Bouton de retour vers la liste des agences */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/agences')}
              className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la liste des agences
            </button>
          </div>

          {/* En-tête */}
          <div className="text-center mb-5">
            <div className="inline-flex p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg mb-2">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-base-content">Créer une nouvelle agence</h1>
            <p className="text-sm text-base-content/60 mt-1">Remplissez les informations ci-dessous pour créer une agence</p>
          </div>

          {/* Carte principale */}
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden border border-primary/20">
            
            {/* Stepper */}
            <div className="px-6 py-3 border-b border-base-200 bg-base-100">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index === activeStep
                  const isCompleted = index < activeStep
                  
                  return (
                    <div key={index} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          transition-all duration-300
                          ${isCompleted 
                            ? 'bg-success text-success-content' 
                            : isActive 
                              ? 'bg-primary text-primary-content ring-4 ring-primary/20' 
                              : 'bg-base-200 text-base-content/50'
                          }
                        `}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-base-content/50'}`}>
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2">
                          <div className={`h-full transition-all duration-300 ${index < activeStep ? 'bg-success' : 'bg-base-200'}`}></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contenu */}
            <div className="p-5">
              
              {/* Messages */}
              {error && (
                <div className="alert alert-error shadow-lg mb-4 rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                  <button onClick={() => setError('')} className="btn btn-sm btn-ghost">✕</button>
                </div>
              )}

              {success && (
                <div className="alert alert-success shadow-lg mb-4 rounded-xl">
                  <CheckCircle className="h-5 w-5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Contenu de l'étape */}
              <div className="min-h-[400px]">
                {getStepContent(activeStep)}
              </div>

              {/* Boutons de navigation */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-base-200">
                <button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  className="btn btn-outline gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                
                {activeStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-primary gap-2 px-6 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Créer l'agence
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn btn-primary gap-2 px-6 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreerAgence