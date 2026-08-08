// src/components/comptabilite/Bilan.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Printer,
  FileSpreadsheet,
  Wallet,
  Users,
  Truck,
  ShoppingCart,
  Briefcase,
  Home,
  Landmark,
  PiggyBank,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Info,
  X,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Scale,
  Shield,
  TrendingUp,
  TrendingDown,
  Banknote,
  Building,
  User,
  Package,
  // ✅ SUPPRESSION DE Store - REMPLACÉ PAR Building2
  Store
} from 'lucide-react'

const Bilan = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agenceId, setAgenceId] = useState(null)
  const [agences, setAgences] = useState([])
  const [selectedAgence, setSelectedAgence] = useState(null)
  const [data, setData] = useState(null)
  const [dateCloture, setDateCloture] = useState(new Date().toISOString().split('T')[0])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showDetails, setShowDetails] = useState(false)

  // Récupérer l'agence courante
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('User') || '{}')
    if (userData.agence_principale) {
      setAgenceId(userData.agence_principale.id)
      setSelectedAgence(userData.agence_principale)
    }
  }, [])

  useEffect(() => {
    fetchAgences()
    if (agenceId) {
      fetchData()
    }
  }, [agenceId, dateCloture])

  const fetchAgences = async () => {
    try {
      const response = await AxiosInstance.get('/agences/')
      setAgences(response.data || [])
    } catch (error) {
      console.error('Erreur chargement agences:', error)
    }
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

      const params = {
        agence_id: agenceId,
        date_cloture: dateCloture
      }

      console.log('📤 Fetching bilan with params:', params)

      // Essayer plusieurs URLs
      let response
      const urls = [
        '/bilan/',
        '/api/bilan/',
        '/comptabilite/bilan/',
        '/api/comptabilite/bilan/'
      ]
      
      for (const url of urls) {
        try {
          console.log(`📤 Trying: ${url}`)
          response = await AxiosInstance.get(url, { params })
          if (response.status === 200) {
            console.log(`✅ Success with: ${url}`)
            break
          }
        } catch (err) {
          if (err.response?.status === 404) {
            console.log(`❌ 404 for: ${url}`)
            continue
          }
          throw err
        }
      }
      
      if (!response) {
        throw new Error('Aucune URL disponible pour le bilan')
      }
      
      console.log('✅ Bilan data received:', response.data)
      
      const result = response.data
      setData(result)

    } catch (error) {
      console.error('❌ Erreur chargement bilan:', error)
      
      // Données par défaut
      setData({
        date: dateCloture,
        agence_id: agenceId,
        actif: { tresorerie: 0, creances: 0 },
        total_actif: 0,
        passif: { dettes_fournisseurs: 0 },
        total_passif: 0,
        est_equilibre: true
      })
      
      if (error.response?.status !== 404) {
        setError('Erreur de chargement du bilan')
        showNotification('Erreur de chargement du bilan', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCurrencyShort = (amount) => {
    if (!amount && amount !== 0) return '0 FCFA'
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Mrd FCFA`
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M FCFA`
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)} K FCFA`
    return formatCurrency(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return 'N/A'
    }
  }

  const handleAgenceChange = (e) => {
    const agence = agences.find(a => a.id === parseInt(e.target.value))
    setSelectedAgence(agence)
    setAgenceId(parseInt(e.target.value))
  }

  // ✅ Configuration des icônes pour l'actif - SANS Store
  const actifIcons = {
    tresorerie: { icon: Wallet, color: 'text-success', label: 'Trésorerie' },
    creances: { icon: Users, color: 'text-info', label: 'Créances clients' },
    stocks: { icon: Package, color: 'text-warning', label: 'Stocks' },
    immobilisations: { icon: Building, color: 'text-primary', label: 'Immobilisations' }
  }

  // ✅ Configuration des icônes pour le passif - SANS Store
  const passifIcons = {
    dettes_fournisseurs: { icon: Truck, color: 'text-error', label: 'Dettes fournisseurs' },
    dettes_sociales: { icon: User, color: 'text-warning', label: 'Dettes sociales' },
    dettes_fiscales: { icon: Banknote, color: 'text-info', label: 'Dettes fiscales' },
    capitaux_propres: { icon: PiggyBank, color: 'text-secondary', label: 'Capitaux propres' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du bilan...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <Scale className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Aucune donnée disponible</h2>
          <p className="text-base-content/60 mb-4">
            Aucune donnée trouvée pour la date de clôture sélectionnée
          </p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const isEquilibre = data.est_equilibre !== undefined ? data.est_equilibre : true

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bilan comptable
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Visualisez la situation financière de votre entreprise
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            className="btn btn-sm sm:btn-md btn-success gap-1"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Exporter</span>
          </button>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="btn btn-sm sm:btn-md btn-info gap-1"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{showDetails ? 'Masquer' : 'Détails'}</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="label">
              <span className="label-text font-medium">Agence</span>
            </label>
            <select
              value={agenceId || ''}
              onChange={handleAgenceChange}
              className="select select-bordered w-full focus:select-primary"
            >
              <option value="">Sélectionner une agence</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>
                  {agence.nom} ({agence.ville || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="label">
              <span className="label-text font-medium">Date de clôture</span>
            </label>
            <input
              type="date"
              value={dateCloture}
              onChange={(e) => setDateCloture(e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>
        </div>
      </div>

      {/* Équilibre */}
      <div className={`alert ${isEquilibre ? 'alert-success' : 'alert-error'} shadow-lg`}>
        <div className="flex items-center gap-2">
          {isEquilibre ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Bilan équilibré</span>
              <span className="text-sm opacity-80">Total Actif = Total Passif</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">Bilan déséquilibré</span>
              <span className="text-sm opacity-80">Total Actif ≠ Total Passif</span>
            </>
          )}
        </div>
      </div>

      {/* Actif et Passif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Actif */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-info/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-info" />
                <h3 className="font-bold text-info">Actif</h3>
                <span className="badge badge-info badge-sm">{Object.keys(data.actif || {}).length}</span>
              </div>
              <span className="text-sm font-bold text-info">
                {formatCurrencyShort(data.total_actif || 0)}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {data.actif && Object.entries(data.actif).length > 0 ? (
              Object.entries(data.actif).map(([key, value]) => {
                const config = actifIcons[key] || { icon: Wallet, color: 'text-base-content', label: key }
                const Icon = config.icon
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded bg-info/10 ${config.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-medium capitalize">{config.label}</span>
                    </div>
                    <span className={`font-bold ${config.color}`}>{formatCurrency(value)}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 text-base-content/40">
                <p>Aucun actif enregistré</p>
              </div>
            )}
          </div>
        </div>

        {/* Passif */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-warning/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-warning" />
                <h3 className="font-bold text-warning">Passif</h3>
                <span className="badge badge-warning badge-sm">{Object.keys(data.passif || {}).length}</span>
              </div>
              <span className="text-sm font-bold text-warning">
                {formatCurrencyShort(data.total_passif || 0)}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {data.passif && Object.entries(data.passif).length > 0 ? (
              Object.entries(data.passif).map(([key, value]) => {
                const config = passifIcons[key] || { icon: Truck, color: 'text-base-content', label: key }
                const Icon = config.icon
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded bg-warning/10 ${config.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-medium capitalize">{config.label}</span>
                    </div>
                    <span className={`font-bold ${config.color}`}>{formatCurrency(value)}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 text-base-content/40">
                <p>Aucun passif enregistré</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synthèse */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-2 rounded-lg bg-info/10">
            <p className="text-xs text-base-content/60">Total Actif</p>
            <p className="text-xl font-bold text-info">{formatCurrencyShort(data.total_actif || 0)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <p className="text-xs text-base-content/60">Total Passif</p>
            <p className="text-xl font-bold text-warning">{formatCurrencyShort(data.total_passif || 0)}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${isEquilibre ? 'bg-success/10' : 'bg-error/10'}`}>
            <p className="text-xs text-base-content/60">État</p>
            <p className={`text-xl font-bold ${isEquilibre ? 'text-success' : 'text-error'}`}>
              {isEquilibre ? '✅ Équilibré' : '❌ Déséquilibré'}
            </p>
          </div>
        </div>
      </div>

      {/* Détails supplémentaires */}
      {showDetails && (
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Informations détaillées
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-base-content/60">Date de clôture</p>
              <p className="font-medium">{formatDate(data.date || dateCloture)}</p>
            </div>
            <div>
              <p className="text-base-content/60">Agence</p>
              <p className="font-medium">{selectedAgence?.nom || '-'}</p>
            </div>
            <div>
              <p className="text-base-content/60">Nombre de postes actif</p>
              <p className="font-medium">{Object.keys(data.actif || {}).length}</p>
            </div>
            <div>
              <p className="text-base-content/60">Nombre de postes passif</p>
              <p className="font-medium">{Object.keys(data.passif || {}).length}</p>
            </div>
            <div>
              <p className="text-base-content/60">Différence Actif - Passif</p>
              <p className={`font-medium ${isEquilibre ? 'text-success' : 'text-error'}`}>
                {formatCurrency((data.total_actif || 0) - (data.total_passif || 0))}
              </p>
            </div>
            <div>
              <p className="text-base-content/60">Fonds de roulement</p>
              <p className="font-medium text-info">
                {formatCurrency((data.actif?.tresorerie || 0) + (data.actif?.creances || 0) - (data.passif?.dettes_fournisseurs || 0))}
              </p>
            </div>
          </div>
        </div>
      )}

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

export default Bilan