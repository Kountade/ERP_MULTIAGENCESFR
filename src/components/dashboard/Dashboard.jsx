// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AxiosInstance from '../AxiosInstance';
import {
  Building2, Users, Package, Truck, DollarSign, ShoppingCart,
  AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  RefreshCw, Calendar, ChevronRight, ArrowUp, ArrowDown,
  Store, UserCheck, FileText, CreditCard, Loader2, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState({ est_pdg: false, est_chef_agence: false });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'];

  const fetchCurrentUser = async () => {
    try {
      const response = await AxiosInstance.get('/users/me/');
      const userData = response.data;
      setCurrentUser(userData);
      const isPDG = userData.role_global === 'pdg' || userData.is_superuser === true;
      const isChefAgence = userData.roles_agence?.some(r => r.role === 'chef_agence') || false;
      setUserRoles({ est_pdg: isPDG, est_chef_agence: isChefAgence });
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Mise à jour des URLs avec les nouveaux ViewSets
      const overviewRes = await AxiosInstance.get('/dashboard/overview/');
      setDashboardData(overviewRes.data);

      // Ventes mensuelles → maintenant dans statistiques
      const salesRes = await AxiosInstance.get('/statistiques/ventes_mensuelles/');
      setMonthlySales(Array.isArray(salesRes.data) ? salesRes.data : []);

      // Top produits → maintenant dans statistiques
      const productsRes = await AxiosInstance.get('/statistiques/top_produits/');
      // S'assurer que les données correspondent au format attendu
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
      setTopProducts(productsData);

      // Alertes stock → toujours dans dashboard
      const alertsRes = await AxiosInstance.get('/dashboard/alertes_stock/');
      setStockAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      showNotification('Erreur de chargement du tableau de bord', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchDashboardData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  const data = dashboardData || {};

  // Cartes KPI
  const kpiCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(data.total_ca),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      sub: `+${formatPrice(data.ca_jour)} aujourd'hui`
    },
    {
      title: 'Ventes en attente',
      value: data.ventes_en_attente || 0,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      sub: `${data.commandes_encours || 0} commandes en cours`
    },
    {
      title: 'Valeur du stock',
      value: formatPrice(data.valeur_stock),
      icon: Package,
      color: 'text-info',
      bgColor: 'bg-info/10',
      sub: `${data.alertes_stock || 0} alertes actives`
    },
    {
      title: 'Impays',
      value: formatPrice(data.impayes),
      icon: AlertCircle,
      color: 'text-error',
      bgColor: 'bg-error/10',
      sub: `${data.commandes_retard || 0} commandes en retard`
    },
    {
      title: 'Employés actifs',
      value: data.employes_actifs || 0,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      sub: `${data.conges_en_attente || 0} congés en attente`
    },
    {
      title: 'Transferts en cours',
      value: data.transferts_encours || 0,
      icon: Truck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      sub: `${data.total_agences || 0} agences`
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Tableau de bord</h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Vue d'ensemble de votre activité
            {currentUser && (
              <span className="ml-2 text-primary">
                • {currentUser.email}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDashboardData} className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2">
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button className="btn btn-ghost btn-sm lg:btn-md gap-1 lg:gap-2">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Aujourd'hui</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-3">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
              <div className="flex items-center gap-2">
                <div className={`stat-figure ${card.color}`}>
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="stat-title text-xs lg:text-sm truncate">{card.title}</div>
              </div>
              <div className={`stat-value text-base lg:text-xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.sub && (
                <div className="stat-desc text-xs text-base-content/50 truncate">{card.sub}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Ventes mensuelles */}
        <div className="lg:col-span-2 bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Évolution des ventes (12 mois)</h2>
            <span className="text-xs text-base-content/50">CA mensuel</span>
          </div>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatPrice(value)} labelFormatter={(label) => `Mois: ${label}`} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Top produits</h2>
            <span className="text-xs text-base-content/50">Quantité vendue</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.produit || 'Produit inconnu'}</p>
                    <p className="text-xs text-base-content/50">{product.quantite || 0} unités</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(product.total)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-base-content/50 py-8">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      {/* Dernières activités et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Alertes stock */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Alertes stock</h2>
            <span className="badge badge-error badge-sm">{stockAlerts.length}</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stockAlerts.length > 0 ? (
              stockAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-error/5 rounded-lg border border-error/20">
                  <AlertCircle className="w-4 h-4 text-error mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.produit}</p>
                    <p className="text-xs text-base-content/60">
                      Stock: <span className="font-semibold text-error">{alert.stock}</span> / Seuil: {alert.seuil}
                    </p>
                    <p className="text-xs text-base-content/50">{alert.agence} • {new Date(alert.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-base-content/50 py-8">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                Aucune alerte active
              </p>
            )}
          </div>
        </div>

        {/* Dernières activités */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Activités récentes</h2>
            <span className="text-xs text-base-content/50">Dernières 24h</span>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data.dernieres_ventes && data.dernieres_ventes.length > 0 ? (
              <>
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Ventes</p>
                {data.dernieres_ventes.slice(0, 3).map((vente, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3 text-primary" />
                      <span className="text-sm font-medium">{vente.reference}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(vente.total)}</p>
                      <p className="text-xs text-base-content/50">{vente.client__nom || 'Anonyme'}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mt-2">Achats</p>
                {data.derniers_achats && data.derniers_achats.slice(0, 3).map((achat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3 text-info" />
                      <span className="text-sm font-medium">{achat.order_number}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(achat.total)}</p>
                      <p className="text-xs text-base-content/50">{achat.supplier__company_name || 'Fournisseur'}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-sm text-base-content/50 py-8">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques RH (visible seulement pour PDG/DRH) */}
      {(userRoles.est_pdg || userRoles.est_drh) && (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Statistiques RH</h2>
            <span className="badge badge-primary badge-sm">PDG/DRH</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="stat p-3 bg-base-200 rounded-lg">
              <div className="stat-figure text-secondary"><Users className="w-4 h-4" /></div>
              <div className="stat-title text-xs">Total employés</div>
              <div className="stat-value text-lg">{data.total_employes || 0}</div>
            </div>
            <div className="stat p-3 bg-base-200 rounded-lg">
              <div className="stat-figure text-success"><UserCheck className="w-4 h-4" /></div>
              <div className="stat-title text-xs">Actifs</div>
              <div className="stat-value text-lg">{data.employes_actifs || 0}</div>
            </div>
            <div className="stat p-3 bg-base-200 rounded-lg">
              <div className="stat-figure text-warning"><Clock className="w-4 h-4" /></div>
              <div className="stat-title text-xs">Congés en attente</div>
              <div className="stat-value text-lg">{data.conges_en_attente || 0}</div>
            </div>
            <div className="stat p-3 bg-base-200 rounded-lg">
              <div className="stat-figure text-error"><AlertCircle className="w-4 h-4" /></div>
              <div className="stat-title text-xs">Absents aujourd'hui</div>
              <div className="stat-value text-lg">{data.absences_jour || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="text-center text-xs text-base-content/40 py-4 border-t border-base-300">
        Données mises à jour en temps réel • {new Date().toLocaleString('fr-FR')}
      </div>
    </div>
  );
};

export default Dashboard;