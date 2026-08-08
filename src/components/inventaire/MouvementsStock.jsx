// src/pages/mouvements-stock/MouvementsStock.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ArrowLeftRight, Package, Box,
  Eye, Filter, Search, RefreshCw, AlertCircle, Calendar,
  Download, Printer, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const MouvementsStock = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_in: 0,
    total_out: 0,
    total_transfer: 0,
    total_value: 0
  });
  
  // Filtres
  const [filters, setFilters] = useState({
    movement_type: '',
    product: '',
    warehouse: '',
    date_debut: '',
    date_fin: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  
  // Données pour les filtres
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userAgence, setUserAgence] = useState(null);

  // Types de mouvement
  const movementTypes = [
    { value: 'in', label: 'Entrée', icon: TrendingDown, color: 'success' },
    { value: 'out', label: 'Sortie', icon: TrendingUp, color: 'error' },
    { value: 'transfer', label: 'Transfert', icon: ArrowLeftRight, color: 'info' },
    { value: 'adjustment', label: 'Ajustement', icon: Package, color: 'warning' },
    { value: 'return', label: 'Retour fournisseur', icon: Package, color: 'secondary' },
    { value: 'return_customer', label: 'Retour client', icon: Package, color: 'secondary' },
    { value: 'scrap', label: 'Mise au rebut', icon: Box, color: 'neutral' },
    { value: 'quarantine', label: 'Mise en quarantaine', icon: AlertCircle, color: 'warning' },
  ];

  // Récupérer les infos utilisateur
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('User');
      const user = userData ? JSON.parse(userData) : null;
      const agenceCourante = JSON.parse(localStorage.getItem('AgenceCourante') || '{}');
      
      let role = 'autre';
      if (user?.role_global === 'pdg') {
        role = 'pdg';
      } else if (user?.role_global === 'drh') {
        role = 'drh';
      } else if (user?.roles_agence) {
        const currentRole = user.roles_agence.find(
          r => r.agence_id === agenceCourante.id && r.est_actif
        );
        if (currentRole) {
          role = currentRole.role;
        }
      }
      
      return { user, role, agenceCourante };
    } catch {
      return { user: null, role: 'autre', agenceCourante: {} };
    }
  };

  // Récupérer les produits pour le filtre
  const fetchProducts = async () => {
    try {
      const response = await AxiosInstance.get('/produits/');
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  // Récupérer les entrepôts pour le filtre
  const fetchWarehouses = async () => {
    try {
      const response = await AxiosInstance.get('/warehouses/');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Erreur chargement entrepôts:', error);
    }
  };

  // Récupérer les mouvements
  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('page_size', itemsPerPage);
      
      if (filters.movement_type) params.append('movement_type', filters.movement_type);
      if (filters.product) params.append('product', filters.product);
      if (filters.warehouse) params.append('warehouse', filters.warehouse);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.search) params.append('search', filters.search);
      
      const response = await AxiosInstance.get(`/stock-movements/?${params.toString()}`);
      
      setMovements(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / itemsPerPage));
      setTotalItems(response.data.count || response.data.length);
      
      // Calculer les statistiques
      calculateStats(response.data.results || response.data);
      
      const { role, agenceCourante } = getUserInfo();
      setUserRole(role);
      setUserAgence(agenceCourante);
      
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
      setError('Impossible de charger les mouvements de stock');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (data) => {
    const stats = {
      total_in: 0,
      total_out: 0,
      total_transfer: 0,
      total_value: 0
    };
    
    data.forEach(movement => {
      stats.total_value += parseFloat(movement.total_price || 0);
      
      switch (movement.movement_type) {
        case 'in':
          stats.total_in += movement.quantity;
          break;
        case 'out':
          stats.total_out += movement.quantity;
          break;
        case 'transfer':
          stats.total_transfer += movement.quantity;
          break;
        default:
          break;
      }
    });
    
    setStats(stats);
  };

  useEffect(() => {
    fetchMovements();
    fetchProducts();
    fetchWarehouses();
  }, [currentPage, filters]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      movement_type: '',
      product: '',
      warehouse: '',
      date_debut: '',
      date_fin: '',
      search: ''
    });
    setCurrentPage(1);
  };

  // Appliquer les filtres
  const applyFilters = () => {
    setCurrentPage(1);
    fetchMovements();
  };

  // Exporter les données
  const exportData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.movement_type) params.append('movement_type', filters.movement_type);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      
      const response = await AxiosInstance.get(`/stock-movements/export/?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mouvements_stock_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export des données');
    }
  };

  // Obtenir les infos d'un type de mouvement
  const getMovementTypeInfo = (type) => {
    const found = movementTypes.find(t => t.value === type);
    return found || { label: type, icon: Package, color: 'neutral' };
  };

  // Formater la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-primary" />
            Mouvements de stock
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Suivi des entrées, sorties et transferts
          </p>
          {userAgence?.nom && (
            <div className="mt-2 text-xs text-base-content/50">
              Agence : <span className="font-semibold text-primary">{userAgence.nom}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={exportData} className="btn btn-outline btn-sm gap-1">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button onClick={() => window.print()} className="btn btn-outline btn-sm gap-1">
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-success/10 shadow-sm">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-success text-sm font-medium">Entrées</p>
                <p className="text-2xl font-bold">{stats.total_in}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>
        
        <div className="card bg-error/10 shadow-sm">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-error text-sm font-medium">Sorties</p>
                <p className="text-2xl font-bold">{stats.total_out}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-error" />
            </div>
          </div>
        </div>
        
        <div className="card bg-info/10 shadow-sm">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-info text-sm font-medium">Transferts</p>
                <p className="text-2xl font-bold">{stats.total_transfer}</p>
              </div>
              <ArrowLeftRight className="w-8 h-8 text-info" />
            </div>
          </div>
        </div>
        
        <div className="card bg-primary/10 shadow-sm">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-primary text-sm font-medium">Valeur totale</p>
                <p className="text-2xl font-bold">{stats.total_value.toLocaleString()} FCFA</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-base-content/60" />
              <span className="font-medium">Filtres</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-sm btn-ghost"
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchMovements} className="btn btn-sm btn-outline gap-1">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              {(filters.movement_type || filters.product || filters.warehouse || 
                filters.date_debut || filters.date_fin || filters.search) && (
                <button onClick={resetFilters} className="btn btn-sm btn-ghost">
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Type de mouvement</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.movement_type}
                  onChange={(e) => setFilters({...filters, movement_type: e.target.value})}
                >
                  <option value="">Tous</option>
                  {movementTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Produit</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.product}
                  onChange={(e) => setFilters({...filters, product: e.target.value})}
                >
                  <option value="">Tous</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Entrepôt</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.warehouse}
                  onChange={(e) => setFilters({...filters, warehouse: e.target.value})}
                >
                  <option value="">Tous</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Recherche</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Référence, produit..."
                    className="input input-bordered w-full pl-9"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Date début</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.date_debut}
                  onChange={(e) => setFilters({...filters, date_debut: e.target.value})}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Date fin</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={filters.date_fin}
                  onChange={(e) => setFilters({...filters, date_fin: e.target.value})}
                />
              </div>

              <div className="flex items-end">
                <button onClick={applyFilters} className="btn btn-primary w-full gap-1">
                  <Search className="w-4 h-4" />
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des mouvements */}
      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg m-4">
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <p className="text-base-content/60">Aucun mouvement de stock trouvé</p>
          </div>
        ) : (
          <>
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-200">
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Entrepôt source</th>
                  <th>Entrepôt dest.</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Créé par</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => {
                  const typeInfo = getMovementTypeInfo(movement.movement_type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <tr key={movement.id} className="hover">
                      <td className="font-mono text-sm font-medium">{movement.reference}</td>
                      <td>
                        <span className={`badge badge-${typeInfo.color} gap-1`}>
                          <Icon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium">{movement.product_name}</span>
                          {movement.product_reference && (
                            <span className="text-xs text-base-content/50">{movement.product_reference}</span>
                          )}
                        </div>
                      </td>
                      <td className="font-semibold">
                        {movement.movement_type === 'out' ? (
                          <span className="text-error">-{movement.quantity}</span>
                        ) : movement.movement_type === 'in' ? (
                          <span className="text-success">+{movement.quantity}</span>
                        ) : (
                          <span className="text-info">{movement.quantity}</span>
                        )}
                      </td>
                      <td>{movement.from_warehouse_name || '-'}</td>
                      <td>{movement.to_warehouse_name || '-'}</td>
                      <td>{movement.unit_price?.toLocaleString()} FCFA</td>
                      <td className="font-medium">{movement.total_price?.toLocaleString()} FCFA</td>
                      <td className="text-sm">{formatDate(movement.movement_date)}</td>
                      <td className="text-sm">{movement.created_by_email || '-'}</td>
                      <td className="text-center">
                        <Link 
                          to={`/mouvements-stock/${movement.id}`} 
                          className="btn btn-xs btn-ghost"
                          title="Voir détails"
                        >
                          <Eye className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <div className="text-sm text-base-content/60">
                  Total: {totalItems} mouvements
                </div>
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="join-item btn btn-sm">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Légende */}
      <div className="mt-4 p-3 bg-base-200 rounded-lg text-xs text-base-content/60">
        <div className="flex flex-wrap gap-4">
          {movementTypes.map(type => (
            <span key={type.value} className={`flex items-center gap-1 text-${type.color}`}>
              <type.icon className="w-3 h-3" />
              {type.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MouvementsStock;