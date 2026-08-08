// src/components/drh/Candidates.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { Users, Search, RefreshCw, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Filter, Calendar, Mail, Phone } from 'lucide-react';

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRecruitment, setFilterRecruitment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const statusConfig = {
    pending: { label: 'En attente', color: 'warning', bgColor: 'bg-warning/10', textColor: 'text-warning' },
    reviewed: { label: 'Examiné', color: 'info', bgColor: 'bg-info/10', textColor: 'text-info' },
    interview_scheduled: { label: 'Entretien programmé', color: 'primary', bgColor: 'bg-primary/10', textColor: 'text-primary' },
    interviewed: { label: 'Entretien effectué', color: 'secondary', bgColor: 'bg-secondary/10', textColor: 'text-secondary' },
    rejected: { label: 'Rejeté', color: 'error', bgColor: 'bg-error/10', textColor: 'text-error' },
    accepted: { label: 'Accepté', color: 'success', bgColor: 'bg-success/10', textColor: 'text-success' },
    hired: { label: 'Embauché', color: 'success', bgColor: 'bg-success/20', textColor: 'text-success' }
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([AxiosInstance.get('/candidates/'), AxiosInstance.get('/recruitments/')])
      .then(([candRes, recRes]) => { setCandidates(candRes.data || []); setRecruitments(recRes.data || []); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    try { await AxiosInstance.delete(`/candidates/${candidateToDelete.id}/`); showNotification('Candidat supprimé', 'success'); fetchData(); setShowDeleteModal(false); } 
    catch (err) { showNotification('Erreur', 'error'); }
  };

  const showNotification = (message, type) => { setNotification({ show: true, message, type }); setTimeout(() => setNotification({ ...notification, show: false }), 4000); };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchTerm || (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || c.status === filterStatus;
    const matchesRecruitment = !filterRecruitment || c.recruitment === parseInt(filterRecruitment);
    return matchesSearch && matchesStatus && matchesRecruitment;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginated = filteredCandidates.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  if (loading) return <div className="flex justify-center p-12"><div className="loading loading-spinner loading-lg"></div></div>;

  return (
    <div className="space-y-6 p-4">
      {notification.show && <div className="fixed top-16 right-6 z-50 alert alert-success shadow-lg"><CheckCircle className="w-4 h-4"/><span>{notification.message}</span><button onClick={()=>setNotification({...notification,show:false})}>✕</button></div>}
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-black text-primary">Candidats</h1><p className="text-sm text-base-content/60">Gestion des candidatures</p></div><div className="flex gap-2"><button onClick={fetchData} className="btn btn-outline gap-1"><RefreshCw className="w-4 h-4"/> Actualiser</button><button onClick={() => navigate('/candidates/new')} className="btn btn-primary gap-1"><Users className="w-4 h-4"/> Nouveau candidat</button></div></div>

      <div className="stats shadow bg-base-100 w-full grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded-xl">
        <div className="stat"><div className="stat-title">Total</div><div className="stat-value text-xl">{candidates.length}</div></div>
        <div className="stat"><div className="stat-title text-warning">En attente</div><div className="stat-value text-xl text-warning">{candidates.filter(c=>c.status==='pending').length}</div></div>
        <div className="stat"><div className="stat-title text-info">Entretiens</div><div className="stat-value text-xl text-info">{candidates.filter(c=>c.status==='interview_scheduled').length}</div></div>
        <div className="stat"><div className="stat-title text-success">Embauchés</div><div className="stat-value text-xl text-success">{candidates.filter(c=>c.status==='hired').length}</div></div>
      </div>

      <div className="bg-base-100 rounded-xl shadow-md p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"/><input type="text" placeholder="Rechercher..." className="input input-bordered w-full pl-9" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></div><div className="flex gap-3 mt-3"><select className="select select-bordered w-48" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">Statuts</option>{Object.entries(statusConfig).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select><select className="select select-bordered w-48" value={filterRecruitment} onChange={e=>setFilterRecruitment(e.target.value)}><option value="">Offres</option>{recruitments.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select><button className="btn btn-outline" onClick={()=>{setFilterStatus('');setFilterRecruitment('');setSearchTerm('');}}><Filter className="w-4 h-4"/> Réinitialiser</button></div></div>

      <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden"><div className="overflow-x-auto"><table className="table w-full"><thead className="bg-base-200"><tr><th>Nom</th><th>Email</th><th>Offre</th><th>Statut</th><th className="text-center">Actions</th></tr></thead><tbody>{paginated.length===0?<tr><td colSpan="5" className="text-center py-12"><Users className="w-12 h-12 mx-auto"/><p>Aucun candidat</p></td></tr>:paginated.map(c=>{const s=statusConfig[c.status]||statusConfig.pending;return <tr key={c.id} className="hover:bg-base-200"><td><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4"/></div>{c.full_name}</div></td><td>{c.email}</td><td>{c.recruitment_title||'-'}</td><td><span className={`badge ${s.bgColor} ${s.textColor}`}>{s.label}</span></td><td className="text-center"><div className="flex justify-center gap-1"><button className="btn btn-ghost btn-xs" onClick={()=>navigate(`/candidates/${c.id}`)}><Eye className="w-4 h-4"/></button><button className="btn btn-ghost btn-xs" onClick={()=>navigate(`/candidates/${c.id}/edit`)}><Edit className="w-4 h-4"/></button><button className="btn btn-ghost btn-xs text-error" onClick={()=>{setCandidateToDelete(c);setShowDeleteModal(true);}}><Trash2 className="w-4 h-4"/></button></div></td></tr>})}</tbody></table></div><div className="p-3 border-t"><div className="flex justify-between items-center"><div className="text-sm">{((currentPage-1)*itemsPerPage)+1} - {Math.min(currentPage*itemsPerPage,filteredCandidates.length)} sur {filteredCandidates.length}</div><div className="join"><button className="join-item btn btn-xs" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}><ChevronLeft/></button>{Array.from({length:Math.min(3,totalPages)},(_,i)=>{let p;if(totalPages<=3)p=i+1;else if(currentPage<=2)p=i+1;else if(currentPage>=totalPages-1)p=totalPages-2+i;else p=currentPage-1+i;return <button key={i} className={`join-item btn btn-xs ${currentPage===p?'btn-primary':''}`} onClick={()=>setCurrentPage(p)}>{p}</button>})}<button className="join-item btn btn-xs" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}><ChevronRight/></button></div></div></div></div>

      {showDeleteModal && candidateToDelete && <div className="modal modal-open"><div className="modal-box"><div className="text-center"><div className="bg-error/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"><Trash2 className="w-8 h-8 text-error"/></div><h3 className="font-bold text-lg">Confirmer</h3><p>Supprimer "{candidateToDelete.full_name}" ?</p><div className="flex gap-3 mt-4"><button className="btn btn-ghost flex-1" onClick={()=>setShowDeleteModal(false)}>Annuler</button><button className="btn btn-error flex-1" onClick={handleDelete}>Supprimer</button></div></div></div></div>}
    </div>
  );
};

export default Candidates;