// src/components/expenses/ExpenseForm.jsx - Version pleine largeur

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Receipt,
  Car,
  Utensils,
  Hotel,
  Package,
  Handshake,
  ClipboardList,
  Plus,
  Image,
  Paperclip
} from 'lucide-react';

const ExpenseForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    expense_type: 'transport',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null
  });
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptName, setReceiptName] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt') {
      const file = files && files[0];
      if (file) {
        setFormData({ ...formData, receipt: file });
        setReceiptName(file.name);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFormData({ ...formData, receipt: null });
        setReceiptName('');
        setReceiptPreview(null);
      }
    } else if (name === 'amount') {
      const cleanedValue = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, amount: cleanedValue });
      setAmountError('');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateAmount = (value) => {
    if (!value || value === '') {
      setAmountError('Le montant est requis');
      return false;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setAmountError('Le montant doit être supérieur à 0');
      return false;
    }
    if (num > 999999999) {
      setAmountError('Le montant ne peut pas dépasser 999 999 999 GNF');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateAmount(formData.amount)) {
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.trim().length < 3) {
      setError('La description doit contenir au moins 3 caractères');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('expense_type', formData.expense_type);
    data.append('amount', parseFloat(formData.amount).toString());
    data.append('date', formData.date);
    data.append('description', formData.description.trim());
    
    if (formData.receipt instanceof File) {
      data.append('receipt', formData.receipt);
    }

    console.log('📤 Envoi des données:');
    for (let [key, value] of data.entries()) {
      if (key === 'receipt') {
        console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      const response = await AxiosInstance.post('/expenses/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Succès:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/expenses'), 2000);
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      
      if (error.response) {
        console.error('📋 Réponse du serveur:', error.response.data);
        console.error('📋 Status:', error.response.status);
        
        const errors = error.response.data;
        let errorMessage = '';
        
        if (typeof errors === 'object') {
          for (const [field, messages] of Object.entries(errors)) {
            if (Array.isArray(messages)) {
              errorMessage += `${field}: ${messages.join(', ')}\n`;
            } else if (typeof messages === 'string') {
              errorMessage += `${field}: ${messages}\n`;
            } else if (typeof messages === 'object') {
              errorMessage += `${field}: ${JSON.stringify(messages)}\n`;
            }
          }
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        } else {
          errorMessage = 'Erreur lors de la soumission';
        }
        
        setError(errorMessage || 'Erreur inconnue');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const expenseTypes = [
    { value: 'transport', label: 'Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'meal', label: 'Repas', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: 'accommodation', label: 'Hébergement', icon: Hotel, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: 'supplies', label: 'Fournitures', icon: Package, color: 'text-green-500', bg: 'bg-green-50' },
    { value: 'client', label: 'Client', icon: Handshake, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { value: 'other', label: 'Autre', icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-50' }
  ];

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/expenses')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Receipt className="w-6 h-6 sm:w-8 sm:h-8" />
              Nouvelle note de frais
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Saisissez les détails de votre dépense
            </p>
          </div>
        </div>
      </div>

      {/* Succès */}
      {success && (
        <div className="alert alert-success mb-6 shadow-lg animate-slideDown">
          <CheckCircle className="w-5 h-5" />
          <div className="flex-1">
            <span className="font-bold">Note soumise avec succès !</span>
            <p className="text-sm opacity-80">Vous serez redirigé vers la liste...</p>
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
        encType="multipart/form-data"
        className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden w-full"
      >
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Type de dépense */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2 text-base">
                <Tag className="w-4 h-4 text-primary" />
                Type de dépense
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {expenseTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.expense_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, expense_type: type.value })}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                        : 'border-base-200 hover:border-primary/50 hover:bg-base-200/50 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/10' : type.bg}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : type.color}`} />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-base-content'}`}>
                      {type.label}
                    </span>
                    {isSelected && <CheckCircle className="w-3 h-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant et Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Montant (GNF)
                </span>
                <span className="label-text-alt text-error">{amountError}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xs font-bold">
                  GNF
                </span>
                <input
                  type="text"
                  name="amount"
                  placeholder="Ex: 25 000"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`
                    input w-full pl-12 pr-4 py-3 transition-all
                    ${amountError ? 'input-error' : 'input-bordered focus:input-primary'}
                  `}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date de la dépense
                </span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input input-bordered w-full py-3 focus:input-primary transition-all"
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Description
              </span>
            </label>
            <textarea
              name="description"
              placeholder="Décrivez la dépense en détail (ex: Taxi pour réunion client)"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-24 focus:textarea-primary transition-all resize-none"
              required
            />
          </div>

          {/* Reçu */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                Reçu / Justificatif
              </span>
              <span className="label-text-alt text-base-content/40">Optionnel</span>
            </label>
            
            <div 
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all
                ${receiptPreview 
                  ? 'border-success/50 bg-success/5' 
                  : 'border-base-300 hover:border-primary/50 hover:bg-base-200/30'
                }
              `}
            >
              <input
                type="file"
                name="receipt"
                onChange={handleChange}
                className="hidden"
                id="receipt-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer block"
              >
                {receiptPreview ? (
                  <div className="relative inline-block">
                    {receiptPreview.startsWith('data:image') ? (
                      <div className="relative">
                        <img
                          src={receiptPreview}
                          alt="Reçu"
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <div className="absolute bottom-2 right-2 bg-success text-white text-xs px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Chargé
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
                        <FileText className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium">{receiptName}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 btn btn-circle btn-error btn-xs shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        setReceiptPreview(null);
                        setReceiptName('');
                        setFormData({ ...formData, receipt: null });
                        document.getElementById('receipt-upload').value = '';
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="w-16 h-16 mx-auto bg-base-200 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-base-content/40" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-base-content/70">
                      Cliquez pour télécharger un reçu
                    </p>
                    <p className="text-xs text-base-content/40 mt-1 flex items-center justify-center gap-2">
                      <span>PDF</span>
                      <span className="w-1 h-1 rounded-full bg-base-content/20" />
                      <span>JPG</span>
                      <span className="w-1 h-1 rounded-full bg-base-content/20" />
                      <span>PNG</span>
                      <span className="w-1 h-1 rounded-full bg-base-content/20" />
                      <span>DOC</span>
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 bg-base-200/50 border-t border-base-200 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="btn btn-ghost flex-1 gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 gap-2 shadow-lg hover:shadow-xl transition-all"
            disabled={loading || !!amountError}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Soumettre la note
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

export default ExpenseForm;