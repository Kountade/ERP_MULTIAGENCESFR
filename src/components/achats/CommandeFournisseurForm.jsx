// src/components/achats/CommandeFournisseurForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, Plus, Minus, Trash2, User, ShoppingCart,
  CheckCircle, AlertCircle, Loader2, Building2, 
  Package, DollarSign, FileText, Warehouse, Truck, Calendar,
  Clock, Hash, Tag, MapPin
} from 'lucide-react';

const CommandeFournisseurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // États généraux
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [agences, setAgences] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedAgence, setSelectedAgence] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  
  // Champs du formulaire
  const [expectedDate, setExpectedDate] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  // Items (lignes de produits)
  const [items, setItems] = useState([]);

  // Totaux
  const [totals, setTotals] = useState({ subtotal: 0, tax_total: 0, grand_total: 0 });

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ============================================================
  // 1. Chargement des données initiales
  // ============================================================
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [suppliersRes, agencesRes, productsRes] = await Promise.all([
          AxiosInstance.get('/suppliers/'),
          AxiosInstance.get('/agences/'),
          AxiosInstance.get('/products/')
        ]);
        
        setSuppliers(suppliersRes.data || []);
        setAgences(agencesRes.data || []);
        setProducts(productsRes.data || []);
        
        // Sélectionner la première agence par défaut
        if (agencesRes.data && agencesRes.data.length > 0) {
          setSelectedAgence(agencesRes.data[0]);
        }
        
        if (isEditMode) {
          await fetchCommande();
        }
      } catch (error) {
        console.error('Erreur chargement des données:', error);
        showNotification('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  // ============================================================
  // 2. Chargement de la commande en mode édition
  // ============================================================
  const fetchCommande = async () => {
    try {
      const response = await AxiosInstance.get(`/purchase-orders/${id}/`);
      const commande = response.data;
      
      setSelectedSupplier(commande.supplier);
      setSelectedAgence(commande.agence);
      setExpectedDate(commande.expected_date || '');
      setUrgency(commande.urgency || 'normal');
      setShippingAddress(commande.shipping_address || '');
      setNotes(commande.notes || '');
      setInternalNotes(commande.internal_notes || '');
      
      // Charger les items
      const loadedItems = (commande.items || []).map(item => ({
        id: item.id || Date.now() + Math.random(),
        product_id: item.product,
        product_name: item.product_name,
        product_reference: item.product_reference || '',
        quantity: item.quantity_ordered || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        discount: parseFloat(item.discount_rate) || 0,
        tax_rate: parseFloat(item.tax_rate) || 20,
        supplier_reference: item.supplier_reference || '',
        total: parseFloat(item.total) || 0
      }));
      
      setItems(loadedItems);
      calculateTotals(loadedItems);
      
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      showNotification('Erreur lors du chargement de la commande', 'error');
    }
  };

  // ============================================================
  // 3. Gestion des lignes (items) - AVEC VÉRIFICATION DES DOUBLONS
  // ============================================================
  
  // Vérifier si un produit est déjà dans la liste
  const isProductAlreadyAdded = (productId) => {
    return items.some(item => item.product_id === productId);
  };

  // Ajouter un nouvel item avec vérification des doublons
  const handleAddItem = () => {
    const availableProducts = products.filter(p => !isProductAlreadyAdded(p.id));
    if (availableProducts.length === 0) {
      showNotification('Tous les produits sont déjà dans la liste', 'warning');
      return;
    }
    
    const firstAvailable = availableProducts[0];
    setItems(prev => [...prev, {
      id: Date.now(),
      product_id: firstAvailable.id,
      product_name: firstAvailable.name,
      product_reference: firstAvailable.reference || '',
      quantity: 1,
      unit_price: firstAvailable.last_purchase_price || firstAvailable.standard_price || 0,
      discount: 0,
      tax_rate: 20,
      supplier_reference: '',
      total: firstAvailable.last_purchase_price || firstAvailable.standard_price || 0
    }]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Si le produit change, mettre à jour les infos
        if (field === 'product_id') {
          const product = products.find(p => p.id === parseInt(value));
          if (product) {
            // Vérifier si le produit est déjà utilisé ailleurs (sauf pour l'item en cours)
            const isDuplicate = items.some(other => 
              other.id !== itemId && other.product_id === parseInt(value)
            );
            
            if (isDuplicate) {
              showNotification(`Le produit "${product.name}" est déjà dans la liste`, 'warning');
              return item; // Retourner l'item inchangé
            }
            
            updatedItem.product_name = product.name;
            updatedItem.product_reference = product.reference || '';
            updatedItem.unit_price = product.last_purchase_price || product.standard_price || 0;
          }
        }
        
        // Recalculer le total si quantité, prix, remise ou TVA change
        if (field === 'quantity' || field === 'unit_price' || field === 'discount' || field === 'tax_rate' || field === 'product_id') {
          const qty = parseFloat(updatedItem.quantity) || 0;
          const price = parseFloat(updatedItem.unit_price) || 0;
          const discount = parseFloat(updatedItem.discount) || 0;
          const taxRate = parseFloat(updatedItem.tax_rate) || 0;
          
          const discountAmount = qty * price * (discount / 100);
          const subtotal = qty * price - discountAmount;
          const taxAmount = subtotal * (taxRate / 100);
          updatedItem.total = subtotal + taxAmount;
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  // ============================================================
  // 4. Calcul des totaux
  // ============================================================
  const calculateTotals = (itemsList) => {
    const subtotal = itemsList.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (qty * price * (1 - discount / 100));
    }, 0);
    
    const tax_total = itemsList.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const subtotal = qty * price * (1 - discount / 100);
      return sum + (subtotal * taxRate / 100);
    }, 0);
    
    const grand_total = subtotal + tax_total;
    setTotals({ subtotal, tax_total, grand_total });
  };

  // ============================================================
  // 5. Soumission de la commande - AVEC VÉRIFICATION DES DOUBLONS
  // ============================================================
  const handleSubmit = async () => {
    // Vérifier que tous les items ont un produit sélectionné
    const emptyItems = items.filter(item => !item.product_id);
    if (emptyItems.length > 0) {
      showNotification('Veuillez sélectionner un produit pour chaque ligne', 'error');
      return;
    }

    if (items.length === 0) {
      showNotification('Ajoutez au moins un produit à la commande', 'error');
      return;
    }
    
    if (!selectedSupplier) {
      showNotification('Veuillez sélectionner un fournisseur', 'error');
      return;
    }
    
    if (!selectedAgence) {
      showNotification('Veuillez sélectionner une agence', 'error');
      return;
    }
    
    if (!expectedDate) {
      showNotification('Veuillez renseigner la date de livraison prévue', 'error');
      return;
    }
    
    if (!shippingAddress.trim()) {
      showNotification('Veuillez renseigner l\'adresse de livraison', 'error');
      return;
    }

    // ✅ VÉRIFICATION DES DOUBLONS AVANT ENVOI
    const productIds = items.map(item => item.product_id);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      showNotification('Des produits sont dupliqués dans la liste. Veuillez corriger.', 'error');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      supplier: selectedSupplier.id,
      agence: selectedAgence.id,
      expected_date: expectedDate,
      urgency: urgency,
      shipping_address: shippingAddress,
      notes: notes,
      internal_notes: internalNotes,
      items: items.map(item => ({
        product: parseInt(item.product_id),
        quantity_ordered: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        discount_rate: parseFloat(item.discount) || 0,
        tax_rate: parseFloat(item.tax_rate) || 20,
        supplier_reference: item.supplier_reference || ''
      }))
    };

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/purchase-orders/${id}/`, payload);
        showNotification('Commande modifiée avec succès !', 'success');
      } else {
        await AxiosInstance.post('/purchase-orders/', payload);
        showNotification('Commande créée avec succès !', 'success');
      }
      setTimeout(() => navigate('/commandes-fournisseurs'), 2000);
    } catch (error) {
      console.error(error);
      let errorMessage = 'Erreur lors de l\'enregistrement';
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      else if (error.response?.data?.non_field_errors) errorMessage = error.response.data.non_field_errors.join(', ');
      showNotification(errorMessage, 'error', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // 6. Gestion de la quantité
  // ============================================================
  const handleQuantityChange = (itemId, newQuantity) => {
    const safeQty = Math.max(1, newQuantity);
    handleItemChange(itemId, 'quantity', safeQty);
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price || 0) + ' FCFA';

  const urgencyOptions = [
    { value: 'normal', label: 'Normal', color: 'success' },
    { value: 'urgent', label: 'Urgent', color: 'warning' },
    { value: 'very_urgent', label: 'Très urgent', color: 'error' }
  ];

  // Filtrer les produits disponibles (non déjà ajoutés)
  const getAvailableProducts = () => {
    const selectedIds = items.map(item => item.product_id);
    return products.filter(p => !selectedIds.includes(p.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement de l'environnement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 lg:px-0 py-4 lg:py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
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
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-5 px-4 lg:px-6 mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 max-w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier la commande' : 'Nouvelle commande'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {selectedAgence ? `Agence : ${selectedAgence.nom}` : 'Commande fournisseur'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/commandes-fournisseurs" className="btn btn-outline btn-sm lg:btn-md gap-2">
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
      <div className="max-w-full mx-0 px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-4 lg:p-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Fournisseur <span className="text-error">*</span>
                  </span>
                </label>
                <select 
                  className="select select-bordered w-full" 
                  value={selectedSupplier?.id || ''} 
                  onChange={(e) => {
                    const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
                    setSelectedSupplier(supplier || null);
                  }}
                  disabled={isEditMode}
                >
                  <option value="">-- Sélectionner un fournisseur --</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name} - {supplier.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-primary" />
                    Agence <span className="text-error">*</span>
                  </span>
                </label>
                <select 
                  className="select select-bordered w-full" 
                  value={selectedAgence?.id || ''} 
                  onChange={(e) => {
                    const agence = agences.find(a => a.id === parseInt(e.target.value));
                    setSelectedAgence(agence || null);
                  }}
                >
                  <option value="">-- Sélectionner une agence --</option>
                  {agences.map(agence => (
                    <option key={agence.id} value={agence.id}>
                      {agence.nom} - {agence.ville}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Livraison prévue <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Urgence et adresse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Niveau d'urgence
                  </span>
                </label>
                <div className="flex gap-4 flex-wrap">
                  {urgencyOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={urgency === option.value}
                        onChange={(e) => setUrgency(e.target.value)}
                        className={`radio radio-${option.color} radio-sm`}
                      />
                      <span className={`text-sm text-${option.color}`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Adresse de livraison <span className="text-error">*</span>
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows="2"
                  placeholder="Adresse complète de livraison"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Articles */}
            <div className="border-t border-base-300 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Articles
                  <span className="badge badge-primary badge-sm">{items.length}</span>
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500 self-center">
                    {getAvailableProducts().length} produits disponibles
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    onClick={handleAddItem}
                    disabled={submitting || getAvailableProducts().length === 0}
                  >
                    <Plus className="w-4 h-4" /> Ajouter une ligne
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Aucun article ajouté</p>
                  <p className="text-sm text-gray-400">Cliquez sur "Ajouter une ligne" pour commencer</p>
                </div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-sm">Ligne #{index + 1}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
                        {/* Select Produit - avec filtrage des doublons */}
                        <div className="form-control w-full md:col-span-2">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">Produit</span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={item.product_id}
                            onChange={(e) => handleItemChange(item.id, 'product_id', parseInt(e.target.value))}
                            disabled={submitting}
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map(p => {
                              const isSelected = items.some(other => other.id !== item.id && other.product_id === p.id);
                              return (
                                <option key={p.id} value={p.id} disabled={isSelected}>
                                  {p.name} - {p.reference}
                                  {isSelected && ' ⚠️ déjà ajouté'}
                                </option>
                              );
                            })}
                          </select>
                          {item.supplier_reference && (
                            <span className="text-xs text-gray-500 mt-1">Réf fourn: {item.supplier_reference}</span>
                          )}
                        </div>

                        {/* Quantité */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">Qté</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              className="btn btn-ghost btn-xs btn-square"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || submitting}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              className="input input-bordered w-full text-center"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              min="1"
                              disabled={submitting}
                            />
                            <button
                              className="btn btn-ghost btn-xs btn-square"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={submitting}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Prix unitaire */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">Prix unit.</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered w-full"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                            disabled={submitting}
                          />
                        </div>

                        {/* Remise */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">Remise %</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered w-full"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            disabled={submitting}
                          />
                        </div>

                        {/* TVA */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">TVA %</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered w-full"
                            value={item.tax_rate}
                            onChange={(e) => handleItemChange(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            disabled={submitting}
                          />
                        </div>

                        {/* Réf fournisseur */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold">Réf fourn.</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={item.supplier_reference}
                            onChange={(e) => handleItemChange(item.id, 'supplier_reference', e.target.value)}
                            placeholder="Réf. fournisseur"
                            disabled={submitting}
                          />
                        </div>

                        {/* Total */}
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm font-semibold text-primary">Total TTC</span>
                          </label>
                          <div className="h-10 flex items-center justify-end px-3 bg-primary/5 rounded-lg border border-primary/20">
                            <span className="font-bold text-primary">{formatPrice(item.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total général */}
                  <div className="text-right pt-4 border-t border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total HT</span>
                        <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-info">
                        <span className="text-gray-600">Total TVA</span>
                        <span>{formatPrice(totals.tax_total)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total TTC</span>
                        <span className="text-primary">{formatPrice(totals.grand_total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes (visibles par le fournisseur)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="2"
                  placeholder="Instructions particulières pour le fournisseur..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes internes
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="2"
                  placeholder="Notes confidentielles (visible uniquement en interne)..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-base-200/50 border-t border-base-200">
            <Link to="/commandes-fournisseurs" className="btn btn-ghost gap-2">
              Annuler
            </Link>
            <button 
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier la commande' : 'Valider la commande'}
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

export default CommandeFournisseurForm;