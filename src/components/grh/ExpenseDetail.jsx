// src/components/expenses/ExpenseDetail.jsx - Version pleine largeur

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Download,
  Printer,
  AlertCircle,
  Trash2,
  Edit,
  Receipt,
  Car,
  Utensils,
  Hotel,
  Briefcase,
  Users,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  Share2,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('User') || '{}');
      setUser(userData);
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
    }
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`/expenses/${id}/`);
      setExpense(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatGNF = (amount) => {
    if (!amount) return '0 GNF';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 GNF';
    return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        class: 'badge-warning', 
        icon: Clock, 
        label: 'En attente RH',
        color: 'text-warning',
        bg: 'bg-warning/10'
      },
      approved: { 
        class: 'badge-success', 
        icon: CheckCircle, 
        label: 'Validé',
        color: 'text-success',
        bg: 'bg-success/10'
      },
      rejected: { 
        class: 'badge-error', 
        icon: XCircle, 
        label: 'Rejeté',
        color: 'text-error',
        bg: 'bg-error/10'
      },
      paid: { 
        class: 'badge-info', 
        icon: Wallet, 
        label: 'Payé',
        color: 'text-info',
        bg: 'bg-info/10'
      },
      cancelled: { 
        class: 'badge-ghost', 
        icon: XCircle, 
        label: 'Annulé',
        color: 'text-base-content/50',
        bg: 'bg-base-content/5'
      }
    };
    return badges[status] || badges.pending;
  };

  const getTypeConfig = (type) => {
    const configs = {
      transport: { icon: Car, label: 'Transport', color: 'text-blue-500', bg: 'bg-blue-50' },
      meal: { icon: Utensils, label: 'Repas', color: 'text-orange-500', bg: 'bg-orange-50' },
      accommodation: { icon: Hotel, label: 'Hébergement', color: 'text-purple-500', bg: 'bg-purple-50' },
      supplies: { icon: Briefcase, label: 'Fournitures', color: 'text-green-500', bg: 'bg-green-50' },
      client: { icon: Users, label: 'Client', color: 'text-pink-500', bg: 'bg-pink-50' },
      other: { icon: MoreHorizontal, label: 'Autre', color: 'text-gray-500', bg: 'bg-gray-50' }
    };
    return configs[type] || configs.other;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(`#${expense.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const InfoCard = ({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) => (
    <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors group">
      <div className={`${bg} rounded-full p-2.5 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-base-content/50 font-medium">{label}</p>
        <p className="font-semibold truncate">{value || '-'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-base-content/70 font-medium">Chargement du détail...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-error/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-error mb-2">Erreur</h2>
          <p className="text-base-content/70">{error || 'Note non trouvée'}</p>
          <button
            onClick={() => navigate('/expenses')}
            className="btn btn-primary mt-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(expense.status);
  const StatusIcon = statusInfo.icon;
  const typeConfig = getTypeConfig(expense.expense_type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/expenses')}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Receipt className="w-6 h-6 sm:w-8 sm:h-8" />
              Détail de la note
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Consultez les informations de votre demande
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className="btn btn-outline btn-sm gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          {expense.receipt && (
            <a
              href={expense.receipt}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Reçu</span>
            </a>
          )}
          {expense.status === 'pending' && (
            <button
              onClick={() => navigate(`/expenses/${expense.id}/edit`)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden w-full">
        {/* Entête avec statut */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-content">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <TypeIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm opacity-80">Note #{expense.id}</p>
                  <button
                    onClick={handleCopyId}
                    className="btn btn-ghost btn-xs text-white/70 hover:text-white hover:bg-white/10"
                    title="Copier l'ID"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-lg font-bold">{expense.description || 'Sans description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${statusInfo.class} badge-lg gap-2 border-0 text-white`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Grille info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard
              icon={User}
              label="Employé"
              value={expense.employee_name}
              color="text-primary"
              bg="bg-primary/10"
            />

            <InfoCard
              icon={Tag}
              label="Type de dépense"
              value={typeConfig.label}
              color={typeConfig.color}
              bg={typeConfig.bg}
            />

            <InfoCard
              icon={Calendar}
              label="Date de la dépense"
              value={expense.date}
              color="text-indigo-500"
              bg="bg-indigo-50"
            />

            <InfoCard
              icon={DollarSign}
              label="Montant"
              value={formatGNF(expense.amount)}
              color="text-emerald-500"
              bg="bg-emerald-50"
            />

            {expense.approved_by_name && (
              <InfoCard
                icon={CheckCircle}
                label="Approuvé par"
                value={expense.approved_by_name}
                color="text-success"
                bg="bg-success/10"
              />
            )}

            {expense.payment_date && (
              <InfoCard
                icon={Wallet}
                label="Remboursé le"
                value={new Date(expense.payment_date).toLocaleDateString('fr-FR')}
                color="text-info"
                bg="bg-info/10"
              />
            )}
          </div>

          {/* Description détaillée */}
          {expense.description && (
            <div className="p-4 bg-base-200/30 rounded-xl border border-base-200/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <p className="text-xs text-base-content/50 font-medium">Description détaillée</p>
              </div>
              <p className="text-base">{expense.description}</p>
            </div>
          )}

          {/* Rejet */}
          {expense.status === 'rejected' && expense.rejection_reason && (
            <div className="alert alert-error shadow-lg">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Motif du rejet</p>
                <p className="text-sm">{expense.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Reçu */}
          {expense.receipt && (
            <div className="border border-base-200 rounded-xl p-4 hover:bg-base-200/30 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reçu joint</p>
                    <p className="text-xs text-base-content/40">Téléchargez le justificatif</p>
                  </div>
                </div>
                <a
                  href={expense.receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="text-xs text-base-content/40 border-t border-base-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Créé le {new Date(expense.created_at).toLocaleString('fr-FR')}
              </span>
              {expense.updated_at !== expense.created_at && (
                <span className="flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  Modifié le {new Date(expense.updated_at).toLocaleString('fr-FR')}
                </span>
              )}
            </div>
            {expense.status === 'pending' && (
              <span className="text-warning font-medium">
                En attente de validation
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions supplémentaires */}
      <div className="mt-6 flex flex-wrap gap-3">
        {expense.status === 'pending' && (
          <>
            <button
              className="btn btn-success gap-2"
              onClick={() => {
                // Action de validation
              }}
            >
              <CheckCircle className="w-4 h-4" />
              Valider
            </button>
            <button
              className="btn btn-error gap-2"
              onClick={() => {
                // Action de rejet
              }}
            >
              <XCircle className="w-4 h-4" />
              Rejeter
            </button>
          </>
        )}
        {expense.status === 'approved' && (
          <button
            className="btn btn-info gap-2"
            onClick={() => {
              // Action de paiement
            }}
          >
            <Wallet className="w-4 h-4" />
            Marquer comme payé
          </button>
        )}
        <button
          className="btn btn-ghost gap-2 ml-auto"
          onClick={() => {
            if (window.confirm('Confirmer la suppression ?')) {
              // Action de suppression
            }
          }}
        >
          <Trash2 className="w-4 h-4 text-error" />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetail;