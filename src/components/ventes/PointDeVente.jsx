// src/components/pos/PointDeVente.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Plus,
  Minus,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  ShoppingCart,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Tag,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  Warehouse,
  Image,
  Barcode,
  User,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Printer,
  Download,
  Receipt,
  Loader,
  Check,
  TrendingUp,
  Award,
  Box,
  Settings,
  LogOut,
  Percent,
  Copy,
  Layers  // ← déjà présent
} from 'lucide-react'

const PointDeVente = () => {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const cartRef = useRef(null)

  // ============================================================
  // ÉTATS
  // ============================================================
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', details: null })
  const [agence, setAgence] = useState(null)
  const [entrepot, setEntrepot] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [notes, setNotes] = useState('')
  const [lastVente, setLastVente] = useState(null)

  // ========== NOUVEAU : États pour les lots ==========
  const [lotsByProduct, setLotsByProduct] = useState({}) // { productId: [lot, ...] }
  const [loadingLots, setLoadingLots] = useState({})

  // Panier (items)
  const [items, setItems] = useState([])
  const [totals, setTotals] = useState({ subtotal: 0, tax_amount: 0, total: 0 })

  // Filtres POS
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  // Design additions
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // ============================================================
  // 1. Chargement de l'utilisateur, agence, entrepôt
  // ============================================================
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await AxiosInstance.get('/users/me/');
        const userData = response.data;
        setCurrentUser(userData);
        const agencesDeLUtilisateur = userData.agences || [];
        if (agencesDeLUtilisateur.length > 0) {
          const agenceUtilisateur = agencesDeLUtilisateur[0];
          setAgence(agenceUtilisateur);
          await fetchEntrepot(agenceUtilisateur.id);
        } else {
          const agencesRes = await AxiosInstance.get('/agences/');
          const agencesList = agencesRes.data || [];
          if (agencesList.length > 0) {
            setAgence(agencesList[0]);
            await fetchEntrepot(agencesList[0].id);
          }
        }
        const catRes = await AxiosInstance.get('/categories/');
        setCategories(catRes.data || []);
      } catch (error) {
        console.error(error);
        showNotification('Erreur de chargement du profil', 'error');
        setLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchEntrepot = async (agenceId) => {
    try {
      const response = await AxiosInstance.get(`/warehouses/?agence=${agenceId}`);
      const warehouses = response.data || [];
      const defaultWarehouse = warehouses.find(w => w.is_default) || warehouses[0];
      if (defaultWarehouse) {
        setEntrepot(defaultWarehouse);
      } else {
        console.warn('Aucun entrepôt trouvé pour cette agence');
      }
      setLoadingUser(false);
    } catch (error) {
      console.error(error);
      setLoadingUser(false);
    }
  };

  // ============================================================
  // 2. Chargement des produits (avec prix détail et gros)
  // ============================================================
  useEffect(() => {
    if (!entrepot || !entrepot.id) return;
    const fetchProductsWithPrices = async () => {
      setLoading(true);
      try {
        const productsRes = await AxiosInstance.get('/products/?is_active=true');
        const allProducts = productsRes.data || [];
        
        const productsWithPrices = await Promise.all(allProducts.map(async (product) => {
          try {
            const priceRes = await AxiosInstance.get(
              `/ventes/product_prices/?product_id=${product.id}&warehouse_id=${entrepot.id}`
            );
            const stockRes = await AxiosInstance.get(`/warehouse-stocks/by_product/?product_id=${product.id}`);
            const stock = stockRes.data?.find(s => s.warehouse === entrepot.id);
            
            return {
              ...product,
              sale_price: priceRes.data.sale_price || 0,
              wholesale_price: priceRes.data.wholesale_price || null,
              has_wholesale: priceRes.data.has_wholesale || false,
              stock_quantity: stock?.quantity || 0,
              has_price: true,
              image_url: product.main_image || '/placeholder-product.png'
            };
          } catch {
            return {
              ...product,
              sale_price: product.sale_price || 0,
              wholesale_price: null,
              has_wholesale: false,
              stock_quantity: 0,
              has_price: false,
              image_url: product.main_image || '/placeholder-product.png'
            };
          }
        }));
        setProducts(productsWithPrices);
      } catch (error) {
        console.error(error);
        showNotification('Erreur de chargement des produits', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProductsWithPrices();
  }, [entrepot]);

  // ============================================================
  // 3. Chargement des clients
  // ============================================================
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await AxiosInstance.get('/clients/?is_active=true');
        setClients(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchClients();
  }, []);

  // ============================================================
  // 4. Chargement des lots disponibles pour un produit
  // ============================================================
  const fetchLotsForProduct = async (productId) => {
    if (!productId || !entrepot?.id) return;

    setLoadingLots(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await AxiosInstance.get(`/lots/by-product/${productId}/`);
      // Filtrer les lots valides dans l'entrepôt, en bon état et avec quantité > 0
      const availableLots = response.data.filter(lot =>
        lot.warehouse === entrepot.id &&
        lot.quality_status === 'good' &&
        lot.quantity > 0
      );
      setLotsByProduct(prev => ({ ...prev, [productId]: availableLots }));
    } catch (error) {
      console.error('Erreur chargement lots:', error);
      showNotification('Erreur de chargement des lots', 'error');
    } finally {
      setLoadingLots(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ============================================================
  // 5. Gestion du panier (items) - AVEC LOT
  // ============================================================
  const isProductAlreadyAdded = (productId) => {
    return items.some(item => item.product_id === productId);
  };

  const handleAddItem = (product = null) => {
    let productToAdd = product;
    
    if (!productToAdd) {
      const availableProducts = products.filter(p => !isProductAlreadyAdded(p.id));
      if (availableProducts.length === 0) {
        showNotification('Tous les produits sont déjà dans le panier', 'warning');
        return;
      }
      productToAdd = availableProducts[0];
    }
    
    if (isProductAlreadyAdded(productToAdd.id)) {
      const existingItem = items.find(item => item.product_id === productToAdd.id);
      handleQuantityChange(existingItem.id, existingItem.quantity + 1);
      return;
    }
    
    const defaultPrice = productToAdd.sale_price || 0;
    
    // Charger les lots pour ce produit
    fetchLotsForProduct(productToAdd.id);
    
    setItems(prev => [...prev, {
      id: Date.now(),
      product_id: productToAdd.id,
      product_name: productToAdd.name,
      product_reference: productToAdd.reference || '',
      quantity: 1,
      price_type: 'retail',
      unit_price: defaultPrice,
      sale_price: productToAdd.sale_price || 0,
      wholesale_price: productToAdd.wholesale_price || null,
      has_wholesale: productToAdd.has_wholesale || false,
      discount: 0,
      total: defaultPrice,
      stock_max: productToAdd.stock_quantity || 0,
      image_url: productToAdd.image_url || '/placeholder-product.png',
      // ========== NOUVEAU : champ lot ==========
      lot: null // ID du lot sélectionné, null = FIFO automatique
    }]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handlePriceTypeChange = (itemId, priceType) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newPrice = priceType === 'wholesale' 
          ? (item.wholesale_price || item.sale_price)
          : item.sale_price;
        
        const updatedItem = {
          ...item,
          price_type: priceType,
          unit_price: newPrice
        };
        
        const qty = parseFloat(updatedItem.quantity) || 0;
        const discount = parseFloat(updatedItem.discount) || 0;
        updatedItem.total = qty * newPrice * (1 - discount / 100);
        
        return updatedItem;
      }
      return item;
    }));
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
              showNotification(`Le produit "${product.name}" est déjà dans le panier`, 'warning');
              return item;
            }
            
            updatedItem.product_name = product.name;
            updatedItem.product_reference = product.reference || '';
            updatedItem.sale_price = product.sale_price || 0;
            updatedItem.wholesale_price = product.wholesale_price || null;
            updatedItem.has_wholesale = product.has_wholesale || false;
            updatedItem.stock_max = product.stock_quantity || 0;
            updatedItem.image_url = product.image_url || '/placeholder-product.png';
            updatedItem.lot = null; // Réinitialiser le lot
            
            // Mettre à jour le prix selon le type actuel
            if (updatedItem.price_type === 'wholesale' && updatedItem.wholesale_price) {
              updatedItem.unit_price = updatedItem.wholesale_price;
            } else {
              updatedItem.unit_price = updatedItem.sale_price;
              updatedItem.price_type = 'retail';
            }

            // Charger les lots pour ce produit
            fetchLotsForProduct(parseInt(value));
          }
        }
        
        // Recalculer le total (incluant le changement de lot)
        if (field === 'quantity' || field === 'unit_price' || field === 'discount' || 
            field === 'product_id' || field === 'price_type' || field === 'lot') {
          const qty = parseFloat(updatedItem.quantity) || 0;
          const price = parseFloat(updatedItem.unit_price) || 0;
          const discount = parseFloat(updatedItem.discount) || 0;
          updatedItem.total = qty * price * (1 - discount / 100);
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const maxQty = item.stock_max || 999;
    const safeQty = Math.max(1, Math.min(newQuantity, maxQty));
    
    if (safeQty !== newQuantity) {
      showNotification(`Stock maximum pour ${item.product_name} : ${maxQty}`, 'warning');
    }
    
    handleItemChange(itemId, 'quantity', safeQty);
  };

  // ============================================================
  // 6. Calcul des totaux - SANS TVA
  // ============================================================
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax_amount = 0; // TVA à 0%
    const total = subtotal + tax_amount;
    setTotals({ subtotal, tax_amount, total });
  }, [items]);

  // ============================================================
  // 7. Soumission de la vente - AVEC LE CHAMP LOT
  // ============================================================
  const handleSubmit = async () => {
    const emptyItems = items.filter(item => !item.product_id);
    if (emptyItems.length > 0) {
      showNotification('Veuillez sélectionner un produit pour chaque ligne', 'error');
      return;
    }

    if (items.length === 0) {
      showNotification('Ajoutez au moins un produit à la vente', 'error');
      return;
    }
    if (!agence) {
      showNotification('Agence non trouvée', 'error');
      return;
    }

    const productIds = items.map(item => item.product_id);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      showNotification('Des produits sont dupliqués dans la liste. Veuillez corriger.', 'error');
      return;
    }

    const stockErrors = [];
    items.forEach(item => {
      if (item.quantity > item.stock_max) {
        stockErrors.push(`${item.product_name} : ${item.stock_max} disponible, ${item.quantity} demandé`);
      }
    });
    if (stockErrors.length > 0) {
      showNotification(`Stock insuffisant :\n${stockErrors.join('\n')}`, 'error');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      type_vente: 'comptoir',
      agence: agence.id,
      client_id: selectedClient?.id || null,
      notes: notes || `Vente POS du ${new Date().toLocaleString()}`,
      items: items.map(item => ({
        product: parseInt(item.product_id),
        quantity: item.quantity,
        prix_unitaire: item.unit_price,
        price_type: item.price_type || 'retail',
        remise: item.discount || 0,
        lot: item.lot || null   // ← ENVOI DU LOT
      }))
    };

    try {
      const response = await AxiosInstance.post('/ventes/', payload);
      const venteData = response.data;
      
      showNotification('Vente créée avec succès !', 'success');
      
      // Vider le panier
      setItems([]);
      setSelectedClient(null);
      setNotes('');
      
      setTimeout(() => {
        navigate('/ventes');
      }, 1500);
      
    } catch (error) {
      console.error(error);
      let errorMessage = 'Erreur lors de la création';
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      else if (error.response?.data?.non_field_errors) errorMessage = error.response.data.non_field_errors.join(', ');
      else if (error.response?.data?.items) {
        errorMessage = 'Erreur dans les articles : ' + JSON.stringify(error.response.data.items);
      }
      showNotification(errorMessage, 'error', error.response?.data);
      setSubmitting(false);
    }
  };

  // ============================================================
  // 8. Notification
  // ============================================================
  const showNotification = (message, type = 'success', details = null) => {
    setNotification({ show: true, message, type, details });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success', details: null }), 8000);
  };

  // ============================================================
  // 9. Formatage et utils
  // ============================================================
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  // Fonction pour formater l'affichage d'un lot dans le sélecteur
  const formatLotLabel = (lot) => {
    let label = `${lot.lot_number}`;
    if (lot.quantity !== undefined) label += ` (${lot.quantity} u.)`;
    if (lot.expiry_date) label += ` - Exp: ${new Date(lot.expiry_date).toLocaleDateString()}`;
    return label;
  };

  const getStatusBadge = (product) => {
    const stock = parseFloat(product.stock_quantity) || 0
    
    if (stock <= 0) {
      return (
        <div className="badge badge-error gap-1">
          <AlertTriangle className="w-3 h-3" />
          Rupture
        </div>
      )
    }
    
    if (product.min_stock_level > 0 && stock <= product.min_stock_level) {
      return (
        <div className="badge badge-warning gap-1">
          <AlertCircle className="w-3 h-3" />
          Stock faible
        </div>
      )
    }
    
    return (
      <div className="badge badge-success gap-1">
        <CheckCircle className="w-3 h-3" />
        En stock
      </div>
    )
  }

  // ============================================================
  // 10. Filtrage et tri
  // ============================================================
  const filteredProducts = React.useMemo(() => {
    let filtered = products
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category === parseInt(selectedCategory)
      )
    }
    return filtered
  }, [products, searchTerm, selectedCategory])

  const sortedProducts = React.useMemo(() => {
    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''
      
      if (sortField === 'stock_quantity' || sortField === 'sale_price' || sortField === 'wholesale_price') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredProducts, sortField, sortDirection])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loadingUser || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du point de vente...
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // 11. RENDU
  // ============================================================
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            {notification.details && (
              <details className="text-xs">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-1 p-1 bg-black/5 rounded">{JSON.stringify(notification.details, null, 2)}</pre>
              </details>
            )}
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Point de Vente
          </h1>
          <p className="text-base text-base-content/60">
            Vente rapide et intuitive
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-outline gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/ventes')}
            className="btn btn-primary gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Voir les ventes
          </button>
        </div>
      </div>

      {/* Sélecteur d'entrepôt et client */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-primary" />
            <div className="bg-gray-100 rounded-lg p-2 px-3 border border-gray-200 h-12 flex items-center flex-1 max-w-xs">
              <p className="font-medium">{entrepot?.name || 'Entrepôt principal'}</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <button
              className="btn btn-outline flex-1 gap-2"
              onClick={() => setShowClientModal(true)}
            >
              {selectedClient ? (
                <span>{selectedClient.nom} {selectedClient.prenom || ''}</span>
              ) : (
                'Client anonyme'
              )}
            </button>
            {selectedClient && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedClient(null)}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher par nom, référence, code-barres..."
                className="input input-bordered w-full pl-12"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              className="select select-bordered min-w-[150px]"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered min-w-[130px]"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="name">Trier par nom</option>
              <option value="sale_price">Trier par prix détail</option>
              <option value="wholesale_price">Trier par prix gros</option>
              <option value="stock_quantity">Trier par stock</option>
            </select>
            
            <button 
              className="btn btn-ghost"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSelectedCategory('all')
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="join">
              <button 
                className={`join-item btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Panier et produits */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Produits */}
        <div className="lg:col-span-3 bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          {paginatedProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-20 h-20 mx-auto mb-4 text-base-content/30" />
              <p className="text-xl font-semibold text-base-content/50">
                Aucun produit trouvé
              </p>
              <p className="text-base text-base-content/40 mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => {
                  const isInCart = isProductAlreadyAdded(product.id)
                  return (
                    <button
                      key={product.id}
                      className={`bg-base-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${
                        isInCart ? 'border-primary' : 'border-base-300 hover:border-primary/50'
                      } group relative`}
                      onClick={() => handleAddItem(product)}
                      disabled={product.stock_quantity <= 0 || submitting}
                    >
                      <div className="relative h-40 bg-base-300">
                        {product.image_url && product.image_url !== '/placeholder-product.png' ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><Package class="w-12 h-12 text-base-content/30" /></div>`
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-base-content/30" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(product)}
                        </div>
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded">Rupture</span>
                          </div>
                        )}
                        {isInCart && (
                          <div className="absolute top-2 left-2">
                            <span className="badge badge-primary badge-sm">✓ Ajouté</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                          <span className="badge badge-sm bg-black/70 text-white border-0">
                            {formatPrice(product.sale_price || 0)}
                          </span>
                          {product.has_wholesale && (
                            <span className="badge badge-sm bg-primary/80 text-white border-0">
                              Gros: {formatPrice(product.wholesale_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-bold text-base-content truncate text-sm">{product.name}</h3>
                        <p className="text-xs text-base-content/50 flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {product.reference || product.sku}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-base-content/50 mt-1">
                          <Tag className="w-3 h-3" />
                          <span>{product.category_name || 'Non catégorisé'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-300">
                          <div>
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(product.sale_price || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-base-content/40" />
                            <span className={`text-xs font-semibold ${
                              product.stock_quantity <= 0 ? 'text-error' : 
                              product.min_stock_level > 0 && product.stock_quantity <= product.min_stock_level ? 'text-warning' : 
                              'text-success'
                            }`}>
                              {product.stock_quantity || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Référence</th>
                    <th>Catégorie</th>
                    <th>Prix détail</th>
                    <th>Prix gros</th>
                    <th>Stock</th>
                    <th>Statut</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          {product.image_url && product.image_url !== '/placeholder-product.png' ? (
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-lg">
                                <img src={product.image_url} alt={product.name} />
                              </div>
                            </div>
                          ) : (
                            <div className="avatar placeholder">
                              <div className="bg-base-200 rounded-lg w-10 h-10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-base-content/30" />
                              </div>
                            </div>
                          )}
                          <span className="font-semibold">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-sm font-mono">{product.reference || product.sku}</td>
                      <td>
                        <span className="badge badge-ghost">
                          {product.category_name || 'Non catégorisé'}
                        </span>
                      </td>
                      <td className="font-semibold text-primary">{formatPrice(product.sale_price || 0)}</td>
                      <td>
                        {product.has_wholesale ? (
                          <span className="font-semibold text-secondary">{formatPrice(product.wholesale_price)}</span>
                        ) : (
                          <span className="text-base-content/40">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          product.stock_quantity <= 0 ? 'badge-error' : 
                          product.min_stock_level > 0 && product.stock_quantity <= product.min_stock_level ? 'badge-warning' : 
                          'badge-success'
                        }`}>
                          {product.stock_quantity || 0}
                        </span>
                      </td>
                      <td>{getStatusBadge(product)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-primary btn-sm gap-1"
                          onClick={() => handleAddItem(product)}
                          disabled={product.stock_quantity <= 0 || submitting}
                        >
                          <Plus className="w-4 h-4" /> Ajouter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {sortedProducts.length > 0 && (
            <div className="p-4 border-t border-base-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-base-content/60">
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
                  {Math.min(currentPage * itemsPerPage, sortedProducts.length)} sur{' '}
                  {sortedProducts.length} produits
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    className="select select-bordered select-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    <option value="12">12 par page</option>
                    <option value="24">24 par page</option>
                    <option value="48">48 par page</option>
                    <option value="96">96 par page</option>
                  </select>
                  
                  <div className="join">
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={i}
                          className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panier */}
        <div className="lg:col-span-1 bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-base-300 bg-base-200/50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Panier
                <span className="badge badge-primary badge-sm">{items.length}</span>
              </h2>
              {items.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                  onClick={() => setItems([])}
                  disabled={submitting}
                >
                  <Trash2 className="w-4 h-4" /> Vider
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 max-h-[400px]">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-base-content/30 mb-3" />
                <p className="text-base-content/50">Panier vide</p>
                <p className="text-sm text-base-content/40">Ajoutez des produits en cliquant sur leurs cartes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const availableLots = lotsByProduct[item.product_id] || [];
                  const isLoadingLots = loadingLots[item.product_id];
                  
                  return (
                    <div key={item.id} className="bg-base-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-base-300 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {item.image_url && item.image_url !== '/placeholder-product.png' ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = `<Package class="w-6 h-6 text-base-content/30" />`
                              }}
                            />
                          ) : (
                            <Package className="w-6 h-6 text-base-content/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <select
                              className="select select-bordered select-xs w-24"
                              value={item.price_type || 'retail'}
                              onChange={(e) => handlePriceTypeChange(item.id, e.target.value)}
                              disabled={submitting}
                            >
                              <option value="retail">Détail</option>
                              <option value="wholesale" disabled={!item.has_wholesale}>
                                {item.has_wholesale ? 'Gros' : 'Gros (ND)'}
                              </option>
                            </select>
                            <span className="text-xs font-semibold text-primary">
                              {formatPrice(item.unit_price)}
                            </span>
                          </div>
                          {item.has_wholesale && item.price_type === 'wholesale' && (
                            <p className="text-xs text-success">
                              ✅ Économie: {formatPrice((item.sale_price - item.wholesale_price) * item.quantity)}
                            </p>
                          )}
                          {/* ========== NOUVEAU : Sélecteur de lot dans le panier ========== */}
                          <div className="mt-1">
                            <select
                              className="select select-bordered select-xs w-full max-w-[180px]"
                              value={item.lot || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleItemChange(item.id, 'lot', val ? parseInt(val) : null);
                              }}
                              disabled={submitting || !item.product_id || isLoadingLots}
                            >
                              <option value="">Automatique (FIFO)</option>
                              {availableLots.map(lot => (
                                <option key={lot.id} value={lot.id}>
                                  {formatLotLabel(lot)}
                                </option>
                              ))}
                            </select>
                            {isLoadingLots && (
                              <span className="text-xs text-info ml-1">⏳</span>
                            )}
                            {!isLoadingLots && item.product_id && availableLots.length === 0 && (
                              <span className="text-xs text-warning ml-1">⚠️ Aucun lot</span>
                            )}
                            {item.lot && (
                              <span className="text-xs text-success ml-1">✅</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || submitting}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock_max || submitting}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs btn-square text-error"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={submitting}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 text-right">
                        <span className="text-sm font-semibold text-primary">
                          Total: {formatPrice(item.total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-base-300 bg-base-200/50">
            {items.length > 0 ? (
              <>
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/60">Sous-total</span>
                    <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                  </div>
                  {/* TVA supprimée */}
                  <div className="flex justify-between text-lg font-bold border-t border-base-300 pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totals.total)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    placeholder="Notes (optionnel)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <button
                  className="btn btn-primary w-full gap-2 shadow-md hover:shadow-lg transition-all"
                  onClick={handleSubmit}
                  disabled={items.length === 0 || submitting || !entrepot}
                >
                  {submitting ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Traitement...</>
                  ) : (
                    <><Receipt className="w-4 h-4" /> Valider la vente {formatPrice(totals.total)}</>
                  )}
                </button>
                {!entrepot && (
                  <p className="text-xs text-error text-center mt-2">⚠️ Entrepôt non trouvé</p>
                )}
              </>
            ) : (
              <p className="text-sm text-base-content/40 text-center">Ajoutez des produits pour commencer</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sélection client */}
      {showClientModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Sélectionner un client
              </h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowClientModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                className="w-full text-left p-3 bg-base-200 rounded-lg hover:bg-primary/10 transition"
                onClick={() => { setSelectedClient(null); setShowClientModal(false) }}
              >
                <div className="font-semibold">Client anonyme</div>
                <div className="text-xs text-base-content/50">Vente sans client enregistré</div>
              </button>
              {clients.map(client => (
                <button
                  key={client.id}
                  className="w-full text-left p-3 bg-base-200 rounded-lg hover:bg-primary/10 transition"
                  onClick={() => { setSelectedClient(client); setShowClientModal(false) }}
                >
                  <div className="font-semibold">{client.nom} {client.prenom || ''}</div>
                  <div className="text-xs text-base-content/50 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {client.telephone}
                    <Mail className="w-3 h-3 ml-2" /> {client.email}
                  </div>
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowClientModal(false)}>Fermer</button>
              <button className="btn btn-primary gap-2" onClick={() => navigate('/clients/nouveau')}>
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
  )
}

export default PointDeVente