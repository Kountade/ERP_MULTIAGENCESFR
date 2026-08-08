// src/components/tresorerie/Tresorerie.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Wallet,
  Coins,
  PiggyBank,
  ArrowLeftRight,
  Receipt,
  TrendingUp,
  CheckCircle,
  Calendar,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Scale,
  PieChart,
  LayoutDashboard,
  Eye,
  MoreVertical,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Users,
  DollarSign,
  ArrowUpDown,
  List,
  Grid3x3,
  Download,
  Printer,
  FileText
} from 'lucide-react'

const Tresorerie = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    solde_global: 0,
    solde_caisses: 0,
    solde_banques: 0,
    nb_caisses: 0,
    nb_comptes: 0,
    encaissements_jour: 0,
    decaissements_jour: 0,
    flux_jour: 0,
    previsions_7j: 0,
    alertes: 0
  })
  const [derniersMouvements, setDerniersMouvements] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setError('Veuillez vous connecter')
        setLoading(false)
        return
      }

      // Récupérer le solde global
      const tresorerieRes = await AxiosInstance.get('/tresorerie/').catch(() => ({ data: { solde_final: 0 } }))
      const soldeGlobal = tresorerieRes.data?.solde_final || 0

      // Récupérer les caisses
      const caissesRes = await AxiosInstance.get('/caisses/').catch(() => ({ data: [] }))
      const caisses = caissesRes.data || []
      const soldeCaisses = caisses.reduce((sum, c) => sum + (c.solde_actuel || 0), 0)

      // Récupérer les comptes bancaires
      const comptesRes = await AxiosInstance.get('/comptes-bancaires/').catch(() => ({ data: [] }))
      const comptes = comptesRes.data || []
      const soldeBanques = comptes.reduce((sum, c) => sum + (c.solde_actuel || 0), 0)

      // Récupérer les mouvements du jour
      const today = new Date().toISOString().split('T')[0]
      const mouvementsRes = await AxiosInstance.get(`/mouvements/?date=${today}`).catch(() => ({ data: [] }))
      const mouvements = mouvementsRes.data || []
      const encaissements = mouvements.filter(m => m.type_mouvement === 'encaissement').reduce((s, m) => s + (m.montant || 0), 0)
      const decaissements = mouvements.filter(m => m.type_mouvement === 'decaissement').reduce((s, m) => s + (m.montant || 0), 0)

      // Récupérer les prévisions
      const previsionsRes = await AxiosInstance.get('/previsions/').catch(() => ({ data: [] }))
      const previsions = previsionsRes.data || []
      const previsions7j = previsions
        .filter(p => new Date(p.date_debut) >= new Date() && new Date(p.date_debut) <= new Date(Date.now() + 7 * 86400000))
        .reduce((sum, p) => sum + (p.montant_prevu || 0), 0)

      // Récupérer les alertes
      const alertesRes = await AxiosInstance.get('/alertes-tresorerie/').catch(() => ({ data: [] }))
      const alertes = alertesRes.data || []

      // Derniers mouvements
      const derniersRes = await AxiosInstance.get('/mouvements/?limit=5').catch(() => ({ data: [] }))
      setDerniersMouvements(derniersRes.data || [])

      setStats({
        solde_global: soldeGlobal,
        solde_caisses: soldeCaisses,
        solde_banques: soldeBanques,
        nb_caisses: caisses.length,
        nb_comptes: comptes.length,
        encaissements_jour: encaissements,
        decaissements_jour: decaissements,
        flux_jour: encaissements - decaissements,
        previsions_7j: previsions7j,
        alertes: alertes.filter(a => a.est_active).length
      })

    } catch (error) {
      console.error('Erreur chargement trésorerie:', error)
      setError('Erreur de chargement de la trésorerie')
      showNotification('Erreur de chargement de la trésorerie', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la trésorerie...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
            💰 Trésorerie
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Vue d'ensemble des flux financiers et des soldes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => navigate('/mouvements/nouveau')}
            className="btn btn-sm sm:btn-md btn-success gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Nouveau mouvement</span>
          </button>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Solde global</div>
          <div className={`stat-value text-lg sm:text-2xl lg:text-3xl font-black ${stats.solde_global >= 0 ? 'text-success' : 'text-error'}`}>
            {formatMontant(stats.solde_global)}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Caisses</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-info">
            {formatMontant(stats.solde_caisses)}
          </div>
          <div className="stat-desc text-xs">{stats.nb_caisses} caisse(s)</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Comptes bancaires</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-primary">
            {formatMontant(stats.solde_banques)}
          </div>
          <div className="stat-desc text-xs">{stats.nb_comptes} compte(s)</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Flux du jour</div>
          <div className={`stat-value text-lg sm:text-2xl lg:text-3xl font-black ${stats.flux_jour >= 0 ? 'text-success' : 'text-error'}`}>
            {stats.flux_jour >= 0 ? '+' : ''}{formatMontant(stats.flux_jour)}
          </div>
          <div className="stat-desc text-xs flex gap-2 flex-wrap">
            <span className="text-success">+{formatMontant(stats.encaissements_jour)}</span>
            <span className="text-error">-{formatMontant(stats.decaissements_jour)}</span>
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <button 
          onClick={() => navigate('/caisses')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-info transition-all text-center group"
        >
          <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-info mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Caisses</p>
        </button>

        <button 
          onClick={() => navigate('/comptes-bancaires')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-primary transition-all text-center group"
        >
          <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Comptes bancaires</p>
        </button>

        <button 
          onClick={() => navigate('/mouvements')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-warning transition-all text-center group"
        >
          <ArrowLeftRight className="w-6 h-6 sm:w-8 sm:h-8 text-warning mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Mouvements</p>
        </button>

        <button 
          onClick={() => navigate('/previsions')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-success transition-all text-center group"
        >
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Prévisions</p>
        </button>

        <button 
          onClick={() => navigate('/rapprochements')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-secondary transition-all text-center group"
        >
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Rapprochements</p>
        </button>

        <button 
          onClick={() => navigate('/frais')}
          className="p-3 sm:p-4 bg-base-100 rounded-xl shadow-md border border-base-200 hover:border-error transition-all text-center group"
        >
          <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-error mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-xs sm:text-sm">Frais</p>
        </button>
      </div>

      {/* Derniers mouvements et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Derniers mouvements */}
        <div className="lg:col-span-2 bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📋 Derniers mouvements</h2>
            <button 
              onClick={() => navigate('/mouvements')}
              className="text-sm text-primary hover:underline"
            >
              Voir tout →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th>Date</th>
                  <th>Type</th>
                  <th>Libellé</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {derniersMouvements.length > 0 ? (
                  derniersMouvements.map((m, idx) => (
                    <tr key={idx} className="hover">
                      <td className="text-xs">{formatDate(m.date_mouvement)}</td>
                      <td>
                        <span className={`badge badge-sm ${m.type_mouvement === 'encaissement' ? 'badge-success' : 'badge-error'}`}>
                          {m.type_mouvement}
                        </span>
                      </td>
                      <td className="text-sm truncate max-w-[150px]">{m.libelle}</td>
                      <td className="text-right font-mono text-sm">
                        {formatMontant(m.montant)}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${m.status === 'effectue' ? 'badge-success' : m.status === 'planifie' ? 'badge-warning' : 'badge-ghost'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-base-content/40">
                      Aucun mouvement récent
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes et infos */}
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <h2 className="text-lg font-semibold mb-4">🔔 Alertes</h2>
          
          <div className="space-y-3">
            {stats.alertes > 0 ? (
              <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-warning">Alertes actives</p>
                    <p className="text-sm text-base-content/60">{stats.alertes} alerte(s) à traiter</p>
                    <button 
                      onClick={() => navigate('/alertes')}
                      className="btn btn-xs btn-warning btn-outline mt-2"
                    >
                      Voir les alertes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-success">Tout est bon !</p>
                    <p className="text-sm text-base-content/60">Aucune alerte à signaler</p>
                  </div>
                </div>
              </div>
            )}

            {stats.previsions_7j > 0 && (
              <div className="p-3 bg-info/10 rounded-xl border border-info/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-info">Prévisions 7 jours</p>
                    <p className="text-sm font-bold text-info">{formatMontant(stats.previsions_7j)}</p>
                    <p className="text-xs text-base-content/60">Entrées prévues</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-base-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Suivi journalier</p>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <p className="text-xs text-base-content/60">Entrées</p>
                      <p className="text-sm font-bold text-success">+{formatMontant(stats.encaissements_jour)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60">Sorties</p>
                      <p className="text-sm font-bold text-error">-{formatMontant(stats.decaissements_jour)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/tresorerie-journaliere')}
              className="w-full btn btn-outline btn-sm gap-2"
            >
              <Calendar className="w-4 h-4" />
              Voir le suivi journalier
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Tresorerie