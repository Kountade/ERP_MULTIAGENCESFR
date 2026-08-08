// src/components/sales/ClientDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft, User, Building2, Phone, Mail, MapPin, Edit,
  ShoppingCart, FileText, CreditCard, Star, StarOff,
  Calendar, Briefcase, Tag, AlertCircle, CheckCircle,
  RefreshCw, Trash2, Package, DollarSign, Users,
  Eye, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [ventes, setVentes] = useState([]);
  const [factures, setFactures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ventes');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, ventesRes, facturesRes] = await Promise.all([
        AxiosInstance.get(`/clients/${id}/`),
        AxiosInstance.get(`/ventes/?client_id=${id}`).catch(() => ({ data: [] })),
        AxiosInstance.get(`/factures/?client=${id}`).catch(() => ({ data: [] }))
      ]);
      
      setClient(clientRes.data);
      setVentes(ventesRes.data || []);
      setFactures(facturesRes.data || []);
      
      const totalAchats = (ventesRes.data || []).reduce((sum, v) => sum + v.total, 0);
      const totalPaye = (ventesRes.data || []).reduce((sum, v) => sum + v.montant_paye, 0);
      
      setStats({
        totalAchats,
        totalPaye,
        resteAPayer: totalAchats - totalPaye,
        nbVentes: (ventesRes.data || []).length,
        nbFactures: (facturesRes.data || []).length
      });
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur de chargement', 'error');
      if (error.response?.status === 404) {
        setTimeout(() => navigate('/clients'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatPrice = (price) => {
    if (!price) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const paginatedVentes = ventes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(ventes.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du client...
          </p>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/clients')} className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary">
                {client.nom} {client.prenom || ''}
              </h1>
              {client.raison_sociale && (
                <p className="text-sm text-gray-500">{client.raison_sociale}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="btn btn-outline btn-sm gap-2">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            <button onClick={() => navigate(`/clients/${id}/modifier`)} className="btn btn-primary btn-sm gap-2">
              <Edit className="w-4 h-4" /> Modifier
            </button>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Ventes</p><p className="text-2xl font-bold text-primary">{stats?.nbVentes || 0}</p></div>
              <ShoppingCart className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Factures</p><p className="text-2xl font-bold text-secondary">{stats?.nbFactures || 0}</p></div>
              <FileText className="w-8 h-8 text-secondary/20" />
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Total achats</p><p className="text-lg font-bold text-success">{formatPrice(stats?.totalAchats)}</p></div>
              <DollarSign className="w-8 h-8 text-success/20" />
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-md rounded-xl">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Reste à payer</p><p className="text-lg font-bold text-warning">{formatPrice(stats?.resteAPayer)}</p></div>
              <CreditCard className="w-8 h-8 text-warning/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{client.telephone}</span></div>
          {client.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{client.email}</span></div>}
          {client.adresse && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span>{client.adresse}</span></div>}
          <div className="flex items-center gap-2">
            <span className={`badge ${client.client_type === 'entreprise' ? 'badge-secondary' : client.client_type === 'revendeur' ? 'badge-warning' : 'badge-primary'}`}>
              {client.client_type === 'entreprise' ? 'Entreprise' : client.client_type === 'revendeur' ? 'Revendeur' : 'Particulier'}
            </span>
            {client.est_revendeur && <span className="badge badge-warning">Revendeur</span>}
            {!client.is_active && <span className="badge badge-error">Inactif</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-white p-1">
        <button className={`tab ${activeTab === 'ventes' ? 'tab-active' : ''}`} onClick={() => setActiveTab('ventes')}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Ventes ({ventes.length})
        </button>
        <button className={`tab ${activeTab === 'factures' ? 'tab-active' : ''}`} onClick={() => setActiveTab('factures')}>
          <FileText className="w-4 h-4 mr-2" /> Factures ({factures.length})
        </button>
      </div>

      {/* Contenu Ventes */}
      {activeTab === 'ventes' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVentes.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8"><ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" /><p>Aucune vente</p></td></tr>
                ) : (
                  paginatedVentes.map((vente) => (
                    <tr key={vente.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/ventes/${vente.id}`)}>
                      <td className="font-mono text-sm">{vente.reference}</td>
                      <td>{formatDate(vente.date_vente)}</td>
                      <td className="font-semibold">{formatPrice(vente.total)}</td>
                      <td><span className={`badge ${vente.status === 'completed' ? 'badge-success' : vente.status === 'pending_approval' ? 'badge-warning' : 'badge-info'}`}>{vente.status}</span></td>
                      <td><button className="btn btn-ghost btn-xs"><Eye className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <button className="btn btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}><ChevronLeft className="w-4 h-4" /></button>
              <span>Page {currentPage} / {totalPages}</span>
              <button className="btn btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Contenu Factures */}
      {activeTab === 'factures' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead><tr><th>Référence</th><th>Date</th><th>Échéance</th><th>Total</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {factures.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" /><p>Aucune facture</p></td></tr>
                ) : (
                  factures.map((facture) => (
                    <tr key={facture.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/factures/${facture.id}`)}>
                      <td className="font-mono text-sm">{facture.reference}</td>
                      <td>{formatDate(facture.date_facture)}</td>
                      <td>{formatDate(facture.date_echeance)}</td>
                      <td className="font-semibold">{formatPrice(facture.total_ttc)}</td>
                      <td><span className={`badge ${facture.statut === 'payee' ? 'badge-success' : facture.statut === 'en_retard' ? 'badge-error' : 'badge-warning'}`}>{facture.statut}</span></td>
                      <td><button className="btn btn-ghost btn-xs"><Eye className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;