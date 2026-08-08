// src/components/drh/Recruitments.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Plus,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Briefcase,
  Building2,
  Clock,
  FileText
} from 'lucide-react';

const Recruitments = () => {
  const navigate = useNavigate();

  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterContract, setFilterContract] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recruitmentToDelete, setRecruitmentToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const statusConfig = {
    draft: { label: 'Brouillon', icon: FileText, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' },
    published: { label: 'Publié', icon: CheckCircle, color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    in_progress: { label: 'En cours', icon: Clock, color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    closed: { label: 'Clôturé', icon: XCircle, color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    cancelled: { label: 'Annulé', icon: XCircle, color: 'default', bgColor: 'bg-base-200', textColor: 'text-base-content/70' }
  };

  const contractConfig = {
    cdi: { label: 'CDI', color: 'success' },
    cdd: { label: 'CDD', color: 'info' },
    internship: { label: 'Stage', color: 'warning' },
    freelance: { label: 'Freelance', color: 'primary' },
    temporary: { label: 'Intérim', color: 'default' },
    apprentice: { label: 'Alternant', color: 'secondary' }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = () => {
    setLoading(true);
    AxiosInstance.get('/recruitments/')
      .then(res => {
        setRecruitments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement', 'error');
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!recruitmentToDelete) return;
    try {
      await AxiosInstance.delete(`/recruitments/${recruitmentToDelete.id}/`);
      showNotification('Recrutement supprimé avec succès', 'success');
      fetchData();
      setShowDeleteModal(false);
      setRecruitmentToDelete(null);
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredRecruitments = recruitments.filter(r => {
    const matchesSearch = !searchTerm || 
      (r.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.department_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || r.status === filterStatus;
    const matchesContract = !filterContract || r.contract_type === filterContract;
    return matchesSearch && matchesStatus && matchesContract;
  });

  const totalPages = Math.ceil(filteredRecruitments.length / itemsPerPage);
  const paginatedRecruitments = filteredRecruitments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: recruitments.length,
    published: recruitments.filter(r => r.status === 'published').length,
    inProgress: recruitments.filter(r => r.status === 'in_progress').length,
    closed: recruitments.filter(r => r.status === 'closed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des recrutements...
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
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-semibold">{notification.message}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setNotification({ ...notification, show: false })}>✕</button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">Recrutements</h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">Gestion des offres d'emploi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-sm btn-outline gap-1"><RefreshCw className="w-3 h-3" /> Actualiser</button>
          <button onClick={() => navigate('/recruitments/new')} className="btn btn-sm btn-primary gap-1"><Plus className="w-3 h-3" /> Nouvelle offre</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-xl shadow-md p-3"><div className="stat-figure text-primary"><FileText className="w-5 h-5" /></div><div className="stat-title text-xs">Total</div><div className="stat-value text-xl font-black">{stats.total}</div></div>
        <div className="stat bg-base-100 rounded-xl shadow-md p-3"><div className="stat-figure text-info"><CheckCircle className="w-5 h-5" /></div><div className="stat-title text-xs">Publiées</div><div className="stat-value text-xl font-black">{stats.published}</div></div>
        <div className="stat bg-base-100 rounded-xl shadow-md p-3"><div className="stat-figure text-warning"><Clock className="w-5 h-5" /></div><div className="stat-title text-xs">En cours</div><div className="stat-value text-xl font-black">{stats.inProgress}</div></div>
        <div className="stat bg-base-100 rounded-xl shadow-md p-3"><div className="stat-figure text-error"><XCircle className="w-5 h-5" /></div><div className="stat-title text-xs">Clôturées</div><div className="stat-value text-xl font-black">{stats.closed}</div></div>
      </div>

      {/* Filtres */}
      <div className="bg-base-100 rounded-xl shadow-md p-4">
        <div className="flex flex-col gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" /><input type="text" placeholder="Rechercher..." className="input input-bordered w-full pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm sm:hidden">Filtres</button>
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
            <select className="select select-bordered w-full sm:w-48" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Statuts</option>
              {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
            </select>
            <select className="select select-bordered w-full sm:w-40" value={filterContract} onChange={e => setFilterContract(e.target.value)}>
              <option value="">Contrats</option>
              {Object.entries(contractConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
            </select>
            <button className="btn btn-outline" onClick={() => { setFilterStatus(''); setFilterContract(''); setSearchTerm(''); }}><Filter className="w-4 h-4" /> Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200"><tr><th>Titre</th><th>Département</th><th>Contrat</th><th>Date limite</th><th>Statut</th><th>Candidats</th><th className="text-center">Actions</th></tr></thead>
            <tbody>
              {paginatedRecruitments.length === 0 ? <tr><td colSpan="7" className="text-center py-12"><Briefcase className="w-12 h-12 mx-auto text-base-content/30 mb-3" /><p>Aucun recrutement</p></td></tr> :
                paginatedRecruitments.map(r => {
                  const status = statusConfig[r.status] || statusConfig.draft;
                  const contract = contractConfig[r.contract_type] || contractConfig.cdi;
                  return <tr key={r.id} className="hover:bg-base-200">
                    <td className="font-medium">{r.title}</td>
                    <td>{r.department_name || '-'}</td>
                    <td><span className="badge bg-primary/10 text-primary">{contract.label}</span></td>
                    <td><div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(r.deadline)}</div></td>
                    <td><span className={`badge ${status.bgColor} ${status.textColor}`}>{status.label}</span></td>
                    <td className="text-center">{r.candidates_count || 0}</td>
                    <td className="text-center"><div className="flex justify-center gap-1"><button className="btn btn-ghost btn-xs" onClick={() => navigate(`/recruitments/${r.id}`)}><Eye className="w-4 h-4" /></button><button className="btn btn-ghost btn-xs" onClick={() => navigate(`/recruitments/${r.id}/edit`)}><Edit className="w-4 h-4" /></button><button className="btn btn-ghost btn-xs text-error" onClick={() => { setRecruitmentToDelete(r); setShowDeleteModal(true); }}><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
        {filteredRecruitments.length > 0 && (
          <div className="p-3 border-t"><div className="flex justify-between items-center"><div className="text-sm">{((currentPage-1)*itemsPerPage)+1} - {Math.min(currentPage*itemsPerPage, filteredRecruitments.length)} sur {filteredRecruitments.length}</div><div className="join"><button className="join-item btn btn-xs" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}><ChevronLeft className="w-3 h-3"/></button>{Array.from({length:Math.min(3,totalPages)},(_,i)=>{let p;if(totalPages<=3)p=i+1;else if(currentPage<=2)p=i+1;else if(currentPage>=totalPages-1)p=totalPages-2+i;else p=currentPage-1+i;return <button key={i} className={`join-item btn btn-xs ${currentPage===p?'btn-primary':''}`} onClick={()=>setCurrentPage(p)}>{p}</button>})}<button className="join-item btn btn-xs" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}><ChevronRight className="w-3 h-3"/></button></div></div></div>
        )}
      </div>

      {/* Modal suppression */}
      {showDeleteModal && recruitmentToDelete && <div className="modal modal-open"><div className="modal-box"><div className="text-center"><div className="bg-error/10 text-error rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"><Trash2 className="w-8 h-8"/></div><h3 className="font-bold text-lg">Confirmer la suppression</h3><p className="py-2">Supprimer "{recruitmentToDelete.title}" ?</p><div className="flex gap-3 mt-4"><button className="btn btn-ghost flex-1" onClick={()=>setShowDeleteModal(false)}>Annuler</button><button className="btn btn-error flex-1" onClick={handleDelete}>Supprimer</button></div></div></div></div>}
    </div>
  );
};

export default Recruitments;