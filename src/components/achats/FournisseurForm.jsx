// FournisseurForm.jsx - Version professionnelle pleine largeur
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { Building2, Mail, Phone, MapPin, Save, ArrowLeft, CheckCircle, XCircle, Info } from 'lucide-react';

const FournisseurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    code: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sénégal',
    is_active: true,
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isEditMode) fetchSupplier();
  }, [id]);

  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const { data } = await AxiosInstance.get(`/suppliers/${id}/`);
      setFormData({
        code: data.code || '',
        company_name: data.company_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Sénégal',
        is_active: data.is_active ?? true,
        notes: data.notes || ''
      });
    } catch (err) {
      setMessage({ text: 'Erreur de chargement du fournisseur', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'La raison sociale est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format d\'email invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
    if (!formData.city.trim()) newErrors.city = 'La ville est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditMode) {
        await AxiosInstance.patch(`/suppliers/${id}/`, formData);
        setMessage({ text: 'Fournisseur modifié avec succès', type: 'success' });
      } else {
        await AxiosInstance.post('/suppliers/', formData);
        setMessage({ text: 'Fournisseur créé avec succès', type: 'success' });
      }
      setTimeout(() => navigate('/fournisseurs'), 1500);
    } catch (err) {
      const msg = err.response?.data?.code?.[0] || err.response?.data?.email?.[0] || 'Erreur lors de l\'enregistrement';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header avec barre de navigation */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/fournisseurs" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            <div className="divider divider-horizontal mx-0 h-6"></div>
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">
              {isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h1>
          </div>
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg py-2 px-4`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire pleine largeur */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte informations générales */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Informations générales
                  </h2>
                  <div className="divider my-2"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Raison sociale <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Nom officiel de l'entreprise"
                        className={`input input-bordered w-full ${errors.company_name ? 'input-error' : ''}`}
                        disabled={loading}
                      />
                      {errors.company_name && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.company_name}</span>
                        </label>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Code fournisseur</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Auto-généré si vide"
                        className="input input-bordered w-full"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-1">
                          <Mail className="w-4 h-4" /> Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@entreprise.com"
                        className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                        disabled={loading}
                      />
                      {errors.email && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.email}</span>
                        </label>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium flex items-center gap-1">
                          <Phone className="w-4 h-4" /> Téléphone <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+221 33 123 45 67"
                        className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                        disabled={loading}
                      />
                      {errors.phone && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.phone}</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte adresse */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Adresse
                  </h2>
                  <div className="divider my-2"></div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Adresse <span className="text-error">*</span></span>
                    </label>
                    <textarea
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Numéro et nom de rue, quartier"
                      className={`textarea textarea-bordered w-full ${errors.address ? 'textarea-error' : ''}`}
                      disabled={loading}
                    />
                    {errors.address && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.address}</span>
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Ville <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Dakar"
                        className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
                        disabled={loading}
                      />
                      {errors.city && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.city}</span>
                        </label>
                      )}
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Pays</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Sénégal"
                        className="input input-bordered w-full"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne latérale - 1/3 */}
            <div className="lg:col-span-1 space-y-6">
              {/* Carte statut et actions */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg">Statut</h2>
                  <div className="divider my-2"></div>
                  <div className="form-control">
                    <label className="cursor-pointer label justify-start gap-3">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="checkbox checkbox-primary"
                        disabled={loading}
                      />
                      <span className="label-text font-medium">Fournisseur actif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Carte notes */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Notes internes
                  </h2>
                  <div className="divider my-2"></div>
                  <div className="form-control">
                    <textarea
                      name="notes"
                      rows="4"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Informations complémentaires, remarques, historique..."
                      className="textarea textarea-bordered w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full gap-2"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isEditMode ? 'Mettre à jour' : 'Enregistrer le fournisseur'}
                    </button>
                    <Link
                      to="/fournisseurs"
                      className="btn btn-outline w-full"
                    >
                      Annuler
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FournisseurForm;