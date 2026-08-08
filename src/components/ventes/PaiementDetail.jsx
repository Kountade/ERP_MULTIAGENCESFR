// src/components/paiements/PaiementDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import PaiementPdf from './PaiementPdf'
import {
  CreditCard, ArrowLeft, Edit, Trash2, AlertCircle,
  DollarSign, Calendar, FileText, User, Phone, Mail,
  MapPin, CheckCircle, XCircle, Clock, RefreshCw, Download
} from 'lucide-react'

const PaiementDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paiement, setPaiement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const methodes = {
    especes: 'Espèces', carte: 'Carte bancaire', cheque: 'Chèque',
    virement: 'Virement', mobile_money: 'Mobile Money', autre: 'Autre'
  }

  const statuts = {
    pending: { label: 'En attente', color: 'warning', icon: Clock },
    completed: { label: 'Complété', color: 'success', icon: CheckCircle },
    failed: { label: 'Échoué', color: 'error', icon: XCircle },
    refunded: { label: 'Remboursé', color: 'info', icon: RefreshCw }
  }

  useEffect(() => {
    fetchPaiement()
  }, [id])

  const fetchPaiement = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await AxiosInstance.get(`/paiements/${id}/`)
      setPaiement(data)
    } catch (err) {
      console.error(err)
      setError('Impossible de charger le paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement ce paiement ?')) return
    try {
      await AxiosInstance.delete(`/paiements/${id}/`)
      navigate('/paiements')
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleDownloadPDF = async () => {
    if (!paiement) return
    setPdfLoading(true)
    try {
      await PaiementPdf(paiement)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const getClientInfo = () => {
    if (!paiement) return null
    // Priorité au client de la facture
    if (paiement.facture_client_nom && paiement.facture_client_nom !== 'Anonyme') {
      return {
        nom: paiement.facture_client_nom,
        prenom: paiement.facture_client_prenom,
        email: paiement.facture_client_email,
        telephone: paiement.facture_client_telephone,
        adresse: paiement.facture_client_adresse,
        raison_sociale: paiement.facture_client_raison_sociale,
        source: 'facture'
      }
    }
    // Sinon client direct
    if (paiement.client_nom && paiement.client_nom !== 'Anonyme') {
      return {
        nom: paiement.client_nom,
        prenom: paiement.client_prenom,
        email: paiement.client_email,
        telephone: paiement.client_telephone,
        adresse: paiement.client_adresse,
        raison_sociale: paiement.client_raison_sociale,
        source: 'direct'
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error || !paiement) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-error" />
        <div className="alert alert-error shadow-lg max-w-md">
          <span>{error || 'Paiement introuvable'}</span>
        </div>
        <button onClick={fetchPaiement} className="btn btn-primary gap-2">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
        <Link to="/paiements" className="btn btn-ghost">Retour à la liste</Link>
      </div>
    )
  }

  const statutInfo = statuts[paiement.statut] || statuts.completed
  const StatutIcon = statutInfo.icon
  const clientInfo = getClientInfo()

  return (
    <div className="min-h-screen bg-base-200">
      <div className="bg-base-100 border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/paiements" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">
              Paiement {paiement.reference || 'Sans référence'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn btn-sm btn-outline gap-1">
              {pdfLoading ? <span className="loading loading-spinner loading-xs"></span> : <Download className="w-4 h-4" />}
              PDF
            </button>
            <button onClick={() => navigate(`/paiements/${id}/edit`)} className="btn btn-sm btn-outline gap-1">
              <Edit className="w-4 h-4" /> Modifier
            </button>
            <button onClick={handleDelete} className="btn btn-sm btn-error gap-1">
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Montant */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Montant
                </h2>
                <div className="text-4xl font-black text-primary">
                  {(paiement.montant || 0).toLocaleString()} FCFA
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="badge badge-lg gap-1">
                    <Calendar className="w-3 h-3" />{' '}
                    {paiement.date_paiement ? new Date(paiement.date_paiement).toLocaleDateString() : 'Date inconnue'}
                  </div>
                  <div className={`badge badge-lg gap-1 badge-${statutInfo.color}`}>
                    <StatutIcon className="w-3 h-3" /> {statutInfo.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Détails paiement */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Informations paiement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-semibold">Référence :</span> {paiement.reference || '-'}</div>
                  <div><span className="font-semibold">Méthode :</span> {methodes[paiement.methode] || paiement.methode || '-'}</div>
                  <div><span className="font-semibold">Réf. externe :</span> {paiement.reference_externe || '-'}</div>
                  <div><span className="font-semibold">Encaissé par :</span> {paiement.encaisse_par?.email || paiement.encaisse_par_nom || '-'}</div>
                  <div className="md:col-span-2"><span className="font-semibold">Notes :</span> {paiement.notes || '-'}</div>
                </div>
              </div>
            </div>

            {/* Facture associée */}
            {paiement.facture_ref && paiement.facture_ref !== '-' && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Facture associée
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><span className="font-semibold">Référence :</span> {paiement.facture_ref}</div>
                    <div><span className="font-semibold">Date :</span> {paiement.facture_date ? new Date(paiement.facture_date).toLocaleDateString() : '-'}</div>
                    <div><span className="font-semibold">Total TTC :</span> {(paiement.facture_total || 0).toLocaleString()} FCFA</div>
                    <div><span className="font-semibold">Reste à payer :</span> {(paiement.facture_restant || 0).toLocaleString()} FCFA</div>
                  </div>
                  <div className="mt-3">
                    <Link to={`/factures/${paiement.facture}`} className="btn btn-sm btn-outline">
                      Voir la facture
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale – Client */}
          <div className="space-y-6">
            {clientInfo ? (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <User className="w-5 h-5" />
                    <h2 className="card-title text-lg">Client</h2>
                    {clientInfo.source === 'facture' && (
                      <span className="badge badge-sm badge-info">Client de la facture</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-semibold">Nom :</span> {clientInfo.nom} {clientInfo.prenom || ''}</div>
                    {clientInfo.raison_sociale && <div><span className="font-semibold">Raison sociale :</span> {clientInfo.raison_sociale}</div>}
                    {clientInfo.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {clientInfo.email}</div>}
                    {clientInfo.telephone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {clientInfo.telephone}</div>}
                    {clientInfo.adresse && <div className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1" /> {clientInfo.adresse}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Client
                  </h2>
                  <p className="text-base-content/50">Aucun client associé</p>
                </div>
              </div>
            )}
            {/* Métadonnées */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Métadonnées</h2>
                <div className="text-sm space-y-1">
                  <div><span className="font-semibold">Créé le :</span> {paiement.created_at ? new Date(paiement.created_at).toLocaleString() : '-'}</div>
                  <div><span className="font-semibold">Modifié le :</span> {paiement.updated_at ? new Date(paiement.updated_at).toLocaleString() : '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaiementDetail