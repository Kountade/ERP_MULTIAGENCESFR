// src/components/drh/EmployeeForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Save,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  PhoneCall,
  Heart,
  Home,
  CreditCard,
  Globe,
  Badge
} from 'lucide-react'

const EmployeeForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [managers, setManagers] = useState([])
  const [errors, setErrors] = useState({})
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [touched, setTouched] = useState({})

  // ✅ TOUS les champs du modèle Employee
  const [formData, setFormData] = useState({
    // Identité
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: 'Dakar',
    nationality: 'Sénégalaise',
    gender: '',
    marital_status: '',
    social_security_number: '',
    
    // Adresse
    address: '',
    city: 'Dakar',
    postal_code: '',
    country: 'Sénégal',
    
    // Professionnel
    department: '',
    position: '',
    manager: '',
    hire_date: '',
    contract_type: 'cdi',
    contract_end_date: '',
    probation_end_date: '',
    work_status: 'active',
    base_salary: '',
    hourly_rate: '',
    
    // Banque
    bank_account: '',
    bank_name: '',
    
    // Avantages
    meal_vouchers: false,
    health_insurance: false,
    company_car: false,
    phone_allowance: 0,
    transport_allowance: 0,
    
    // Contact urgence
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    emergency_contact_email: '',
    
    // Autres
    notes: ''
  })

  const contractTypes = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'internship', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'temporary', label: 'Intérim' },
    { value: 'apprentice', label: 'Alternant' }
  ]

  const workStatuses = [
    { value: 'active', label: 'Actif', icon: CheckCircle },
    { value: 'inactive', label: 'Inactif', icon: X },
    { value: 'on_leave', label: 'En congé', icon: Calendar },
    { value: 'sick', label: 'Maladie', icon: AlertCircle },
    { value: 'remote', label: 'Télétravail', icon: Home },
    { value: 'suspended', label: 'Suspendu', icon: AlertCircle },
    { value: 'terminated', label: 'Licencié', icon: X }
  ]

  const genders = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' },
    { value: 'other', label: 'Autre' }
  ]

  const maritalStatuses = [
    { value: 'single', label: 'Célibataire' },
    { value: 'married', label: 'Marié(e)' },
    { value: 'divorced', label: 'Divorcé(e)' },
    { value: 'widowed', label: 'Veuf/Veuve' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depts, pos, emps] = await Promise.all([
          AxiosInstance.get('/departments/'),
          AxiosInstance.get('/positions/'),
          AxiosInstance.get('/employees/')
        ])
        setDepartments(depts.data || [])
        setPositions(pos.data || [])
        setManagers(emps.data || [])
      } catch (error) { 
        console.error('Erreur chargement:', error)
      }
    }
    fetchData()

    if (isEditMode) {
      AxiosInstance.get(`/employees/${id}/`)
        .then(res => {
          const emp = res.data
          setFormData({
            first_name: emp.user?.first_name || '',
            last_name: emp.user?.last_name || '',
            email: emp.user?.email || '',
            phone: emp.user?.phone || '',
            birth_date: emp.birth_date || '',
            birth_place: emp.birth_place || 'Dakar',
            nationality: emp.nationality || 'Sénégalaise',
            gender: emp.gender || '',
            marital_status: emp.marital_status || '',
            social_security_number: emp.social_security_number || '',
            address: emp.address || '',
            city: emp.city || 'Dakar',
            postal_code: emp.postal_code || '',
            country: emp.country || 'Sénégal',
            department: emp.department?.id?.toString() || '',
            position: emp.position?.id?.toString() || '',
            manager: emp.manager?.id?.toString() || '',
            hire_date: emp.hire_date || '',
            contract_type: emp.contract_type || 'cdi',
            contract_end_date: emp.contract_end_date || '',
            probation_end_date: emp.probation_end_date || '',
            work_status: emp.work_status || 'active',
            base_salary: emp.base_salary || '',
            hourly_rate: emp.hourly_rate || '',
            bank_account: emp.bank_account || '',
            bank_name: emp.bank_name || '',
            meal_vouchers: emp.meal_vouchers || false,
            health_insurance: emp.health_insurance || false,
            company_car: emp.company_car || false,
            phone_allowance: emp.phone_allowance || 0,
            transport_allowance: emp.transport_allowance || 0,
            emergency_contact_name: emp.emergency_contact_name || '',
            emergency_contact_phone: emp.emergency_contact_phone || '',
            emergency_contact_relation: emp.emergency_contact_relation || '',
            emergency_contact_email: emp.emergency_contact_email || '',
            notes: emp.notes || ''
          })
        })
        .catch(console.error)
        .finally(() => setInitialLoading(false))
    } else {
      setInitialLoading(false)
    }
  }, [id, isEditMode])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const finalValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({ ...prev, [name]: finalValue }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.first_name?.trim()) newErrors.first_name = 'Prénom requis'
    if (!formData.last_name?.trim()) newErrors.last_name = 'Nom requis'
    if (!formData.email?.trim()) newErrors.email = 'Email requis'
    if (!formData.hire_date) newErrors.hire_date = "Date d'embauche requise"
    if (!formData.base_salary) newErrors.base_salary = 'Salaire requis'
    if (!formData.emergency_contact_name?.trim()) newErrors.emergency_contact_name = 'Contact urgence requis'
    if (!formData.emergency_contact_phone?.trim()) newErrors.emergency_contact_phone = 'Téléphone urgence requis'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    return newErrors
  }

  // ✅ Fonction pour nettoyer les nombres
  const cleanNumber = (value) => {
    if (!value && value !== 0) return 0
    const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.')
    return parseFloat(cleaned) || 0
  }

  // ✅ Fonction pour préparer les données à envoyer
  const prepareDataToSend = () => {
    return {
      // Identité
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone?.trim() || '',
      birth_date: formData.birth_date || null,
      birth_place: formData.birth_place?.trim() || 'Dakar',
      nationality: formData.nationality?.trim() || 'Sénégalaise',
      gender: formData.gender || null,
      marital_status: formData.marital_status || null,
      social_security_number: formData.social_security_number?.trim() || '',
      
      // Adresse
      address: formData.address?.trim() || '',
      city: formData.city?.trim() || 'Dakar',
      postal_code: formData.postal_code?.trim() || '',
      country: formData.country?.trim() || 'Sénégal',
      
      // Professionnel
      department: formData.department ? parseInt(formData.department) : null,
      position: formData.position ? parseInt(formData.position) : null,
      manager: formData.manager ? parseInt(formData.manager) : null,
      hire_date: formData.hire_date,
      contract_type: formData.contract_type,
      contract_end_date: formData.contract_end_date || null,
      probation_end_date: formData.probation_end_date || null,
      work_status: formData.work_status,
      base_salary: cleanNumber(formData.base_salary),
      hourly_rate: formData.hourly_rate ? cleanNumber(formData.hourly_rate) : null,
      
      // Banque
      bank_account: formData.bank_account?.trim() || '',
      bank_name: formData.bank_name?.trim() || '',
      
      // Avantages
      meal_vouchers: formData.meal_vouchers || false,
      health_insurance: formData.health_insurance || false,
      company_car: formData.company_car || false,
      phone_allowance: cleanNumber(formData.phone_allowance),
      transport_allowance: cleanNumber(formData.transport_allowance),
      
      // Contact urgence
      emergency_contact_name: formData.emergency_contact_name?.trim() || '',
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || '',
      emergency_contact_relation: formData.emergency_contact_relation?.trim() || '',
      emergency_contact_email: formData.emergency_contact_email?.trim() || '',
      
      // Notes
      notes: formData.notes?.trim() || ''
    }
  }

  const handleSubmit = async () => {
    // Validation
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('Veuillez corriger les erreurs', 'error')
      const firstError = document.querySelector('.input-error, .select-error')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstError.focus()
      }
      return
    }

    setLoading(true)
    
    const dataToSend = prepareDataToSend()
    
    // ✅ Log pour déboguer
    console.log('📤 Données envoyées:', JSON.stringify(dataToSend, null, 2))

    try {
      let response
      if (isEditMode) {
        response = await AxiosInstance.put(`/employees/${id}/`, dataToSend)
        showNotification('Employé modifié avec succès 🎉', 'success')
      } else {
        response = await AxiosInstance.post('/employees/', dataToSend)
        showNotification('Employé créé avec succès 🎉', 'success')
      }
      console.log('✅ Réponse:', response.data)
      setTimeout(() => navigate('/employees'), 2000)
    } catch (error) {
      console.error('❌ Erreur API:', error.response?.data)
      
      if (error.response?.data) {
        const apiErrors = error.response.data
        
        // ✅ Formater les erreurs pour affichage
        const formattedErrors = {}
        Object.keys(apiErrors).forEach(key => {
          if (typeof apiErrors[key] === 'string') {
            formattedErrors[key] = apiErrors[key]
          } else if (Array.isArray(apiErrors[key])) {
            formattedErrors[key] = apiErrors[key][0]
          } else if (typeof apiErrors[key] === 'object' && apiErrors[key] !== null) {
            formattedErrors[key] = JSON.stringify(apiErrors[key])
          } else {
            formattedErrors[key] = String(apiErrors[key])
          }
        })
        setErrors(formattedErrors)
        
        // Afficher un message d'erreur plus spécifique
        const errorMessage = Object.values(formattedErrors)[0] || 'Erreur lors de l\'enregistrement'
        showNotification(errorMessage, 'error')
      } else {
        showNotification('Erreur de connexion au serveur', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-semibold text-base-content/70">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown max-w-md w-full">
          <div className={`alert shadow-lg ${
            notification.type === 'success' ? 'alert-success' : 'alert-error'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold flex-1">{notification.message}</span>
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
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary">
              {isEditMode ? '✏️ Modifier l\'employé' : '👤 Nouvel employé'}
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              {isEditMode ? 'Modifiez les informations' : 'Créez un nouveau profil employé'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/employees')}
              className="btn btn-outline gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary gap-2 min-w-[120px]"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Section Identité */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Identité</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Prénom <span className="text-error">*</span></span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`}
                  placeholder="Jean"
                />
                {errors.first_name && <span className="text-error text-xs mt-1">{errors.first_name}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Nom <span className="text-error">*</span></span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.last_name ? 'input-error' : ''}`}
                  placeholder="Dupont"
                />
                {errors.last_name && <span className="text-error text-xs mt-1">{errors.last_name}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Email <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-9 ${errors.email ? 'input-error' : ''}`}
                    placeholder="jean.dupont@entreprise.com"
                  />
                </div>
                {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Téléphone</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-9"
                    placeholder="+221 77 123 45 67"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Date de naissance</span>
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Lieu de naissance</span>
                </label>
                <input
                  type="text"
                  name="birth_place"
                  value={formData.birth_place}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Dakar"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Nationalité</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Sénégalaise"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Genre</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner</option>
                  {genders.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Situation matrimoniale</span>
                </label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner</option>
                  {maritalStatuses.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">N° Sécurité Sociale</span>
                </label>
                <input
                  type="text"
                  name="social_security_number"
                  value={formData.social_security_number}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="1234567890123"
                />
              </div>
            </div>
          </div>

          {/* Section Adresse */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Adresse</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Adresse</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  rows="2"
                  placeholder="Numéro, rue, quartier"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Ville</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Dakar"
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Code postal</span>
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="10000"
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Pays</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Sénégal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Professionnel */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Professionnel</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Département</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-base-content/40" />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="select select-bordered w-full pl-9"
                  >
                    <option value="">Sélectionner</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Poste</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner</option>
                  {positions.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Manager</span>
                </label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Aucun</option>
                  {managers.filter(m => m.id !== parseInt(id)).map(m => (
                    <option key={m.id} value={m.id.toString()}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Date d'embauche <span className="text-error">*</span></span>
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.hire_date ? 'input-error' : ''}`}
                />
                {errors.hire_date && <span className="text-error text-xs mt-1">{errors.hire_date}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Type de contrat</span>
                </label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {contractTypes.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Statut</span>
                </label>
                <select
                  name="work_status"
                  value={formData.work_status}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {workStatuses.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Salaire de base (FCFA) <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="base_salary"
                    value={formData.base_salary}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-9 ${errors.base_salary ? 'input-error' : ''}`}
                    placeholder="0"
                  />
                </div>
                {errors.base_salary && <span className="text-error text-xs mt-1">{errors.base_salary}</span>}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Taux horaire</span>
                </label>
                <input
                  type="text"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              {formData.contract_type === 'cdd' && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Date fin de contrat</span>
                  </label>
                  <input
                    type="date"
                    name="contract_end_date"
                    value={formData.contract_end_date}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              )}

              {formData.contract_type === 'internship' && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Date fin de stage</span>
                  </label>
                  <input
                    type="date"
                    name="probation_end_date"
                    value={formData.probation_end_date}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section Avantages */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Avantages sociaux</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="meal_vouchers"
                    checked={formData.meal_vouchers}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Tickets restaurant</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="health_insurance"
                    checked={formData.health_insurance}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Assurance santé</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="company_car"
                    checked={formData.company_car}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Véhicule de fonction</span>
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Indemnité téléphone</span>
                </label>
                <input
                  type="text"
                  name="phone_allowance"
                  value={formData.phone_allowance}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Indemnité transport</span>
                </label>
                <input
                  type="text"
                  name="transport_allowance"
                  value={formData.transport_allowance}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section Banque */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Informations bancaires</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Banque</span>
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="BCEAO"
                />
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">IBAN / Compte</span>
                </label>
                <input
                  type="text"
                  name="bank_account"
                  value={formData.bank_account}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="SN12 3456 7890 1234 5678 9012 3456"
                />
              </div>
            </div>
          </div>

          {/* Section Contact Urgence */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-error" />
              <h2 className="text-lg font-bold">Contact d'urgence <span className="text-error">*</span></h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Nom complet <span className="text-error">*</span></span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.emergency_contact_name ? 'input-error' : ''}`}
                  placeholder="Marie Dupont"
                />
                {errors.emergency_contact_name && <span className="text-error text-xs mt-1">{errors.emergency_contact_name}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Téléphone <span className="text-error">*</span></span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-9 ${errors.emergency_contact_phone ? 'input-error' : ''}`}
                    placeholder="+221 77 123 45 67"
                  />
                </div>
                {errors.emergency_contact_phone && <span className="text-error text-xs mt-1">{errors.emergency_contact_phone}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Relation</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.emergency_contact_relation ? 'input-error' : ''}`}
                  placeholder="Conjoint, Parent, Frère/Soeur"
                />
                {errors.emergency_contact_relation && <span className="text-error text-xs mt-1">{errors.emergency_contact_relation}</span>}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    name="emergency_contact_email"
                    value={formData.emergency_contact_email}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-9"
                    placeholder="contact@email.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Notes</h2>
            </div>
            <div className="divider mt-0 mb-4"></div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Notes supplémentaires</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          {/* Message d'information */}
          <div className="alert alert-info shadow-lg">
            <AlertCircle className="w-5 h-5" />
            <div>
              <span className="font-semibold">Champs obligatoires :</span> Prénom, Nom, Email, 
              Date d'embauche, Salaire, Contact d'urgence
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeForm