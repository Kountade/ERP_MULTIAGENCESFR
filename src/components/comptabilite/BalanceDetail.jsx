// src/components/comptabilite/BalanceDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { pdf } from '@react-pdf/renderer'
import BalancePdf from './BalancePdf'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Scale,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Download,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  Filter,
  X,
  Layers,
  BookOpen,
  Info,
  TrendingUp,
  TrendingDown,
  Shield,
  Loader2
} from 'lucide-react'

const BalanceDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [balance, setBalance] = useState(null)
  const [lignes, setLignes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [pdfLoading, setPdfLoading] = useState(false)

  const typeConfig = {
    actif: { label: 'Actif', color: 'info', icon: TrendingUp },
    passif: { label: 'Passif', color: 'warning', icon: TrendingDown },
    capitaux: { label: 'Capitaux propres', color: 'secondary', icon: Shield },
    charges: { label: 'Charges', color: 'error', icon: TrendingDown },
    produits: { label: 'Produits', color: 'success', icon: TrendingUp }
  }

  const typeColors = {
    actif: 'badge-info',
    passif: 'badge-warning',
    capitaux: 'badge-secondary',
    charges: 'badge-error',
    produits: 'badge-success'
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

      // Récupérer la balance
      const response = await AxiosInstance.get(`/balances/${id}/`)
      const data = response.data
      setBalance(data)
      
      // Récupérer les lignes de la balance
      const lignesData = data.lignes || []
      setLignes(lignesData)

    } catch (error) {
      console.error('❌ Erreur chargement balance:', error)
      setError('Erreur de chargement de la balance')
      showNotification('Erreur de chargement de la balance', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch {
      return 'N/A'
    }
  }

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || typeConfig.charges
    return (
      <span className={`badge ${typeColors[type] || 'badge-ghost'} gap-1 text-xs border-0`}>
        {config.label}
      </span>
    )
  }

  // Filtrer les lignes
  const filteredLignes = lignes.filter(ligne => {
    const search = searchTerm.toLowerCase()
    const compteNom = (ligne.compte_nom || '').toLowerCase()
    const compteCode = (ligne.compte_code || '').toLowerCase()
    const matchesSearch = compteNom.includes(search) || compteCode.includes(search)
    const matchesType = filterType === '' || ligne.type_compte === filterType
    return matchesSearch && matchesType
  })

  // Calculer les totaux
  const totals = {
    totalDebitInitial: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.solde_initial_debit) || 0), 0),
    totalCreditInitial: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.solde_initial_credit) || 0), 0),
    totalDebitMouvement: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.mouvement_debit) || 0), 0),
    totalCreditMouvement: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.mouvement_credit) || 0), 0),
    totalDebitFinal: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.solde_final_debit) || 0), 0),
    totalCreditFinal: filteredLignes.reduce((sum, l) => sum + (parseFloat(l.solde_final_credit) || 0), 0)
  }

  // Vérifier l'équilibre
  const estEquilibree = totals.totalDebitFinal === totals.totalCreditFinal

  // ✅ Télécharger le PDF de la balance
  const handleDownloadPDF = async () => {
    if (!balance) return
    
    setPdfLoading(true)
    try {
      // Récupérer les données complètes avec les lignes
      const response = await AxiosInstance.get(`/balances/${balance.id}/`)
      const data = response.data
      
      // Générer le PDF
      const blob = await pdf(<BalancePdf balance={data} />).toBlob()
      
      // Télécharger
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `balance_${balance.reference}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showNotification('PDF téléchargé avec succès', 'success')
    } catch (error) {
      console.error('Erreur PDF:', error)
      showNotification('Erreur lors du téléchargement du PDF', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  // ✅ Fonction d'impression
  const handlePrint = () => {
    window.print()
  }

  // ✅ Exporter en Excel (fonctionnalité à implémenter)
  const handleExportExcel = () => {
    showNotification('Export Excel en cours de développement', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la balance...
          </p>
        </div>
      </div>
    )
  }

  if (error || !balance) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Balance non trouvée'}</p>
          <button onClick={() => navigate('/balances')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
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
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'info' ? 'alert-info' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
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
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/balances')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              Balance {balance.reference}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-2 flex-wrap">
              <span>{balance.type_balance_display || balance.type_balance}</span>
              <span className="w-px h-3 bg-base-300"></span>
              <span>{formatDate(balance.date_debut)} → {formatDate(balance.date_fin)}</span>
              <span className="w-px h-3 bg-base-300"></span>
              <span className={`badge ${balance.status === 'valide' ? 'badge-success' : balance.status === 'archive' ? 'badge-neutral' : 'badge-warning'} badge-sm`}>
                {balance.status_display || balance.status}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
            title="Actualiser"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          
          {/* ✅ Bouton PDF amélioré */}
          <button 
            onClick={handleDownloadPDF}
            className="btn btn-sm sm:btn-md btn-success gap-1"
            title="Télécharger le PDF"
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline">{pdfLoading ? 'Génération...' : 'Exporter PDF'}</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
            title="Imprimer"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Imprimer</span>
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="btn btn-sm sm:btn-md btn-info gap-1"
            title="Exporter en Excel"
          >
            <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Informations de la balance */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-base-content/60">Référence</p>
            <p className="font-bold text-primary">{balance.reference}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Type</p>
            <p>{balance.type_balance_display || balance.type_balance}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Statut</p>
            <span className={`badge ${balance.status === 'valide' ? 'badge-success' : balance.status === 'archive' ? 'badge-neutral' : 'badge-warning'} badge-sm`}>
              {balance.status_display || balance.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Créé par</p>
            <p className="text-sm">{balance.created_by_email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Équilibre */}
      <div className={`alert ${estEquilibree ? 'alert-success' : 'alert-error'} shadow-lg`}>
        <div className="flex flex-wrap items-center gap-2">
          {estEquilibree ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Balance équilibrée</span>
              <span className="text-sm opacity-80">Total débit = Total crédit</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <span className="font-bold">Balance non équilibrée</span>
              <span className="text-sm opacity-80">Total débit ≠ Total crédit</span>
            </>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un compte..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select 
            className="select select-bordered w-full sm:w-40 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous types</option>
            <option value="actif">Actif</option>
            <option value="passif">Passif</option>
            <option value="capitaux">Capitaux propres</option>
            <option value="charges">Charges</option>
            <option value="produits">Produits</option>
          </select>
          <button 
            className="btn btn-outline gap-2"
            onClick={() => {
              setFilterType('')
              setSearchTerm('')
            }}
          >
            <Filter className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau de la balance */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-xs sm:table-sm lg:table-md w-full">
            <thead>
              <tr className="text-xs sm:text-sm bg-base-200/50">
                <th className="w-8"></th>
                <th>Compte</th>
                <th>Type</th>
                <th className="text-right">Solde initial</th>
                <th className="text-right">Mouvements</th>
                <th className="text-right">Solde final</th>
              </tr>
              <tr className="text-xs bg-base-200/30 border-b border-base-300">
                <th></th>
                <th></th>
                <th></th>
                <th>
                  <div className="flex justify-end gap-2">
                    <span className="text-success">Débit</span>
                    <span className="text-error">Crédit</span>
                  </div>
                </th>
                <th>
                  <div className="flex justify-end gap-2">
                    <span className="text-success">Débit</span>
                    <span className="text-error">Crédit</span>
                  </div>
                </th>
                <th>
                  <div className="flex justify-end gap-2">
                    <span className="text-success">Débit</span>
                    <span className="text-error">Crédit</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLignes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-base-content/60">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    Aucune ligne trouvée
                  </td>
                </tr>
              ) : (
                filteredLignes.map((ligne, index) => (
                  <tr key={index} className="hover:bg-base-200/50 transition-colors">
                    <td>
                      {ligne.sous_lignes && ligne.sous_lignes.length > 0 && (
                        <button
                          onClick={() => toggleRow(index)}
                          className="btn btn-ghost btn-xs btn-square"
                        >
                          {expandedRows.has(index) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronUp className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{ligne.compte_code}</span>
                        <span className="font-medium">{ligne.compte_nom}</span>
                      </div>
                    </td>
                    <td>{getTypeBadge(ligne.type_compte)}</td>
                    <td>
                      <div className="flex justify-end gap-4">
                        <span className="text-success font-mono text-xs">
                          {formatCurrency(ligne.solde_initial_debit)}
                        </span>
                        <span className="text-error font-mono text-xs">
                          {formatCurrency(ligne.solde_initial_credit)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-4">
                        <span className="text-success font-mono text-xs">
                          {formatCurrency(ligne.mouvement_debit)}
                        </span>
                        <span className="text-error font-mono text-xs">
                          {formatCurrency(ligne.mouvement_credit)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-4 font-bold">
                        <span className="text-success font-mono text-xs">
                          {formatCurrency(ligne.solde_final_debit)}
                        </span>
                        <span className="text-error font-mono text-xs">
                          {formatCurrency(ligne.solde_final_credit)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totaux */}
            {filteredLignes.length > 0 && (
              <tfoot>
                <tr className="bg-base-200/70 font-bold border-t-2 border-base-300">
                  <td colSpan="3" className="text-right">TOTAUX</td>
                  <td>
                    <div className="flex justify-end gap-4">
                      <span className="text-success font-mono text-sm">
                        {formatCurrency(totals.totalDebitInitial)}
                      </span>
                      <span className="text-error font-mono text-sm">
                        {formatCurrency(totals.totalCreditInitial)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-4">
                      <span className="text-success font-mono text-sm">
                        {formatCurrency(totals.totalDebitMouvement)}
                      </span>
                      <span className="text-error font-mono text-sm">
                        {formatCurrency(totals.totalCreditMouvement)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-4">
                      <span className="text-success font-mono text-sm">
                        {formatCurrency(totals.totalDebitFinal)}
                      </span>
                      <span className="text-error font-mono text-sm">
                        {formatCurrency(totals.totalCreditFinal)}
                      </span>
                    </div>
                  </td>
                </tr>
                {/* Équilibre */}
                <tr className={`${estEquilibree ? 'bg-success/5' : 'bg-error/5'}`}>
                  <td colSpan="6" className="text-center py-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {estEquilibree ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-success">
                            Balance équilibrée : {formatCurrency(totals.totalDebitFinal)} = {formatCurrency(totals.totalCreditFinal)}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-error" />
                          <span className="text-sm font-medium text-error">
                            Balance non équilibrée : {formatCurrency(totals.totalDebitFinal)} ≠ {formatCurrency(totals.totalCreditFinal)}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pied de page avec infos supplémentaires */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-base-content/60">Créé le</p>
            <p className="font-medium">{formatDate(balance.created_at)} {balance.created_at ? `à ${new Date(balance.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}` : ''}</p>
          </div>
          {balance.validated_at && (
            <div>
              <p className="text-xs text-base-content/60">Validé le</p>
              <p className="font-medium text-success">{formatDate(balance.validated_at)} {`à ${new Date(balance.validated_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-base-content/60">Nombre de lignes</p>
            <p className="font-medium">{filteredLignes.length} compte(s) affiché(s) sur {lignes.length} total</p>
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

export default BalanceDetail