// src/components/drh/LeaveForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save,
  ArrowLeft,
  User,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Clock
} from 'lucide-react';

const LeaveForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '', leave_type: 'annual', start_date: '', end_date: '', reason: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const leaveTypes = [
    { value: 'annual', label: 'Congés payés', icon: Calendar, color: 'primary' },
    { value: 'sick', label: 'Maladie', icon: AlertCircle, color: 'error' },
    { value: 'unpaid', label: 'Sans solde', icon: Clock, color: 'warning' },
    { value: 'other', label: 'Autre', icon: FileText, color: 'info' }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    // Charger les employés
    AxiosInstance.get('/employees/')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Erreur chargement employés:', err));
    
    // Si modification, charger les données existantes
    if (isEdit) {
      AxiosInstance.get(`/leaves/${id}/`)
        .then(res => {
          const data = res.data;
          setFormData({
            employee: data.employee, 
            leave_type: data.leave_type, 
            start_date: data.start_date, 
            end_date: data.end_date, 
            reason: data.reason || ''
          });
        })
        .catch(err => {
          console.error('Erreur chargement demande:', err);
          showNotification('Erreur lors du chargement', 'error');
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee) newErrors.employee = 'Veuillez sélectionner un employé';
    if (!formData.start_date) newErrors.start_date = 'La date de début est requise';
    if (!formData.end_date) newErrors.end_date = 'La date de fin est requise';
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'La date de fin doit être postérieure à la date de début';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await AxiosInstance.put(`/leaves/${id}/`, formData);
        showNotification('Demande de congé modifiée avec succès', 'success');
      } else {
        await AxiosInstance.post('/leaves/', formData);
        showNotification('Demande de congé créée avec succès', 'success');
      }
      setTimeout(() => navigate('/leaves'), 1500);
    } catch (err) {
      console.error('Erreur:', err);
      showNotification('Erreur lors de l\'enregistrement', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.full_name : '';
  };

  if (isEdit && !formData.employee && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
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
          onClick={() => navigate('/leaves')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            {isEdit ? 'Modifier la demande de congé' : 'Nouvelle demande de congé'}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            {isEdit ? 'Modifiez les informations de la demande' : 'Créez une nouvelle demande de congé'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employé */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Employé <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-base-content/40" />
                </div>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  className={`select select-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary ${errors.employee ? 'select-error' : ''}`}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              {errors.employee && (
                <span className="text-error text-xs mt-1">{errors.employee}</span>
              )}
            </div>

            {/* Type de congé */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Type de congé</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                </div>
                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleChange}
                  className="select select-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date début */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Date de début <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                </div>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary ${errors.start_date ? 'input-error' : ''}`}
                />
              </div>
              {errors.start_date && (
                <span className="text-error text-xs mt-1">{errors.start_date}</span>
              )}
            </div>

            {/* Date fin */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Date de fin <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-base-content/40" />
                </div>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary ${errors.end_date ? 'input-error' : ''}`}
                />
              </div>
              {errors.end_date && (
                <span className="text-error text-xs mt-1">{errors.end_date}</span>
              )}
            </div>

            {/* Motif */}
            <div className="md:col-span-2 form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">Motif</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="w-4 h-4 text-base-content/40" />
                </div>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="4"
                  className="textarea textarea-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Raison du congé..."
                />
              </div>
            </div>
          </div>

          {/* Aperçu pour édition */}
          {isEdit && formData.employee && (
            <div className="mt-6 p-4 bg-base-200 rounded-xl">
              <h4 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Récapitulatif
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-base-content/60">Employé :</span>
                  <span className="ml-2 font-medium">{getEmployeeName(formData.employee)}</span>
                </div>
                <div>
                  <span className="text-base-content/60">Type :</span>
                  <span className="ml-2 font-medium">
                    {leaveTypes.find(t => t.value === formData.leave_type)?.label || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/60">Période :</span>
                  <span className="ml-2 font-medium">
                    {formData.start_date && new Date(formData.start_date).toLocaleDateString('fr-FR')} → {formData.end_date && new Date(formData.end_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {formData.start_date && formData.end_date && (
                  <div>
                    <span className="text-base-content/60">Durée :</span>
                    <span className="ml-2 font-medium">
                      {Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) + 1} jour(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-200">
            <button
              onClick={() => navigate('/leaves')}
              className="btn btn-outline gap-2"
            >
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
                  {isEdit ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message d'information */}
      <div className="alert alert-info shadow-lg">
        <AlertCircle className="w-4 h-4" />
        <div>
          <span className="font-semibold">Information :</span> Une fois soumise, la demande devra être approuvée par la direction.
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;