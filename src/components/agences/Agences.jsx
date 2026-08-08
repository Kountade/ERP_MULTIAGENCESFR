// src/components/Agences.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  CheckCircle, 
  XCircle,
  Eye,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Store,
  Building,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Printer,
  MoreVertical,
  Shield,
  Clock,
  Globe,
  Trophy,
  Sparkles
} from 'lucide-react'

const Agences = () => {
  const navigate = useNavigate()

  const [agences, setAgences] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [agenceToDelete, setAgenceToDelete] = useState(null)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedAgence, setSelectedAgence] = useState(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const typeAgence = {
    principale: { label: 'Agence Principale', icon: Building, color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary' },
    secondaire: { label: 'Agence Secondaire', icon: Store, color: 'accent', bgColor: 'bg-accent/10', textColor: 'text-accent' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        setSnackbar({ open: true, message: 'Veuillez vous connecter', type: 'warning' })
        setLoading(false)
        return
      }
      const response = await AxiosInstance.get('/agences/')
      setAgences(response.data || [])
    } catch (error) {
      console.error('Erreur chargement agences:', error)
      setSnackbar({ open: true, message: 'Erreur de chargement des agences', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteAgence = async () => {
    if (!agenceToDelete) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/agences/${agenceToDelete.id}/`)
      setSnackbar({ open: true, message: 'Agence supprimée avec succès', type: 'success' })
      fetchData()
      setOpenDeleteDialog(false)
      setAgenceToDelete(null)
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: error.response?.data?.error || 'Erreur lors de la suppression', type: 'error' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleActive = async (agence) => {
    try {
      await AxiosInstance.patch(`/agences/${agence.id}/`, {
        est_active: !agence.est_active
      })
      setSnackbar({ 
        open: true, 
        message: `Agence ${agence.est_active ? 'désactivée' : 'activée'} avec succès`, 
        type: 'success' 
      })
      fetchData()
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur lors de la modification', type: 'error' })
    }
  }

  const handleEditAgence = async () => {
    if (!editFormData) return
    setEditLoading(true)
    try {
      await AxiosInstance.patch(`/agences/${editFormData.id}/`, {
        nom: editFormData.nom,
        telephone: editFormData.telephone,
        email: editFormData.email,
        adresse: editFormData.adresse,
        ville: editFormData.ville,
        code_postal: editFormData.code_postal,
        pays: editFormData.pays
      })
      setSnackbar({ open: true, message: 'Agence modifiée avec succès', type: 'success' })
      setOpenEditDialog(false)
      fetchData()
      if (selectedAgence?.id === editFormData.id) {
        setSelectedAgence({ ...selectedAgence, ...editFormData })
      }
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: 'Erreur lors de la modification', type: 'error' })
    } finally {
      setEditLoading(false)
    }
  }

  const openEditModal = (agence) => {
    setEditFormData({
      id: agence.id,
      nom: agence.nom,
      telephone: agence.telephone || '',
      email: agence.email || '',
      adresse: agence.adresse || '',
      ville: agence.ville || '',
      code_postal: agence.code_postal || '',
      pays: agence.pays || 'France'
    })
    setOpenEditDialog(true)
  }

  const openDetailsModal = (agence) => {
    setSelectedAgence(agence)
    setOpenDetailsDialog(true)
  }

  // Filtrage
  const filteredAgences = agences.filter(agence => {
    const search = searchTerm.toLowerCase()
    const nom = (agence.nom || '').toLowerCase()
    const code = (agence.code || '').toLowerCase()
    const ville = (agence.ville || '').toLowerCase()
    const email = (agence.email || '').toLowerCase()
    return (nom.includes(search) || code.includes(search) || ville.includes(search) || email.includes(search)) 
      && (!filterType || agence.type_agence === filterType)
  })

  // Pagination
  const totalPages = Math.ceil(filteredAgences.length / itemsPerPage)
  const paginatedAgences = filteredAgences.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: agences.length,
    principales: agences.filter(a => a.type_agence === 'principale').length,
    secondaires: agences.filter(a => a.type_agence === 'secondaire').length,
    actives: agences.filter(a => a.est_active).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des agences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Container plein largeur - sans padding */}
      <div className="w-full px-0">
        
        {/* En-tête avec padding interne */}
        <div className="px-4 md:px-6 pt-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-base-content">Agences</h1>
              </div>
              <p className="text-sm text-base-content/60">Gérez l'ensemble de vos agences ({agences.length} agence(s))</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchData} className="btn btn-outline gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button onClick={() => navigate('/creer-agence')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Créer une agence
              </button>
            </div>
          </div>
        </div>

        {/* Cartes statistiques - sans marge latérale */}
        <div className="px-4 md:px-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/50 text-xs uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary/20" />
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/50 text-xs uppercase tracking-wide">Principales</p>
                  <p className="text-2xl font-bold text-primary">{stats.principales}</p>
                </div>
                <Building className="h-8 w-8 text-primary/20" />
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/50 text-xs uppercase tracking-wide">Secondaires</p>
                  <p className="text-2xl font-bold text-accent">{stats.secondaires}</p>
                </div>
                <Store className="h-8 w-8 text-accent/20" />
              </div>
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/50 text-xs uppercase tracking-wide">Actives</p>
                  <p className="text-2xl font-bold text-success">{stats.actives}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="px-4 md:px-6 mb-6">
          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, ville, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                >
                  <option value="">Tous les types</option>
                  <option value="principale">Principale</option>
                  <option value="secondaire">Secondaire</option>
                </select>
              </div>
              <button
                onClick={() => { setFilterType(''); setSearchTerm(''); }}
                className="btn btn-outline gap-2"
              >
                <Filter className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des agences */}
        <div className="px-4 md:px-6">
          {paginatedAgences.length === 0 ? (
            <div className="bg-base-100 rounded-xl shadow-sm p-12 text-center border border-base-200">
              <Building2 className="h-20 w-20 mx-auto text-base-content/20 mb-4" />
              <h3 className="text-lg font-semibold text-base-content/60 mb-2">Aucune agence trouvée</h3>
              <p className="text-sm text-base-content/40 mb-4">Commencez par créer votre première agence</p>
              <button onClick={() => navigate('/creer-agence')} className="btn btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Créer une agence
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {paginatedAgences.map((agence) => {
                  const typeInfo = typeAgence[agence.type_agence]
                  const TypeIcon = typeInfo?.icon || Building2
                  return (
                    <div key={agence.id} className="bg-base-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-base-200 hover:border-primary/20">
                      <div className={`h-1 ${agence.est_active ? 'bg-primary' : 'bg-base-300'}`}></div>
                      <div className="p-4">
                        {/* En-tête */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                              <TypeIcon className={`h-5 w-5 ${typeInfo.textColor}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-base-content text-sm">{agence.nom}</h3>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${agence.type_agence === 'principale' ? 'bg-primary' : 'bg-accent'}`}>
                                {typeInfo?.label}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleToggleActive(agence)}
                            className="tooltip"
                            data-tip={agence.est_active ? 'Désactiver' : 'Activer'}
                          >
                            {agence.est_active ? 
                              <CheckCircle className="h-4 w-4 text-success" /> : 
                              <XCircle className="h-4 w-4 text-base-content/30" />
                            }
                          </button>
                        </div>

                        {/* Infos de contact */}
                        <div className="space-y-1.5 mb-3 p-2 bg-base-200/50 rounded-lg">
                          {agence.email && (
                            <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                              <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                              <span className="truncate">{agence.email}</span>
                            </div>
                          )}
                          {agence.telephone && (
                            <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                              <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                              <span>{agence.telephone}</span>
                            </div>
                          )}
                          {agence.ville && (
                            <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                              <span className="truncate">{agence.ville}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 justify-end pt-2 border-t border-base-200">
                          <button 
                            onClick={() => openDetailsModal(agence)}
                            className="btn btn-xs btn-ghost gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Détails
                          </button>
                          <button 
                            onClick={() => openEditModal(agence)}
                            className="btn btn-xs btn-ghost gap-1 text-primary"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button 
                            onClick={() => { setAgenceToDelete(agence); setOpenDeleteDialog(true) }}
                            disabled={agence.nombre_utilisateurs > 0}
                            className="btn btn-xs btn-ghost gap-1 text-error disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pb-6">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-outline disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="join">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-outline disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Suppression */}
      {openDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-error p-4 text-center">
              <Trash2 className="h-12 w-12 text-white mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70">
                Êtes-vous sûr de vouloir supprimer l'agence <strong className="text-error">"{agenceToDelete?.nom}"</strong> ?
              </p>
              <p className="text-sm text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 p-4 bg-base-200">
              <button onClick={() => setOpenDeleteDialog(false)} className="btn btn-ghost flex-1">
                Annuler
              </button>
              <button 
                onClick={handleDeleteAgence} 
                disabled={deleteLoading}
                className="btn btn-error flex-1 text-white"
              >
                {deleteLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {openDetailsDialog && selectedAgence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Détails de l'agence</h2>
              </div>
              <button onClick={() => setOpenDetailsDialog(false)} className="text-white hover:text-white/80">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Nom</label>
                  <p className="text-lg font-bold text-base-content">{selectedAgence.nom}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Code</label>
                  <p className="text-base-content">{selectedAgence.code || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Type</label>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white ${selectedAgence.type_agence === 'principale' ? 'bg-primary' : 'bg-accent'}`}>
                      {selectedAgence.type_agence === 'principale' ? <Building className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                      {typeAgence[selectedAgence.type_agence]?.label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Statut</label>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${selectedAgence.est_active ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
                      {selectedAgence.est_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {selectedAgence.est_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Adresse</label>
                  <p className="text-base-content/70">
                    {selectedAgence.adresse}<br />
                    {selectedAgence.code_postal} {selectedAgence.ville}<br />
                    {selectedAgence.pays}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Téléphone</label>
                  <p className="text-base-content/70 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {selectedAgence.telephone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Email</label>
                  <p className="text-base-content/70 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {selectedAgence.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Créée le</label>
                  <p className="text-base-content/70 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatDate(selectedAgence.date_creation)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-base-200">
              <button onClick={() => setOpenDetailsDialog(false)} className="btn btn-ghost flex-1">
                Fermer
              </button>
              <button 
                onClick={() => { setOpenDetailsDialog(false); openEditModal(selectedAgence); }} 
                className="btn btn-primary flex-1 gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {openEditDialog && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-accent p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Modifier l'agence</h2>
              </div>
              <button onClick={() => setOpenEditDialog(false)} className="text-white hover:text-white/80">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Nom *</span>
                </label>
                <input
                  type="text"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({...editFormData, nom: e.target.value})}
                  className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Téléphone</span>
                  </label>
                  <input
                    type="tel"
                    value={editFormData.telephone}
                    onChange={(e) => setEditFormData({...editFormData, telephone: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Adresse</span>
                </label>
                <textarea
                  value={editFormData.adresse}
                  onChange={(e) => setEditFormData({...editFormData, adresse: e.target.value})}
                  rows="2"
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Code postal</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.code_postal}
                    onChange={(e) => setEditFormData({...editFormData, code_postal: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Ville</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.ville}
                    onChange={(e) => setEditFormData({...editFormData, ville: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Pays</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.pays}
                    onChange={(e) => setEditFormData({...editFormData, pays: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-base-200">
              <button onClick={() => setOpenEditDialog(false)} className="btn btn-ghost flex-1">
                Annuler
              </button>
              <button 
                onClick={handleEditAgence} 
                disabled={editLoading}
                className="btn btn-accent flex-1 gap-2 text-white"
              >
                {editLoading ? <span className="loading loading-spinner loading-sm"></span> : <><Save className="w-4 h-4" /> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar/Toast */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideDown">
          <div className={`alert shadow-xl ${snackbar.type === 'success' ? 'alert-success' : snackbar.type === 'error' ? 'alert-error' : 'alert-warning'}`}>
            <div className="flex items-center gap-2">
              {snackbar.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span>{snackbar.message}</span>
            </div>
            <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agences