// src/components/expenses/ExpenseClaim.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Trash2
} from 'lucide-react';

const ExpenseClaim = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await AxiosInstance.get('/expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const info = {
      pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'En attente' },
      approved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Approuvé' },
      rejected: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Rejeté' },
      paid: { icon: CheckCircle, color: 'text-info', bg: 'bg-info/10', label: 'Remboursé' }
    };
    return info[status] || info.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      transport: '🚗',
      meal: '🍽️',
      accommodation: '🏨',
      supplies: '📎',
      client: '🤝',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  const formatGNF = (amount) => {
    if (!amount) return '0 GNF';
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF`;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchStatus = filter === 'all' || expense.status === filter;
    const matchSearch = expense.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    paid: expenses.filter(e => e.status === 'paid').length,
    totalAmount: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Chargement des notes de frais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notes de frais</h1>
          <p className="text-sm text-base-content/60">Gérez vos demandes de remboursement</p>
        </div>
        <button
          onClick={() => navigate('/expenses/new')}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle note
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
          <p className="text-sm text-base-content/60">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
          <p className="text-sm text-warning">En attente</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
          <p className="text-sm text-success">Approuvés</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
          <p className="text-sm text-base-content/60">Montant total</p>
          <p className="text-2xl font-bold">{formatGNF(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par employé ou description..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected', 'paid'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'Tous' : 
               status === 'pending' ? 'En attente' :
               status === 'approved' ? 'Approuvés' :
               status === 'rejected' ? 'Rejetés' : 'Remboursés'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des notes */}
      <div className="bg-base-100 rounded-xl shadow-lg border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Description</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-base-content/60">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    Aucune note de frais trouvée
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const statusInfo = getStatusInfo(expense.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={expense.id}>
                      <td className="font-medium">{expense.employee_name || 'N/A'}</td>
                      <td>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(expense.expense_type)}
                          {expense.expense_type_display}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate">{expense.description || '-'}</td>
                      <td className="font-bold">{formatGNF(expense.amount)}</td>
                      <td>{expense.date}</td>
                      <td>
                        <span className={`badge ${statusInfo.bg} ${statusInfo.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/expenses/${expense.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {expense.receipt && (
                            <a
                              href={expense.receipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-xs"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {expense.status === 'pending' && (
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => {
                                if (confirm('Supprimer cette note ?')) {
                                  // Delete logic
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseClaim;