// src/components/grh/Departments.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Code,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Briefcase,
} from 'lucide-react';

const Departments = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withManager: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get('/departments/');
      const data = response.data || [];
      setDepartments(data);
      setStats({
        total: data.length,
        active: data.filter(d => d.is_active).length,
        inactive: data.filter(d => !d.is_active).length,
        withManager: data.filter(d => d.manager).length,
      });
    } catch (error) {
      console.error('Erreur fetch départements:', error);
      let errorMsg = 'Erreur de chargement des départements';
      if (error.response) {
        errorMsg = error.response.data?.detail || `Erreur ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    try {
      await AxiosInstance.delete(`/departments/${departmentToDelete.id}/`);
      showNotification(`Département "${departmentToDelete.name}" supprimé avec succès`, 'success');
      fetchData();
      setShowDeleteModal(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.detail || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedDepartments = useMemo(() => {
    let filtered = departments.filter(dept => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (dept.name?.toLowerCase() || '').includes(search) ||
        (dept.code?.toLowerCase() || '').includes(search) ||
        (dept.description?.toLowerCase() || '').includes(search) ||
        (dept.manager_name?.toLowerCase() || '').includes(search);
      const matchesActive = filterActive === '' || dept.is_active === (filterActive === 'true');
      return matchesSearch && matchesActive;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'employees_count') {
        aVal = a.employees_count || 0;
        bVal = b.employees_count || 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [departments, searchTerm, filterActive, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredAndSortedDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (isActive) => (
    isActive ? (
      <span className="badge badge-success badge-sm gap-1">
        <CheckCircle className="w-3 h-3" /> Actif
      </span>
    ) : (
      <span className="badge badge-ghost badge-sm gap-1">
        <AlertCircle className="w-3 h-3" /> Inactif
      </span>
    )
  );

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base font-medium text-base-content/70 animate-pulse">
            Chargement des départements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-6">
      {/* Notification toast */}
      {notification.show && (
        <div className="fixed top-16 lg:top-20 right-3 lg:right-6 z-50 animate-slideDown w-[calc(100%-1.5rem)] lg:w-auto max-w-md">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="text-sm lg:text-base font-medium">{notification.message}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-base-content">Départements</h1>
          <p className="text-xs lg:text-sm text-base-content/60">
            Gérez les départements de l'entreprise
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline btn-sm lg:btn-md gap-1 lg:gap-2">
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={() => navigate('/departments/new')}
            className="btn btn-primary btn-sm lg:btn-md gap-1 lg:gap-2"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Nouveau département</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-primary">
            <Building2 className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Total</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Actifs</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.active}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-warning">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Inactifs</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.inactive}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg lg:rounded-xl shadow-sm border border-base-300 p-2 lg:p-4">
          <div className="stat-figure text-info">
            <Users className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="stat-title text-xs lg:text-sm">Avec responsable</div>
          <div className="stat-value text-lg lg:text-2xl">{stats.withManager}</div>
        </div>
      </div>

      {/* Filtres desktop */}
      <div className="hidden lg:flex bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, responsable..."
              className="input input-bordered input-sm w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="select select-bordered select-sm w-36"
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterActive('');
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            <Filter className="w-3 h-3" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres mobile */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered input-sm w-full pl-8 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="w-3 h-3" /> Filtres
          </button>
        </div>
        {showMobileFilters && (
          <div className="mt-2 p-3 bg-base-100 rounded-lg border border-base-300 space-y-2">
            <select
              className="select select-bordered select-sm w-full"
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tous statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
            <button
              className="btn btn-outline btn-sm w-full"
              onClick={() => {
                setFilterActive('');
                setSearchTerm('');
                setCurrentPage(1);
                setShowMobileFilters(false);
              }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Tableau desktop */}
      <div className="hidden lg:block bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th></th>
                <th>
                  <button
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('name')}
                  >
                    Nom <SortIcon field="name" />
                  </button>
                </th>
                <th>
                  <button
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('code')}
                  >
                    Code <SortIcon field="code" />
                  </button>
                </th>
                <th>Description</th>
                <th>
                  <button
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('manager_name')}
                  >
                    Responsable <SortIcon field="manager_name" />
                  </button>
                </th>
                <th>
                  <button
                    className="flex items-center gap-1 hover:text-primary font-semibold"
                    onClick={() => handleSort('employees_count')}
                  >
                    Employés <SortIcon field="employees_count" />
                  </button>
                </th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDepartments.map((dept) => (
                <tr key={dept.id} className="hover">
                  <td>
                    <div className="avatar placeholder">
                      <div className="bg-primary/10 text-primary rounded-lg w-8 h-8 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{dept.name}</div>
                    {dept.parent_department_name && (
                      <div className="text-xs text-base-content/50">
                        Parent : {dept.parent_department_name}
                      </div>
                    )}
                  </td>
                  <td><code className="text-sm">{dept.code || '-'}</code></td>
                  <td className="max-w-xs truncate text-base-content/70">
                    {dept.description || '-'}
                  </td>
                  <td>
                    {dept.manager_name ? (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        {dept.manager_name}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className="badge badge-sm badge-ghost">
                      {dept.employees_count || 0}
                    </span>
                  </td>
                  <td>{getStatusBadge(dept.is_active)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => navigate(`/departments/${dept.id}/edit`)}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => {
                          setDepartmentToDelete(dept);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAndSortedDepartments.length === 0 && (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-base font-medium text-base-content/50">
              Aucun département trouvé
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              className="btn btn-primary btn-sm mt-4"
              onClick={() => navigate('/departments/new')}
            >
              <Plus className="w-3 h-3" /> Créer un département
            </button>
          </div>
        )}
      </div>

      {/* Liste mobile */}
      <div className="lg:hidden space-y-2">
        {paginatedDepartments.length === 0 ? (
          <div className="bg-base-100 rounded-xl p-8 text-center border border-base-300">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-base-content/30" />
            <p className="text-sm font-medium text-base-content/50">
              Aucun département trouvé
            </p>
            <button
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate('/departments/new')}
            >
              <Plus className="w-3 h-3" /> Créer
            </button>
          </div>
        ) : (
          paginatedDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-base-100 rounded-xl p-3 border border-base-300 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm truncate">{dept.name}</h3>
                      <p className="text-xs text-base-content/60 font-mono mt-0.5">
                        {dept.code}
                      </p>
                    </div>
                    {getStatusBadge(dept.is_active)}
                  </div>
                  {dept.description && (
                    <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                  {dept.manager_name && (
                    <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Resp. : {dept.manager_name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Briefcase className="w-3 h-3" /> Employés :{' '}
                      {dept.employees_count || 0}
                    </div>
                    {dept.parent_department_name && (
                      <div className="flex items-center gap-1 text-xs text-base-content/60">
                        <Building2 className="w-3 h-3" /> Parent :{' '}
                        {dept.parent_department_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-base-200">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye className="w-3 h-3" /> Voir
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate(`/departments/${dept.id}/edit`)}
                >
                  <Edit className="w-3 h-3" /> Modifier
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => {
                    setDepartmentToDelete(dept);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedDepartments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs lg:text-sm text-base-content/60">
            {Math.min(
              filteredAndSortedDepartments.length,
              (currentPage - 1) * itemsPerPage + 1
            )}{' '}
            -{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedDepartments.length
            )}{' '}
            sur {filteredAndSortedDepartments.length}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="select select-bordered select-xs lg:select-sm w-20 lg:w-28"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <div className="join">
              <button
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <span className="join-item btn btn-xs lg:btn-sm no-animation">
                {currentPage} / {totalPages}
              </span>
              <button
                className="join-item btn btn-xs lg:btn-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-base-content/70 text-sm">
                Voulez-vous vraiment supprimer le département
              </p>
              <p className="text-lg font-bold text-error mt-2">
                "{departmentToDelete?.name}" ?
              </p>
              <p className="text-xs text-base-content/50 mt-3">
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleDeleteDepartment}
              >
                <Trash2 className="w-3 h-3" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale détails */}
      {showDetailsModal && selectedDepartment && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Détails du département</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-primary/10 text-primary rounded-lg w-16 h-16 flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedDepartment.name}</h4>
                  <code className="text-sm text-base-content/60">
                    {selectedDepartment.code}
                  </code>
                  <div className="mt-1">{getStatusBadge(selectedDepartment.is_active)}</div>
                </div>
              </div>
              <div className="divider my-2"></div>
              {selectedDepartment.description && (
                <div>
                  <label className="text-xs font-semibold text-base-content/60">
                    Description
                  </label>
                  <p className="text-sm mt-1">{selectedDepartment.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-base-content/60">
                    Responsable
                  </label>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    {selectedDepartment.manager_name ? (
                      <>
                        <Users className="w-3 h-3 text-primary" />{' '}
                        {selectedDepartment.manager_name}
                      </>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/60">
                    Département parent
                  </label>
                  <p className="text-sm mt-1">
                    {selectedDepartment.parent_department_name || 'Aucun'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/60">
                    Nombre d'employés
                  </label>
                  <p className="text-lg font-bold">{selectedDepartment.employees_count || 0}</p>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  navigate(`/departments/${selectedDepartment.id}/edit`);
                }}
              >
                <Edit className="w-3 h-3" /> Modifier
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;