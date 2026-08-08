// src/components/comptabilite/EcritureDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Notebook,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  User,
  Info,
  Loader2,
  BookOpen,
  Hash,
  Tag,
  Printer,
  Download,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Link,
  ExternalLink
} from 'lucide-react'

const EcritureDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [ecriture, setEcriture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const statusConfig = {
    brouillon: { label: 'Brouillon', color: 'warning', icon: FileText },
    valide: { label: 'Validée', color: 'success', icon: CheckCircle },
    annulee: { label: 'Annulée', color: 'error', icon: XCircle },
    cloturee: { label: 'Clôturée', color: 'neutral', icon: Clock }
  }

  const statusColors = {
    brouillon: 'badge-warning',
    valide: 'badge-success',
    annulee: 'badge-error',
    cloturee: 'badge-neutral'
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

      const response = await AxiosInstance.get(`/ecritures/${id}/`)
      setEcriture(response.data)

    } catch (error) {
      console.error('❌ Erreur chargement écriture:', error)
      setError('Erreur de chargement de l\'écriture')
      showNotification('Erreur de chargement de l\'écriture', 'error')
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

  const handleDeleteEcriture = async () => {
    try {
      await AxiosInstance.delete(`/ecritures/${id}/`)
      showNotification('Écriture supprimée avec succès', 'success')
      setTimeout(() => navigate('/ecritures'), 1000)
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error')
    }
  }

  const handleValiderEcriture = async () => {
    try {
      await AxiosInstance.post(`/ecritures/${id}/valider/`)
      showNotification('Écriture validée avec succès', 'success')
      fetchData()
    } catch (error) {
      showNotification('Erreur lors de la validation', 'error')
    }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('fr-FR')
    } catch {
      return 'N/A'
    }
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.brouillon
    const Icon = config.icon
    return (
      <span className={`badge ${statusColors[status] || 'badge-ghost'} gap-1 text-sm border-0 px-4 py-2`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de l'écriture...
          </p>
        </div>
      </div>
    )
  }

  if (error || !ecriture) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-base-200">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">Erreur de chargement</h2>
          <p className="text-base-content/60 mb-4">{error || 'Écriture non trouvée'}</p>
          <button onClick={() => navigate('/ecritures')} className="btn btn-primary gap-2">
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
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/ecritures')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content">
              {ecriture.reference}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {ecriture.journal_code || ecriture.journal}
              </span>
              <span className="w-px h-4 bg-base-300"></span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(ecriture.date_ecriture)}
              </span>
              <span className="w-px h-4 bg-base-300"></span>
              {getStatusBadge(ecriture.status)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          {ecriture.status === 'brouillon' && (
            <>
              <button 
                onClick={() => navigate(`/ecritures/${id}/modifier`)}
                className="btn btn-sm sm:btn-md btn-primary gap-1"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Modifier</span>
              </button>
              <button 
                className="btn btn-sm sm:btn-md btn-success gap-1"
                onClick={handleValiderEcriture}
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Valider</span>
              </button>
              <button 
                className="btn btn-sm sm:btn-md btn-error gap-1"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Supprimer</span>
              </button>
            </>
          )}
          <button 
            onClick={() => window.print()}
            className="btn btn-sm sm:btn-md btn-outline gap-1"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            className="btn btn-sm sm:btn-md btn-info gap-1"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Journal</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg">{ecriture.journal_code}</p>
              <p className="text-sm text-base-content/60">{ecriture.journal_nom}</p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Montants</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-base-content/40">Débit</p>
              <p className="font-bold text-lg text-success">{formatCurrency(ecriture.total_debit)}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">Crédit</p>
              <p className="font-bold text-lg text-error">{formatCurrency(ecriture.total_credit)}</p>
            </div>
          </div>
          {ecriture.est_equilibree ? (
            <div className="mt-2 text-success text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Équilibrée
            </div>
          ) : (
            <div className="mt-2 text-error text-sm flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Non équilibrée
            </div>
          )}
        </div>

        <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wider">Informations</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-base-content/60">Agence</span>
              <span className="font-medium">{ecriture.agence_nom || '-'}</span>
            </div>
            {ecriture.created_by_email && (
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Créé par</span>
                <span className="font-medium">{ecriture.created_by_email}</span>
              </div>
            )}
            {ecriture.validated_by_email && (
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Validé par</span>
                <span className="font-medium">{ecriture.validated_by_email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Libellé et Notes */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-xs text-base-content/60">Libellé</p>
              <p className="font-medium text-lg">{ecriture.libelle}</p>
            </div>
            {ecriture.piece_justificative && (
              <div>
                <p className="text-xs text-base-content/60">Pièce justificative</p>
                <p className="font-medium">{ecriture.piece_justificative}</p>
              </div>
            )}
            {ecriture.notes && (
              <div>
                <p className="text-xs text-base-content/60">Notes</p>
                <p className="text-sm">{ecriture.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lignes d'écriture */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-base-200">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Lignes d'écriture
            <span className="badge badge-ghost badge-xs">{ecriture.lignes?.length || 0} ligne(s)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-xs">
                <th>Compte</th>
                <th>Libellé</th>
                <th className="text-right">Débit</th>
                <th className="text-right">Crédit</th>
              </tr>
            </thead>
            <tbody>
              {ecriture.lignes && ecriture.lignes.length > 0 ? (
                ecriture.lignes.map((ligne, index) => (
                  <tr key={index} className="hover">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{ligne.compte_code}</span>
                        <span className="text-sm">{ligne.compte_nom}</span>
                      </div>
                    </td>
                    <td className="text-sm">{ligne.libelle || '-'}</td>
                    <td className="text-right font-mono text-sm text-success">
                      {ligne.debit > 0 ? formatCurrency(ligne.debit) : '-'}
                    </td>
                    <td className="text-right font-mono text-sm text-error">
                      {ligne.credit > 0 ? formatCurrency(ligne.credit) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-base-content/40">
                    Aucune ligne d'écriture
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <td colSpan="2" className="text-right">TOTAUX</td>
                <td className="text-right text-success font-mono">{formatCurrency(ecriture.total_debit)}</td>
                <td className="text-right text-error font-mono">{formatCurrency(ecriture.total_credit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-wrap gap-4 text-xs text-base-content/40">
          <span>Créé le {formatDateTime(ecriture.created_at)}</span>
          {ecriture.updated_at && ecriture.updated_at !== ecriture.created_at && (
            <span>Modifié le {formatDateTime(ecriture.updated_at)}</span>
          )}
          {ecriture.validated_at && (
            <span>Validé le {formatDateTime(ecriture.validated_at)}</span>
          )}
          {ecriture.source_type && (
            <span>Source: {ecriture.source_type} #{ecriture.source_id}</span>
          )}
        </div>
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">Voulez-vous vraiment supprimer cette écriture ?</p>
              <p className="text-base font-bold text-error mt-2">"{ecriture.reference} - {ecriture.libelle}"</p>
              <p className="text-xs text-base-content/50 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-error flex-1" onClick={handleDeleteEcriture}>Supprimer</button>
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

export default EcritureDetail