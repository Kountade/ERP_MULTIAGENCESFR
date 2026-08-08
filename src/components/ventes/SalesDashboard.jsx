// src/components/sales/SalesDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Eye,
  Printer,
  Download,
  Filter,
  LayoutDashboard,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentVentes, setRecentVentes] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('today');
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 4000);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [dashboardRes, ventesRes, topProductsRes] = await Promise.all([
        AxiosInstance.get('/dashboard/ventes/'),
        AxiosInstance.get('/ventes/?ordering=-date_vente&limit=5'),
        AxiosInstance.get('/dashboard/top-products/').catch(() => ({ data: [] }))
      ]);
      setStats(dashboardRes.data);
      setRecentVentes(ventesRes.data || []);
      setTopProducts(topProductsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      showNotification('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    showNotification('Données actualisées avec succès', 'success');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const mainCards = [
    { title: 'Chiffre d\'affaires', value: formatPrice(stats?.total_ca), icon: DollarSign, bgColor: 'bg-green-50', textColor: 'text-green-600', borderColor: 'border-green-200' },
    { title: 'CA du jour', value: formatPrice(stats?.ca_jour), icon: TrendingUp, bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { title: 'Ventes en attente', value: stats?.ventes_en_attente || 0, icon: Clock, bgColor: 'bg-orange-50', textColor: 'text-orange-600', borderColor: 'border-orange-200' },
    { title: 'Impayés', value: formatPrice(stats?.impayes), icon: AlertCircle, bgColor: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200' }
  ];

  const secondaryCards = [
    { title: 'Total ventes', value: formatNumber(stats?.total_ventes), icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-50', link: '/ventes' },
    { title: 'Ventes complétées', value: formatNumber(stats?.ventes_completed), icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', link: '/ventes?status=completed' },
    { title: 'Ventes annulées', value: formatNumber(stats?.ventes_annulees), icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', link: '/ventes?status=cancelled' },
    { title: 'Clients actifs', value: formatNumber(stats?.total_clients), icon: Users, color: 'text-cyan-600', bgColor: 'bg-cyan-50', link: '/clients' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl text-sm sm:text-base rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête avec gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <LayoutDashboard className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">Tableau de bord commercial</h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              Vue d'ensemble de l'activité commerciale – {formatNumber(stats?.total_ventes)} vente(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={refreshData} className="btn btn-sm sm:btn-md btn-outline gap-2 hover:bg-primary/10 transition-all" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button onClick={() => navigate('/point-de-vente')} className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-none shadow-lg hover:shadow-xl transition-all gap-2">
              <ShoppingCart className="w-4 h-4" />
              Nouvelle vente
            </button>
          </div>
        </div>
      </div>

      {/* Filtre période */}
      <div className="flex justify-end">
        <div className="btn-group">
          <button className={`btn btn-sm ${period === 'today' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('today')}>Aujourd'hui</button>
          <button className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('week')}>Cette semaine</button>
          <button className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('month')}>Ce mois</button>
          <button className={`btn btn-sm ${period === 'year' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod('year')}>Cette année</button>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card, index) => (
          <div key={index} className={`card bg-white shadow-md hover:shadow-lg transition-all rounded-xl border-l-4 ${card.borderColor}`}>
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryCards.map((card, index) => (
          <div key={index} className="card bg-white shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl" onClick={() => card.link && navigate(card.link)}>
            <div className="card-body p-4 text-center">
              <div className={`p-2 rounded-full ${card.bgColor} w-10 h-10 mx-auto mb-2 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique et Top produits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des ventes */}
        <div className="lg:col-span-2 card bg-white shadow-md rounded-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Évolution des ventes</h2>
              </div>
              <select className="select select-xs select-bordered w-32">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
                <option>12 derniers mois</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 78, 55, 89, 72, 58].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-lg" style={{ height: `${height}%` }}>
                    <div className="w-full bg-primary rounded-t-lg transition-all" style={{ height: `${height}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top produits */}
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Top produits</h2>
            </div>
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Aucune donnée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400">#{i+1}</span>
                      <div>
                        <p className="font-medium text-sm">{product.product__name}</p>
                        <p className="text-xs text-gray-500">{formatNumber(product.total_quantity)} vendus</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-primary">{formatPrice(product.total_ca)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dernières ventes */}
      <div className="card bg-white shadow-md rounded-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Dernières ventes</h2>
            </div>
            <button className="btn btn-ghost btn-sm text-primary flex items-center gap-1" onClick={() => navigate('/ventes')}>
              Voir toutes <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentVentes.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Aucune vente récente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left">Référence</th>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Montant</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-center">Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {recentVentes.map((vente) => (
                    <tr key={vente.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/ventes/${vente.id}`)}>
                      <td className="p-3 font-mono text-sm">{vente.reference}</td>
                      <td className="p-3">{vente.client_nom || 'Anonyme'}</td>
                      <td className="p-3 text-sm">{formatDate(vente.date_vente)}</td>
                      <td className="p-3 font-semibold text-primary">{formatPrice(vente.total)}</td>
                      <td className="p-3">
                        <span className={`badge ${
                          vente.status === 'completed' ? 'badge-success' :
                          vente.status === 'pending_approval' ? 'badge-warning' :
                          vente.status === 'approved' ? 'badge-info' :
                          vente.status === 'rejected' ? 'badge-error' : 'badge-ghost'
                        }`}>
                          {vente.status === 'completed' ? 'Complétée' :
                           vente.status === 'pending_approval' ? 'En attente' :
                           vente.status === 'approved' ? 'Approuvée' :
                           vente.status === 'rejected' ? 'Rejetée' : vente.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button className="btn btn-ghost btn-xs btn-square" onClick={(e) => { e.stopPropagation(); navigate(`/ventes/${vente.id}`); }}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Résumé des ventes et État des paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Résumé des ventes */}
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Résumé des ventes</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total ventes</span>
                <span className="font-bold text-gray-900">{formatNumber(stats?.total_ventes)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ventes du jour</span>
                <span className="font-bold text-gray-900">{formatNumber(stats?.nb_ventes_jour)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ventes approuvées</span>
                <span className="font-bold text-info">{formatNumber(stats?.ventes_approuvees)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ventes complétées</span>
                <span className="font-bold text-success">{formatNumber(stats?.ventes_completed)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Ventes annulées</span>
                <span className="font-bold text-error">{formatNumber(stats?.ventes_annulees)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* État des paiements */}
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">État des paiements</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Montant total dû</span>
                <span className="font-bold text-error">{formatPrice(stats?.impayes)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Taux de recouvrement</span>
                <span className="font-bold text-success">{stats?.taux_paiement || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-success h-2 rounded-full transition-all" style={{ width: `${stats?.taux_paiement || 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <button onClick={() => navigate('/point-de-vente')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <ShoppingCart className="w-4 h-4" /> Point de vente
        </button>
        <button onClick={() => navigate('/ventes')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <ShoppingCart className="w-4 h-4" /> Ventes
        </button>
        <button onClick={() => navigate('/clients')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <Users className="w-4 h-4" /> Clients
        </button>
        <button onClick={() => navigate('/devis')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <FileText className="w-4 h-4" /> Devis
        </button>
        <button onClick={() => navigate('/factures')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <Receipt className="w-4 h-4" /> Factures
        </button>
        <button onClick={() => navigate('/paiements')} className="btn btn-outline btn-sm gap-2 justify-center hover:bg-primary/10 transition-all">
          <CreditCard className="w-4 h-4" /> Paiements
        </button>
      </div>
    </div>
  );
};

export default SalesDashboard;