// src/components/drh/EmployeeDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  QrCode,
  Mail,
  Briefcase,
  Building2,
  Heart,
  AlertCircle,
  BadgeCheck,
  Clock,
  FileText,
  Users
} from 'lucide-react'

const EmployeeDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const statusConfig = {
    active: { label: 'Actif', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    inactive: { label: 'Inactif', icon: XCircle, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/50' },
    on_leave: { label: 'En congé', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    sick: { label: 'Maladie', icon: AlertCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    remote: { label: 'Télétravail', icon: CheckCircle, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    suspended: { label: 'Suspendu', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    terminated: { label: 'Licencié', icon: XCircle, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/50' }
  }

  const contractConfig = {
    cdi: { label: 'CDI', color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    cdd: { label: 'CDD', color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    internship: { label: 'Stage', color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    freelance: { label: 'Freelance', color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary' },
    temporary: { label: 'Intérim', color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' },
    apprentice: { label: 'Alternant', color: 'secondary', bgColor: 'bg-secondary/10', textColor: 'text-secondary' }
  }

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(number)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchEmployee = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await AxiosInstance.get(`/employees/${id}/`)
      setEmployee(response.data)
    } catch (error) {
      console.error('Error fetching employee:', error)
      setError(error.response?.data?.detail || 'Erreur lors du chargement de l\'employé')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchEmployee()
  }, [id])

  const handleDelete = async () => {
    if (!employee) return
    try {
      await AxiosInstance.delete(`/employees/${id}/`)
      showNotification('Employé supprimé avec succès', 'success')
      setTimeout(() => navigate('/employees'), 1500)
    } catch (error) {
      console.error('Error:', error)
      showNotification('Erreur lors de la suppression', 'error')
    }
    setShowDeleteModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-error/10 text-error rounded-full w-20 h-20">
              <AlertCircle className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-error mb-2">Erreur</h1>
          <p className="text-base-content/70 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/employees')} 
            className="btn btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-warning/10 text-warning rounded-full w-20 h-20">
              <User className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Employé non trouvé</h1>
          <p className="text-base-content/70 mb-6">L'employé que vous recherchez n'existe pas ou a été supprimé.</p>
          <button 
            onClick={() => navigate('/employees')} 
            className="btn btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[employee.work_status] || statusConfig.active
  const StatusIcon = status.icon
  const contract = contractConfig[employee.contract_type] || contractConfig.cdi

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
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {employee.full_name}
              </h1>
              <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </div>
              <div className={`badge ${contract.bgColor} ${contract.textColor}`}>
                {contract.label}
              </div>
            </div>
            <p className="text-sm text-base-content/60 mt-2 flex items-center gap-1">
              <BadgeCheck className="w-4 h-4 text-primary" />
              Matricule: {employee.employee_number}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/employees/${id}/qr`)}
              className="btn btn-outline gap-2 text-primary border-primary/30 hover:border-primary"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <Link 
              to={`/employees/${id}/edit`}
              className="btn btn-outline gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil - Carte avatar */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-6 text-center">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary/10 rounded-full w-32 h-32 ring-4 ring-primary/20">
                <div className="flex items-center justify-center h-full">
                  <User className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-base-content">{employee.full_name}</h2>
            <p className="text-sm text-base-content/60 mt-1">
              {employee.position_title || employee.position?.title || 'Poste non défini'}
            </p>
            <div className="badge bg-primary/10 text-primary font-mono mt-3 gap-1">
              <BadgeCheck className="w-3 h-3" />
              {employee.employee_number}
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="lg:col-span-2 bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-5 border-b border-base-200 bg-base-200/50">
            <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
              <User className="w-5 h-5 text-primary" />
              Informations générales
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <p className="text-base mt-1">{employee.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Téléphone
                </label>
                <p className="text-base mt-1">{employee.phone || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date d'embauche
                </label>
                <p className="text-base mt-1">{formatDate(employee.hire_date)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Salaire de base
                </label>
                <p className="text-base font-bold text-primary mt-1">
                  {formatNumber(employee.base_salary)} €
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Adresse
                </label>
                <p className="text-base mt-1">
                  {employee.address ? `${employee.address}, ${employee.city || ''} ${employee.country || ''}` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Poste et département */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-5 border-b border-base-200 bg-base-200/50">
            <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
              <Briefcase className="w-5 h-5 text-primary" />
              Poste et département
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Poste</label>
              <p className="text-base font-semibold mt-1">{employee.position_title || employee.position?.title || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Département</label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-base">{employee.department_name || employee.department?.name || '-'}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Manager</label>
              <p className="text-base mt-1">{employee.manager_name || employee.manager?.full_name || 'Aucun manager'}</p>
            </div>
          </div>
        </div>

        {/* Contact d'urgence */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-5 border-b border-base-200 bg-base-200/50">
            <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
              <Heart className="w-5 h-5 text-primary" />
              Contact d'urgence
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Nom</label>
              <p className="text-base font-semibold mt-1">{employee.emergency_contact_name || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Téléphone</label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-base">{employee.emergency_contact_phone || '-'}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Relation</label>
              <p className="text-base mt-1">{employee.emergency_contact_relation || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer l'employé ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{employee.full_name}"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1"
                onClick={handleDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDetail