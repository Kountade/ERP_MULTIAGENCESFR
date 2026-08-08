// src/pages/entrepots/EntrepotForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, X, Building2, MapPin, Phone, Mail, User,
  Warehouse as WarehouseIcon, AlertCircle, CheckCircle
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const EntrepotForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [agences, setAgences] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userAgenceId, setUserAgenceId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouse_type: 'main',
    agence: null,
    address: '',
    city: '',
    postal_code: '',
    country: 'Sénégal',
    phone: '',
    email: '',
    manager: null,
    is_active: true,
    is_default: false,
  });

  // Types d'entrepôts
  const warehouseTypes = [
    { value: 'main', label: 'Entrepôt principal' },
    { value: 'secondary', label: 'Entrepôt secondaire' },
    { value: 'store', label: 'Magasin' },
    { value: 'transit', label: 'Zone de transit' },
    { value: 'returns', label: 'Zone de retour' },
    { value: 'quarantine', label: 'Zone de quarantaine' },
  ];

  // Récupérer les infos utilisateur
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('User');
      const user = userData ? JSON.parse(userData) : null;
      const agenceCourante = JSON.parse(localStorage.getItem('AgenceCourante') || '{}');
      
      let role = 'autre';
      if (user?.role_global === 'pdg') {
        role = 'pdg';
      } else if (user?.role_global === 'drh') {
        role = 'drh';
      } else if (user?.roles_agence) {
        const currentRole = user.roles_agence.find(
          r => r.agence_id === agenceCourante.id && r.est_actif
        );
        if (currentRole) {
          role = currentRole.role;
        }
      }
      
      return { user, role, agenceCourante };
    } catch {
      return { user: null, role: 'autre', agenceCourante: {} };
    }
  };

  // Récupérer les agences disponibles
  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/');
      setAgences(response.data);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
    }
  };

  // Récupérer les managers disponibles
  const fetchManagers = async () => {
    try {
      const response = await AxiosInstance.get('/users/?role=chef_agence');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement managers:', error);
      return [];
    }
  };

  // Récupérer l'entrepôt en mode édition
  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/warehouses/${id}/`);
      const data = response.data;
      setFormData({
        code: data.code || '',
        name: data.name || '',
        warehouse_type: data.warehouse_type || 'main',
        agence: data.agence?.id || data.agence || null,
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || 'Sénégal',
        phone: data.phone || '',
        email: data.email || '',
        manager: data.manager?.id || data.manager || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_default: data.is_default || false,
      });
    } catch (error) {
      console.error('Erreur chargement entrepôt:', error);
      setError('Impossible de charger les données de l\'entrepôt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { role, agenceCourante } = getUserInfo();
    setUserRole(role);
    setUserAgenceId(agenceCourante.id);
    
    fetchAgences();
    
    if (isEditMode) {
      fetchWarehouse();
    } else {
      // En création, pré-sélectionner l'agence courante
      setFormData(prev => ({
        ...prev,
        agence: agenceCourante.id
      }));
    }
  }, [id]);

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gérer la sélection de l'agence
  const handleAgenceChange = (e) => {
    const agenceId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      agence: agenceId
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom de l\'entrepôt est requis');
      return false;
    }
    if (!formData.code.trim()) {
      setError('Le code de l\'entrepôt est requis');
      return false;
    }
    if (!formData.agence) {
      setError('L\'agence associée est requise');
      return false;
    }
    if (!formData.address.trim()) {
      setError('L\'adresse est requise');
      return false;
    }
    if (!formData.city.trim()) {
      setError('La ville est requise');
      return false;
    }
    if (!formData.postal_code.trim()) {
      setError('Le code postal est requis');
      return false;
    }
    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const submitData = {
        ...formData,
        agence: parseInt(formData.agence),
        manager: formData.manager ? parseInt(formData.manager) : null,
      };
      
      let response;
      if (isEditMode) {
        response = await AxiosInstance.put(`/warehouses/${id}/`, submitData);
      } else {
        response = await AxiosInstance.post('/warehouses/', submitData);
      }
      
      setSuccess(true);
      
      // Rediriger après 1.5 secondes
      setTimeout(() => {
        navigate(`/entrepots/${response.data.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      if (error.response?.data) {
        const errors = error.response.data;
        const messages = Object.values(errors).flat().join(', ');
        setError(messages || 'Erreur lors de la sauvegarde');
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  // Vérifier si l'utilisateur peut créer/modifier
  const canEdit = () => {
    return userRole === 'pdg' || userRole === 'drh' || userRole === 'chef_agence';
  };

  if (!canEdit()) {
    return (
      <div className="p-4">
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-6 h-6" />
          <span>Vous n'avez pas les permissions nécessaires pour cette action.</span>
        </div>
        <Link to="/entrepots" className="btn btn-outline btn-sm mt-4">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Link to={isEditMode ? `/entrepots/${id}` : '/entrepots'} className="text-sm text-base-content/60 hover:text-primary mb-2 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {isEditMode ? 'Retour à l\'entrepôt' : 'Retour aux entrepôts'}
        </Link>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <WarehouseIcon className="w-7 h-7 text-primary" />
          {isEditMode ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
        </h1>
        <p className="text-base-content/60 text-sm mt-1">
          {isEditMode 
            ? 'Modifiez les informations de votre entrepôt' 
            : 'Créez un nouvel entrepôt ou magasin'}
        </p>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="alert alert-success shadow-lg mb-6">
          <CheckCircle className="w-5 h-5" />
          <span>
            {isEditMode 
              ? 'Entrepôt modifié avec succès ! Redirection...' 
              : 'Entrepôt créé avec succès ! Redirection...'}
          </span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
        <div className="card-body">
          {/* Erreur */}
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section: Informations de base */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Informations de base</h2>
              
              {/* Code */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Code *</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Ex: WH001"
                  className="input input-bordered w-full font-mono"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">Code unique identifiant l'entrepôt</span>
                </label>
              </div>

              {/* Nom */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Nom *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Entrepôt principal Dakar"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Type d'entrepôt */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Type d'entrepôt</span>
                </label>
                <select
                  name="warehouse_type"
                  className="select select-bordered w-full"
                  value={formData.warehouse_type}
                  onChange={handleChange}
                >
                  {warehouseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Agence associée */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Agence associée *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.agence || ''}
                  onChange={handleAgenceChange}
                  required
                  disabled={userRole !== 'pdg' && userRole !== 'drh'}
                >
                  <option value="">Sélectionner une agence</option>
                  {agences.map(agence => (
                    <option key={agence.id} value={agence.id}>
                      {agence.nom} ({agence.type_agence})
                    </option>
                  ))}
                </select>
                {userRole !== 'pdg' && userRole !== 'drh' && (
                  <label className="label">
                    <span className="label-text-alt text-info">L'agence est automatiquement définie selon votre profil</span>
                  </label>
                )}
              </div>

              {/* Responsable */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Responsable</span>
                </label>
                <select
                  name="manager"
                  className="select select-bordered w-full"
                  value={formData.manager || ''}
                  onChange={handleChange}
                >
                  <option value="">Aucun responsable</option>
                  {/* Les managers seront chargés dynamiquement */}
                </select>
              </div>
            </div>

            {/* Section: Adresse */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Adresse</h2>
              
              {/* Adresse */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Adresse *</span>
                </label>
                <textarea
                  name="address"
                  placeholder="Adresse complète"
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Ville */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Ville *</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ex: Dakar"
                  className="input input-bordered w-full"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Code postal */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Code postal *</span>
                </label>
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Ex: 10000"
                  className="input input-bordered w-full"
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Pays */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Pays</span>
                </label>
                <input
                  type="text"
                  name="country"
                  className="input input-bordered w-full"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Section: Contact */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold border-b pb-2">Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Téléphone */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Téléphone</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+221 77 123 45 67"
                      className="input input-bordered w-full pl-9"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="email"
                      name="email"
                      placeholder="contact@entrepot.com"
                      className="input input-bordered w-full pl-9"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Options */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold border-b pb-2">Options</h2>
              
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="toggle toggle-primary toggle-sm"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span className="text-sm">Entrepôt actif</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_default"
                    className="toggle toggle-info toggle-sm"
                    checked={formData.is_default}
                    onChange={handleChange}
                  />
                  <span className="text-sm">Entrepôt par défaut</span>
                </label>
              </div>
              <p className="text-xs text-base-content/50">
                Note : Un seul entrepôt peut être par défaut par agence.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-end mt-6 pt-4 border-t">
            <Link 
              to={isEditMode ? `/entrepots/${id}` : '/entrepots'} 
              className="btn btn-ghost gap-1"
            >
              <X className="w-4 h-4" />
              Annuler
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary gap-1"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Enregistrer' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EntrepotForm;