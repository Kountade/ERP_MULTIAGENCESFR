// src/components/drh/PayrollDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Shield,
  Percent,
  Heart,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const PayrollDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusConfig = {
    draft: { label: 'Brouillon', icon: FileText, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' },
    calculated: { label: 'Calculée', icon: TrendingUp, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    approved: { label: 'Approuvée', icon: CheckCircle, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    paid: { label: 'Payée', icon: CheckCircle, color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' }
  };

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    AxiosInstance.get(`/payroll/${id}/`)
      .then(res => setPayroll(res.data))
      .catch(err => {
        console.error(err);
        setError('Erreur lors du chargement de la fiche de paie');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0,00';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logique de téléchargement du PDF
    window.open(`/api/payroll/${id}/download/`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement de la fiche de paie...
          </p>
        </div>
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-error/10 text-error rounded-full w-20 h-20">
              <AlertCircle className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-error mb-2">Erreur</h1>
          <p className="text-base-content/70 mb-6">{error || 'Fiche de paie non trouvée'}</p>
          <button 
            onClick={() => navigate('/payroll')} 
            className="btn btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[payroll.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const monthName = months[payroll.month - 1] || '';

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/payroll')}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à la liste
            </button>
            
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                Fiche de paie {payroll.payroll_number}
              </h1>
              <div className={`badge ${status.bgColor} ${status.textColor} gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              Générée le {new Date(payroll.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="btn btn-outline gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button 
              onClick={handleDownload}
              className="btn btn-primary gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal - style bulletin de paie */}
      <div className="bg-white dark:bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden print:shadow-none print:border-none">
        {/* En-tête du bulletin */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-base-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">BULLETIN DE PAIE</h2>
            <p className="text-sm text-base-content/60 mt-1">Période du {monthName} {payroll.year}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations employeur et employé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-base-content border-l-4 border-primary pl-3">Employeur</h3>
              <div className="bg-base-200 rounded-lg p-4 space-y-1">
                <p className="font-bold text-base-content">SEYDI GROUP</p>
                <p className="text-sm text-base-content/70">SIRET : 123 456 789 00012</p>
                <p className="text-sm text-base-content/70">NAF : 6202A</p>
                <p className="text-sm text-base-content/70">Dakar, Sénégal</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-base-content border-l-4 border-primary pl-3">Employé</h3>
              <div className="bg-base-200 rounded-lg p-4 space-y-1">
                <p className="font-bold text-base-content">{payroll.employee_name}</p>
                <p className="text-sm text-base-content/70">Matricule : {payroll.employee_number || '-'}</p>
                <p className="text-sm text-base-content/70">Poste : {payroll.position_title || '-'}</p>
                <p className="text-sm text-base-content/70">Département : {payroll.department_name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Salaire brut et net */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-base-200 rounded-lg p-4 text-center">
              <p className="text-sm text-base-content/60">Salaire brut</p>
              <p className="text-2xl font-bold text-base-content">{formatNumber(payroll.gross_salary)} €</p>
            </div>
            <div className="bg-success/10 rounded-lg p-4 text-center border border-success/20">
              <p className="text-sm text-success/70">Net à payer</p>
              <p className="text-3xl font-bold text-success">{formatNumber(payroll.net_salary)} €</p>
            </div>
          </div>

          {/* Détail des primes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-base-content border-l-4 border-primary pl-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Éléments de rémunération
              </h3>
              <div className="bg-base-200 rounded-lg divide-y divide-base-300">
                <div className="flex justify-between p-3">
                  <span className="text-sm">Salaire de base</span>
                  <span className="font-medium">{formatNumber(payroll.base_salary)} €</span>
                </div>
                {payroll.performance_bonus > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Prime de performance</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.performance_bonus)} €</span>
                  </div>
                )}
                {payroll.seniority_bonus > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Prime d'ancienneté</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.seniority_bonus)} €</span>
                  </div>
                )}
                {payroll.overtime_amount > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Heures supplémentaires</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.overtime_amount)} €</span>
                  </div>
                )}
                {payroll.transport_bonus > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Indemnité transport</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.transport_bonus)} €</span>
                  </div>
                )}
                {payroll.phone_bonus > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Indemnité téléphone</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.phone_bonus)} €</span>
                  </div>
                )}
                {payroll.other_bonus > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Autres primes</span>
                    <span className="font-medium text-success">+ {formatNumber(payroll.other_bonus)} €</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-primary/5 font-bold">
                  <span>Total brut</span>
                  <span>{formatNumber(payroll.gross_salary)} €</span>
                </div>
              </div>
            </div>

            {/* Détail des déductions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base-content border-l-4 border-error pl-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-error" />
                Déductions et cotisations
              </h3>
              <div className="bg-base-200 rounded-lg divide-y divide-base-300">
                {payroll.social_security > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Sécurité sociale</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.social_security)} €</span>
                  </div>
                )}
                {payroll.income_tax > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Impôt sur le revenu</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.income_tax)} €</span>
                  </div>
                )}
                {payroll.pension_fund > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Fonds de pension</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.pension_fund)} €</span>
                  </div>
                )}
                {payroll.health_insurance > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Mutuelle</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.health_insurance)} €</span>
                  </div>
                )}
                {payroll.unpaid_leave > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Congé sans solde</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.unpaid_leave)} €</span>
                  </div>
                )}
                {payroll.other_deductions > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm">Autres déductions</span>
                    <span className="font-medium text-error">- {formatNumber(payroll.other_deductions)} €</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-error/5 font-bold">
                  <span>Total déductions</span>
                  <span className="text-error">- {formatNumber(payroll.gross_salary - payroll.net_salary)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif final */}
          <div className="bg-success/5 rounded-lg p-4 border border-success/20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-success/70">NET À PAYER</p>
                <p className="text-3xl font-bold text-success">{formatNumber(payroll.net_salary)} €</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-base-content/50">Date de paiement prévue</p>
                <p className="font-medium">Fin du mois en cours</p>
              </div>
            </div>
          </div>

          {/* Informations bancaires */}
          <div className="text-center text-xs text-base-content/50 pt-4 border-t border-base-200">
            <p>SEYDI GROUP - ERP Multi-Agences</p>
            <p>Document généré automatiquement - Fait foi</p>
          </div>
        </div>
      </div>

      {/* Actions supplémentaires */}
      <div className="flex justify-center gap-4 print:hidden">
        <button 
          onClick={() => navigate('/payroll')}
          className="btn btn-outline gap-2"
        >
          Retour à la liste
        </button>
        <button 
          onClick={handlePrint}
          className="btn btn-primary gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimer le bulletin
        </button>
      </div>

      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .bg-base-100 {
            background-color: white !important;
          }
          .shadow-xl {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollDetail;