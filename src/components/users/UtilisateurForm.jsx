// src/components/users/UtilisateurForm.jsx - Version avec rôle Comptable
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  UserPlus, Mail, Lock, User, Calendar, 
  CheckCircle, XCircle, Building2, Store, 
  Briefcase, Users, Shield, ChevronRight, 
  ArrowLeft, Save, Phone, MapPin, Globe,
  CreditCard, Award, Sparkles, Trophy, 
  AlertCircle, UserCheck, HardDrive, Clock,
  FileText, IdCard, Home, Eye, EyeOff,
  X, Edit, Trash2, Calculator, FileSpreadsheet,
  PieChart, DollarSign, Receipt, BookOpen,
  Loader2
} from 'lucide-react';

// Configuration des rôles globaux
const ROLES_GLOBAUX = [
  { value: 'pdg', label: 'PDG', description: 'Accès total à toutes les agences', icon: Shield, color: 'error' },
  { value: 'drh', label: 'DRH', description: 'Gestion RH toutes agences', icon: Users, color: 'secondary' },
  { value: 'autre', label: 'Utilisateur standard', description: 'Rôle spécifique par agence', icon: User, color: 'neutral' }
];

// Configuration des rôles par agence
const ROLES_AGENCE_FALLBACK = [
  { value: 'chef_agence', label: "Chef d'agence", description: "Gestion complète de l'agence", icon: Store, color: 'primary' },
  { value: 'gestionnaire_stock', label: 'Gestionnaire de stock', description: 'Gestion des stocks et logistique', icon: HardDrive, color: 'info' },
  { value: 'commercial', label: 'Commercial', description: 'Force de vente et relation client', icon: Users, color: 'success' },
  { value: 'comptable', label: 'Comptable', description: 'Gestion comptable et financière', icon: Calculator, color: 'warning' }
];

const ROLE_ICONS = {
  chef_agence: Store,
  gestionnaire_stock: HardDrive,
  commercial: Users,
  comptable: Calculator
};

const ROLE_COLORS = {
  chef_agence: 'primary',
  gestionnaire_stock: 'info',
  commercial: 'success',
  comptable: 'warning'
};

const ROLE_DETAILS = {
  chef_agence: {
    description: "Gère l'ensemble des opérations de l'agence",
    permissions: ['Gestion utilisateurs', 'Validation commandes', 'Rapports', 'Gestion stock']
  },
  gestionnaire_stock: {
    description: "Gère les stocks et la logistique",
    permissions: ['Gestion inventaire', 'Transferts', 'Commandes', 'Rapports stock']
  },
  commercial: {
    description: "Développe les ventes et relations clients",
    permissions: ['Gestion clients', 'Devis', 'Factures', 'Suivi commandes']
  },
  comptable: {
    description: "Gère la comptabilité et les finances",
    permissions: ['Gestion factures', 'Paiements', 'Rapports financiers', 'Analyses']
  }
};

const UtilisateurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États généraux
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agences, setAgences] = useState([]);
  const [rolesAgenceDisponibles, setRolesAgenceDisponibles] = useState([]);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  
  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    employee_id: '',
    hire_date: '',
    contract_type: '',
    salary: '',
    role_global: 'autre',
    agence_id: '',
    role_agence: ''
  });
  
  const [selectedRoleGlobal, setSelectedRoleGlobal] = useState('autre');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ============================================================
  // 1. Chargement des données
  // ============================================================
  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/');
      setAgences(response.data || []);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
      showNotification('Erreur de chargement des agences', 'error');
    }
  };

  const fetchUserData = async () => {
    if (!isEditMode) return;
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/users/${id}/`);
      const user = response.data;
      setSelectedRoleGlobal(user.role_global || 'autre');
      
      setFormData({
        email: user.email || '',
        password: '',
        password2: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        employee_id: user.employee_id || '',
        hire_date: user.hire_date || '',
        contract_type: user.contract_type || '',
        salary: user.salary || '',
        role_global: user.role_global || 'autre',
        agence_id: user.roles_agence?.[0]?.agence_id || '',
        role_agence: user.roles_agence?.[0]?.role || ''
      });
      
      if (user.roles_agence?.[0]?.agence_id) {
        await updateRolesDisponibles(user.roles_agence[0].agence_id);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateRolesDisponibles = async (agenceId) => {
    if (!agenceId) {
      setRolesAgenceDisponibles([]);
      return;
    }
    
    setLoadingAgences(true);
    try {
      const response = await AxiosInstance.get(`/agences/${agenceId}/roles_disponibles/`);
      const rolesData = response.data?.roles || [];
      
      if (rolesData.length > 0) {
        const rolesFiltres = rolesData.map(role => {
          const fallbackRole = ROLES_AGENCE_FALLBACK.find(r => r.value === role.value);
          const details = ROLE_DETAILS[role.value] || {};
          return {
            value: role.value,
            label: role.label,
            description: details.description || fallbackRole?.description || '',
            icon: ROLE_ICONS[role.value] || fallbackRole?.icon || Briefcase,
            color: ROLE_COLORS[role.value] || fallbackRole?.color || 'neutral',
            permissions: details.permissions || []
          };
        });
        setRolesAgenceDisponibles(rolesFiltres);
      } else {
        setRolesAgenceDisponibles(ROLES_AGENCE_FALLBACK);
      }
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      setRolesAgenceDisponibles(ROLES_AGENCE_FALLBACK);
    } finally {
      setLoadingAgences(false);
    }
  };

  useEffect(() => {
    fetchAgences();
    if (isEditMode) {
      fetchUserData();
    }
  }, [id]);

  // ============================================================
  // 2. Gestion des changements
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'role_global') {
      setSelectedRoleGlobal(value);
      if (value !== 'autre') {
        setFormData(prev => ({ ...prev, agence_id: '', role_agence: '' }));
        setRolesAgenceDisponibles([]);
      }
    }
    
    if (name === 'agence_id') {
      setFormData(prev => ({ ...prev, role_agence: '' }));
      if (value) {
        updateRolesDisponibles(value);
      } else {
        setRolesAgenceDisponibles([]);
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ============================================================
  // 3. Validation
  // ============================================================
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = '8 caractères minimum';
      }
      
      if (formData.password !== formData.password2) {
        newErrors.password2 = 'Les mots de passe ne correspondent pas';
      }
    }
    
    if (formData.role_global === 'autre') {
      if (!formData.agence_id) {
        newErrors.agence_id = 'L\'agence est obligatoire';
      }
      if (!formData.role_agence) {
        newErrors.role_agence = 'Le rôle est obligatoire';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // 4. Soumission
  // ============================================================
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);

    const submitData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      employee_id: formData.employee_id || null,
      role_global: formData.role_global
    };
    
    if (formData.role_global === 'autre') {
      if (formData.agence_id) {
        submitData.agence_id = parseInt(formData.agence_id);
      }
      if (formData.role_agence) {
        submitData.role_agence = formData.role_agence;
      }
    }
    
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === undefined || submitData[key] === null) {
        delete submitData[key];
      }
    });
    
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    try {
      if (isEditMode) {
        await AxiosInstance.patch(`/users/${id}/`, submitData);
        showNotification('Utilisateur modifié avec succès !', 'success');
      } else {
        await AxiosInstance.post('/register/', submitData);
        showNotification('Utilisateur créé avec succès !', 'success');
      }
      setTimeout(() => navigate('/utilisateurs'), 2000);
    } catch (error) {
      console.error('Erreur:', error);
      let errorMessage = isEditMode ? 'Échec de la modification' : 'Échec de la création';
      
      if (error.response?.data?.email) {
        errorMessage = `Email: ${error.response.data.email[0]}`;
      } else if (error.response?.data?.employee_id) {
        errorMessage = `Matricule: ${error.response.data.employee_id[0]}`;
      } else if (error.response?.data?.agence_id) {
        errorMessage = `Agence: ${error.response.data.agence_id[0]}`;
      } else if (error.response?.data?.role_agence) {
        errorMessage = `Rôle: ${error.response.data.role_agence[0]}`;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      showNotification(errorMessage, 'error', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRoleBadge = (roleValue, roleLabel) => {
    const color = ROLE_COLORS[roleValue] || 'neutral';
    const Icon = ROLE_ICONS[roleValue] || Briefcase;
    
    return (
      <span className={`badge badge-${color} gap-2 px-3 py-2 text-sm font-medium`}>
        <Icon className="h-3 w-3" />
        {roleLabel}
      </span>
    );
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement de l'utilisateur...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 lg:py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm lg:text-base font-medium whitespace-pre-line">{notification.message}</span>
            {notification.details && (
              <details className="text-xs">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-1 p-1 bg-black/5 rounded">{JSON.stringify(notification.details, null, 2)}</pre>
              </details>
            )}
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ show: false, message: '', type: 'success', details: null })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-5 px-4 lg:px-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                {isEditMode ? <UserCheck className="w-7 h-7 text-primary" /> : <UserPlus className="w-7 h-7 text-primary" />}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {isEditMode ? 'Modifiez les informations de l\'utilisateur' : 'Remplissez les informations pour créer un nouvel utilisateur'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/utilisateurs" className="btn btn-outline btn-sm lg:btn-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="btn btn-primary btn-sm lg:btn-md gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="max-w-full px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-4 lg:p-6">
            {/* Informations de connexion */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Informations de connexion
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                    placeholder="utilisateur@email.com"
                    disabled={submitting}
                  />
                  {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
                </div>
                
                {!isEditMode && (
                  <>
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Mot de passe <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                          placeholder="••••••••"
                          disabled={submitting}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <span className="text-error text-xs mt-1">{errors.password}</span>}
                    </div>
                    
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-primary" />
                          Confirmation <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        className={`input input-bordered w-full ${errors.password2 ? 'input-error' : ''}`}
                        placeholder="••••••••"
                        disabled={submitting}
                      />
                      {errors.password2 && <span className="text-error text-xs mt-1">{errors.password2}</span>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Prénom</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Prénom"
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Nom</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Nom"
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Téléphone
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="+221 XX XXX XX XX"
                    disabled={submitting}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-primary" />
                      Matricule
                    </span>
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="EMP-001 (optionnel)"
                    disabled={submitting}
                  />
                  <span className="text-xs text-base-content/40 mt-1">Optionnel - Laissez vide si non disponible</span>
                </div>
              </div>
            </div>

            <div className="divider text-base-content/40 text-xs">RÔLES & PERMISSIONS</div>

            {/* Rôle global */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Rôle global <span className="text-error">*</span>
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ROLES_GLOBAUX.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRoleGlobal === role.value;
                  return (
                    <label
                      key={role.value}
                      className={`
                        cursor-pointer p-3 rounded-xl border-2 transition-all duration-200
                        ${isSelected 
                          ? `border-${role.color} bg-${role.color}/10 shadow-md` 
                          : 'border-base-200 hover:border-base-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="role_global"
                        value={role.value}
                        checked={isSelected}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? `bg-${role.color}/10` : 'bg-base-200'}`}>
                          <Icon className={`h-5 w-5 ${isSelected ? `text-${role.color}` : 'text-base-content/50'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${isSelected ? `text-${role.color}` : 'text-base-content'}`}>
                            {role.label}
                          </p>
                          <p className="text-xs text-base-content/50">{role.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Champs spécifiques pour les utilisateurs d'agence */}
            {selectedRoleGlobal === 'autre' && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      Agence <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="agence_id"
                    value={formData.agence_id}
                    onChange={handleChange}
                    disabled={submitting || agences.length === 0}
                    className={`select select-bordered w-full ${errors.agence_id ? 'select-error' : ''}`}
                  >
                    <option value="">-- Sélectionner une agence --</option>
                    {agences.map((agence) => (
                      <option key={agence.id} value={agence.id}>
                        🏢 {agence.nom} ({agence.type_display})
                      </option>
                    ))}
                  </select>
                  {errors.agence_id && <span className="text-error text-xs mt-1">{errors.agence_id}</span>}
                </div>

                {formData.agence_id && (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Rôle dans l'agence <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="role_agence"
                      value={formData.role_agence}
                      onChange={handleChange}
                      disabled={submitting || loadingAgences}
                      className={`select select-bordered w-full ${errors.role_agence ? 'select-error' : ''}`}
                    >
                      <option value="">-- Sélectionner un rôle --</option>
                      {rolesAgenceDisponibles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <option key={role.value} value={role.value}>
                            {role.label} {role.value === 'comptable' ? '📊' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {loadingAgences && (
                      <span className="text-info text-xs mt-1 flex items-center gap-1">
                        <span className="loading loading-spinner loading-xs"></span>
                        Chargement des rôles...
                      </span>
                    )}
                    {errors.role_agence && <span className="text-error text-xs mt-1">{errors.role_agence}</span>}
                    
                    {formData.role_agence && (
                      <div className="mt-3 p-3 bg-base-200 rounded-lg">
                        {(() => {
                          const selectedRole = rolesAgenceDisponibles.find(r => r.value === formData.role_agence);
                          if (!selectedRole) return null;
                          const details = ROLE_DETAILS[selectedRole.value];
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {renderRoleBadge(selectedRole.value, selectedRole.label)}
                                <span className="text-xs text-base-content/50">
                                  {selectedRole.description}
                                </span>
                              </div>
                              {details?.permissions && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {details.permissions.map((perm, idx) => (
                                    <span key={idx} className="badge badge-ghost badge-xs">
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info pour PDG/DRH */}
            {(selectedRoleGlobal === 'pdg' || selectedRoleGlobal === 'drh') && (
              <div className="alert alert-info shadow-lg mt-4">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">
                  {selectedRoleGlobal === 'pdg' 
                    ? '👑 Le PDG aura accès à toutes les agences et toutes les fonctionnalités.'
                    : '👥 Le DRH pourra gérer les ressources humaines de toutes les agences.'}
                </span>
              </div>
            )}

            {/* ALERTE pour le rôle Comptable */}
            {formData.role_agence === 'comptable' && selectedRoleGlobal === 'autre' && (
              <div className="alert alert-warning shadow-lg mt-4">
                <Calculator className="h-5 w-5" />
                <span className="text-sm">
                  📊 Le comptable aura accès à la gestion financière, aux rapports 
                  comptables et aux opérations de paiement pour cette agence.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-gray-50/50 border-t border-base-200">
            <Link to="/utilisateurs" className="btn btn-ghost gap-2">
              Annuler
            </Link>
            <button 
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier l\'utilisateur' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </div>
      </div>

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
  );
};

export default UtilisateurForm;

