// src/pages/stocks/StockDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, Clock, CheckCircle, Building2, Box,
  History, Printer, Download, Edit, RefreshCw
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const StockDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovements, setShowMovements] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`/produits/${id}/`);
      setProduct(response.data);
      
      // Récupérer les mouvements du produit
      const movementsRes = await AxiosInstance.get(`/stock-movements/by-product/${id}/`);
      setMovements(movementsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Produit non trouvé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA';
    return Math.round(amount).toLocaleString() + ' FCFA';
  };

  const getStockStatus = () => {
    if (!product) return { label: '', color: '', icon: null };
    if (product.stock_quantity === 0) {
      return { label: 'Rupture de stock', color: 'error', icon: AlertCircle };
    }
    if (product.is_low_stock) {
      return { label: 'Stock faible', color: 'warning', icon: Clock };
    }
    return { label: 'En stock', color: 'success', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <AlertCircle className="w-6 h-6" />
          <span>{error || 'Produit non trouvé'}</span>
        </div>
        <Link to="/stocks" className="btn btn-outline btn-sm mt-4">
          Retour
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;
  const stockValue = (product.stock_quantity || 0) * (product.purchase_price || 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <Link to="/stocks" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* En-tête */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="badge badge-ghost font-mono">{product.reference}</span>
                  <span className={`badge badge-${stockStatus.color} gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {stockStatus.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{formatCurrency(stockValue)}</p>
              <p className="text-sm text-base-content/60">Valeur du stock</p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-base-content/50">Quantité en stock</p>
              <p className={`text-2xl font-bold ${product.stock_quantity <= product.minimum_stock ? 'text-warning' : ''}`}>
                {product.stock_quantity || 0}
              </p>
              <p className="text-sm text-base-content/50">Stock minimum: {product.minimum_stock || 0}</p>
            </div>
            
            <div>
              <p className="text-sm text-base-content/50">Prix d'achat</p>
              <p className="text-xl font-semibold">{formatCurrency(product.purchase_price)}</p>
            </div>
            
            <div>
              <p className="text-sm text-base-content/50">Prix de vente</p>
              <p className="text-xl font-semibold">{formatCurrency(product.sale_price)}</p>
            </div>
            
            <div>
              <p className="text-sm text-base-content/50">Marge</p>
              <p className="text-xl font-semibold text-success">{product.margin_percentage || 0}%</p>
            </div>
            
            <div>
              <p className="text-sm text-base-content/50">Unité</p>
              <p className="text-xl font-semibold">{product.unit_abbrev || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-base-content/50">Catégorie</p>
              <p className="text-xl font-semibold">{product.category_name || '-'}</p>
            </div>
          </div>

          {/* Barre de progression du stock */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Niveau de stock</span>
              <span>{((product.stock_quantity || 0) / ((product.minimum_stock || 1) * 10) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${product.stock_quantity === 0 ? 'bg-error' : product.is_low_stock ? 'bg-warning' : 'bg-success'} transition-all`}
                style={{ width: `${Math.min(((product.stock_quantity || 0) / ((product.minimum_stock || 1) * 10) * 100), 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-end mt-6 pt-4 border-t">
            <button className="btn btn-outline btn-sm gap-1">
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button className="btn btn-outline btn-sm gap-1">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <Link to={`/produits/${id}/modifier`} className="btn btn-primary btn-sm gap-1">
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
          </div>
        </div>
      </div>

      {/* Historique des mouvements */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="card-title">Historique des mouvements</h2>
            </div>
            <button 
              onClick={() => setShowMovements(!showMovements)}
              className="btn btn-sm btn-ghost"
            >
              {showMovements ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          
          {showMovements && (
            movements.length === 0 ? (
              <p className="text-center text-base-content/50 py-4">Aucun mouvement enregistré</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Type</th>
                      <th>Quantité</th>
                      <th>Entrepôt</th>
                      <th>Date</th>
                     </tr>
                  </thead>
                  <tbody>
                    {movements.slice(0, 10).map(movement => (
                      <tr key={movement.id}>
                        <td className="font-mono text-xs">{movement.reference}</td>
                        <td>
                          <span className={`badge badge-xs ${movement.movement_type === 'in' ? 'badge-success' : 'badge-error'}`}>
                            {movement.movement_type === 'in' ? 'Entrée' : 'Sortie'}
                          </span>
                        </td>
                        <td className={movement.movement_type === 'out' ? 'text-error' : 'text-success'}>
                          {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
                        </td>
                        <td>{movement.to_warehouse?.name || movement.from_warehouse?.name || '-'}</td>
                        <td className="text-xs">{new Date(movement.movement_date).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {movements.length > 10 && (
                  <div className="text-center mt-4">
                    <Link to={`/mouvements-stock/by-product/${id}`} className="btn btn-xs btn-ghost">
                      Voir tous les mouvements
                    </Link>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;