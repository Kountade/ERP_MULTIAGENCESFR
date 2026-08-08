// src/components/achats/ReceptionForm.jsx - COMPLET CORRIGÉ

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, ArrowLeft, Plus, Minus, Trash2, ShoppingCart,
  CheckCircle, AlertCircle, Loader2, Package,
  FileText, Truck, History
} from 'lucide-react';

const ReceptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [commandeSelected, setCommandeSelected] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null });
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalItemsToReceive, setTotalItemsToReceive] = useState(0);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ✅ CHARGEMENT DES COMMANDES RÉCEPTIONNABLES
  useEffect(() => {
    const fetchCommandes = async () => {
      setLoading(true);
      try {
        let response;
        try {
          response = await AxiosInstance.get('/purchase-orders/receivable/');
        } catch {
          response = await AxiosInstance.get('/purchase-orders/');
        }
        
        let allOrders = response.data || [];
        
        if (!response.config.url.includes('/receivable/')) {
          allOrders = allOrders.filter(order => {
            if (['draft', 'received', 'cancelled', 'rejected'].includes(order.status)) {
              return false;
            }
            const hasRemaining = order.items?.some(item => {
              return (item.quantity_ordered || 0) > (item.quantity_received || 0);
            });
            return hasRemaining;
          });
        }
        
        const sortedOrders = allOrders.sort((a, b) => {
          if (a.status === 'partially_received' && b.status !== 'partially_received') return -1;
          if (a.status !== 'partially_received' && b.status === 'partially_received') return 1;
          return new Date(b.order_date) - new Date(a.order_date);
        });
        
        setCommandes(sortedOrders);
        
        if (isEditMode) {
          await fetchReception();
        }
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        showNotification('Erreur de chargement des commandes', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCommandes();
  }, [id]);

  // Chargement d'une réception en mode édition
  const fetchReception = async () => {
    try {
      const response = await AxiosInstance.get(`/purchase-receipts/${id}/`);
      const reception = response.data;
      setPurchaseOrder(reception.purchase_order?.id || reception.purchase_order || '');
      setNotes(reception.notes || '');

      if (reception.purchase_order) {
        const orderId = reception.purchase_order.id || reception.purchase_order;
        const orderResponse = await AxiosInstance.get(`/purchase-orders/${orderId}/`);
        const order = orderResponse.data;
        setCommandeSelected(order);

        const receptionItems = reception.items || [];
        const orderItems = order.items || [];

        const loadedItems = receptionItems.map(recItem => {
          const orderItem = orderItems.find(oi => oi.id === recItem.order_item);
          if (!orderItem) return null;

          return {
            id: recItem.id,
            order_item_id: recItem.order_item,
            product_id: orderItem.product,
            product_name: orderItem.product_name || 'Produit',
            product_reference: orderItem.product_reference || '',
            quantity_ordered: orderItem.quantity_ordered || 0,
            quantity_received: orderItem.quantity_received || 0,
            remaining_quantity: (orderItem.quantity_ordered || 0) - (orderItem.quantity_received || 0),
            quantity: recItem.quantity || 0,
            unit_price: parseFloat(orderItem.unit_price) || 0,
            total: (parseFloat(orderItem.unit_price) || 0) * (recItem.quantity || 0),
            quality_ok: recItem.quality_ok !== false,
            lot_number: recItem.lot_number || '',
            expiry_date: recItem.expiry_date || '',
            notes: recItem.notes || ''
          };
        }).filter(item => item !== null);

        setItems(loadedItems);
        calculateTotal(loadedItems);
        calculateTotalItems(loadedItems);
      }
    } catch (error) {
      console.error('Erreur chargement réception:', error);
      showNotification('Erreur lors du chargement', 'error');
    }
  };

  // Chargement des détails d'une commande
  const loadCommandeDetails = async (orderId) => {
    if (!orderId) {
      setCommandeSelected(null);
      setItems([]);
      setTotalValue(0);
      setTotalItemsToReceive(0);
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/purchase-orders/${orderId}/`);
      const order = response.data;

      if (order.status === 'draft') {
        showNotification('Cette commande est un brouillon', 'error');
        setCommandeSelected(null);
        setItems([]);
        setTotalValue(0);
        setTotalItemsToReceive(0);
        setPurchaseOrder('');
        setLoading(false);
        return;
      }

      if (order.status === 'received') {
        showNotification('Cette commande est déjà entièrement reçue', 'warning');
        setCommandeSelected(null);
        setItems([]);
        setTotalValue(0);
        setTotalItemsToReceive(0);
        setPurchaseOrder('');
        setLoading(false);
        return;
      }

      setCommandeSelected(order);

      const loadedItems = (order.items || [])
        .filter(item => {
          const ordered = item.quantity_ordered || 0;
          const received = item.quantity_received || 0;
          return received < ordered;
        })
        .map(item => {
          const ordered = item.quantity_ordered || 0;
          const received = item.quantity_received || 0;
          const remaining = ordered - received;

          return {
            id: item.id,
            order_item_id: item.id,
            product_id: item.product,
            product_name: item.product_name || 'Produit',
            product_reference: item.product_reference || '',
            quantity_ordered: ordered,
            quantity_received: received,
            remaining_quantity: remaining,
            quantity: 0,
            unit_price: parseFloat(item.unit_price) || 0,
            total: 0,
            quality_ok: true,
            lot_number: '',
            expiry_date: '',
            notes: ''
          };
        });

      setItems(loadedItems);
      calculateTotal(loadedItems);
      calculateTotalItems(loadedItems);
      
      if (loadedItems.length === 0) {
        showNotification('Tous les articles de cette commande ont déjà été reçus', 'info');
      }
    } catch (error) {
      console.error('Erreur chargement détails commande:', error);
      showNotification('Erreur lors du chargement des détails', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculs
  const calculateTotal = (itemsList) => {
    const total = itemsList.reduce((sum, item) => sum + (item.total || 0), 0);
    setTotalValue(total);
  };

  const calculateTotalItems = (itemsList) => {
    const total = itemsList.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setTotalItemsToReceive(total);
  };

  // Gestion des quantités
  const handleQuantityChange = (index, newQuantity) => {
    const item = items[index];
    const maxQty = item.remaining_quantity;
    let quantity = parseInt(newQuantity) || 0;

    if (quantity > maxQty) {
      showNotification(`La quantité ne peut pas dépasser ${maxQty} (quantité restante)`, 'warning');
      quantity = maxQty;
    }
    if (quantity < 0) quantity = 0;

    const newTotal = (item.unit_price || 0) * quantity;

    const updatedItems = [...items];
    updatedItems[index] = {
      ...item,
      quantity: quantity,
      total: newTotal
    };

    setItems(updatedItems);
    calculateTotal(updatedItems);
    calculateTotalItems(updatedItems);
  };

  const handleQualityChange = (index, qualityOk) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quality_ok: qualityOk
    };
    setItems(updatedItems);
  };

  const handleLotChange = (index, lotNumber) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      lot_number: lotNumber
    };
    setItems(updatedItems);
  };

  const handleExpiryChange = (index, expiryDate) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      expiry_date: expiryDate
    };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotal(updatedItems);
    calculateTotalItems(updatedItems);
  };

  const selectAllItems = () => {
    const updatedItems = items.map(item => ({
      ...item,
      quantity: item.remaining_quantity,
      total: (item.unit_price || 0) * item.remaining_quantity
    }));
    setItems(updatedItems);
    calculateTotal(updatedItems);
    calculateTotalItems(updatedItems);
  };

  const deselectAllItems = () => {
    const updatedItems = items.map(item => ({
      ...item,
      quantity: 0,
      total: 0
    }));
    setItems(updatedItems);
    calculateTotal(updatedItems);
    calculateTotalItems(updatedItems);
  };

  // Sélection de la commande
  const handleCommandeChange = (e) => {
    const orderId = e.target.value;
    setPurchaseOrder(orderId);
    setItems([]);
    setTotalValue(0);
    setTotalItemsToReceive(0);
    if (orderId) {
      loadCommandeDetails(orderId);
    } else {
      setCommandeSelected(null);
    }
  };

  // ✅ GÉNÉRER LA FACTURE
  const generateInvoice = async (receiptId) => {
    if (!receiptId) {
      console.error('❌ ID de réception manquant');
      return null;
    }

    setGeneratingInvoice(true);
    try {
      console.log('📄 GÉNÉRATION FACTURE POUR ID:', receiptId);
      const response = await AxiosInstance.post(`/purchase-receipts/${receiptId}/generate_invoice/`);
      console.log('✅ FACTURE GÉNÉRÉE:', response.data);
      
      if (response.data.success) {
        showNotification(`✅ Facture ${response.data.invoice.invoice_number} créée !`, 'success');
        return response.data;
      } else {
        showNotification('⚠️ ' + (response.data.error || 'Erreur génération'), 'warning');
        return null;
      }
    } catch (error) {
      console.error('❌ ERREUR GÉNÉRATION FACTURE:', error);
      if (error.response?.data?.error) {
        showNotification('⚠️ ' + error.response.data.error, 'warning');
      } else {
        showNotification('⚠️ Erreur lors de la génération de la facture', 'warning');
      }
      return null;
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // ✅ SOUMISSION CORRIGÉE
  const handleSubmit = async () => {
    if (!purchaseOrder) {
      showNotification('Veuillez sélectionner une commande', 'error');
      return;
    }

    const itemsToReceive = items.filter(item => item.quantity > 0);
    if (itemsToReceive.length === 0) {
      showNotification('Au moins un article doit être reçu', 'error');
      return;
    }

    setSubmitting(true);

    const payload = {
      purchase_order: parseInt(purchaseOrder),
      notes: notes,
      items: itemsToReceive.map(item => ({
        order_item: item.order_item_id || item.id,
        quantity: parseInt(item.quantity),
        quality_checked: true,
        quality_ok: item.quality_ok !== false,
        quality_notes: '',
        lot_number: item.lot_number || '',
        expiry_date: item.expiry_date || null,
        notes: item.notes || ''
      }))
    };

    console.log('📤 PAYLOAD:', payload);

    try {
      let response;
      if (isEditMode) {
        response = await AxiosInstance.put(`/purchase-receipts/${id}/`, payload);
        showNotification('Réception modifiée avec succès !', 'success');
        setTimeout(() => navigate('/receptions'), 2000);
      } else {
        // ✅ CRÉER LA RÉCEPTION
        response = await AxiosInstance.post('/purchase-receipts/', payload);
        const newReceiptId = response.data.id;
        
        console.log('✅ RÉCEPTION CRÉÉE:', response.data);
        console.log('📦 ID RÉCEPTION:', newReceiptId);
        
        showNotification('Réception créée avec succès !', 'success');
        
        // ✅ GÉNÉRER LA FACTURE
        if (newReceiptId) {
          // Attendre un peu pour que la base de données soit à jour
          await new Promise(resolve => setTimeout(resolve, 1500));
          await generateInvoice(newReceiptId);
        }
        
        setTimeout(() => navigate('/receptions'), 3000);
      }
    } catch (error) {
      console.error('❌ ERREUR:', error);
      let errorMessage = 'Erreur lors de l\'enregistrement';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.purchase_order) {
          errorMessage = data.purchase_order.join(', ');
        } else if (data.items) {
          errorMessage = JSON.stringify(data.items);
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors.join(', ');
        } else {
          errorMessage = JSON.stringify(data);
        }
      }
      
      showNotification(errorMessage, 'error', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  // Composant d'historique
  const ReceiptHistory = ({ orderItemId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
      if (orderItemId) {
        const fetchHistory = async () => {
          try {
            const response = await AxiosInstance.get(`/purchase-order-items/${orderItemId}/receipt-history/`);
            setHistory(response.data || []);
          } catch (error) {
            console.error('Erreur chargement historique:', error);
          }
        };
        fetchHistory();
      }
    }, [orderItemId]);

    if (history.length === 0) return null;

    return (
      <details className="mt-2">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-primary flex items-center gap-1">
          <History className="w-3 h-3" />
          Historique ({history.length})
        </summary>
        <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
          {history.map((rec, idx) => (
            <div key={idx} className="text-xs flex flex-wrap gap-2 items-center border-b border-gray-200 py-1.5">
              <span className="font-medium text-primary">{rec.quantity} unités</span>
              <span className="text-gray-400">
                le {new Date(rec.receipt?.created_at || rec.created_at).toLocaleDateString('fr-FR')}
              </span>
              <span className={`badge badge-xs ${rec.quality_ok ? 'badge-success' : 'badge-error'}`}>
                {rec.quality_ok ? '✅ OK' : '❌ Problème'}
              </span>
              {rec.lot_number && (
                <span className="badge badge-ghost badge-xs">Lot: {rec.lot_number}</span>
              )}
            </div>
          ))}
        </div>
      </details>
    );
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price || 0) + ' FCFA';
  const hasItemsToReceive = items.some(item => item.quantity > 0);

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 lg:py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm lg:text-base font-medium whitespace-pre-line">{notification.message}</span>
            {notification.details && (
              <details className="text-xs">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-1 p-1 bg-black/5 rounded max-h-32 overflow-auto">{JSON.stringify(notification.details, null, 2)}</pre>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {isEditMode ? 'Modifier la réception' : 'Nouvelle réception'}
              </h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              {isEditMode ? 'Modifiez les quantités reçues' : 'Enregistrez une réception de marchandises'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/receptions" className="btn btn-outline btn-sm lg:btn-md gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !hasItemsToReceive}
              className="btn btn-primary btn-sm lg:btn-md gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier' : 'Valider'}
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-full px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-4 lg:p-6">
            {/* Sélection de la commande */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Commande fournisseur <span className="text-error">*</span>
                </span>
              </label>
              <select
                value={purchaseOrder}
                onChange={handleCommandeChange}
                className="select select-bordered w-full"
                disabled={isEditMode || loading}
              >
                <option value="">-- Sélectionner une commande --</option>
                {commandes.map(cmd => (
                  <option key={cmd.id} value={cmd.id}>
                    {cmd.order_number} - {cmd.supplier?.company_name || cmd.supplier_name} - 
                    {new Date(cmd.order_date).toLocaleDateString('fr-FR')} - 
                    {cmd.status === 'partially_received' ? '⚠️ ' : ''}
                    {cmd.status_display || cmd.status}
                    {cmd.items && cmd.items.length > 0 && 
                      ` (${cmd.items.filter(i => (i.quantity_ordered || 0) > (i.quantity_received || 0)).length} article(s) restant(s))`
                    }
                  </option>
                ))}
              </select>
              {commandes.length === 0 && !loading && (
                <div className="alert alert-warning mt-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Aucune commande disponible pour réception.</span>
                </div>
              )}
            </div>

            {/* Informations commande */}
            {commandeSelected && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-semibold text-primary flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Détails de la commande
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={selectAllItems}
                      className="btn btn-xs btn-primary gap-1"
                      disabled={submitting || items.length === 0}
                    >
                      <CheckCircle className="w-3 h-3" /> Tout recevoir
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllItems}
                      className="btn btn-xs btn-ghost gap-1"
                      disabled={submitting || items.length === 0}
                    >
                      <X className="w-3 h-3" /> Tout annuler
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Fournisseur:</span>
                    <p className="font-medium">{commandeSelected.supplier?.company_name || commandeSelected.supplier_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Agence:</span>
                    <p>{commandeSelected.agence?.nom || commandeSelected.agence_nom}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date commande:</span>
                    <p>{new Date(commandeSelected.order_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Statut:</span>
                    <p className={`badge badge-sm ${
                      commandeSelected.status === 'draft' ? 'badge-ghost' :
                      commandeSelected.status === 'sent' ? 'badge-info' :
                      commandeSelected.status === 'partially_received' ? 'badge-warning' :
                      commandeSelected.status === 'received' ? 'badge-success' :
                      'badge-neutral'
                    }`}>
                      {commandeSelected.status_display || commandeSelected.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Articles */}
            {items.length > 0 && (
              <div className="border-t border-base-300 pt-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Articles à recevoir
                    <span className="badge badge-primary badge-sm">{items.length}</span>
                  </h3>
                  <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-primary">{totalItemsToReceive}</span> unités
                    pour <span className="font-bold text-primary">{formatPrice(totalValue)}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-sm">
                        <th>Produit</th>
                        <th>Référence</th>
                        <th className="text-center">Commandé</th>
                        <th className="text-center">Reçu</th>
                        <th className="text-center">Restant</th>
                        <th className="text-center">À recevoir</th>
                        <th className="text-right">Prix unit.</th>
                        <th className="text-right">Total</th>
                        <th>Lot</th>
                        <th>Date expiration</th>
                        <th className="text-center">Qualité</th>
                        <th>Historique</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.order_item_id || index} className="hover">
                          <td className="font-medium">{item.product_name}</td>
                          <td className="text-xs font-mono">{item.product_reference}</td>
                          <td className="text-center">
                            <span className="badge badge-neutral">{item.quantity_ordered}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-info">{item.quantity_received}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-warning">{item.remaining_quantity}</span>
                          </td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                disabled={item.quantity <= 0 || submitting}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                className="input input-bordered input-xs w-16 text-center"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                min="0"
                                max={item.remaining_quantity}
                                disabled={submitting}
                              />
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                disabled={item.quantity >= item.remaining_quantity || submitting}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="text-right">{formatPrice(item.unit_price)}</td>
                          <td className="text-right font-semibold text-primary">{formatPrice(item.total)}</td>
                          <td>
                            <input
                              type="text"
                              value={item.lot_number || ''}
                              onChange={(e) => handleLotChange(index, e.target.value)}
                              placeholder="Lot"
                              className="input input-bordered input-xs w-24"
                              disabled={item.quantity === 0 || submitting}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={item.expiry_date || ''}
                              onChange={(e) => handleExpiryChange(index, e.target.value)}
                              className="input input-bordered input-xs w-32"
                              disabled={item.quantity === 0 || submitting}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={item.quality_ok !== false}
                              onChange={(e) => handleQualityChange(index, e.target.checked)}
                              className="checkbox checkbox-success checkbox-xs"
                              disabled={item.quantity === 0 || submitting}
                            />
                          </td>
                          <td>
                            <ReceiptHistory orderItemId={item.order_item_id} />
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="btn btn-ghost btn-xs text-error"
                              disabled={submitting}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan="7" className="text-right font-bold">Valeur totale à recevoir</td>
                        <td colSpan="5" className="font-bold text-primary text-lg">{formatPrice(totalValue)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-control mt-6">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Notes (optionnel)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                rows="2"
                placeholder="Observations sur la réception..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 lg:p-6 bg-gray-50/50 border-t border-base-200">
            <Link to="/receptions" className="btn btn-ghost gap-2">
              Annuler
            </Link>
            <button
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
              onClick={handleSubmit}
              disabled={submitting || !hasItemsToReceive || generatingInvoice}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditMode ? 'Modifier la réception' : 'Valider'}
            </button>
            {generatingInvoice && (
              <span className="text-sm text-info flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération de la facture...
              </span>
            )}
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

export default ReceptionForm;