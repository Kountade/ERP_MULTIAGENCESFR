// src/components/drh/Documents.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  FolderOpen,
  X
} from 'lucide-react';

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const documentTypes = {
    contract: 'Contrat', 
    attestation: 'Attestation', 
    certificate: 'Certificat', 
    procedure: 'Procédure', 
    policy: 'Politique', 
    other: 'Autre'
  };

  const showNotification = (message, type) => { 
    setNotification({ show: true, message, type }); 
    setTimeout(() => setNotification({ ...notification, show: false }), 4000); 
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/documents/'), 
      AxiosInstance.get('/departments/')
    ])
      .then(([docRes, deptRes]) => { 
        setDocuments(docRes.data || []); 
        setDepartments(deptRes.data || []); 
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
    if (!docToDelete) return;
    try { 
      await AxiosInstance.delete(`/documents/${docToDelete.id}/`); 
      showNotification('Document supprimé avec succès', 'success'); 
      fetchData(); 
      setShowDeleteModal(false); 
      setDocToDelete(null);
    } catch (err) { 
      showNotification('Erreur lors de la suppression', 'error'); 
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchTerm || (doc.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = !filterType || doc.document_type === filterType;
    const matchesDept = !filterDepartment || doc.department?.toString() === filterDepartment;
    return matchesSearch && matchesType && matchesDept;
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = { 
    total: documents.length, 
    byType: Object.keys(documentTypes).reduce((acc, key) => {
      acc[key] = documents.filter(d => d.document_type === key).length;
      return acc;
    }, {})
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des documents...
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
            Documents RH
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gestion documentaire ({stats.total} documents)
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
            onClick={() => navigate('/documents/new')}
            className="btn btn-sm sm:btn-md btn-primary gap-1 sm:gap-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            Nouveau document
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
          <div className="stat-figure text-primary">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="stat-title text-xs font-semibold">Total</div>
          <div className="stat-value text-lg font-black">{stats.total}</div>
        </div>
        {Object.entries(documentTypes).map(([key, label]) => (
          <div key={key} className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3">
            <div className="stat-title text-xs font-semibold truncate">{label}</div>
            <div className="stat-value text-lg font-black">{stats.byType[key] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un document..."
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
              className="select select-bordered w-full sm:w-40 text-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Types</option>
              {Object.entries(documentTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select 
              className="select select-bordered w-full sm:w-48 text-sm"
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Départements</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterType('');
                setFilterDepartment('');
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
                <th>Titre</th>
                <th>Type</th>
                <th>Version</th>
                <th className="hidden md:table-cell">Département</th>
                <th className="hidden sm:table-cell">Mis à jour</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <FolderOpen className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                    <p className="text-base-content/50">Aucun document trouvé</p>
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-base-200 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary/10 text-primary">
                        {documentTypes[doc.document_type] || doc.document_type}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-ghost">v{doc.version || '1.0'}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      {doc.department_name || '-'}
                    </td>
                    <td className="hidden sm:table-cell text-sm">
                      {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        {doc.file && (
                          <button 
                            onClick={() => window.open(doc.file, '_blank')}
                            className="btn btn-ghost btn-xs"
                            title="Voir"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                        {doc.file && (
                          <a 
                            href={doc.file} 
                            download 
                            className="btn btn-ghost btn-xs"
                            title="Télécharger"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                        <button 
                          onClick={() => navigate(`/documents/${doc.id}/edit`)}
                          className="btn btn-ghost btn-xs"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            setDocToDelete(doc);
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDocs.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDocs.length)} sur {filteredDocs.length}
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
      {showDeleteModal && docToDelete && (
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
                Voulez-vous vraiment supprimer ce document ?
              </p>
              <p className="text-base font-bold text-error mt-2">
                "{docToDelete.title}"
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

export default Documents;