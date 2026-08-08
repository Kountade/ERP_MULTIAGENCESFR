// src/components/paiements/PaiementForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, Plus, Minus, Trash2, CreditCard,
  CheckCircle, AlertCircle, Loader2, Building2, 
  Package, DollarSign, FileText, User, Hash, Calendar,
  Receipt, Phone, Mail
} from 'lucide-react';

const PaiementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États généraux
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [factures, setFactures] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  
  // Champs du formulaire
  const [factureId, setFactureId] = useState('');
  const [montant, setMontant] = useState('');
  const [methode, setMethode] = useState('especes');
  const [referenceExterne, setReferenceExterne] = useState('');
  const [notes, setNotes] = useState('');

  // États de validation
  const [errors, setErrors] = useState({});
  const [loadingFactures, setLoadingFactures] = useState(true);

  const methodesPaiement = [
    { value: 'especes', label: 'Espèces', icon: '💰' },
    { value: 'carte', label: 'Carte bancaire', icon: '💳' },
    { value: 'cheque', label: 'Chèque', icon: '📝' },
    { value: 'virement', label: 'Virement', icon: '🏦' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'autre', label: 'Autre', icon: '📌' }
  ];

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ============================================================
  // 1. Chargement des factures éligibles
  // ============================================================
  useEffect(() => {
    const fetchFactures = async () => {
      setLoadingFactures(true);
      try {
        const res = await AxiosInstance.get('/factures/?status__in=partially_paid,overdue,sent');
        const facturesAvecReste = res.data.filter(f => (f.montant_restant || 0) > 0);
        setFactures(facturesAvecReste);
        if (isEditMode) {
          await fetchPaiement();
        }
      } catch (err) {
        console.error('Erreur chargement factures', err);
        showNotification('Impossible de charger les factures', 'error');
      } finally {
        setLoadingFactures(false);
      }
    };
    fetchFactures();
  }, [id]);

  // ============================================================
  // 2. Chargement du paiement en mode édition
  // ============================================================
  const fetchPaiement = async () => {
    setLoading(true);
    try {
      const { data } = await AxiosInstance.get(`/paiements/${id}/`);
      setFactureId(data.facture?.id || '');
      setMontant(data.montant);
      setMethode(data.methode);
      setReferenceExterne(data.reference_externe || '');
      setNotes(data.notes || '');
      if (data.facture) {
        setSelectedFacture(data.facture);
      }
    } catch (err) {
      console.error('Erreur chargement paiement', err);
      showNotification('Erreur de chargement du paiement', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 3. Gestion des changements
  // ============================================================
  const handleFactureChange = (e) => {
    const factureIdValue = parseInt(e.target.value);
    const facture = factures.find(f => f.id === factureIdValue);
    setSelectedFacture(facture || null);
    setFactureId(factureIdValue);
    setMontant('');
    if (errors.facture) setErrors(prev => ({ ...prev, facture: '' }));
  };

  const handleChange = (field, value) => {
    if (field === 'facture') {
      setFactureId(value);
      if (errors.facture) setErrors(prev => ({ ...prev, facture: '' }));
    } else if (field === 'montant') {
      setMontant(value);
      if (errors.montant) setErrors(prev => ({ ...prev, montant: '' }));
    } else if (field === 'methode') {
      setMethode(value);
      if (errors.methode) setErrors(prev => ({ ...prev, methode: '' }));
    } else if (field === 'reference_externe') {
      setReferenceExterne(value);
    } else if (field === 'notes') {
      setNotes(value);
    }
  };

  // ============================================================
  // 4. Validation
  // ============================================================
  const validate = () => {
    const newErrors = {};
    if (!factureId) newErrors.facture = 'Veuillez sélectionner une facture';
    if (!montant || parseFloat(montant) <= 0) newErrors.montant = 'Montant invalide';
    if (!methode) newErrors.methode = 'Choisissez une méthode';

    if (selectedFacture && montant) {
      const montantValue = parseFloat(montant);
      const restant = selectedFacture.montant_restant || 0;
      if (montantValue > restant) {
        newErrors.montant = `Maximum : ${restant.toLocaleString()} FCFA`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // 5. Soumission
  // ============================================================
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    
    const payload = {
      facture: parseInt(factureId),
      montant: parseFloat(montant),
      methode: methode,
      reference_externe: referenceExterne,
      notes: notes
    };

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/paiements/${id}/`, payload);
        showNotification('Paiement modifié avec succès', 'success');
      } else {
        await AxiosInstance.post('/paiements/', payload);
        showNotification('Paiement enregistré avec succès', 'success');
      }
      setTimeout(() => navigate('/paiements'), 2000);
    } catch (err) {
      console.error('Erreur:', err);
      const errorData = err.response?.data;
      let errorMessage = 'Erreur lors de l\'enregistrement';
      if (errorData?.facture) errorMessage = errorData.facture[0];
      else if (errorData?.montant) errorMessage = errorData.montant[0];
      else if (errorData?.non_field_errors) errorMessage = errorData.non_field_errors[0];
      else if (errorData?.error) errorMessage = errorData.error;
      showNotification(errorMessage, 'error', errorData);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getFactureLabel = (facture) => {
    const clientName = facture.client_nom || facture.client?.nom || 'Client inconnu';
    const restant = facture.montant_restant?.toLocaleString() || '0';
    return `${facture.reference} - ${clientName} (Reste: ${restant} FCFA)`;
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement du paiement...
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
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier le paiement' : 'Nouveau paiement'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {isEditMode ? 'Modifiez les informations du paiement' : 'Enregistrez un nouveau paiement'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/paiements" className="btn btn-outline btn-sm lg:btn-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="btn btn-primary btn-sm lg:btn-md gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier' : 'Valider'}
            </button>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="max-w-full px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche : Champs du formulaire */}
              <div className="space-y-4">
                {/* Sélection de la facture */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-primary" />
                      Facture <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={factureId}
                    onChange={handleFactureChange}
                    className={`select select-bordered w-full ${errors.facture ? 'select-error' : ''}`}
                    disabled={isEditMode || submitting || loadingFactures}
                  >
                    <option value="">-- Sélectionner une facture --</option>
                    {factures.map(f => (
                      <option key={f.id} value={f.id}>
                        {getFactureLabel(f)}
                      </option>
                    ))}
                  </select>
                  {loadingFactures && (
                    <span className="text-info text-xs mt-1 flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs"></span>
                      Chargement des factures...
                    </span>
                  )}
                  {errors.facture && <span className="text-error text-xs mt-1">{errors.facture}</span>}
                  {!loadingFactures && factures.length === 0 && (
                    <span className="text-warning text-xs mt-1">
                      Aucune facture avec un reste à payer &gt; 0
                    </span>
                  )}
                </div>

                {/* Montant */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Montant <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={montant}
                    onChange={(e) => handleChange('montant', e.target.value)}
                    placeholder="0"
                    className={`input input-bordered w-full ${errors.montant ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.montant && <span className="text-error text-xs mt-1">{errors.montant}</span>}
                  {selectedFacture && (
                    <span className="text-info text-xs mt-1">
                      Maximum : {formatPrice(selectedFacture.montant_restant)}
                    </span>
                  )}
                </div>

                {/* Méthode de paiement */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Méthode <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={methode}
                    onChange={(e) => handleChange('methode', e.target.value)}
                    className={`select select-bordered w-full ${errors.methode ? 'select-error' : ''}`}
                    disabled={submitting}
                  >
                    {methodesPaiement.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                  {errors.methode && <span className="text-error text-xs mt-1">{errors.methode}</span>}
                </div>

                {/* Référence externe */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      Référence externe
                    </span>
                  </label>
                  <input
                    type="text"
                    value={referenceExterne}
                    onChange={(e) => handleChange('reference_externe', e.target.value)}
                    placeholder="N° chèque, virement, etc."
                    className="input input-bordered w-full"
                    disabled={submitting}
                  />
                </div>

                {/* Notes */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Notes
                    </span>
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Informations complémentaires..."
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Colonne droite : Résumé de la facture */}
              <div className="lg:sticky lg:top-20 h-fit">
                {selectedFacture ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Récapitulatif de la facture
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-500">Référence</span>
                        <span className="font-mono font-semibold">{selectedFacture.reference}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-500">Client</span>
                        <span className={!selectedFacture.client ? 'text-warning' : ''}>
                          {selectedFacture.client?.nom || selectedFacture.client_nom || '⚠️ Aucun'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-500">Total TTC</span>
                        <span className="font-bold text-primary">{formatPrice(selectedFacture.total_ttc)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-500">Déjà payé</span>
                        <span className="text-success font-semibold">{formatPrice(selectedFacture.montant_paye || 0)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-500">Reste à payer</span>
                        <span className="text-error font-bold">{formatPrice(selectedFacture.montant_restant || 0)}</span>
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mt-3 pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progression</span>
                          <span className="font-medium">
                            {selectedFacture.total_ttc > 0 
                              ? ((selectedFacture.montant_paye / selectedFacture.total_ttc) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${selectedFacture.total_ttc > 0 
                                ? (selectedFacture.montant_paye / selectedFacture.total_ttc) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bouton d'action */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        onClick={handleSubmit} 
                        disabled={submitting} 
                        className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditMode ? 'Modifier le paiement' : 'Enregistrer le paiement'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <CreditCard className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">Aucune facture sélectionnée</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Sélectionnez une facture pour voir le résumé
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-gray-50/50 border-t border-base-200">
            <Link to="/paiements" className="btn btn-ghost gap-2">
              Annuler
            </Link>
            <button 
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier le paiement' : 'Valider le paiement'}
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

export default PaiementForm;