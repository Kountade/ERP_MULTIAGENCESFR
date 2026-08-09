// src/components/achats/HistoriquePaiementFactures.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AxiosInstance from '../AxiosInstance';
import HistoriquePaiementFacturesDpf from './HistoriquePaiementFacturesDpf';
import {
  ArrowLeft,
  FileText,
  Download,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const HistoriquePaiementFactures = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', class: 'badge-warning' },
      processing: { label: 'En cours', class: 'badge-info' },
      completed: { label: 'Terminé', class: 'badge-success' },
      failed: { label: 'Échoué', class: 'badge-error' },
      cancelled: { label: 'Annulé', class: 'badge-ghost' }
    };
    return badges[status] || { label: status, class: 'badge-ghost' };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger la facture
      const factureRes = await AxiosInstance.get(`/factures-fournisseur/${id}/`);
      setFacture(factureRes.data);

      // Charger les paiements
      const paiementsRes = await AxiosInstance.get(`/factures-fournisseur/${id}/payments/`);
      setPaiements(paiementsRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-base-content/60">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-xl font-bold text-error">Erreur</h2>
          <p className="text-base-content/60 mt-2">{error || 'Facture non trouvée'}</p>
          <button onClick={() => navigate('/paiement-fournisseur')} className="btn btn-primary mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const totalPaye = paiements
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRestant = (facture.total || 0) - totalPaye;

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-base-200 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/paiement-fournisseur')}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Historique des paiements
            </h1>
            <p className="text-sm text-base-content/60">
              Facture {facture.invoice_number} - {facture.supplier?.company_name || 'Fournisseur'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {paiements.length > 0 && (
            <PDFDownloadLink
              document={
                <HistoriquePaiementFacturesDpf 
                  facture={facture} 
                  paiements={paiements} 
                />
              }
              fileName={`historique_paiements_${facture.invoice_number}.pdf`}
              className="btn btn-primary gap-2"
            >
              {({ loading }) => (
                <>
                  <FileText className="w-4 h-4" />
                  {loading ? 'Génération...' : 'Télécharger PDF'}
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Récapitulatif de la facture */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium text-base-content/60">Total facture</div>
              <div className="text-lg font-bold">{formatCurrency(facture.total)}</div>
            </div>
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-xs font-medium text-base-content/60">Total payé</div>
              <div className="text-lg font-bold text-success">{formatCurrency(totalPaye)}</div>
            </div>
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-xs font-medium text-base-content/60">Restant dû</div>
              <div className={`text-lg font-bold ${totalRestant > 0 ? 'text-error' : 'text-success'}`}>
                {formatCurrency(totalRestant)}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <div className="text-xs font-medium text-base-content/60">Échéance</div>
              <div className="text-lg font-bold">{formatDate(facture.due_date)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">
            {paiements.length} paiement(s) effectué(s)
          </h2>
        </div>

        {paiements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-base-200 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-base-content/30" />
            </div>
            <p className="text-lg font-semibold text-base-content/50">
              Aucun paiement enregistré
            </p>
            <p className="text-sm text-base-content/40 mt-2">
              Cette facture n'a pas encore reçu de paiement
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60 border-b border-base-200">
                  <th>N° Paiement</th>
                  <th>Date</th>
                  <th>Méthode</th>
                  <th>Référence</th>
                  <th className="text-center">Statut</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((payment) => {
                  const status = getStatusBadge(payment.status);
                  return (
                    <tr key={payment.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200/50">
                      <td className="font-mono text-sm font-medium">
                        {payment.payment_number}
                      </td>
                      <td>{formatDate(payment.payment_date)}</td>
                      <td className="capitalize">
                        {payment.payment_method?.replace('_', ' ')}
                      </td>
                      <td>{payment.reference_number || '-'}</td>
                      <td className="text-center">
                        <span className={`badge ${status.class} badge-sm`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-right font-bold text-success">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriquePaiementFactures;