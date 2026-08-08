// src/components/sales/DevisForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, Plus, Minus, Trash2, User, FileText,
  CheckCircle, AlertCircle, Loader2, Building2, Package, Calendar
} from 'lucide-react';

const DevisForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // États généraux
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [agence, setAgence] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [conditions, setConditions] = useState('');
  const [piedDePage, setPiedDePage] = useState('');
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ sous_total: 0, tva: 0, total: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ============================================================
  // 1. Chargement de l'utilisateur, agence
  // ============================================================
  useEffect(() => {
    const fetchUserAndAgence = async () => {
      try {
        const response = await AxiosInstance.get('/users/me/');
        const userData = response.data;
        const userAgences = userData.agences || [];

        if (userAgences.length === 0) {
          const agencesRes = await AxiosInstance.get('/agences/');
          const allAgences = agencesRes.data || [];
          if (allAgences.length > 0) setAgence(allAgences[0]);
          else showNotification('Aucune agence trouvée', 'error');
        } else {
          setAgence(userAgences[0]);
        }
      } catch (err) {
        console.error(err);
        showNotification('Erreur de chargement du profil', 'error');
      }
    };
    fetchUserAndAgence();
  }, []);

  // ============================================================
  // 2. Chargement des clients et produits
  // ============================================================
  useEffect(() => {
    if (!agence) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, productsRes] = await Promise.all([
          AxiosInstance.get('/clients/?is_active=true'),
          AxiosInstance.get('/products/?is_active=true')
        ]);
        setClients(clientsRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
        showNotification('Erreur de chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agence]);

  // ============================================================
  // 3. Si édition, charger le devis
  // ============================================================
  useEffect(() => {
    if (!isEditing || loading || !agence) return;
    const fetchDevis = async () => {
      try {
        const response = await AxiosInstance.get(`/devis/${id}/`);
        const devis = response.data;
        if (devis.agence && devis.agence.id !== agence.id) {
          showNotification(`Ce devis appartient à l'agence "${devis.agence.nom}". Vous ne pouvez que le consulter.`, 'error');
        }
        setSelectedClient(devis.client);
        setExpirationDate(devis.date_expiration?.split('T')[0] || '');
        setNotes(devis.notes || '');
        setConditions(devis.conditions || '');
        setPiedDePage(devis.pied_de_page || '');
        const cartItems = devis.items.map(item => ({
          id: item.id || Date.now() + Math.random(),
          product_id: item.product?.id || item.product,
          product_name: item.product_name,
          product_reference: item.product_reference,
          quantity: item.quantity,
          unit_price: item.prix_unitaire,
          total: item.total,
        }));
        setItems(cartItems);
        recalculTotaux(cartItems);
      } catch (err) {
        console.error(err);
        showNotification('Erreur de chargement du devis', 'error');
      }
    };
    fetchDevis();
  }, [id, isEditing, loading, agence]);

  // ============================================================
  // 4. Gestion des lignes (items) - COMME VenteForm
  // ============================================================
  
  // Vérifier si un produit est déjà dans la liste
  const isProductAlreadyAdded = (productId) => {
    return items.some(item => item.product_id === productId);
  };

  // Ajouter une nouvelle ligne
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
      unit_price: firstAvailable.sale_price || 0,
      total: firstAvailable.sale_price || 0,
    }]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'product_id') {
          const product = products.find(p => p.id === parseInt(value));
          if (product) {
            const isDuplicate = items.some(other => 
              other.id !== itemId && other.product_id === parseInt(value)
            );
            
            if (isDuplicate) {
              showNotification(`Le produit "${product.name}" est déjà dans la liste`, 'warning');
              return item;
            }
            
            updatedItem.product_name = product.name;
            updatedItem.product_reference = product.reference || '';
            updatedItem.unit_price = product.sale_price || 0;
          }
        }
        
        if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
          const qty = parseFloat(updatedItem.quantity) || 0;
          const price = parseFloat(updatedItem.unit_price) || 0;
          updatedItem.total = qty * price;
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
    recalculTotaux(updatedItems);
  };

  const recalculTotaux = (itemsList) => {
    const sous_total = itemsList.reduce((sum, item) => sum + (item.total || 0), 0);
    const tva = sous_total * 0.18;
    const total = sous_total + tva;
    setTotals({ sous_total, tva, total });
  };

  // ============================================================
  // 5. Soumission
  // ============================================================
  const handleSubmit = async () => {
    if (!agence) {
      showNotification('Agence non trouvée', 'error');
      return;
    }
    if (items.length === 0) {
      showNotification('Ajoutez au moins un produit', 'error');
      return;
    }
    if (!expirationDate) {
      showNotification('Date d\'expiration requise', 'error');
      return;
    }

    // Vérifier les doublons
    const productIds = items.map(item => item.product_id);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      showNotification('Des produits sont dupliqués dans la liste. Veuillez corriger.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      agence: agence.id,
      client_id: selectedClient?.id || null,
      date_expiration: expirationDate,
      notes,
      conditions,
      pied_de_page: piedDePage,
      items: items.map(item => ({
        product: parseInt(item.product_id),
        quantity: item.quantity,
        prix_unitaire: item.unit_price,
        tva: item.unit_price * 0.18,
        remise: 0,
      })),
    };

    try {
      if (isEditing) {
        await AxiosInstance.put(`/devis/${id}/`, payload);
        showNotification('Devis modifié avec succès');
      } else {
        await AxiosInstance.post('/devis/', payload);
        showNotification('Devis créé avec succès');
      }
      setTimeout(() => navigate('/devis'), 2000);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'enregistrement';
      showNotification(msg, 'error', error.response?.data);
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
            Chargement du formulaire...
          </p>
        </div>
      </div>
    );
  }

  // Filtrer les produits disponibles (non déjà ajoutés)
  const getAvailableProducts = () => {
    const selectedIds = items.map(item => item.product_id);
    return products.filter(p => !selectedIds.includes(p.id));
  };

  return (
    <div className="px-0 lg:px-0 py-4 lg:py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Notification */}
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
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditing ? 'Modifier le devis' : 'Nouveau devis'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {agence ? `Agence : ${agence.nom}` : 'Agence non définie'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/devis')} className="btn btn-outline btn-sm lg:btn-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="btn btn-primary btn-sm lg:btn-md gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Mettre à jour' : 'Créer le devis'}
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
                    Agence
                  </span>
                </label>
                <div className="bg-gray-100 rounded-lg p-2 px-3 border border-gray-200 h-12 flex items-center">
                  <p className="font-medium">{agence?.nom || 'Chargement...'}</p>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Client
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={selectedClient ? `${selectedClient.nom} ${selectedClient.prenom || ''}` : 'Client anonyme'}
                    readOnly
                  />
                  <button type="button" className="btn btn-outline gap-1" onClick={() => setShowClientModal(true)}>
                    <User className="w-4 h-4" /> {selectedClient ? 'Changer' : 'Ajouter'}
                  </button>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Date d'expiration <span className="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="date" 
                  className="input input-bordered w-full" 
                  value={expirationDate} 
                  onChange={e => setExpirationDate(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Articles - Style VenteForm */}
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
                  {items.map((item, index) => {
                    const availableProducts = products.filter(p => 
                      !items.some(other => other.id !== item.id && other.product_id === p.id)
                    );
                    
                    return (
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {/* Select Produit */}
                          <div className="form-control w-full md:col-span-2">
                            <label className="label">
                              <span className="label-text text-sm font-semibold">Produit</span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              value={item.product_id || ''}
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
                          </div>

                          {/* Quantité */}
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text text-sm font-semibold">Qté</span>
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1 || submitting}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                className="input input-bordered w-full text-center"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                                disabled={submitting}
                              />
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => handleItemChange(item.id, 'quantity', item.quantity + 1)}
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
                              step="0.01"
                              disabled={submitting}
                            />
                          </div>

                          {/* Total */}
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text text-sm font-semibold text-primary">Total</span>
                            </label>
                            <div className="h-10 flex items-center justify-end px-3 bg-primary/5 rounded-lg border border-primary/20">
                              <span className="font-bold text-primary">{formatPrice(item.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total général */}
                  <div className="text-right pt-4 border-t border-gray-200">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total HT</span>
                        <span className="font-semibold">{formatPrice(totals.sous_total)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-success">
                        <span className="text-gray-600">TVA (18%)</span>
                        <span>{formatPrice(totals.tva)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total TTC</span>
                        <span className="text-primary">{formatPrice(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Conditions, notes, pied de page */}
            <div className="space-y-4 mt-6 border-t border-base-300 pt-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Conditions générales</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="3"
                  placeholder="Conditions générales du devis..."
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Notes internes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="2"
                  placeholder="Notes internes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Pied de page</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="2"
                  placeholder="Pied de page du devis..."
                  value={piedDePage}
                  onChange={(e) => setPiedDePage(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-base-200/50 border-t border-base-200">
            <button className="btn btn-ghost gap-2" onClick={() => navigate('/devis')}>
              Annuler
            </button>
            <button 
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Mettre à jour' : 'Créer le devis'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sélection client */}
      {showClientModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Sélectionner un client</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowClientModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-primary/10 transition"
                onClick={() => { setSelectedClient(null); setShowClientModal(false); }}
              >
                <div className="font-semibold">Client anonyme</div>
                <div className="text-xs text-gray-500">Devis sans client enregistré</div>
              </button>
              {clients.map(client => (
                <button
                  key={client.id}
                  className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-primary/10 transition"
                  onClick={() => { setSelectedClient(client); setShowClientModal(false); }}
                >
                  <div className="font-semibold">{client.nom} {client.prenom || ''}</div>
                  <div className="text-xs text-gray-500">{client.telephone}</div>
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowClientModal(false)}>Fermer</button>
              <button className="btn btn-primary" onClick={() => navigate('/clients/nouveau')}>
                <Plus className="w-4 h-4" /> Nouveau client
              </button>
            </div>
          </div>
        </div>
      )}

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

export default DevisForm;