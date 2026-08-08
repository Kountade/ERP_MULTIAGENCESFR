// src/components/achats/PaiementsFournisseurForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
  Building2,
  Banknote,
  Landmark,
  Wallet,
  Phone,
  Search,
  RefreshCw,
  Clock,
  Receipt,
  User,
  Mail,
  MapPin,
  Hash
} from 'lucide-react';

const PaiementsFournisseurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const factureIdParam = searchParams.get('facture');
  
  const isEditMode = !!id;

  // États
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  
  const [factures, setFactures] = useState([]);
  const [agences, setAgences] = useState([]);
  const [caisses, setCaisses] = useState([]);
  const [comptesBancaires, setComptesBancaires] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    invoice: factureIdParam || '',
    agence: '',
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    caisse: '',
    compte_bancaire: '',
    notes: '',
    status: 'completed'
  });

  // Méthodes de paiement
  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: Banknote, color: 'text-green-500', bg: 'bg-green-50' },
    { value: 'bank_transfer', label: 'Virement', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'check', label: 'Chèque', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: 'card', label: 'Carte', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { value: 'mobile_money', label: 'Mobile Money', icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: 'other', label: 'Autre', icon: CreditCard, color: 'text-gray-500', bg: 'bg-gray-50' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'En attente', color: 'text-warning' },
    { value: 'processing', label: 'En cours', color: 'text-info' },
    { value: 'completed', label: 'Terminé', color: 'text-success' },
    { value: 'failed', label: 'Échoué', color: 'text-error' },
    { value: 'cancelled', label: 'Annulé', color: 'text-gray-500' }
  ];

  // Formatage
  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // ✅ Redirection vers paiement-fournisseur (singulier)
  useEffect(() => {
    if (redirecting) {
      const timer = setTimeout(() => {
        navigate('/paiement-fournisseur'); // ← CORRIGÉ: singulier
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [redirecting, navigate]);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Charger les factures impayées ou partiellement payées
        const facturesRes = await AxiosInstance.get('/factures-fournisseur/?status=pending,partial,overdue');
        setFactures(facturesRes.data || []);

        // Charger les agences
        const agencesRes = await AxiosInstance.get('/agences/');
        setAgences(agencesRes.data || []);

        // Charger les caisses
        const caissesRes = await AxiosInstance.get('/caisses/');
        setCaisses(caissesRes.data || []);

        // Charger les comptes bancaires
        const comptesRes = await AxiosInstance.get('/comptes-bancaires/');
        setComptesBancaires(comptesRes.data || []);

        // Si un ID de facture est passé en paramètre
        if (factureIdParam) {
          await loadInvoiceDetails(factureIdParam);
        }

        // Si mode édition, charger les données du paiement
        if (isEditMode) {
          await fetchPayment(id);
        }

      } catch (error) {
        console.error('Erreur chargement données:', error);
        setError('Erreur de chargement des données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, factureIdParam]);

  // Charger un paiement existant
  const fetchPayment = async (paymentId) => {
    try {
      const response = await AxiosInstance.get(`/paiement-fournisseur/${paymentId}/`);
      const payment = response.data;
      
      setFormData({
        invoice: payment.invoice?.id || payment.invoice || '',
        agence: payment.agence?.id || payment.agence || '',
        amount: payment.amount || '',
        payment_method: payment.payment_method || 'bank_transfer',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        reference_number: payment.reference_number || '',
        caisse: payment.caisse?.id || payment.caisse || '',
        compte_bancaire: payment.compte_bancaire?.id || payment.compte_bancaire || '',
        notes: payment.notes || '',
        status: payment.status || 'completed'
      });

      if (payment.invoice) {
        const invoiceId = payment.invoice.id || payment.invoice;
        await loadInvoiceDetails(invoiceId);
      }

    } catch (error) {
      console.error('Erreur chargement paiement:', error);
      setError('Erreur de chargement du paiement');
    }
  };

  // Charger les détails d'une facture
  const loadInvoiceDetails = async (invoiceId) => {
    if (!invoiceId) {
      setSelectedInvoice(null);
      setFormData(prev => ({ ...prev, agence: '' }));
      return;
    }

    try {
      const response = await AxiosInstance.get(`/factures-fournisseur/${invoiceId}/`);
      const invoice = response.data;
      setSelectedInvoice(invoice);
      
      // Remplir automatiquement l'agence
      if (invoice.agence) {
        setFormData(prev => ({
          ...prev,
          agence: invoice.agence.id || invoice.agence
        }));
      }

      // Suggérer le montant restant
      if (invoice.amount_remaining && !isEditMode) {
        setFormData(prev => ({
          ...prev,
          amount: invoice.amount_remaining
        }));
      }

    } catch (error) {
      console.error('Erreur chargement facture:', error);
      setError('Erreur de chargement de la facture');
    }
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'invoice') {
      loadInvoiceDetails(value);
    }
  };

  // Gérer les changements de destination
  const handleDestinationChange = (type, value) => {
    if (type === 'caisse') {
      setFormData(prev => ({ ...prev, caisse: value, compte_bancaire: '' }));
    } else if (type === 'compte') {
      setFormData(prev => ({ ...prev, compte_bancaire: value, caisse: '' }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = [];

    if (!formData.invoice) {
      errors.push('Veuillez sélectionner une facture');
    }
    if (!formData.agence) {
      errors.push('Veuillez sélectionner une agence');
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }
    if (!formData.payment_method) {
      errors.push('Veuillez sélectionner une méthode de paiement');
    }
    if (!formData.payment_date) {
      errors.push('Veuillez sélectionner une date de paiement');
    }
    if (!formData.caisse && !formData.compte_bancaire) {
      errors.push('Veuillez sélectionner une caisse ou un compte bancaire');
    }

    if (selectedInvoice && parseFloat(formData.amount) > parseFloat(selectedInvoice.amount_remaining)) {
      errors.push(`Le montant (${formatCurrency(formData.amount)}) dépasse le reste dû (${formatCurrency(selectedInvoice.amount_remaining)})`);
    }

    return errors;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      invoice: parseInt(formData.invoice),
      agence: parseInt(formData.agence),
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      reference_number: formData.reference_number,
      status: formData.status,
      notes: formData.notes
    };

    if (formData.caisse) {
      payload.caisse = parseInt(formData.caisse);
    }
    if (formData.compte_bancaire) {
      payload.compte_bancaire = parseInt(formData.compte_bancaire);
    }

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/paiement-fournisseur/${id}/`, payload);
      } else {
        await AxiosInstance.post('/paiement-fournisseur/', payload);
      }

      setSuccess(true);
      
      // ✅ Déclencher la redirection vers paiement-fournisseur (singulier)
      setTimeout(() => {
        setRedirecting(true);
      }, 1500);

    } catch (error) {
      console.error('Erreur:', error);
      
      let errorMessage = 'Erreur lors de l\'enregistrement';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors.join('\n');
        } else if (data.detail) {
          errorMessage = data.detail;
        } else {
          errorMessage = Object.values(data).flat().join('\n');
        }
      }
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  // État de chargement
  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  // Écran de redirection
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-success">
            {isEditMode ? 'Paiement modifié !' : 'Paiement créé !'}
          </h2>
          <p className="text-base-content/60 mt-2">
            Redirection vers la liste des paiements...
          </p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/paiement-fournisseur')} // ← CORRIGÉ: singulier
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
              {isEditMode ? 'Modifier le paiement' : 'Nouveau paiement'}
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              {isEditMode ? 'Modifiez les informations du paiement' : 'Enregistrez un nouveau paiement fournisseur'}
            </p>
          </div>
        </div>
      </div>

      {/* Succès */}
      {success && (
        <div className="alert alert-success mb-6 shadow-lg animate-slideDown">
          <CheckCircle className="w-5 h-5" />
          <div className="flex-1">
            <span className="font-bold">
              {isEditMode ? 'Paiement modifié avec succès !' : 'Paiement créé avec succès !'}
            </span>
            <p className="text-sm opacity-80">Redirection en cours...</p>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setSuccess(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="alert alert-error mb-6 shadow-lg animate-slideDown">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Erreur</span>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setError(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulaire */}
      <form 
        onSubmit={handleSubmit}
        className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden w-full"
      >
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Facture */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-primary" />
                Facture à payer <span className="text-error">*</span>
              </span>
              {factures.length === 0 && !loading && (
                <span className="text-warning text-xs">⚠️ Aucune facture en attente</span>
              )}
            </label>
            <select
              name="invoice"
              value={formData.invoice}
              onChange={handleChange}
              className="select select-bordered w-full focus:select-primary transition-all"
              disabled={isEditMode || loading || submitting}
            >
              <option value="">-- Sélectionner une facture --</option>
              {factures.map(f => (
                <option key={f.id} value={f.id}>
                  {f.invoice_number} - {f.supplier_name || f.supplier?.company_name} 
                  ({formatCurrency(f.amount_remaining)} restant)
                </option>
              ))}
            </select>
          </div>

          {/* Résumé de la facture sélectionnée */}
          {selectedInvoice && (
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Détails de la facture
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-base-content/50">N° Facture</span>
                  <p className="font-medium">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <span className="text-base-content/50">Fournisseur</span>
                  <p className="font-medium">{selectedInvoice.supplier_name || selectedInvoice.supplier?.company_name}</p>
                </div>
                <div>
                  <span className="text-base-content/50">Échéance</span>
                  <p className={`font-medium ${selectedInvoice.is_overdue ? 'text-error' : ''}`}>
                    {formatDate(selectedInvoice.due_date)}
                    {selectedInvoice.is_overdue && ' ⚠️'}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/50">Reste à payer</span>
                  <p className="font-bold text-error">{formatCurrency(selectedInvoice.amount_remaining)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agence */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Agence <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="agence"
              value={formData.agence}
              onChange={handleChange}
              className="select select-bordered w-full focus:select-primary transition-all"
              disabled={loading || submitting}
            >
              <option value="">-- Sélectionner une agence --</option>
              {agences.map(a => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>

          {/* Montant et Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Montant (FCFA) <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xs font-bold">
                  FCFA
                </span>
                <input
                  type="number"
                  name="amount"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input input-bordered w-full pl-16 pr-4 py-3 focus:input-primary transition-all"
                  step="0.01"
                  min="0.01"
                  disabled={submitting}
                  required
                />
              </div>
              {selectedInvoice && (
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-base-content/60">
                    Reste dû: <span className="font-semibold text-error">{formatCurrency(selectedInvoice.amount_remaining)}</span>
                  </span>
                  <span className="text-base-content/60">
                    Total: <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date de paiement <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className="input input-bordered w-full py-3 focus:input-primary transition-all"
                max={new Date().toISOString().split('T')[0]}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Méthode de paiement <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.payment_method === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value }))}
                    disabled={submitting}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                        : 'border-base-200 hover:border-primary/50 hover:bg-base-200/50 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-primary/10' : method.bg}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : method.color}`} />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-base-content/70'}`}>
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination du paiement */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                Destination du paiement <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Caisse */}
              <div 
                className={`
                  p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${formData.caisse 
                    ? 'border-primary bg-primary/5' 
                    : 'border-base-200 hover:border-primary/50 hover:bg-base-200/30'
                  }
                `}
                onClick={() => {
                  if (caisses.length > 0) {
                    handleDestinationChange('caisse', caisses[0].id);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={!!formData.caisse}
                    onChange={() => {}}
                    className="radio radio-primary radio-sm"
                    disabled={submitting}
                  />
                  <div className="flex-1">
                    <span className="font-medium">Caisse</span>
                    <select
                      className="select select-bordered select-sm w-full mt-1"
                      value={formData.caisse}
                      onChange={(e) => handleDestinationChange('caisse', e.target.value)}
                      disabled={!formData.caisse || submitting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">-- Sélectionner --</option>
                      {caisses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({formatCurrency(c.solde_actuel)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Compte bancaire */}
              <div 
                className={`
                  p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${formData.compte_bancaire 
                    ? 'border-primary bg-primary/5' 
                    : 'border-base-200 hover:border-primary/50 hover:bg-base-200/30'
                  }
                `}
                onClick={() => {
                  if (comptesBancaires.length > 0) {
                    handleDestinationChange('compte', comptesBancaires[0].id);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={!!formData.compte_bancaire}
                    onChange={() => {}}
                    className="radio radio-primary radio-sm"
                    disabled={submitting}
                  />
                  <div className="flex-1">
                    <span className="font-medium">Compte bancaire</span>
                    <select
                      className="select select-bordered select-sm w-full mt-1"
                      value={formData.compte_bancaire}
                      onChange={(e) => handleDestinationChange('compte', e.target.value)}
                      disabled={!formData.compte_bancaire || submitting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">-- Sélectionner --</option>
                      {comptesBancaires.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({formatCurrency(c.solde)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Référence et Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  N° Référence
                </span>
              </label>
              <input
                type="text"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="N° de chèque, virement, etc."
                className="input input-bordered w-full focus:input-primary transition-all"
                disabled={submitting}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Statut
                </span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select select-bordered w-full focus:select-primary transition-all"
                disabled={submitting}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes
              </span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informations supplémentaires sur le paiement..."
              className="textarea textarea-bordered w-full h-24 focus:textarea-primary transition-all resize-none"
              disabled={submitting}
            />
          </div>

        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 bg-base-200/50 border-t border-base-200 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/paiement-fournisseur')} // ← CORRIGÉ: singulier
            className="btn btn-ghost flex-1 gap-2"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 gap-2 shadow-lg hover:shadow-xl transition-all"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Modifier le paiement' : 'Enregistrer le paiement'}
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaiementsFournisseurForm;