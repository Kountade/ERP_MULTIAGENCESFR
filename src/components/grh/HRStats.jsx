// src/components/drh/HRStats.jsx
import React, { useEffect, useState } from 'react';
import AxiosInstance from '../AxiosInstance';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  Briefcase, 
  Award, 
  PieChart, 
  BarChart3,
  RefreshCw,
  X,
  Loader2,
  Activity,
  Smile,
  Frown,
  Target,
  Zap,
  User
} from 'lucide-react';

const HRStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // URL corrigée: /hr/stats/dashboard/
      const response = await AxiosInstance.get('/hr/stats/dashboard/');
      console.log('Stats data:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      console.error('Response:', err.response);
      setError(err.response?.data?.detail || err.message || 'Erreur de chargement des statistiques');
      setNotification({ show: true, message: 'Erreur de chargement des statistiques', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Formatage des nombres
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);
  };

  // États de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des statistiques RH...
          </p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-error mb-2">Erreur</h2>
          <p className="text-base-content/70 mb-6">{error}</p>
          <button onClick={fetchStats} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si pas de données
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-warning" />
          </div>
          <p className="text-base-content/70">Aucune donnée disponible</p>
          <button onClick={fetchStats} className="btn btn-primary btn-sm gap-2 mt-4">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
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

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">Tableau de bord RH</h1>
            </div>
            <p className="text-sm text-base-content/60 ml-1">
              Statistiques et indicateurs clés de performance
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={fetchStats} className="btn btn-sm sm:btn-md btn-outline gap-2 hover:bg-primary/10 transition-all">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Effectif total</p>
                <p className="text-3xl font-bold text-primary">{stats.total_employees || 0}</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Actifs: {stats.active_employees || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Congés</p>
                <p className="text-3xl font-bold text-warning">{stats.on_leave || 0}</p>
                <p className="text-xs text-base-content/50 mt-1">En attente: {stats.pending_leaves || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-warning" /></div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Masse salariale</p>
                <p className="text-xl font-bold text-info">{formatCurrency(stats.monthly_payroll)}</p>
                <p className="text-xs text-base-content/50 mt-1">Moyenne: {formatCurrency(stats.average_salary)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center"><DollarSign className="w-6 h-6 text-info" /></div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-all rounded-xl border border-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/50 font-medium uppercase tracking-wide">Présence aujourd'hui</p>
                <p className="text-3xl font-bold text-success">{stats.present_today || 0}</p>
                <p className="text-xs text-error mt-1">Absents: {stats.absent_today || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center"><UserCheck className="w-6 h-6 text-success" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution par genre */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-primary"/> Répartition par genre</h2>
        {stats.gender_distribution && Object.keys(stats.gender_distribution).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.gender_distribution).map(([gender, count]) => {
              const percentage = stats.total_employees > 0 ? ((count / stats.total_employees) * 100).toFixed(1) : 0;
              const genderLabel = gender === 'M' ? 'Masculin' : gender === 'F' ? 'Féminin' : 'Non spécifié';
              return (
                <div key={gender}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{genderLabel}</span>
                    <span className="font-semibold">{formatNumber(count)} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (<div className="text-center py-8 text-base-content/50">Aucune donnée de genre disponible</div>)}
      </div>

      {/* Distribution par département */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Répartition par département</h2>
        {stats.department_distribution && stats.department_distribution.length > 0 ? (
          <div className="space-y-3">
            {stats.department_distribution.map((dept, idx) => {
              const percentage = stats.total_employees > 0 ? ((dept.employee_count / stats.total_employees) * 100).toFixed(1) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dept.name}</span>
                    <span className="font-semibold">{formatNumber(dept.employee_count)} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (<div className="text-center py-8 text-base-content/50">Aucune donnée départementale disponible</div>)}
      </div>

      {/* Alertes congés */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-warning"/> Alertes solde de congés</h2>
        {stats.leave_balance_alert && stats.leave_balance_alert.length > 0 ? (
          <div className="space-y-2">
            {stats.leave_balance_alert.map((alert, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-warning/10 rounded-lg hover:bg-warning/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-warning" />
                  </div>
                  <span className="font-medium">{alert.employee_name}</span>
                </div>
                <div className="badge badge-warning gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.remaining_days} jours restants
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-success">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
            <p>Tous les soldes de congés sont suffisants</p>
          </div>
        )}
      </div>

      {/* Nouveaux embauches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-success"/> Nouveaux embauches</h2>
          <div className="text-center">
            <p className="text-5xl font-bold text-success mb-2">{stats.new_hires_this_month || 0}</p>
            <p className="text-sm text-base-content/50">ce mois-ci</p>
            <div className="mt-4 pt-4 border-t border-base-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-base-content/70">Taux de rotation</span>
                <span className="text-xl font-semibold text-info">{stats.turnover_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateurs supplémentaires */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary"/> Indicateurs clés</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-base-200 rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats.active_employees || 0}</p>
              <p className="text-xs text-base-content/50">Employés actifs</p>
            </div>
            <div className="text-center p-3 bg-base-200 rounded-lg">
              <p className="text-2xl font-bold text-info">{stats.present_today || 0}</p>
              <p className="text-xs text-base-content/50">Présents aujourd'hui</p>
            </div>
            <div className="text-center p-3 bg-base-200 rounded-lg">
              <p className="text-2xl font-bold text-warning">{stats.pending_leaves || 0}</p>
              <p className="text-xs text-base-content/50">Congés en attente</p>
            </div>
            <div className="text-center p-3 bg-base-200 rounded-lg">
              <p className="text-2xl font-bold text-success">{stats.new_hires_this_month || 0}</p>
              <p className="text-xs text-base-content/50">Nouveaux ce mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRStats;