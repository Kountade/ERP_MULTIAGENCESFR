// src/components/audit/AuditLog.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Eye,
  Activity,
  Calendar,
  User,
  Box,
  ArrowUpDown
} from 'lucide-react';

const AuditLog = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR').format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChanges = (changes) => {
    if (!changes || Object.keys(changes).length === 0) return '-';
    return (
      <div className="space-y-1">
        {Object.entries(changes).map(([field, change]) => (
          <div key={field} className="text-xs">
            <span className="font-semibold">{field}</span> : {change.old} → {change.new}
          </div>
        ))}
      </div>
    );
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchUsers = async () => {
    try {
      const res = await AxiosInstance.get('/users/');
      setUsers(res.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: itemsPerPage,
        ordering: sortDirection === 'asc' ? sortField : `-${sortField}`,
        ...(searchTerm && { search: searchTerm }),
        ...(filterAction && { action: filterAction }),
        ...(filterUser && { user: filterUser }),
        ...(filterModel && { model_name: filterModel }),
        ...(filterStartDate && { timestamp__gte: filterStartDate }),
        ...(filterEndDate && { timestamp__lte: filterEndDate })
      });
      const res = await AxiosInstance.get(`/logs/?${params.toString()}`);
      if (res.data.results) {
        setLogs(res.data.results);
        setTotalItems(res.data.count);
      } else if (Array.isArray(res.data)) {
        setLogs(res.data);
        setTotalItems(res.data.length);
      } else {
        setLogs([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement des logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortField, sortDirection, searchTerm, filterAction, filterUser, filterModel, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterAction('');
    setFilterUser('');
    setFilterModel('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Action', 'Modèle', 'Objet', 'Détails'];
    const rows = logs.map(log => [
      formatDate(log.timestamp),
      log.user_name || 'Système',
      log.action_display || log.action,
      log.model_name,
      log.object_repr,
      JSON.stringify(log.changes)
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link);
    showNotification('Export CSV réussi', 'success');
  };

  const actionOptions = [
    { value: '', label: 'Toutes' },
    { value: 'create', label: 'Création' },
    { value: 'update', label: 'Modification' },
    { value: 'delete', label: 'Suppression' },
    { value: 'login', label: 'Connexion' },
    { value: 'logout', label: 'Déconnexion' }
  ];

  const modelOptions = [
    { value: '', label: 'Tous' },
    { value: 'Sale', label: 'Vente' },
    { value: 'Customer', label: 'Client' },
    { value: 'Product', label: 'Produit' },
    { value: 'PurchaseOrder', label: 'Commande achat' },
    { value: 'Supplier', label: 'Fournisseur' },
    { value: 'User', label: 'Utilisateur' }
  ];

  // Statistiques pour les cartes
  const stats = {
    total: totalItems,
    byAction: {
      create: logs.filter(l => l.action === 'create').length,
      update: logs.filter(l => l.action === 'update').length,
      delete: logs.filter(l => l.action === 'delete').length,
      login: logs.filter(l => l.action === 'login').length
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12"></div>
          <p className="text-base font-semibold text-gray-600">Chargement des journaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="btn btn-sm btn-ghost">✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Journal d'audit</h1>
          <p className="text-sm text-gray-500">Historique complet des actions système</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="btn btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={exportToCSV} className="btn btn-outline btn-sm gap-2">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-primary">
          <div className="text-2xl font-bold text-primary">{formatNumber(stats.total)}</div>
          <div className="text-sm text-gray-600 font-medium">Total enregistrements</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-success">
          <div className="text-2xl font-bold text-success">{formatNumber(stats.byAction.create)}</div>
          <div className="text-sm text-gray-600 font-medium">Créations</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-warning">
          <div className="text-2xl font-bold text-warning">{formatNumber(stats.byAction.update)}</div>
          <div className="text-sm text-gray-600 font-medium">Modifications</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-error">
          <div className="text-2xl font-bold text-error">{formatNumber(stats.byAction.delete)}</div>
          <div className="text-sm text-gray-600 font-medium">Suppressions</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Objet, détail..."
                className="input input-bordered w-full pl-9 py-2 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="w-40">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Action</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            >
              {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="w-44">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Utilisateur</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterUser}
              onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tous</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
            </select>
          </div>
          <div className="w-44">
            <label className="label text-xs font-semibold text-gray-600 mb-1">Modèle</label>
            <select
              className="select select-bordered w-full h-10 text-sm"
              value={filterModel}
              onChange={(e) => { setFilterModel(e.target.value); setCurrentPage(1); }}
            >
              {modelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs font-semibold text-gray-600 mb-1">Date début</label>
            <input
              type="date"
              className="input input-bordered w-36 h-10 text-sm"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div>
            <label className="label text-xs font-semibold text-gray-600 mb-1">Date fin</label>
            <input
              type="date"
              className="input input-bordered w-36 h-10 text-sm"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div>
            <button
              className="btn btn-outline h-10 px-5 gap-2 text-sm"
              onClick={resetFilters}
            >
              <Filter className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune activité enregistrée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-sm font-semibold text-gray-700">
                    <th className="py-3 px-4">
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('timestamp')}>
                        Date/heure <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('user')}>
                        Utilisateur <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('action')}>
                        Action <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort('model_name')}>
                        Modèle <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="py-3 px-4">Objet</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="py-2 px-4 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                      <td className="py-2 px-4">{log.user_name || 'Système'}</td>
                      <td className="py-2 px-4">
                        <span className={`badge badge-sm ${log.action === 'delete' ? 'badge-error' : log.action === 'create' ? 'badge-success' : log.action === 'update' ? 'badge-warning' : 'badge-info'}`}>
                          {log.action_display}
                        </span>
                      </td>
                      <td className="py-2 px-4">{log.model_name}</td>
                      <td className="py-2 px-4 max-w-xs truncate" title={log.object_repr}>
                        {log.object_repr}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                          className="btn btn-ghost btn-sm"
                          title="Détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr className="text-sm font-semibold">
                    <td colSpan="5" className="py-3 px-4 text-right">Total :</td>
                    <td className="py-3 px-4 font-bold text-primary">{formatNumber(totalItems)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="text-sm text-gray-500">
                  {startIndex + 1} - {endIndex} sur {formatNumber(totalItems)}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="select select-bordered select-sm w-20 text-sm"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) return null;
                      }
                      return (
                        <button
                          key={i}
                          className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détails */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Détails du log</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Date / heure</p>
                  <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Utilisateur</p>
                  <p className="text-sm">{selectedLog.user_name || 'Système'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Action</p>
                  <p className="text-sm">{selectedLog.action_display}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Modèle</p>
                  <p className="text-sm">{selectedLog.model_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500">Objet</p>
                  <p className="text-sm break-all">{selectedLog.object_repr}</p>
                </div>
                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Modifications</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono">
                      {formatChanges(selectedLog.changes)}
                    </div>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Adresse IP</p>
                    <p className="text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="btn btn-outline btn-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AuditLog;