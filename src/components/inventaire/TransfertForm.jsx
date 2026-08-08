// src/pages/transferts/TransfertForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, AlertCircle, CheckCircle,
  ArrowLeftRight, Package, Building2, Calendar, FileText, X, 
  Search, Hash, Tag, Info, Store
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const TransfertForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    from_agence_id: '',
    to_agence_id: '',
    expected_date: '',
    notes: '',
    items: []
  });

  const [agences, setAgences] = useState([]);
  const [agencesPrincipales, setAgencesPrincipales] = useState([]);
  const [agencesSecondaires, setAgencesSecondaires] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newItem, setNewItem] = useState({ product: '', quantity: 1, unit_price: 0 });
  const [categories, setCategories] = useState([]);
  const [totals, setTotals] = useState({ total_quantity: 0, total_value: 0 });

  const user = JSON.parse(localStorage.getItem('User') || '{}');
  const agenceCourante = JSON.parse(localStorage.getItem('AgenceCourante') || '{}');

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        console.log('🚀 Chargement des données...');

        // Récupérer toutes les agences
        const agencesRes = await AxiosInstance.get('/agences/');
        const toutesLesAgences = agencesRes.data || [];
        
        console.log(`📊 ${toutesLesAgences.length} agences récupérées`);
        
        setAgences(toutesLesAgences);
        
        // Filtrer les agences principales actives
        const principales = toutesLesAgences.filter(
          a => a.type_agence === 'principale' && a.est_active
        );
        setAgencesPrincipales(principales);
        console.log(`✅ ${principales.length} agences principales actives:`, 
          principales.map(a => a.nom).join(', '));
        
        // Filtrer les agences secondaires actives
        const secondaires = toutesLesAgences.filter(
          a => a.type_agence === 'secondaire' && a.est_active
        );
        setAgencesSecondaires(secondaires);
        console.log(`✅ ${secondaires.length} agences secondaires actives:`, 
          secondaires.map(a => a.nom).join(', '));

        // Récupérer les produits
        const produitsRes = await AxiosInstance.get('/products/');
        const tousLesProduits = produitsRes.data || [];
        setProducts(tousLesProduits);
        console.log(`📊 ${tousLesProduits.length} produits récupérés`);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(
          tousLesProduits.map(p => p.category_name).filter(Boolean)
        )];
        setCategories(uniqueCategories.sort());
        
        // Pré-sélectionner l'agence de destination si secondaire
        if (agenceCourante?.id && agenceCourante?.type_agence === 'secondaire') {
          setFormData(prev => ({ 
            ...prev, 
            to_agence_id: agenceCourante.id.toString() 
          }));
          console.log('🎯 Destination pré-sélectionnée:', agenceCourante.nom);
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement:', error);
        let errorMsg = 'Erreur de chargement des données';
        
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
          
          if (error.response.status === 401) {
            errorMsg = 'Session expirée. Veuillez vous reconnecter.';
          } else if (error.response.data?.detail) {
            errorMsg = error.response.data.detail;
          } else if (error.response.data?.error) {
            errorMsg = error.response.data.error;
          }
        } else if (error.request) {
          errorMsg = 'Serveur inaccessible. Vérifiez votre connexion.';
        }
        
        showNotification(errorMsg, 'error');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const calculateTotals = (items) => {
    let totalQty = 0, totalVal = 0;
    items.forEach(item => {
      totalQty += item.quantity || 0;
      totalVal += (item.quantity || 0) * (item.unit_price || 0);
    });
    setTotals({ total_quantity: totalQty, total_value: totalVal });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA';
    return parseFloat(amount).toLocaleString('fr-FR') + ' FCFA';
  };

  // =====================================================
  // GESTION DES PRODUITS
  // =====================================================

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setNewItem({
      product: product.id,
      quantity: 1,
      unit_price: product.sale_price || product.purchase_price || 0
    });
  };

  const addProduct = () => {
    if (!selectedProduct) {
      showNotification('Veuillez sélectionner un produit', 'error');
      return;
    }
    if (!newItem.quantity || newItem.quantity <= 0) {
      showNotification('La quantité doit être supérieure à 0', 'error');
      return;
    }
    if (!newItem.unit_price || newItem.unit_price <= 0) {
      showNotification('Le prix unitaire doit être supérieur à 0', 'error');
      return;
    }
    if (formData.items.some(item => item.product === selectedProduct.id)) {
      showNotification('Ce produit est déjà dans la liste', 'error');
      return;
    }

    const newItemObj = {
      id: Date.now(),
      product: selectedProduct.id,
      product_name: selectedProduct.name,
      product_reference: selectedProduct.reference || 'N/A',
      quantity: parseInt(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total: parseInt(newItem.quantity) * parseFloat(newItem.unit_price)
    };
    
    const updatedItems = [...formData.items, newItemObj];
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
    
    // Réinitialiser
    setSelectedProduct(null);
    setNewItem({ product: '', quantity: 1, unit_price: 0 });
    setProductSearch('');
    setProductCategory('');
    setShowProductModal(false);
    
    showNotification(`${selectedProduct.name} ajouté au transfert`, 'success');
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    const qty = parseInt(quantity) || 0;
    updatedItems[index].quantity = qty;
    updatedItems[index].total = qty * (updatedItems[index].unit_price || 0);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
  };

  const updateItemPrice = (index, price) => {
    const updatedItems = [...formData.items];
    const pr = parseFloat(price) || 0;
    updatedItems[index].unit_price = pr;
    updatedItems[index].total = (updatedItems[index].quantity || 0) * pr;
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
  };

  // =====================================================
  // GESTION DU FORMULAIRE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.from_agence_id) {
      newErrors.from_agence_id = 'Veuillez sélectionner une agence source';
    }
    
    if (!formData.to_agence_id) {
      newErrors.to_agence_id = 'Veuillez sélectionner une agence de destination';
    }
    
    if (formData.from_agence_id && formData.to_agence_id && 
        formData.from_agence_id === formData.to_agence_id) {
      newErrors.to_agence_id = 'Les agences source et destination doivent être différentes';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'Ajoutez au moins un article au transfert';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // SOUMISSION DU FORMULAIRE (CORRIGÉE)
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Construction correcte du payload
      const payload = {
        from_agence: parseInt(formData.from_agence_id),
        to_agence: parseInt(formData.to_agence_id),
        expected_date: formData.expected_date || null,
        notes: formData.notes || '',
        items: formData.items.map(item => ({
          product: parseInt(item.product),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      
      console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2));
      
      // Vérification détaillée des items
      console.log('🔍 Vérification des items:');
      payload.items.forEach((item, index) => {
        console.log(`  Article ${index + 1}:`, {
          product: `${item.product} (type: ${typeof item.product})`,
          quantity: `${item.quantity} (type: ${typeof item.quantity})`,
          unit_price: `${item.unit_price} (type: ${typeof item.unit_price})`
        });
      });
      
      const response = await AxiosInstance.post('/transfers/', payload);
      
      console.log('✅ Transfert créé:', response.data);
      
      showNotification('Demande de transfert créée avec succès !', 'success');
      
      setTimeout(() => {
        navigate('/transferts');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur création transfert:', error);
      console.error('Détails erreur:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Erreur lors de la création du transfert';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Gestion des différents formats d'erreur
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.items) {
          // Erreurs sur les items
          if (Array.isArray(data.items)) {
            errorMessage = data.items.map((item, i) => 
              `Article ${i + 1}: ${JSON.stringify(item)}`
            ).join(' | ');
          } else if (typeof data.items === 'object') {
            errorMessage = 'Erreur articles: ' + JSON.stringify(data.items);
          }
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors.join(', ') 
            : data.non_field_errors;
        } else {
          // Erreurs de validation par champ
          const fieldErrors = Object.entries(data)
            .filter(([_, v]) => v)
            .map(([field, msgs]) => {
              const msgArray = Array.isArray(msgs) ? msgs : [msgs];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join(' | ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RENDU : CHARGEMENT
  // =====================================================
  
  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Chargement des agences et produits...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDU : FORMULAIRE
  // =====================================================
  
  return (
    <div className="min-h-screen bg-base-200 py-4 px-4 sm:py-6 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Notification */}
        {notification.show && (
          <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className={`alert shadow-lg ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {notification.type === 'success' ? 
                <CheckCircle className="w-5 h-5" /> : 
                <AlertCircle className="w-5 h-5" />
              }
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))} 
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Fil d'Ariane */}
        <div className="mb-4">
          <Link to="/transferts" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux transferts
          </Link>
        </div>

        {/* Carte formulaire */}
        <div className="card bg-base-100 shadow-xl border border-primary/20">
          <div className="card-body p-4 sm:p-6">
            
            {/* En-tête */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-3">
                <ArrowLeftRight className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Nouvelle demande de transfert</h2>
              <p className="text-base-content/60 text-sm">
                Depuis une agence principale vers une agence secondaire
              </p>
              
              {/* Info agences */}
              <div className="mt-2 text-xs text-base-content/40">
                {agencesPrincipales.length} agence(s) principale(s) active(s) |{' '}
                {agencesSecondaires.length} agence(s) secondaire(s) active(s)
              </div>
              
              {agenceCourante?.nom && (
                <div className="badge badge-outline mt-2">{agenceCourante.nom}</div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Sélection des agences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Agence SOURCE (Principale) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Agence source (Principale)
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <select 
                    name="from_agence_id" 
                    value={formData.from_agence_id} 
                    onChange={handleChange} 
                    className={`select select-bordered w-full ${errors.from_agence_id ? 'select-error' : ''}`}
                  >
                    <option value="">
                      -- Sélectionner une agence principale --
                    </option>
                    {agencesPrincipales.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.nom} - {ag.ville} ({ag.code})
                      </option>
                    ))}
                  </select>
                  {errors.from_agence_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.from_agence_id}</span>
                    </label>
                  )}
                  {agencesPrincipales.length === 0 && (
                    <label className="label">
                      <span className="label-text-alt text-warning">
                        ⚠️ Aucune agence principale active
                      </span>
                    </label>
                  )}
                </div>

                {/* Agence DESTINATION (Secondaire) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Store className="w-4 h-4 text-secondary" />
                      Agence destination (Secondaire)
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <select 
                    name="to_agence_id" 
                    value={formData.to_agence_id} 
                    onChange={handleChange} 
                    className={`select select-bordered w-full ${errors.to_agence_id ? 'select-error' : ''}`}
                    disabled={
                      agenceCourante?.type_agence === 'secondaire' && 
                      agenceCourante?.id && 
                      formData.to_agence_id === agenceCourante.id.toString()
                    }
                  >
                    <option value="">
                      -- Sélectionner une agence secondaire --
                    </option>
                    {agencesSecondaires.map(ag => (
                      <option key={ag.id} value={ag.id}>
                        {ag.nom} - {ag.ville} ({ag.code})
                      </option>
                    ))}
                  </select>
                  {errors.to_agence_id && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.to_agence_id}</span>
                    </label>
                  )}
                  {agenceCourante?.type_agence === 'secondaire' && (
                    <label className="label">
                      <span className="label-text-alt text-info">
                        ✓ Votre agence de rattachement
                      </span>
                    </label>
                  )}
                  {agencesSecondaires.length === 0 && (
                    <label className="label">
                      <span className="label-text-alt text-warning">
                        ⚠️ Aucune agence secondaire active
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Date et Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date prévue
                    </span>
                  </label>
                  <input 
                    type="date" 
                    name="expected_date" 
                    value={formData.expected_date} 
                    onChange={handleChange} 
                    className="input input-bordered w-full" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes / Motif
                    </span>
                  </label>
                  <textarea 
                    name="notes" 
                    rows="2" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    className="textarea textarea-bordered w-full" 
                    placeholder="Motif du transfert, instructions particulières..."
                  />
                </div>
              </div>

              {/* Section Articles */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Articles à transférer
                      {formData.items.length > 0 && (
                        <span className="badge badge-primary">
                          {formData.items.length} article{formData.items.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowProductModal(true)} 
                    className="btn btn-primary gap-2"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un produit
                  </button>
                </div>
                
                {errors.items && (
                  <div className="alert alert-error mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.items}</span>
                  </div>
                )}
                
                {formData.items.length === 0 ? (
                  <div className="text-center py-16 bg-base-200 rounded-xl border-2 border-dashed border-base-300">
                    <Package className="w-16 h-16 mx-auto text-base-content/20 mb-3" />
                    <p className="text-base-content/50">Aucun article ajouté</p>
                    <p className="text-sm text-base-content/40 mt-1">
                      Cliquez sur "Ajouter un produit" pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-base-200">
                    <table className="table table-zebra">
                      <thead className="bg-base-200">
                        <tr>
                          <th>#</th>
                          <th>Produit</th>
                          <th>Référence</th>
                          <th className="text-center">Quantité</th>
                          <th className="text-right">Prix unitaire</th>
                          <th className="text-right">Total</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => (
                          <tr key={item.id} className="hover">
                            <td className="text-center text-sm opacity-50">{idx + 1}</td>
                            <td className="font-medium">{item.product_name}</td>
                            <td>
                              <code className="text-xs bg-base-200 px-2 py-1 rounded">
                                {item.product_reference}
                              </code>
                            </td>
                            <td className="text-center">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => updateItemQuantity(idx, e.target.value)} 
                                min="1" 
                                className="input input-xs input-bordered w-20 text-center" 
                              />
                            </td>
                            <td className="text-right">
                              <input 
                                type="number" 
                                value={item.unit_price} 
                                onChange={e => updateItemPrice(idx, e.target.value)} 
                                min="0" 
                                step="1" 
                                className="input input-xs input-bordered w-28 text-right" 
                              />
                            </td>
                            <td className="text-right font-semibold">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="text-center">
                              <button 
                                type="button" 
                                onClick={() => removeItem(idx)} 
                                className="btn btn-xs btn-ghost text-error"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-base-200 font-bold">
                          <td colSpan="3" className="text-right">Total</td>
                          <td className="text-center">
                            <span className="badge badge-primary">{totals.total_quantity}</span>
                          </td>
                          <td></td>
                          <td className="text-right text-primary text-lg">
                            {formatCurrency(totals.total_value)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <button 
                  type="submit" 
                  disabled={submitting || formData.items.length === 0} 
                  className="btn btn-primary flex-1 gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span> 
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> 
                      Enregistrer la demande
                    </>
                  )}
                </button>
                <Link to="/transferts" className="btn btn-outline">
                  Annuler
                </Link>
              </div>
              
              {/* Note d'information */}
              <div className="mt-4 p-3 bg-info/5 rounded-lg border border-info/20">
                <p className="text-sm text-base-content/60 flex items-center gap-2">
                  <Info className="w-4 h-4 text-info" />
                  La demande sera envoyée au chef de l'agence principale pour approbation.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL DE SÉLECTION DE PRODUIT */}
      {/* ===================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* En-tête modal */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary-focus p-4 sm:p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ajouter un produit</h2>
                  <p className="text-white/70 text-sm">
                    {products.length} produit(s) disponible(s)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                  setProductSearch('');
                  setProductCategory('');
                }} 
                className="btn btn-ghost btn-circle text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Corps modal */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* Liste produits */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-base-200">
                {/* Recherche */}
                <div className="space-y-3 mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input 
                      type="text" 
                      placeholder="Rechercher par nom, référence..." 
                      value={productSearch} 
                      onChange={e => setProductSearch(e.target.value)} 
                      className="input input-bordered w-full pl-12" 
                      autoFocus 
                    />
                  </div>
                  <select 
                    value={productCategory} 
                    onChange={e => setProductCategory(e.target.value)} 
                    className="select select-bordered w-full"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                {/* Grille produits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products
                    .filter(p => {
                      const searchLower = productSearch.toLowerCase();
                      const matchSearch = !productSearch || 
                        (p.name || '').toLowerCase().includes(searchLower) ||
                        (p.reference || '').toLowerCase().includes(searchLower) ||
                        (p.barcode || '').toLowerCase().includes(searchLower);
                      const matchCategory = !productCategory || p.category_name === productCategory;
                      return matchSearch && matchCategory;
                    })
                    .map(product => {
                      const isSelected = selectedProduct?.id === product.id;
                      const isAlreadyAdded = formData.items.some(
                        item => item.product === product.id
                      );
                      
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => !isAlreadyAdded && handleProductSelect(product)}
                          disabled={isAlreadyAdded}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : isAlreadyAdded
                                ? 'border-success/50 bg-success/5 opacity-60 cursor-not-allowed'
                                : 'border-base-200 hover:border-base-300 hover:bg-base-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <code className="text-xs bg-base-300/50 px-2 py-0.5 rounded font-mono">
                                  <Hash className="inline w-3 h-3 mr-1" />
                                  {product.reference || 'N/A'}
                                </code>
                                {product.category_name && (
                                  <span className="text-xs bg-base-300/50 px-2 py-0.5 rounded">
                                    <Tag className="inline w-3 h-3 mr-1" />
                                    {product.category_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-primary">
                                {formatCurrency(product.sale_price || product.purchase_price)}
                              </div>
                              <div className={`text-xs font-medium mt-1 ${
                                (product.stock_quantity || 0) <= 0 
                                  ? 'text-error' 
                                  : (product.stock_quantity || 0) <= (product.minimum_stock || 5)
                                    ? 'text-warning'
                                    : 'text-success'
                              }`}>
                                Stock: {product.stock_quantity || 0}
                              </div>
                            </div>
                          </div>
                          {isAlreadyAdded && (
                            <div className="mt-3 text-xs text-success font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Déjà ajouté au transfert
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
                
                {/* Aucun résultat */}
                {products.filter(p => {
                  const searchLower = productSearch.toLowerCase();
                  const matchSearch = !productSearch || 
                    (p.name || '').toLowerCase().includes(searchLower) ||
                    (p.reference || '').toLowerCase().includes(searchLower) ||
                    (p.barcode || '').toLowerCase().includes(searchLower);
                  const matchCategory = !productCategory || p.category_name === productCategory;
                  return matchSearch && matchCategory;
                }).length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                    <p className="text-lg font-medium text-base-content/50">
                      Aucun produit trouvé
                    </p>
                    <p className="text-base-content/40 mt-1">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                )}
              </div>
              
              {/* Panneau détail produit */}
              {selectedProduct && (
                <div className="w-full lg:w-96 bg-base-200/50 p-4 sm:p-6 overflow-y-auto">
                  <div className="space-y-5">
                    {/* Info produit */}
                    <div className="bg-base-100 rounded-xl p-4 shadow-sm">
                      <h4 className="font-bold text-lg mb-3">{selectedProduct.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Référence</span>
                          <span className="font-mono font-medium">
                            {selectedProduct.reference || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-base-200">
                          <span className="text-base-content/60">Stock</span>
                          <span className={`font-medium ${
                            (selectedProduct.stock_quantity || 0) > 0 
                              ? 'text-success' 
                              : 'text-error'
                          }`}>
                            {selectedProduct.stock_quantity || 0}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-base-content/60">Prix standard</span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(selectedProduct.sale_price || selectedProduct.purchase_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantité */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Quantité *</span>
                      </label>
                      <input 
                        type="number" 
                        value={newItem.quantity} 
                        onChange={e => setNewItem(prev => ({ 
                          ...prev, 
                          quantity: parseInt(e.target.value) || 0 
                        }))} 
                        min="1"
                        max={selectedProduct.stock_quantity || 1000}
                        className="input input-bordered w-full text-lg" 
                      />
                    </div>
                    
                    {/* Prix unitaire */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Prix unitaire *</span>
                      </label>
                      <input 
                        type="number" 
                        value={newItem.unit_price} 
                        onChange={e => setNewItem(prev => ({ 
                          ...prev, 
                          unit_price: parseFloat(e.target.value) || 0 
                        }))} 
                        min="0" 
                        step="1" 
                        className="input input-bordered w-full text-lg" 
                      />
                    </div>
                    
                    {/* Total */}
                    <div className="bg-primary/10 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium">Total</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency((newItem.quantity || 0) * (newItem.unit_price || 0))}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bouton ajouter */}
                    <button 
                      type="button" 
                      onClick={addProduct} 
                      className="btn btn-primary w-full gap-2 btn-lg"
                      disabled={
                        !selectedProduct || 
                        !newItem.quantity || 
                        newItem.quantity <= 0 || 
                        !newItem.unit_price || 
                        newItem.unit_price <= 0
                      }
                    >
                      <Plus className="w-5 h-5" /> Ajouter au transfert
                    </button>
                  </div>
                </div>
              )}
              
              {/* Message si aucun produit sélectionné */}
              {!selectedProduct && (
                <div className="w-full lg:w-96 bg-base-200/50 p-4 sm:p-6 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-base-content/15 mb-4" />
                    <p className="text-base-content/50">
                      Sélectionnez un produit dans la liste
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default TransfertForm;