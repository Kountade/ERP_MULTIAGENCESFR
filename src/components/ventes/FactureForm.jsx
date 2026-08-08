// src/components/sales/FactureForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save,
  X,
  ArrowLeft,
  Receipt,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2,
  User,
  Info,
  CreditCard,
  Plus
} from 'lucide-react';

const FactureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ventes, setVentes] = useState([]);
  const [selectedVente, setSelectedVente] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    type_facture: 'finale',
    date_echeance: '',
    conditions_paiement: 'Paiement à 30 jours',
    notes: '',
    pied_de_page: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchVentesEligibles = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/ventes/sans_facture/');
      setVentes(response.data || []);
      // Date d'échéance par défaut : +30 jours
      const echeance = new Date();
      echeance.setDate(echeance.getDate() + 30);
      setFormData(prev => ({ ...prev, date_echeance: echeance.toISOString().split('T')[0] }));
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement des ventes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentesEligibles();
  }, []);

  const handleVenteChange = (venteId) => {
    const vente = ventes.find(v => v.id === parseInt(venteId));
    setSelectedVente(vente || null);
    setFormErrors(prev => ({ ...prev, vente: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedVente) errors.vente = 'La vente est obligatoire';
    if (!formData.date_echeance) errors.date_echeance = 'La date d\'échéance est obligatoire';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vente: selectedVente.id,
        type_facture: formData.type_facture,
        date_echeance: formData.date_echeance,
        conditions_paiement: formData.conditions_paiement,
        notes: formData.notes,
        pied_de_page: formData.pied_de_page
      };

      if (isEditMode) {
        await AxiosInstance.put(`/factures/${id}/`, payload);
        showNotification('Facture modifiée avec succès', 'success');
      } else {
        await AxiosInstance.post('/factures/', payload);
        showNotification('Facture créée avec succès', 'success');
      }
      setTimeout(() => navigate('/factures'), 1500);
    } catch (error) {
      console.error(error);
      const errorData = error.response?.data;
      let errorMsg = 'Erreur lors de l\'enregistrement';
      if (errorData?.vente) errorMsg = errorData.vente[0];
      else if (errorData?.error) errorMsg = errorData.error;
      else if (typeof errorData === 'string') errorMsg = errorData;
      showNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price || 0) + ' FCFA';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
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
                <Receipt className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier la facture' : 'Nouvelle facture'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {isEditMode
                ? 'Modifiez les informations de la facture'
                : 'Générez une facture à partir d\'une vente validée'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/factures')}
              className="btn btn-outline btn-sm lg:btn-md gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-sm lg:btn-md gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditMode ? 'Mettre à jour' : 'Créer la facture'}
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type de facture */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Type de facture
                  </span>
                </label>
                <select
                  className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={formData.type_facture}
                  onChange={(e) => setFormData({ ...formData, type_facture: e.target.value })}
                >
                  <option value="proforma">Proforma</option>
                  <option value="finale">Finale</option>
                  <option value="avoir">Avoir</option>
                </select>
              </div>

              {/* Vente associée */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Vente associée *
                  </span>
                </label>
                <select
                  className={`select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                    formErrors.vente ? 'select-error' : ''
                  }`}
                  value={selectedVente?.id || ''}
                  onChange={(e) => handleVenteChange(e.target.value)}
                >
                  <option value="">Sélectionner une vente</option>
                  {ventes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.reference} - {formatPrice(v.total)} - {v.client_nom || 'Anonyme'}
                    </option>
                  ))}
                </select>
                {formErrors.vente && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.vente}</span>
                  </label>
                )}
                {ventes.length === 0 && !loading && (
                  <p className="text-xs text-warning mt-1">
                    ⚠️ Aucune vente éligible. Seules les ventes approuvées ou complétées sans facture apparaissent.
                  </p>
                )}
              </div>

              {/* Client (auto rempli) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-gray-100 cursor-not-allowed"
                  value={selectedVente?.client_nom || 'Non renseigné'}
                  readOnly
                  disabled
                />
              </div>

              {/* Agence (auto remplie) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Agence
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-gray-100 cursor-not-allowed"
                  value={selectedVente?.agence_nom || 'Non renseignée'}
                  readOnly
                  disabled
                />
              </div>

              {/* Date d'échéance */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date d'échéance *
                  </span>
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                    formErrors.date_echeance ? 'input-error' : ''
                  }`}
                  value={formData.date_echeance}
                  onChange={(e) => {
                    setFormData({ ...formData, date_echeance: e.target.value });
                    setFormErrors((prev) => ({ ...prev, date_echeance: null }));
                  }}
                />
                {formErrors.date_echeance && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.date_echeance}</span>
                  </label>
                )}
              </div>

              {/* Conditions de paiement */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Conditions de paiement
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  rows="2"
                  value={formData.conditions_paiement}
                  onChange={(e) =>
                    setFormData({ ...formData, conditions_paiement: e.target.value })
                  }
                  placeholder="Ex: Paiement à 30 jours, escompte 2%..."
                />
              </div>

              {/* Notes */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Notes
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Pied de page */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pied de page
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  rows="2"
                  value={formData.pied_de_page}
                  onChange={(e) => setFormData({ ...formData, pied_de_page: e.target.value })}
                  placeholder="Mentions légales, coordonnées bancaires..."
                />
              </div>
            </div>

            {/* Résumé de la vente (si sélectionnée) */}
            {selectedVente && (
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Récapitulatif de la vente</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-base-content/60">Sous-total HT :</span>{' '}
                    <span className="font-medium">{formatPrice(selectedVente.sous_total)}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60">TVA (18%) :</span>{' '}
                    <span className="font-medium">{formatPrice(selectedVente.tva)}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60 font-bold">Total TTC :</span>{' '}
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(selectedVente.total)}
                    </span>
                  </div>
                </div>
                {selectedVente.montant_paye > 0 && (
                  <div className="mt-2 pt-2 border-t border-primary/20 text-sm">
                    <span className="text-base-content/60">Montant déjà payé :</span>{' '}
                    <span className="font-medium text-green-600">
                      {formatPrice(selectedVente.montant_paye)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions du formulaire */}
          <div className="flex justify-end gap-3 p-6 bg-base-200/50 border-t border-base-200">
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={() => navigate('/factures')}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditMode ? 'Mettre à jour' : 'Créer la facture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureForm;