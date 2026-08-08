// src/components/fournisseurs/FournisseurDetail.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  Building2, Mail, Phone, MapPin, Globe, User, Briefcase,
  ArrowLeft, Edit, CheckCircle, XCircle, AlertCircle,
  CreditCard, DollarSign, Truck, Clock, Star, Award,
  FileText, Hash, Calendar, Users, PhoneCall, AtSign,
  Home, Info, Shield, TrendingUp, Package, ExternalLink,
  Printer, Download, RefreshCw, Plus, ShoppingCart
} from 'lucide-react'

const FournisseurDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [fournisseur, setFournisseur] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })

  // Types de fournisseurs
  const supplierTypes = {
    manufacturer: 'Fabricant',
    distributor: 'Distributeur',
    wholesaler: 'Grossiste',
    importer: 'Importateur',
    service: 'Prestataire de services'
  }

  // Conditions de paiement
  const paymentTerms = {
    immediate: 'Paiement immédiat',
    '15_days': '15 jours',
    '30_days': '30 jours',
    '45_days': '45 jours',
    '60_days': '60 jours',
    end_of_month: 'Fin de mois'
  }

  // Conditions de livraison
  const deliveryTerms = {
    exw: 'EXW - Départ usine',
    fca: 'FCA - Franco transporteur',
    fas: 'FAS - Franco le long du navire',
    fob: 'FOB - Franco à bord',
    cf: 'CFR - Coût et fret',
    cif: 'CIF - Coût, assurance et fret',
    dap: 'DAP - Rendu au lieu de destination',
    ddu: 'DDU - Droits non acquittés',
    ddp: 'DDP - Droits acquittés'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return 'Non renseigné'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non renseigné'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Non renseigné'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: fournisseur?.currency || 'XOF'
    }).format(amount)
  }

  const getStars = (rating) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-warning fill-warning' : 'text-base-content/20'}`}
          />
        ))}
      </div>
    )
  }

  const fetchFournisseurData = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await AxiosInstance.get(`/fournisseurs/${id}/`)
      } catch (err) {
        if (err.response?.status === 404) {
          response = await AxiosInstance.get(`/suppliers/${id}/`)
        } else {
          throw err
        }
      }
      setFournisseur(response.data)
    } catch (error) {
      console.error('Erreur chargement fournisseur:', error)
      if (error.response?.status === 404) {
        setError('Fournisseur non trouvé')
      } else {
        setError('Erreur lors du chargement des données')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchFournisseurData()
    }
  }, [id])

  const handleToggleStatus = async () => {
    if (!fournisseur) return
    setStatusLoading(true)
    try {
      await AxiosInstance.patch(`/fournisseurs/${fournisseur.id}/`, {
        is_active: !fournisseur.is_active
      })
      setSnackbar({ 
        open: true, 
        message: `Fournisseur ${fournisseur.is_active ? 'désactivé' : 'activé'} avec succès`, 
        type: 'success' 
      })
      fetchFournisseurData()
      setOpenStatusDialog(false)
    } catch (error) {
      console.error('Erreur:', error)
      setSnackbar({ open: true, message: 'Erreur lors de la modification', type: 'error' })
    } finally {
      setStatusLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'address', label: 'Adresse', icon: MapPin },
    { id: 'banking', label: 'Bancaire', icon: CreditCard },
    { id: 'commercial', label: 'Commercial', icon: DollarSign },
    { id: 'stats', label: 'Statistiques', icon: TrendingUp }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Chargement des informations...</p>
        </div>
      </div>
    )
  }

  if (error || !fournisseur) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">{error || 'Fournisseur non trouvé'}</h2>
          <p className="text-base-content/60 mb-4">Le fournisseur que vous recherchez n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate('/fournisseurs')} className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const supplierTypeLabel = supplierTypes[fournisseur.supplier_type] || 'Distributeur'

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Snackbar */}
        {snackbar.open && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
            <div className={`alert shadow-xl ${snackbar.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <div className="flex items-center gap-2">
                {snackbar.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{snackbar.message}</span>
              </div>
              <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="btn btn-sm btn-ghost">✕</button>
            </div>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mb-4">
          <Link
            to="/fournisseurs"
            className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg border-2 border-white/20">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full ${fournisseur.is_active ? 'bg-success' : 'bg-error'} border-2 border-white`}></div>
              </div>
              
              {/* Infos principales */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{fournisseur.company_name}</h1>
                  <div className="badge badge-primary/20 text-white gap-1">
                    {supplierTypeLabel}
                  </div>
                  {fournisseur.is_preferred && (
                    <div className="badge badge-warning gap-1">
                      <Star className="w-3 h-3" />
                      Préféré
                    </div>
                  )}
                  <div className={`badge ${fournisseur.is_active ? 'badge-success' : 'badge-error'} gap-1`}>
                    {fournisseur.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {fournisseur.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  {fournisseur.code && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      Code: {fournisseur.code}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {fournisseur.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {fournisseur.phone}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Link 
                  to={`/fournisseurs/${id}/edit`}
                  className="btn btn-accent gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
                <button 
                  onClick={() => setOpenStatusDialog(true)}
                  className={`btn gap-2 ${fournisseur.is_active ? 'btn-warning' : 'btn-success'} text-white`}
                >
                  {fournisseur.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {fournisseur.is_active ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Contenu des tabs */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 overflow-hidden">
          
          {/* Tab Général */}
          {activeTab === 'general' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Informations générales
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Raison sociale</label>
                      <p className="text-base-content font-medium">{fournisseur.company_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Code fournisseur</label>
                      <p className="text-base-content">{fournisseur.code || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Type de fournisseur</label>
                      <p className="text-base-content">{supplierTypeLabel}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">N° RC / RCCM</label>
                      <p className="text-base-content">{fournisseur.registration_number || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">N° TVA / IFU</label>
                      <p className="text-base-content">{fournisseur.tax_id || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Note</label>
                      <div className="flex items-center gap-2">
                        {getStars(fournisseur.rating)}
                        {fournisseur.rating && (
                          <span className="text-sm text-base-content/50">{fournisseur.rating}/5</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Préférence</label>
                      <p className="text-base-content">
                        {fournisseur.is_preferred ? (
                          <span className="badge badge-warning gap-1">
                            <Star className="w-3 h-3" />
                            Fournisseur préféré
                          </span>
                        ) : 'Standard'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Site web
                  </h3>
                  <div className="space-y-3">
                    {fournisseur.website ? (
                      <a 
                        href={fournisseur.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        {fournisseur.website}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <p className="text-base-content/50">Non renseigné</p>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-primary mt-6 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Notes publiques</label>
                      <p className="text-base-content mt-1">{fournisseur.notes || 'Aucune note'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Notes internes</label>
                      <p className="text-base-content mt-1 text-info/70">{fournisseur.internal_notes || 'Aucune note interne'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contact */}
          {activeTab === 'contact' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact principal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Nom</label>
                      <p className="text-base-content">{fournisseur.contact_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Fonction</label>
                      <p className="text-base-content">{fournisseur.contact_title || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Email</label>
                      <p className="text-base-content flex items-center gap-1">
                        <Mail className="w-4 h-4 text-primary" />
                        {fournisseur.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Téléphone fixe</label>
                      <p className="text-base-content flex items-center gap-1">
                        <Phone className="w-4 h-4 text-primary" />
                        {fournisseur.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Mobile</label>
                      <p className="text-base-content flex items-center gap-1">
                        <PhoneCall className="w-4 h-4 text-primary" />
                        {fournisseur.mobile || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Fax</label>
                      <p className="text-base-content">{fournisseur.fax || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Adresse */}
          {activeTab === 'address' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Adresse
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Adresse</label>
                      <p className="text-base-content">{fournisseur.address}</p>
                      {fournisseur.address_line2 && <p className="text-base-content">{fournisseur.address_line2}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Ville</label>
                      <p className="text-base-content">{fournisseur.city}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">État / Région</label>
                      <p className="text-base-content">{fournisseur.state || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Code postal</label>
                      <p className="text-base-content">{fournisseur.postal_code || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Pays</label>
                      <p className="text-base-content">{fournisseur.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Bancaire */}
          {activeTab === 'banking' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Coordonnées bancaires
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Banque</label>
                      <p className="text-base-content">{fournisseur.bank_name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">N° de compte</label>
                      <p className="text-base-content">{fournisseur.bank_account || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Code SWIFT/BIC</label>
                      <p className="text-base-content">{fournisseur.bank_swift || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">IBAN</label>
                      <p className="text-base-content">{fournisseur.bank_iban || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Commercial */}
          {activeTab === 'commercial' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Conditions commerciales
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Conditions de paiement</label>
                      <p className="text-base-content">{paymentTerms[fournisseur.payment_terms] || fournisseur.payment_terms}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Conditions de livraison</label>
                      <p className="text-base-content">{deliveryTerms[fournisseur.delivery_terms] || fournisseur.delivery_terms}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Devise</label>
                      <p className="text-base-content">{fournisseur.currency}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Délai de livraison (jours)</label>
                      <p className="text-base-content">{fournisseur.lead_time_days} jours</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Montant minimum de commande</label>
                      <p className="text-base-content">{formatCurrency(fournisseur.minimum_order_amount)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Remise</label>
                      <p className="text-base-content">{fournisseur.discount_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Statistiques */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-xl p-4">
                  <div className="stat-figure text-primary">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Total commandes</div>
                  <div className="stat-value text-2xl font-bold">{fournisseur.total_orders || 0}</div>
                </div>
                
                <div className="stat bg-base-200 rounded-xl p-4">
                  <div className="stat-figure text-success">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Total dépensé</div>
                  <div className="stat-value text-2xl font-bold">{formatCurrency(fournisseur.total_spent)}</div>
                </div>
                
                <div className="stat bg-base-200 rounded-xl p-4">
                  <div className="stat-figure text-info">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Retard moyen</div>
                  <div className="stat-value text-2xl font-bold">
                    {fournisseur.average_delivery_delay ? `${fournisseur.average_delivery_delay} j` : '-'}
                  </div>
                </div>
                
                <div className="stat bg-base-200 rounded-xl p-4">
                  <div className="stat-figure text-warning">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="stat-title text-sm">Taux livraison à temps</div>
                  <div className="stat-value text-2xl font-bold">
                    {fournisseur.on_time_delivery_rate ? `${fournisseur.on_time_delivery_rate}%` : '-'}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Score de performance</label>
                    <div className="mt-2">
                      <div className="w-full bg-base-200 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-500"
                          style={{ width: `${fournisseur.performance_score || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-base-content/50 mt-1">{fournisseur.performance_score || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Métadonnées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Créé le</label>
                    <p className="text-base-content">{formatDateTime(fournisseur.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Modifié le</label>
                    <p className="text-base-content">{formatDateTime(fournisseur.updated_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Créé par</label>
                    <p className="text-base-content">{fournisseur.created_by?.email || 'Système'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmation changement de statut */}
      {openStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className={`p-4 text-center ${fournisseur.is_active ? 'bg-warning' : 'bg-success'}`}>
              {fournisseur.is_active ? (
                <XCircle className="h-12 w-12 text-white mx-auto mb-2" />
              ) : (
                <CheckCircle className="h-12 w-12 text-white mx-auto mb-2" />
              )}
              <h3 className="text-xl font-bold text-white">
                {fournisseur.is_active ? 'Désactiver' : 'Activer'} le fournisseur
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-base-content/70">
                Êtes-vous sûr de vouloir {fournisseur.is_active ? 'désactiver' : 'activer'} le fournisseur 
                <strong className={fournisseur.is_active ? 'text-warning' : 'text-success'}>
                  " {fournisseur.company_name} "
                </strong>
                ?
              </p>
              <p className="text-sm text-base-content/50 mt-2">
                {fournisseur.is_active 
                  ? 'Le fournisseur ne pourra plus être utilisé dans les commandes.' 
                  : 'Le fournisseur pourra à nouveau être utilisé dans les commandes.'}
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-base-200">
              <button onClick={() => setOpenStatusDialog(false)} className="btn btn-ghost flex-1">
                Annuler
              </button>
              <button 
                onClick={handleToggleStatus} 
                disabled={statusLoading}
                className={`btn flex-1 text-white ${fournisseur.is_active ? 'btn-warning' : 'btn-success'}`}
              >
                {statusLoading ? <span className="loading loading-spinner loading-sm"></span> : (fournisseur.is_active ? 'Désactiver' : 'Activer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FournisseurDetail