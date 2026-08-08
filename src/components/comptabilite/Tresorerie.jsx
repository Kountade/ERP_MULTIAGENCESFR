// src/components/comptabilite/Tresorerie.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wallet,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Truck,
  CreditCard,
  Banknote,
  Landmark,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Info,
  Clock,
  Loader2
} from 'lucide-react'

const Tresorerie = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agenceId, setAgenceId] = useState(null)
  const [agences, setAgences] = useState([])
  const [selectedAgence, setSelectedAgence] = useState(null)
  const [data, setData] = useState(null)
  const [encaissements, setEncaissements] = useState([])
  const [decaissements, setDecaissements] = useState([])
  const [dateDebut, setDateDebut] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [searchTerm, setSearchTerm] = useState('')

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

      // ✅ URL CORRECTE - SEULEMENT /tresorerie
      const params = {
        agence_id: agenceId,
        date_debut: dateDebut,
        date_fin: dateFin
      }

      console.log('📤 Fetching tresorerie with params:', params)

      const response = await AxiosInstance.get('/tresorerie/', { params })
      
      console.log('✅ Tresorerie data received:', response.data)
      
      const result = response.data
      setData(result)
      setEncaissements(result.details_encaissements || [])
      setDecaissements(result.details_decaissements || [])

    } catch (error) {
      console.error('❌ Erreur chargement trésorerie:', error)
      
      // ✅ Afficher des données par défaut même en cas d'erreur
      setData({
        solde_initial: 0,
        encaissements: 0,
        decaissements: 0,
        solde_final: 0,
        details_encaissements: [],
        details_decaissements: []
      })
      setEncaissements([])
      setDecaissements([])
      
      // Ne pas afficher d'erreur si c'est juste un 404
      if (error.response?.status !== 404) {
        setError('Erreur de chargement de la trésorerie')
        showNotification('Erreur de chargement de la trésorerie', 'error')
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

  // Filtrer les encaissements
  const filteredEncaissements = useMemo(() => {
    if (!searchTerm) return encaissements
    return encaissements.filter(item => {
      const search = searchTerm.toLowerCase()
      return (item.client_nom || '').toLowerCase().includes(search) ||
             (item.reference || '').toLowerCase().includes(search) ||
             (item.mode_reglement_display || '').toLowerCase().includes(search)
    })
  }, [encaissements, searchTerm])

  // Filtrer les décaissements
  const filteredDecaissements = useMemo(() => {
    if (!searchTerm) return decaissements
    return decaissements.filter(item => {
      const search = searchTerm.toLowerCase()
      return (item.fournisseur_nom || '').toLowerCase().includes(search) ||
             (item.reference || '').toLowerCase().includes(search) ||
             (item.mode_reglement_display || '').toLowerCase().includes(search)
    })
  }, [decaissements, searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
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

  // Afficher un message si aucune donnée
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Aucune donnée disponible</h2>
          <p className="text-base-content/60 mb-4">
            Aucune transaction trouvée pour la période sélectionnée
          </p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

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
            Trésorerie
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Suivez vos flux de trésorerie
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

      {/* Indicateurs de trésorerie */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary"><Wallet className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Solde initial</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black truncate">
            {formatCurrencyShort(data.solde_initial)}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success"><TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Encaissements</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black text-success truncate">
            {formatCurrencyShort(data.encaissements)}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-error"><TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Décaissements</div>
          <div className="stat-value text-base sm:text-lg lg:text-2xl font-black text-error truncate">
            {formatCurrencyShort(data.decaissements)}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /></div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Solde final</div>
          <div className={`stat-value text-base sm:text-lg lg:text-2xl font-black truncate ${data.solde_final >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrencyShort(data.solde_final)}
          </div>
          <div className="stat-desc text-xs">
            Variation: {data.solde_final >= data.solde_initial ? '+' : ''}
            {formatCurrencyShort(data.solde_final - data.solde_initial)}
          </div>
        </div>
      </div>

      {/* Encadré récapitulatif */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-base-content/60">Période</p>
            <p className="font-medium">{formatDate(dateDebut)} → {formatDate(dateFin)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Agence</p>
            <p className="font-medium">{selectedAgence?.nom || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Nombre de transactions</p>
            <p className="font-medium">{encaissements.length + decaissements.length}</p>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher dans les transactions..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="btn btn-outline gap-2"
            onClick={() => setSearchTerm('')}
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Encaissements et Décaissements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Encaissements */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-success/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <h3 className="font-bold text-success">Encaissements</h3>
                <span className="badge badge-success badge-sm">{filteredEncaissements.length}</span>
              </div>
              <span className="text-sm font-bold text-success">
                {formatCurrencyShort(filteredEncaissements.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0))}
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredEncaissements.length === 0 ? (
              <div className="p-6 text-center text-base-content/40">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Aucun encaissement trouvé</p>
              </div>
            ) : (
              filteredEncaissements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-success/10 text-success flex-shrink-0">
                      <ArrowUp className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.client_nom || 'Client'}</p>
                      <div className="flex items-center gap-2 text-xs text-base-content/40 flex-wrap">
                        <span className="font-mono">{item.reference}</span>
                        <span className="w-px h-3 bg-base-300"></span>
                        <span>{item.mode_reglement_display || item.mode_reglement}</span>
                        <span className="w-px h-3 bg-base-300"></span>
                        <span>{formatDate(item.date_reglement)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-success flex-shrink-0">
                    +{formatCurrency(item.montant)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Décaissements */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          <div className="bg-error/10 p-3 sm:p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-error" />
                <h3 className="font-bold text-error">Décaissements</h3>
                <span className="badge badge-error badge-sm">{filteredDecaissements.length}</span>
              </div>
              <span className="text-sm font-bold text-error">
                {formatCurrencyShort(filteredDecaissements.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0))}
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredDecaissements.length === 0 ? (
              <div className="p-6 text-center text-base-content/40">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Aucun décaissement trouvé</p>
              </div>
            ) : (
              filteredDecaissements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-error/10 text-error flex-shrink-0">
                      <ArrowDown className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.fournisseur_nom || 'Fournisseur'}</p>
                      <div className="flex items-center gap-2 text-xs text-base-content/40 flex-wrap">
                        <span className="font-mono">{item.reference}</span>
                        <span className="w-px h-3 bg-base-300"></span>
                        <span>{item.mode_reglement_display || item.mode_reglement}</span>
                        <span className="w-px h-3 bg-base-300"></span>
                        <span>{formatDate(item.date_reglement)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-error flex-shrink-0">
                    -{formatCurrency(item.montant)}
                  </div>
                </div>
              ))
            )}
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