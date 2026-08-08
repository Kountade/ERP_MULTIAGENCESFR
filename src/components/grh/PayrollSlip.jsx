// src/components/drh/PayrollSlip.jsx - Version avec débogage
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import AxiosInstance from '../AxiosInstance';
import PayrollSlipPDF from './PayrollSlipPDF';
import {
  ArrowLeft,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer,
  Eye,
  User,
  Calendar,
  Hash
} from 'lucide-react';

const PayrollSlip = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(false);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching payroll for ID:', id);
        const response = await AxiosInstance.get(`/payroll/${id}/`);
        console.log('✅ Données reçues de l\'API:', response.data);
        console.log('📋 Structure des données:', Object.keys(response.data));
        
        // Vérifier les champs importants
        console.log('💰 Salaire brut:', response.data.base_salary || response.data.gross_salary || 'NON TROUVÉ');
        console.log('💰 Primes:', response.data.bonuses || response.data.primes || 'NON TROUVÉ');
        console.log('💰 Retenues:', response.data.deductions || response.data.retenues || 'NON TROUVÉ');
        
        setPayroll(response.data);
        setError(null);
      } catch (err) {
        console.error('❌ Erreur de chargement:', err);
        console.error('Détails:', err.response?.data);
        setError(err.response?.data?.detail || 'Erreur de chargement du bulletin');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPayroll();
    } else {
      setError('ID du bulletin manquant');
      setLoading(false);
    }
  }, [id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement du bulletin de paie...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-error/10 text-error rounded-full w-20 h-20">
              <AlertCircle className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-error mb-2">Erreur</h1>
          <p className="text-base-content/70 mb-6">{error}</p>
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

  if (!payroll) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-warning/10 text-warning rounded-full w-20 h-20">
              <FileText className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Bulletin non trouvé</h1>
          <p className="text-base-content/70 mb-6">Le bulletin que vous recherchez n'existe pas.</p>
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

  const fileName = `bulletin_paie_${payroll.payroll_number || id}_${payroll.month || ''}_${payroll.year || ''}.pdf`;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-base-200 min-h-screen">
      {/* Notification Toast */}
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
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/payroll')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrint}
            className="btn btn-outline gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          
          <PDFDownloadLink
            document={<PayrollSlipPDF payroll={payroll} />}
            fileName={fileName}
          >
            {({ loading: pdfLoading, error: pdfGenError }) => {
              if (pdfGenError) {
                console.error('PDF generation error:', pdfGenError);
                return (
                  <button className="btn btn-error gap-2" disabled>
                    <AlertCircle className="w-4 h-4" />
                    Erreur génération
                  </button>
                );
              }
              return (
                <button className="btn btn-primary gap-2" disabled={pdfLoading}>
                  {pdfLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </>
                  )}
                </button>
              );
            }}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Informations du bulletin */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Bulletin de paie
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              N° {payroll.payroll_number || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Employé</p>
              <p className="text-sm font-semibold">{payroll.employee_name || 'Non spécifié'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Période</p>
              <p className="text-sm font-semibold">
                {payroll.month || 'MM'}/{payroll.year || 'YYYY'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">Matricule</p>
              <p className="text-sm font-semibold">{payroll.employee_id || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu PDF */}
      {pdfError ? (
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-bold">Erreur d'aperçu</h3>
            <p className="text-sm">Impossible d'afficher l'aperçu. Vous pouvez tout de même télécharger le PDF.</p>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
          <div className="h-[70vh] min-h-[500px] w-full">
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <PayrollSlipPDF payroll={payroll} />
            </PDFViewer>
          </div>
        </div>
      )}

      {/* Actions supplémentaires */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <button
          onClick={() => navigate(`/payroll/${id}/details`)}
          className="btn btn-outline gap-2"
        >
          <Eye className="w-4 h-4" />
          Voir les détails
        </button>
        <PDFDownloadLink
          document={<PayrollSlipPDF payroll={payroll} />}
          fileName={fileName}
        >
          {({ loading: pdfLoading }) => (
            <button className="btn btn-success gap-2" disabled={pdfLoading}>
              {pdfLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Préparation...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Télécharger le bulletin
                </>
              )}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-info/10 rounded-lg p-4 border border-info/20">
        <div className="flex items-start gap-3">
          <div className="bg-info/20 rounded-full p-1">
            <AlertCircle className="w-4 h-4 text-info" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-info">Information</h4>
            <p className="text-xs text-base-content/70 mt-1">
              Le bulletin de paie est généré au format PDF. Vous pouvez le télécharger, 
              l'imprimer ou le consulter directement dans l'aperçu ci-dessus.
              <br />
              <span className="font-medium">Devise :</span> Franc Guinéen (GNF) - Séparateur de milliers : espace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSlip;