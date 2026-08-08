// src/components/comptabilite/CompteResultat.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Printer,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
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
  Filter
} from 'lucide-react'

const CompteResultat = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agenceId, setAgenceId] = useState(null)
  const [agences, setAgences] = useState([])
  const [selectedAgence, setSelectedAgence] = useState(null)
  const [data, setData] = useState(null)
  const [dateDebut, setDateDebut] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0])
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
  }, [agenceId, dateDebut, dateFin])

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
        date_debut: dateDebut,
        date_fin: dateFin
      }

      console.log('📤 Fetching compte resultat with params:', params)

      // Essayer plusieurs URLs
      let response
      const urls = [
        '/compte-resultat/',
        '/api/compte-resultat/',
        '/comptabilite/compte-resultat/',
        '/api/comptabilite/compte-resultat/'
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
        throw new Error('Aucune URL disponible pour le compte de résultat')
      }
      
      console.log('✅ Compte resultat data received:', response.data)
      
      const result = response.data
      setData(result)

    } catch (error) {
      console.error('❌ Erreur chargement compte de résultat:', error)
      
      // Données par défaut
      setData({
        periode: `${dateDebut} au ${dateFin}`,
        agence_id: agenceId,
        produits: { ventes: 0 },
        total_produits: 0,
        charges: { achats: 0 },
        total_charges: 0,
        resultat: 0,
        type_resultat: 'Bénéfice'
      })
      
      if (error.response?.status !== 404) {
        setError('Erreur de chargement du compte de résultat')
        showNotification('Erreur de chargement du compte de résultat', 'error')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du compte de résultat...
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
          <BarChart3 className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Aucune donnée disponible</h2>
          <p className="text-base-content/60 mb-4">
            Aucune donnée trouvée pour la période sélectionnée
          </p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const isBenefice = data.resultat > 0

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
            Compte de résultat
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Analysez vos performances financières
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
              <span className="label-text font-medium">Date début</span>
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>

          <div className="flex-1">
            <label className="label">
              <span className="label-text font-medium">Date fin</span>
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="input input-bordered w-full focus:input-primary"
            />
          </div>
        </div>
      </div>

      {/* Résultat global */}
      <div className={`rounded-xl shadow-lg border-2 p-4 sm:p-6 ${isBenefice ? 'border-success bg-success/5' : 'border-error bg-error/5'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isBenefice ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              {isBenefice ? (
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
              ) : (
                <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            <div>
              <p className="text-sm text-base-content/60">Résultat de la période</p>
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-black ${isBenefice ? 'text-success' : 'text-error'}`}>
                {isBenefice ? '+' : '-'}{formatCurrency(Math.abs(data.resultat))}
              </p>
              <p className="text-sm font-medium">
                {data.type_resultat || (isBenefice ? 'Bénéfice' : 'Perte')}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-base-content/60">
            <p>Période: {data.periode || `${formatDate(dateDebut)} → ${formatDate(dateFin)}`}</p>
            <p>Agence: {selectedAgence?.nom || '-'}</p>
          </div>
        </div>
      </div>

      {/* Produits et Charges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Produits */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-success/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <h3 className="font-bold text-success">Produits</h3>
                <span className="badge badge-success badge-sm">{Object.keys(data.produits || {}).length}</span>
              </div>
              <span className="text-sm font-bold text-success">
                {formatCurrencyShort(data.total_produits || 0)}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {data.produits && Object.entries(data.produits).length > 0 ? (
              Object.entries(data.produits).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-success/10 text-success">
                      <ArrowUp className="w-3 h-3" />
                    </div>
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <span className="font-bold text-success">{formatCurrency(value)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-base-content/40">
                <p>Aucun produit enregistré</p>
              </div>
            )}
          </div>
        </div>

        {/* Charges */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-error/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-error" />
                <h3 className="font-bold text-error">Charges</h3>
                <span className="badge badge-error badge-sm">{Object.keys(data.charges || {}).length}</span>
              </div>
              <span className="text-sm font-bold text-error">
                {formatCurrencyShort(data.total_charges || 0)}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            {data.charges && Object.entries(data.charges).length > 0 ? (
              Object.entries(data.charges).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-error/10 text-error">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <span className="font-bold text-error">{formatCurrency(value)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-base-content/40">
                <p>Aucune charge enregistrée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synthèse */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-base-content/60">Total Produits</p>
            <p className="text-xl font-bold text-success">{formatCurrencyShort(data.total_produits || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-base-content/60">Total Charges</p>
            <p className="text-xl font-bold text-error">{formatCurrencyShort(data.total_charges || 0)}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${isBenefice ? 'bg-success/10' : 'bg-error/10'}`}>
            <p className="text-xs text-base-content/60">Résultat</p>
            <p className={`text-xl font-bold ${isBenefice ? 'text-success' : 'text-error'}`}>
              {isBenefice ? '+' : '-'}{formatCurrencyShort(Math.abs(data.resultat || 0))}
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
              <p className="text-base-content/60">Période</p>
              <p className="font-medium">{data.periode || `${formatDate(dateDebut)} → ${formatDate(dateFin)}`}</p>
            </div>
            <div>
              <p className="text-base-content/60">Agence</p>
              <p className="font-medium">{selectedAgence?.nom || '-'}</p>
            </div>
            <div>
              <p className="text-base-content/60">Nombre de produits</p>
              <p className="font-medium">{Object.keys(data.produits || {}).length}</p>
            </div>
            <div>
              <p className="text-base-content/60">Nombre de charges</p>
              <p className="font-medium">{Object.keys(data.charges || {}).length}</p>
            </div>
            <div>
              <p className="text-base-content/60">Marge brute</p>
              <p className="font-medium text-success">
                {formatCurrency((data.total_produits || 0) - (data.total_charges || 0))}
              </p>
            </div>
            <div>
              <p className="text-base-content/60">Type de résultat</p>
              <p className={`font-medium ${isBenefice ? 'text-success' : 'text-error'}`}>
                {data.type_resultat || (isBenefice ? 'Bénéfice' : 'Perte')}
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

export default CompteResultat