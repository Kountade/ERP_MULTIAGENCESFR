// src/components/dashboard/Analyses.jsx
import React, { useEffect, useState, useMemo } from 'react';
import AxiosInstance from '../AxiosInstance';
import {
  TrendingUp, TrendingDown, Calendar, Filter, Download, RefreshCw,
  AlertCircle, CheckCircle, X, Loader2, Target, Activity,
  Zap, DollarSign, Package, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, Line, Cell, PieChart, Pie
} from 'recharts';

const Analyses = () => {
  const [loading, setLoading] = useState(true);
  const [ventes, setVentes] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]); // pour la tendance
  const [topProducts, setTopProducts] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [period, setPeriod] = useState('12m');
  const [activeTab, setActiveTab] = useState('tendances');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      // Récupérer les données nécessaires pour chaque onglet
      // 1. Tendance des ventes (6 mois)
      const tendanceRes = await AxiosInstance.get('/analyses/tendance_ventes/');
      const tendanceData = Array.isArray(tendanceRes.data) ? tendanceRes.data : [];
      setMonthlySales(tendanceData);

      // 2. Top produits (pour l'onglet clients, on peut utiliser /statistiques/top_produits/)
      const productsRes = await AxiosInstance.get('/statistiques/top_produits/');
      setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : []);

      // 3. Données générales (overview) pour les cartes
      const overviewRes = await AxiosInstance.get('/dashboard/overview/');
      setStatsData(overviewRes.data || {});

      // 4. Récupérer la liste des ventes pour les statistiques (clients, etc.)
      const ventesRes = await AxiosInstance.get('/ventes/');
      setVentes(Array.isArray(ventesRes.data) ? ventesRes.data : []);

    } catch (error) {
      console.error('Erreur chargement analyses:', error);
      showNotification('Erreur de chargement des analyses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Analyses calculées
  const analyses = useMemo(() => {
    const completed = ventes.filter(v => v.status === 'completed');
    const totalCA = completed.reduce((sum, v) => sum + (v.total || 0), 0);
    const avgOrder = completed.length > 0 ? totalCA / completed.length : 0;

    const monthly = monthlySales.map(m => ({ ...m, total: Number(m.total) || 0 }));
    const currentMonth = monthly.length > 0 ? monthly[monthly.length - 1] : { total: 0 };
    const previousMonth = monthly.length > 1 ? monthly[monthly.length - 2] : { total: 0 };
    const growth = previousMonth.total > 0 ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100 : 0;

    // Prévision (moyenne mobile sur 3 mois)
    const forecast = [];
    if (monthly.length >= 3) {
      const last3 = monthly.slice(-3);
      const avg = last3.reduce((s, m) => s + m.total, 0) / 3;
      forecast.push({ mois: 'Prochain mois', total: avg });
    }

    // Saisonnalité (par jour de semaine)
    const dayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    completed.forEach(v => {
      const date = new Date(v.date_vente);
      const day = date.getDay();
      dayOfWeek[day] += v.total || 0;
    });
    const seasonality = dayNames.map((name, i) => ({ jour: name, ca: dayOfWeek[i] }));

    // Top clients
    const clients = {};
    completed.forEach(v => {
      const key = v.client_nom || 'Anonyme';
      if (!clients[key]) clients[key] = { total: 0, count: 0 };
      clients[key].total += v.total || 0;
      clients[key].count += 1;
    });
    const topClients = Object.entries(clients)
      .map(([nom, data]) => ({ nom, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Heures de pointe
    const hourDistribution = [];
    for (let h = 8; h <= 20; h++) {
      hourDistribution.push({ heure: `${h}h`, ventes: 0 });
    }
    completed.forEach(v => {
      const date = new Date(v.date_vente);
      const hour = date.getHours();
      if (hour >= 8 && hour <= 20) {
        hourDistribution[hour - 8].ventes += 1;
      }
    });

    return {
      totalCA,
      avgOrder,
      growth,
      monthly,
      forecast,
      seasonality,
      topClients,
      hourDistribution,
      totalVentes: completed.length,
      totalOrders: ventes.length
    };
  }, [ventes, monthlySales]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des analyses...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tendances', label: 'Tendances', icon: TrendingUp },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'saisonnalite', label: 'Saisonnalité', icon: Calendar },
    { id: 'previsions', label: 'Prévisions', icon: Target },
  ];

  // Fonction de rendu sécurisée pour chaque onglet
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tendances':
        return (
          <>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Évolution des ventes (6 derniers mois)</h2>
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyses.monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="CA mensuel" />
                    <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} name="Tendance" dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg text-success"><TrendingUp className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-base-content/50">Meilleur mois</p>
                    <p className="text-lg font-bold text-success">
                      {analyses.monthly.length > 0 ? analyses.monthly.reduce((a, b) => a.total > b.total ? a : b).mois : '-'}
                    </p>
                    <p className="text-sm">{analyses.monthly.length > 0 ? formatPrice(analyses.monthly.reduce((a, b) => a.total > b.total ? a : b).total) : '-'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error/10 rounded-lg text-error"><TrendingDown className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-base-content/50">Plus faible mois</p>
                    <p className="text-lg font-bold text-error">
                      {analyses.monthly.length > 0 ? analyses.monthly.reduce((a, b) => a.total < b.total ? a : b).mois : '-'}
                    </p>
                    <p className="text-sm">{analyses.monthly.length > 0 ? formatPrice(analyses.monthly.reduce((a, b) => a.total < b.total ? a : b).total) : '-'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-base-content/50">Moyenne mensuelle</p>
                    <p className="text-lg font-bold text-primary">
                      {analyses.monthly.length > 0 ? formatPrice(analyses.monthly.reduce((s, m) => s + m.total, 0) / analyses.monthly.length) : '-'}
                    </p>
                    <p className="text-sm text-base-content/60">sur {analyses.monthly.length} mois</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'clients':
        return (
          <>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Top 10 clients</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr><th>#</th><th>Client</th><th className="text-right">Achats</th><th className="text-right">CA</th><th className="text-right">Panier moyen</th></tr>
                  </thead>
                  <tbody>
                    {analyses.topClients.length > 0 ? (
                      analyses.topClients.map((client, i) => (
                        <tr key={i}>
                          <td className="font-bold text-primary">#{i + 1}</td>
                          <td>{client.nom}</td>
                          <td className="text-right">{client.count}</td>
                          <td className="text-right font-semibold">{formatPrice(client.total)}</td>
                          <td className="text-right">{formatPrice(client.total / client.count)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center text-sm text-base-content/50 py-4">Aucune donnée client</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Répartition des clients</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="stat p-3 bg-base-200 rounded-lg">
                  <div className="stat-title text-xs">Clients uniques</div>
                  <div className="stat-value text-lg">{analyses.topClients.length}</div>
                </div>
                <div className="stat p-3 bg-base-200 rounded-lg">
                  <div className="stat-title text-xs">CA moyen / client</div>
                  <div className="stat-value text-lg">
                    {analyses.topClients.length > 0 ? formatPrice(analyses.totalCA / analyses.topClients.length) : '0 FCFA'}
                  </div>
                </div>
                <div className="stat p-3 bg-base-200 rounded-lg">
                  <div className="stat-title text-xs">Meilleur client</div>
                  <div className="stat-value text-lg text-primary">{analyses.topClients.length > 0 ? analyses.topClients[0].nom : '-'}</div>
                </div>
              </div>
            </div>
          </>
        );

      case 'saisonnalite':
        return (
          <>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">CA par jour de la semaine</h2>
              <div className="h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyses.seasonality} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Bar dataKey="ca" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {analyses.seasonality.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Heures de pointe</h2>
              <div className="h-56 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyses.hourDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="heure" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="ventes" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );

      case 'previsions':
        return (
          <>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Prévision des ventes</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {analyses.forecast.length > 0 ? (
                  <div className="stat p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="stat-figure text-primary"><Target className="w-5 h-5" /></div>
                    <div className="stat-title text-xs">Prévision mois prochain</div>
                    <div className="stat-value text-lg text-primary">{formatPrice(analyses.forecast[0].total)}</div>
                    <div className="stat-desc text-xs">Moyenne mobile 3 mois</div>
                  </div>
                ) : (
                  <div className="stat p-4 bg-base-200 rounded-lg">
                    <div className="stat-title text-xs">Prévision</div>
                    <div className="stat-value text-lg text-base-content/50">Données insuffisantes</div>
                    <div className="stat-desc text-xs">Minimum 3 mois requis</div>
                  </div>
                )}
                <div className="stat p-4 bg-base-200 rounded-lg">
                  <div className="stat-title text-xs">Tendance</div>
                  <div className={`stat-value text-lg ${analyses.growth >= 0 ? 'text-success' : 'text-error'}`}>
                    {analyses.growth >= 0 ? '+' : ''}{analyses.growth.toFixed(1)}%
                  </div>
                  <div className="stat-desc text-xs">vs mois précédent</div>
                </div>
                <div className="stat p-4 bg-base-200 rounded-lg">
                  <div className="stat-title text-xs">Confiance</div>
                  <div className="stat-value text-lg text-accent">
                    {analyses.monthly.length >= 6 ? 'Élevée' : analyses.monthly.length >= 3 ? 'Moyenne' : 'Faible'}
                  </div>
                  <div className="stat-desc text-xs">{analyses.monthly.length} mois de données</div>
                </div>
              </div>
              <div className="h-56 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[...analyses.monthly, ...analyses.forecast]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="CA réel" />
                    {analyses.forecast.length > 0 && <Bar dataKey="total" fill="#f59e0b" name="Prévision" />}
                    <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} name="Tendance" strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <h2 className="text-base lg:text-lg font-semibold mb-4">Recommandations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analyses.growth < 0 && (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                    <div><p className="text-sm font-medium text-warning">Baisse d'activité</p><p className="text-xs text-base-content/60">Augmentez vos actions marketing.</p></div>
                  </div>
                )}
                {analyses.seasonality.length > 0 && (
                  <div className="p-3 bg-info/10 rounded-lg border border-info/20 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-info mt-0.5" />
                    <div><p className="text-sm font-medium text-info">Saisonnalité</p><p className="text-xs text-base-content/60">{analyses.seasonality.reduce((a, b) => a.ca > b.ca ? a : b).jour} est votre meilleur jour.</p></div>
                  </div>
                )}
                {analyses.topClients.length > 0 && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20 flex items-start gap-3">
                    <Users className="w-5 h-5 text-success mt-0.5" />
                    <div><p className="text-sm font-medium text-success">Fidélisation</p><p className="text-xs text-base-content/60">Client clé : {analyses.topClients[0].nom}. Offres exclusives.</p></div>
                  </div>
                )}
                {analyses.avgOrder > 0 && (
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div><p className="text-sm font-medium text-accent">Upselling</p><p className="text-xs text-base-content/60">Panier moyen : {formatPrice(analyses.avgOrder)}. Proposez des ventes croisées.</p></div>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" /> : <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Analyses & Intelligence</h1>
          <p className="text-xs lg:text-sm text-base-content/60">Analyses avancées et prévisions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="select select-bordered select-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="all">Tout</option>
          </select>
          <button onClick={fetchAnalyses} className="btn btn-outline btn-sm gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button className="btn btn-primary btn-sm gap-1"><Download className="w-3 h-3" /> Rapport</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary"><DollarSign className="w-4 h-4 lg:w-5 lg:h-5" /></div>
          <div className="stat-title text-xs lg:text-sm">CA total</div>
          <div className="stat-value text-base lg:text-xl">{formatPrice(analyses.totalCA)}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-secondary"><Package className="w-4 h-4 lg:w-5 lg:h-5" /></div>
          <div className="stat-title text-xs lg:text-sm">Panier moyen</div>
          <div className="stat-value text-base lg:text-xl">{formatPrice(analyses.avgOrder)}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" /></div>
          <div className="stat-title text-xs lg:text-sm">Croissance</div>
          <div className={`stat-value text-base lg:text-xl ${analyses.growth >= 0 ? 'text-success' : 'text-error'}`}>
            {analyses.growth >= 0 ? '+' : ''}{analyses.growth.toFixed(1)}%
          </div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning"><Activity className="w-4 h-4 lg:w-5 lg:h-5" /></div>
          <div className="stat-title text-xs lg:text-sm">Commandes</div>
          <div className="stat-value text-base lg:text-xl">{analyses.totalOrders}</div>
        </div>
      </div>

      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`btn btn-sm gap-1 lg:gap-2 ${activeTab === tab.id ? 'btn-primary text-white' : 'btn-ghost'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Analyses;