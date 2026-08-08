// src/components/drh/PerformanceReviews.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  Star, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  User, 
  Calendar,
  X,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

const PerformanceReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const statusConfig = {
    draft: { label: 'Brouillon', color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' },
    submitted: { label: 'Soumis', color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    acknowledged: { label: 'Reconnu', color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    completed: { label: 'Terminé', color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' }
  };

  const showNotification = (message, type) => { 
    setNotification({ show: true, message, type }); 
    setTimeout(() => setNotification({ ...notification, show: false }), 4000); 
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/performance/'),
      AxiosInstance.get('/employees/')
    ])
      .then(([revRes, empRes]) => { 
        setReviews(revRes.data || []); 
        setEmployees(empRes.data || []);
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try { 
      await AxiosInstance.delete(`/performance/${reviewToDelete.id}/`); 
      showNotification('Évaluation supprimée avec succès', 'success'); 
      fetchData(); 
      setShowDeleteModal(false); 
      setReviewToDelete(null);
    } catch (err) { 
      showNotification('Erreur lors de la suppression', 'error'); 
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchTerm || 
      (review.employee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || review.status === filterStatus;
    const matchesEmployee = !filterEmployee || review.employee?.toString() === filterEmployee;
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = { 
    total: reviews.length, 
    completed: reviews.filter(r => r.status === 'completed').length,
    pending: reviews.filter(r => r.status === 'submitted').length,
    draft: reviews.filter(r => r.status === 'draft').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((a, b) => a + (b.overall_rating || 0), 0) / reviews.length).toFixed(1) 
      : 0
  };

  const getStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-warning text-warning" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 text-warning" strokeWidth={1.5} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty${i}`} className="w-3 h-3 text-gray-300" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des évaluations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Notification */}
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
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            Évaluations de performance
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gestion des entretiens annuels ({stats.total} évaluations)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => navigate('/performance/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            Nouvelle évaluation
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Terminées</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-success">{stats.completed}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">En attente</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black text-warning">{stats.pending}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Note moyenne</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.averageRating}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher par employé..."
                className="input input-bordered w-full pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm sm:hidden gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select 
              className="select select-bordered w-full sm:w-48 text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-48 text-sm"
              value={filterEmployee}
              onChange={(e) => {
                setFilterEmployee(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id.toString()}>{emp.full_name}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterStatus('');
                setFilterEmployee('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-xs sm:table-sm lg:table-md w-full">
            <thead>
              <tr className="text-xs sm:text-sm bg-base-200">
                <th>Employé</th>
                <th>Date d'évaluation</th>
                <th>Période</th>
                <th>Note</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                    <p className="text-base-content/50">Aucune évaluation trouvée</p>
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => {
                  const status = statusConfig[review.status] || statusConfig.draft;
                  return (
                    <tr key={review.id} className="hover:bg-base-200 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{review.employee_name}</span>
                        </div>
                      </td>
                      <td className="text-sm">
                        {review.review_date ? new Date(review.review_date).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="text-sm">
                        {review.review_period_start && review.review_period_end ? (
                          `${new Date(review.review_period_start).toLocaleDateString('fr-FR')} → ${new Date(review.review_period_end).toLocaleDateString('fr-FR')}`
                        ) : '-'}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {getStarRating(review.overall_rating || 0)}
                          <span className="ml-1 text-sm font-medium">({review.overall_rating?.toFixed(1) || 0})</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => navigate(`/performance/${review.id}`)}
                            className="btn btn-ghost btn-xs"
                            title="Détails"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => navigate(`/performance/${review.id}/edit`)}
                            className="btn btn-ghost btn-xs"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => { 
                              setReviewToDelete(review); 
                              setShowDeleteModal(true); 
                            }}
                            className="btn btn-ghost btn-xs text-error"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredReviews.length)} sur {filteredReviews.length}
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <select 
                  className="select select-bordered select-xs sm:select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
                
                <div className="join">
                  <button 
                    className="join-item btn btn-xs sm:btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        className={`join-item btn btn-xs sm:btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className="join-item btn btn-xs sm:btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && reviewToDelete && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="avatar placeholder mb-3 sm:mb-4">
                <div className="bg-error/10 text-error rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-base-content/70">
                Voulez-vous vraiment supprimer cette évaluation ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                {reviewToDelete.employee_name}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-error flex-1"
                onClick={handleDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReviews;