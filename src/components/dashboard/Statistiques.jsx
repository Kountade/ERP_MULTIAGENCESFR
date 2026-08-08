// src/components/dashboard/Statistiques.jsx
import React, { useEffect, useState, useMemo } from 'react';
import AxiosInstance from '../AxiosInstance';
import {
  BarChart3, Calendar, Filter, Download, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, Package, Users,
  PieChart, ChevronLeft, ChevronRight, X, CheckCircle,
  AlertCircle, Loader2, ArrowUp, ArrowDown, Eye,
  Printer, FileText, MoreHorizontal
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Scatter, ScatterChart
} from 'recharts';

const Statistiques = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [period, setPeriod] = useState('12m');
  const [filterAgence, setFilterAgence] = useState('');
  const [agences, setAgences] = useState([]);
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

  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/');
      setAgences(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Récupérer les ventes pour analyses
      const ventesRes = await AxiosInstance.get('/ventes/');
      setVentes(Array.isArray(ventesRes.data) ? ventesRes.data : []);

      // ✅ Ventes mensuelles (endpoint corrigé)
      const salesRes = await AxiosInstance.get('/statistiques/ventes_mensuelles/');
      setMonthlySales(Array.isArray(salesRes.data) ? salesRes.data : []);

      // ✅ Top produits (endpoint corrigé)
      const productsRes = await AxiosInstance.get('/statistiques/top_produits/');
      setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);

      // Stats générales
      const overviewRes = await AxiosInstance.get('/dashboard/overview/');
      setStatsData(overviewRes.data || {});

    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      showNotification('Erreur de chargement des statistiques', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAgences();
    fetchStats();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = ventes.length;
    const completed = ventes.filter(v => v.status === 'completed');
    const pending = ventes.filter(v => v.status === 'pending_approval');
    const approved = ventes.filter(v => v.status === 'approved');
    const rejected = ventes.filter(v => v.status === 'rejected');

    const totalCA = completed.reduce((sum, v) => sum + (v.total || 0), 0);
    const avgOrder = totalCA / (completed.length || 1);

    // Répartition par statut
    const statusDistribution = [
      { name: 'Complétées', value: completed.length, color: COLORS[0] },
      { name: 'Approuvées', value: approved.length, color: COLORS[1] },
      { name: 'En attente', value: pending.length, color: COLORS[2] },
      { name: 'Rejetées', value: rejected.length, color: COLORS[3] },
    ];

    // Répartition par agence
    const agenceDistribution = agences.map(ag => {
      const count = ventes.filter(v => v.agence_nom === ag.nom).length;
      const ca = ventes.filter(v => v.agence_nom === ag.nom && v.status === 'completed')
        .reduce((sum, v) => sum + (v.total || 0), 0);
      return { nom: ag.nom, count, ca };
    }).filter(a => a.count > 0);

    return { total, completed: completed.length, pending: pending.length, approved: approved.length, rejected: rejected.length, totalCA, avgOrder, statusDistribution, agenceDistribution };
  }, [ventes, agences]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Statistiques</h1>
          <p className="text-xs lg:text-sm text-base-content/60">Analyse détaillée de vos performances</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="3m">3 derniers mois</option>
            <option value="6m">6 derniers mois</option>
            <option value="12m">12 derniers mois</option>
            <option value="all">Tout</option>
          </select>
          {userRoles.est_pdg && (
            <select
              className="select select-bordered select-sm"
              value={filterAgence}
              onChange={(e) => setFilterAgence(e.target.value)}
            >
              <option value="">Toutes agences</option>
              {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          )}
          <button onClick={fetchStats} className="btn btn-outline btn-sm gap-1">
            <RefreshCw className="w-3 h-3" /> Actualiser
          </button>
          <button className="btn btn-primary btn-sm gap-1">
            <Download className="w-3 h-3" /> Exporter
          </button>
        </div>
      </div>

      {/* Cartes résumées */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-title text-xs lg:text-sm">Total ventes</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-title text-xs lg:text-sm">CA total</div>
          <div className="stat-value text-lg lg:text-2xl text-primary">{formatPrice(stats.totalCA)}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-title text-xs lg:text-sm">Panier moyen</div>
          <div className="stat-value text-lg lg:text-2xl text-secondary">{formatPrice(stats.avgOrder)}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-title text-xs lg:text-sm">Taux de conversion</div>
          <div className="stat-value text-lg lg:text-2xl text-success">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-title text-xs lg:text-sm">En attente</div>
          <div className="stat-value text-lg lg:text-2xl text-warning">{stats.pending}</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Évolution CA */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Évolution du CA</h2>
            <span className="text-xs text-base-content/50">Mensuel</span>
          </div>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Répartition par statut</h2>
            <span className="text-xs text-base-content/50">Nombre de ventes</span>
          </div>
          <div className="h-64 lg:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats.statusDistribution.filter(s => s.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {stats.statusDistribution.filter(s => s.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} ventes`} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Top produits */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Top 10 produits</h2>
            <span className="text-xs text-base-content/50">Quantité</span>
          </div>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="produit" tick={{ fontSize: 10 }} width={60} />
                <Tooltip formatter={(value) => `${value} unités`} />
                <Bar dataKey="quantite" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance par agence */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold">Performance par agence</h2>
            <span className="text-xs text-base-content/50">CA</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Agence</th>
                  <th className="text-right">Ventes</th>
                  <th className="text-right">CA</th>
                  <th className="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {stats.agenceDistribution.length > 0 ? (
                  stats.agenceDistribution.map((ag, i) => {
                    const percentage = stats.totalCA > 0 ? ((ag.ca / stats.totalCA) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i}>
                        <td className="font-medium">{ag.nom}</td>
                        <td className="text-right">{ag.count}</td>
                        <td className="text-right font-semibold text-primary">{formatPrice(ag.ca)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs">{percentage}%</span>
                            <div className="w-16 h-1.5 bg-base-300 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="4" className="text-center text-sm text-base-content/50 py-4">Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tableau détaillé des ventes */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold">Détail des ventes</h2>
          <span className="text-xs text-base-content/50">{ventes.length} enregistrements</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Client</th>
                <th>Agence</th>
                <th>Date</th>
                <th className="text-right">Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
              </tr>
            </thead>
            <tbody>
              {ventes.slice(0, 15).map((vente) => (
                <tr key={vente.id}>
                  <td className="font-mono text-xs">{vente.reference}</td>
                  <td>{vente.client_nom || 'Anonyme'}</td>
                  <td>{vente.agence_nom}</td>
                  <td className="text-xs">{new Date(vente.date_vente).toLocaleDateString('fr-FR')}</td>
                  <td className="text-right font-semibold">{formatPrice(vente.total)}</td>
                  <td>
                    <span className={`badge badge-sm ${
                      vente.status === 'completed' ? 'badge-success' :
                      vente.status === 'approved' ? 'badge-info' :
                      vente.status === 'pending_approval' ? 'badge-warning' :
                      vente.status === 'rejected' ? 'badge-error' :
                      'badge-ghost'
                    }`}>
                      {vente.status_display || vente.status}
                    </span>
                  </td>
                  <td>
                    {vente.est_paye ? (
                      <span className="badge badge-success badge-sm">Payé</span>
                    ) : (
                      <span className="badge badge-error badge-sm">{formatPrice(vente.montant_du)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ventes.length > 15 && (
          <div className="text-center mt-3">
            <button className="btn btn-ghost btn-sm">Voir plus...</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistiques;