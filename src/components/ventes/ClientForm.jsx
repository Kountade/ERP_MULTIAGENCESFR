// src/components/sales/ClientForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, User, Building2, Phone, Mail, MapPin,
  Briefcase, CreditCard, Star, AlertCircle, CheckCircle, Loader2,
  Users, Calendar, Clock, RefreshCw
} from 'lucide-react';

const ClientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    client_type: 'particulier',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    raison_sociale: '',
    numero_tva: '',
    est_revendeur: false,
    is_active: true
  });
  const [errors, setErrors] = useState({});

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/clients/${id}/`);
      const client = response.data;
      setFormData({
        client_type: client.client_type,
        nom: client.nom,
        prenom: client.prenom || '',
        email: client.email || '',
        telephone: client.telephone,
        adresse: client.adresse || '',
        raison_sociale: client.raison_sociale || '',
        numero_tva: client.numero_tva || '',
        est_revendeur: client.est_revendeur,
        is_active: client.is_active
      });
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Client non trouvé', 'error');
      setTimeout(() => navigate('/clients'), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchClient();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await AxiosInstance.put(`/clients/${id}/`, formData);
        showNotification('Client modifié avec succès', 'success');
      } else {
        await AxiosInstance.post('/clients/', formData);
        showNotification('Client ajouté avec succès', 'success');
      }
      setTimeout(() => navigate('/clients'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du client...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl text-sm sm:text-base rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier le client' : 'Nouveau client'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {isEditMode ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client à la base'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/clients')} className="btn btn-sm sm:btn-md btn-outline gap-2 hover:bg-primary/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-none shadow-lg hover:shadow-xl transition-all gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Mettre à jour' : 'Créer le client'}
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de client */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Type de client *</span>
              </label>
              <select
                className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={formData.client_type}
                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
              >
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
                <option value="revendeur">Revendeur</option>
              </select>
            </div>

            {/* Nom */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Nom *</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.nom ? 'input-error' : ''}`}
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom du client"
                />
              </div>
              {errors.nom && <span className="text-error text-xs mt-1">{errors.nom}</span>}
            </div>

            {/* Prénom */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prénom</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Prénom du client"
              />
            </div>

            {/* Téléphone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Téléphone *</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.telephone ? 'input-error' : ''}`}
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="77 123 45 67"
                />
              </div>
              {errors.telephone && <span className="text-error text-xs mt-1">{errors.telephone}</span>}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@email.com"
                />
              </div>
              {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
            </div>

            {/* Adresse */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Adresse</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  className="textarea textarea-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  rows={3}
                  placeholder="Adresse complète du client"
                />
              </div>
            </div>

            {/* Champs entreprise */}
            {formData.client_type === 'entreprise' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Raison sociale</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      value={formData.raison_sociale}
                      onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                      placeholder="Raison sociale de l'entreprise"
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Numéro TVA</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      value={formData.numero_tva}
                      onChange={(e) => setFormData({ ...formData, numero_tva: e.target.value })}
                      placeholder="Numéro de TVA intracommunautaire"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={formData.est_revendeur}
                onChange={(e) => setFormData({ ...formData, est_revendeur: e.target.checked })}
              />
              <span className="label-text flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" /> Revendeur (bénéficie de prix spéciaux)
              </span>
            </label>

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-success"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="label-text flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> Client actif
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" className="btn btn-ghost gap-2" onClick={() => navigate('/clients')}>
              <X className="w-4 h-4" /> Annuler
            </button>
            <button type="submit" className="btn btn-primary gap-2" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Mettre à jour' : 'Créer le client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;