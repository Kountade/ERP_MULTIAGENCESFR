// src/components/drh/PositionForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Briefcase,
  Save,
  X,
  Building2,
  ArrowLeft,
  FileText,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const PositionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [departments, setDepartments] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    min_salary: '',
    max_salary: '',
    is_active: true
  })
  const [errors, setErrors] = useState({})
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    fetchDepartments()
    if (isEditMode) {
      fetchPosition()
    } else {
      setInitialLoading(false)
    }
  }, [id])

  const fetchPosition = async () => {
    try {
      const response = await AxiosInstance.get(`/positions/${id}/`)
      const pos = response.data
      setFormData({
        title: pos.title || '',
        department: pos.department?.id?.toString() || '',
        description: pos.description || '',
        requirements: pos.requirements || '',
        min_salary: pos.min_salary || '',
        max_salary: pos.max_salary || '',
        is_active: pos.is_active !== undefined ? pos.is_active : true
      })
    } catch (error) {
      console.error('Error fetching position:', error)
      showNotification('Erreur lors du chargement du poste', 'error')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await AxiosInstance.get('/departments/')
      setDepartments(response.data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
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

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title?.trim()) newErrors.title = 'Le titre est requis'
    if (!formData.department) newErrors.department = 'Le département est requis'
    
    if (formData.min_salary && formData.max_salary) {
      const min = parseFloat(formData.min_salary)
      const max = parseFloat(formData.max_salary)
      if (!isNaN(min) && !isNaN(max) && min > max) {
        newErrors.min_salary = 'Le salaire min ne peut pas être supérieur au salaire max'
      }
    }
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    const dataToSend = {
      title: formData.title,
      department: parseInt(formData.department),
      description: formData.description || '',
      requirements: formData.requirements || '',
      min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
      max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null,
      is_active: formData.is_active
    }

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/positions/${id}/`, dataToSend)
        showNotification('Poste modifié avec succès', 'success')
      } else {
        await AxiosInstance.post('/positions/', dataToSend)
        showNotification('Poste créé avec succès', 'success')
      }
      setTimeout(() => navigate('/positions'), 2000)
    } catch (error) {
      console.error('Error saving position:', error)
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const newErrors = {}
          Object.keys(error.response.data).forEach(key => {
            newErrors[key] = Array.isArray(error.response.data[key]) 
              ? error.response.data[key][0] 
              : error.response.data[key]
          })
          setErrors(newErrors)
        }
      }
      showNotification('Erreur lors de l\'enregistrement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === parseInt(departmentId))
    return dept ? dept.name : ''
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du poste...
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
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
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
      <div className="mb-6">
        <button
          onClick={() => navigate('/positions')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
              {isEditMode ? 'Modifier le poste' : 'Nouveau poste'}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isEditMode ? 'Modifiez les informations du poste' : 'Créez un nouveau poste'}
            </p>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/positions')}
              className="btn btn-outline gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary gap-2 transition-all duration-300 disabled:opacity-50"
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
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre du poste */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Titre du poste <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.title ? 'input-error' : ''}`}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              {errors.title && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </span>
                </label>
              )}
            </div>

            {/* Département */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Département <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`select select-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary ${errors.department ? 'select-error' : ''}`}
                >
                  <option value="">Sélectionner un département</option>
                  {departments.filter(d => d.is_active !== false).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.department}
                  </span>
                </label>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2 form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Description</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="textarea textarea-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Description détaillée du poste, missions principales..."
                />
              </div>
            </div>

            {/* Prérequis */}
            <div className="md:col-span-2 form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Prérequis / Exigences</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="4"
                  className="textarea textarea-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Compétences requises, expérience, formation, langues..."
                />
              </div>
            </div>

            {/* Salaire min */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Salaire minimum</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-base-content/50">€</span>
                </div>
                <input
                  type="number"
                  name="min_salary"
                  value={formData.min_salary}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 pr-10 focus:border-primary focus:ring-1 focus:ring-primary ${errors.min_salary ? 'input-error' : ''}`}
                  placeholder="0"
                />
              </div>
              {errors.min_salary && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.min_salary}
                  </span>
                </label>
              )}
            </div>

            {/* Salaire max */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Salaire maximum</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-base-content/50">€</span>
                </div>
                <input
                  type="number"
                  name="max_salary"
                  value={formData.max_salary}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-10 pr-10 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Statut actif */}
            <div className="md:col-span-2">
              <div className="divider"></div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                <div>
                  <p className="font-semibold text-base-content">Statut du poste</p>
                  <p className="text-sm text-base-content/60">Activez ou désactivez ce poste</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu rapide pour édition */}
        {isEditMode && (formData.title || formData.department) && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-base-200 rounded-xl">
            <h4 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Aperçu du poste
            </h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-base-content/60">Titre:</span>
                <span className="ml-2 font-medium text-base-content">{formData.title || '—'}</span>
              </div>
              <div>
                <span className="text-base-content/60">Département:</span>
                <span className="ml-2 font-medium text-base-content">{getDepartmentName(formData.department) || '—'}</span>
              </div>
              {(formData.min_salary || formData.max_salary) && (
                <div>
                  <span className="text-base-content/60">Salaire:</span>
                  <span className="ml-2 font-medium text-base-content">
                    {formData.min_salary && `${parseInt(formData.min_salary).toLocaleString()} €`}
                    {formData.min_salary && formData.max_salary && ' - '}
                    {formData.max_salary && `${parseInt(formData.max_salary).toLocaleString()} €`}
                  </span>
                </div>
              )}
              <div>
                <span className="text-base-content/60">Statut:</span>
                <span className={`ml-2 badge ${formData.is_active ? 'badge-success' : 'badge-ghost'}`}>
                  {formData.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PositionForm