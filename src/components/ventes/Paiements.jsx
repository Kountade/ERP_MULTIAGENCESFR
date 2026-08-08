// src/components/paiements/Paiements.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import PaiementPdf from './PaiementPdf'
import {
  Plus, Edit, Trash2, Search, RefreshCw, Filter, CreditCard,
  X, AlertCircle, CheckCircle, Eye, MoreVertical, ChevronLeft, ChevronRight,
  ArrowUpDown, LayoutGrid, List, Phone, Calendar, DollarSign,
  Clock, XCircle, FileText, Download, Receipt
} from 'lucide-react'

const Paiements = () => {
  const navigate = useNavigate()
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethode, setFilterMethode] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [paiementToDelete, setPaiementToDelete] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [viewMode, setViewMode] = useState('table')
  const [sortField, setSortField] = useState('date_paiement')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({ total: 0, total_montant: 0, montant_jour: 0 })
  const [pdfLoadingId, setPdfLoadingId] = useState(null)

  const methodesPaiement = {
    especes: 'Espèces', carte: 'Carte bancaire', cheque: 'Chèque',
    virement: 'Virement', mobile_money: 'Mobile Money', autre: 'Autre'
  }

  const statutsPaiement = {
    pending: 'En attente', completed: 'Complété', failed: 'Échoué', refunded: 'Remboursé'
  }

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
      const [paiementsRes, statsRes] = await Promise.all([
        AxiosInstance.get('/paiements/'),
        AxiosInstance.get('/paiements/stats/')
      ])
      setPaiements(paiementsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
      setError('Erreur de chargement des paiements')
      showNotification('Erreur de chargement des paiements', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!paiementToDelete) return
    try {
      await AxiosInstance.delete(`/paiements/${paiementToDelete.id}/`)
      showNotification(`Paiement ${paiementToDelete.reference} supprimé`, 'success')
      fetchData()
      setShowDeleteModal(false)
      setPaiementToDelete(null)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const getStatutBadge = (statut) => {
    const config = {
      completed: { class: 'badge-success', icon: CheckCircle, label: 'Complété' },
      pending: { class: 'badge-warning', icon: Clock, label: 'En attente' },
      failed: { class: 'badge-error', icon: XCircle, label: 'Échoué' },
      refunded: { class: 'badge-info', icon: RefreshCw, label: 'Remboursé' }
    }
    const { class: bgClass, icon: Icon, label } = config[statut] || config.completed
    return (
      <div className={`badge ${bgClass} gap-1 text-xs`}>
        <Icon className="w-3 h-3" /> {label}
      </div>
    )
  }

  const getFactureRef = (paiement) => {
    return paiement.facture_ref || paiement.facture?.reference || '-'
  }

  const getClientName = (paiement) => {
    if (paiement.facture_client_nom && paiement.facture_client_nom !== 'Anonyme')
      return paiement.facture_client_nom
    if (paiement.client_nom && paiement.client_nom !== 'Anonyme')
      return paiement.client_nom
    return 'Anonyme'
  }

  const filteredAndSorted = React.useMemo(() => {
    let filtered = paiements.filter(p => {
      const search = searchTerm.toLowerCase()
      const matchSearch =
        (p.reference || '').toLowerCase().includes(search) ||
        getClientName(p).toLowerCase().includes(search) ||
        getFactureRef(p).toLowerCase().includes(search) ||
        (p.reference_externe || '').toLowerCase().includes(search)
      const matchMethode = filterMethode === '' || p.methode === filterMethode
      const matchStatut = filterStatut === '' || p.statut === filterStatut
      return matchSearch && matchMethode && matchStatut
    })
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '', bVal = b[sortField] || ''
      if (sortField === 'date_paiement') {
        aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime()
      } else if (sortField === 'client') {
        aVal = getClientName(a).toLowerCase()
        bVal = getClientName(b).toLowerCase()
      } else if (sortField === 'facture') {
        aVal = getFactureRef(a).toLowerCase()
        bVal = getFactureRef(b).toLowerCase()
      } else if (sortField === 'montant') {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return filtered
  }, [paiements, searchTerm, filterMethode, filterStatut, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginated = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleViewDetail = (id) => navigate(`/paiements/${id}`)

  const handleDownloadPDF = async (paiement, id) => {
    setPdfLoadingId(id)
    try {
      await PaiementPdf(paiement)
    } catch (err) {
      console.error(err)
      showNotification('Erreur lors de la génération du PDF', 'error')
    } finally {
      setPdfLoadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-6">
          <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
          <p className="text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des paiements...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary gap-2">
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slideDown max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold whitespace-pre-line">{notification.message}</span>
            <button 
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-base-content mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Paiements
          </h1>
          <p className="text-base text-base-content/60">
            Gestion des encaissements et reçus
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchData} className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={() => navigate('/paiements/nouveau')} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Nouveau paiement
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-primary"><CreditCard className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Total encaissé</div>
          <div className="stat-value text-2xl font-black truncate">{stats.total_montant?.toLocaleString()} FCFA</div>
          <div className="stat-desc text-sm">{stats.total} transactions</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-success"><Calendar className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Aujourd'hui</div>
          <div className="stat-value text-2xl font-black truncate">{stats.montant_jour?.toLocaleString()} FCFA</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-300 p-4">
          <div className="stat-figure text-info"><DollarSign className="w-6 h-6" /></div>
          <div className="stat-title text-sm font-semibold">Moyenne par paiement</div>
          <div className="stat-value text-2xl font-black truncate">
            {stats.total > 0 ? Math.round(stats.total_montant / stats.total).toLocaleString() : 0} FCFA
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par référence, client, facture..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm lg:hidden gap-2">
            <Filter className="w-4 h-4" /> Filtres {showFilters ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-3`}>
            <select 
              className="select select-bordered select-sm w-40" 
              value={filterMethode}
              onChange={(e) => { setFilterMethode(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Toutes méthodes</option>
              {Object.entries(methodesPaiement).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select 
              className="select select-bordered select-sm w-40" 
              value={filterStatut}
              onChange={(e) => { setFilterStatut(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Tous statuts</option>
              {Object.entries(statutsPaiement).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button 
              className="btn btn-sm btn-ghost gap-1"
              onClick={() => { setFilterMethode(''); setFilterStatut(''); setSearchTerm(''); setCurrentPage(1) }}
            >
              <X className="w-4 h-4" /> Réinitialiser
            </button>
            <div className="join ml-auto">
              <button 
                className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} 
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} 
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
            <p className="text-lg font-semibold text-base-content/50">Aucun paiement trouvé</p>
            <p className="text-sm text-base-content/40 mt-2">Ajoutez votre premier paiement</p>
            <button className="btn btn-primary mt-6 gap-2" onClick={() => navigate('/paiements/nouveau')}>
              <Plus className="w-4 h-4" /> Nouveau paiement
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
            {paginated.map(p => (
              <div key={p.id} className="bg-base-200 rounded-2xl p-5 hover:shadow-md transition-all border border-base-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-mono font-bold text-lg">{p.reference}</div>
                    <div className="text-xs text-base-content/50">{new Date(p.date_paiement).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleViewDetail(p.id)} className="btn btn-ghost btn-sm btn-circle text-primary" title="Détails">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDownloadPDF(p, p.id)} className="btn btn-ghost btn-sm btn-circle text-info" title="PDF" disabled={pdfLoadingId === p.id}>
                      {pdfLoadingId === p.id ? <span className="loading loading-spinner loading-xs"></span> : <Download className="w-4 h-4" />}
                    </button>
                    <div className="dropdown dropdown-end">
                      <button className="btn btn-ghost btn-sm btn-circle"><MoreVertical className="w-4 h-4" /></button>
                      <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-2xl w-44">
                        <li><button onClick={() => navigate(`/paiements/${p.id}/edit`)}><Edit className="w-4 h-4" /> Modifier</button></li>
                        <li><button className="text-error" onClick={() => { setPaiementToDelete(p); setShowDeleteModal(true) }}><Trash2 className="w-4 h-4" /> Supprimer</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <DollarSign className="w-5 h-5" /> {p.montant.toLocaleString()} FCFA
                  </div>
                  <div className="flex items-center gap-2 text-sm"><CreditCard className="w-4 h-4" /> {methodesPaiement[p.methode] || p.methode}</div>
                  <div className="flex items-center gap-2 text-sm truncate">
                    <FileText className="w-4 h-4 text-base-content/50" /> Facture: {getFactureRef(p)}
                  </div>
                  <div className="flex items-center gap-2 text-sm truncate">
                    <Receipt className="w-4 h-4 text-base-content/50" /> {getClientName(p)}
                  </div>
                </div>
                <div className="mt-4 pt-3 flex justify-between items-center border-t border-base-300/50">
                  {getStatutBadge(p.statut)}
                  {p.reference_externe && <span className="text-xs text-base-content/40">Ref: {p.reference_externe}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200">
                <tr>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('reference')}>Référence<ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('date_paiement')}>Date<ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('client')}>Client<ArrowUpDown className="w-3 h-3" /></button></th>
                  <th><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('facture')}>Facture<ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="text-right"><button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('montant')}>Montant<ArrowUpDown className="w-3 h-3" /></button></th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.id} className="hover">
                    <td className="font-mono font-medium">{p.reference}</td>
                    <td>{new Date(p.date_paiement).toLocaleDateString()}</td>
                    <td>{getClientName(p)}</td>
                    <td className="font-mono">{getFactureRef(p)}</td>
                    <td className="text-right font-semibold">{p.montant.toLocaleString()} FCFA</td>
                    <td>{methodesPaiement[p.methode] || p.methode}</td>
                    <td>{getStatutBadge(p.statut)}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleViewDetail(p.id)} className="btn btn-ghost btn-xs" title="Détails">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownloadPDF(p, p.id)} className="btn btn-ghost btn-xs text-info" title="PDF" disabled={pdfLoadingId === p.id}>
                          {pdfLoadingId === p.id ? <span className="loading loading-spinner loading-xs"></span> : <Download className="w-4 h-4" />}
                        </button>
                        <button onClick={() => navigate(`/paiements/${p.id}/edit`)} className="btn btn-ghost btn-xs text-primary" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setPaiementToDelete(p); setShowDeleteModal(true) }} className="btn btn-ghost btn-xs text-error" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-base-100 border-t-2">
                <tr className="font-bold">
                  <td colSpan="4" className="text-right">Total</td>
                  <td className="text-right">{filteredAndSorted.reduce((s, p) => s + (parseFloat(p.montant) || 0), 0).toLocaleString()} FCFA</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSorted.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} sur {filteredAndSorted.length}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <select className="select select-bordered select-sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <div className="join">
                  <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) pageNum = i + 1
                    else if (currentPage <= 3) pageNum = i + 1
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = currentPage - 2 + i
                    return (
                      <button
                        key={i}
                        className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button className="join-item btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && paiementToDelete && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-3" />
              <h3 className="font-bold text-xl">Confirmer la suppression</h3>
              <p className="py-4">
                Supprimer définitivement le paiement <span className="font-bold">{paiementToDelete.reference}</span> ?
              </p>
              <div className="flex gap-3">
                <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                <button className="btn btn-error flex-1" onClick={handleDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Paiements