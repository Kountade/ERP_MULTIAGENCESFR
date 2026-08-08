// src/components/drh/RecruitmentForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import { ArrowLeft, Save, Building2, Briefcase, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const RecruitmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', department: '', position: '', description: '', requirements: '',
    location: '', contract_type: 'cdi', experience_required: 0, deadline: '', status: 'draft'
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const contractTypes = [
    { value: 'cdi', label: 'CDI' }, { value: 'cdd', label: 'CDD' }, { value: 'internship', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' }, { value: 'temporary', label: 'Intérim' }, { value: 'apprentice', label: 'Alternant' }
  ];

  useEffect(() => {
    Promise.all([AxiosInstance.get('/departments/'), AxiosInstance.get('/positions/')])
      .then(([deptRes, posRes]) => { setDepartments(deptRes.data || []); setPositions(posRes.data || []); });
    if (isEdit) AxiosInstance.get(`/recruitments/${id}/`).then(res => setFormData(res.data));
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEdit) await AxiosInstance.put(`/recruitments/${id}/`, formData);
      else await AxiosInstance.post('/recruitments/', formData);
      setNotification({ show: true, message: `Offre ${isEdit ? 'modifiée' : 'créée'} avec succès`, type: 'success' });
      setTimeout(() => navigate('/recruitments'), 1500);
    } catch (err) { setNotification({ show: true, message: 'Erreur', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 p-4">
      {notification.show && <div className="fixed top-16 right-6 z-50 alert alert-success shadow-lg"><CheckCircle className="w-4 h-4"/><span>{notification.message}</span><button onClick={()=>setNotification({...notification,show:false})}>✕</button></div>}
      <button onClick={()=>navigate('/recruitments')} className="inline-flex items-center gap-2 text-primary mb-4"><ArrowLeft className="w-4 h-4"/> Retour</button>
      <h1 className="text-3xl font-black text-primary">{isEdit ? 'Modifier' : 'Nouvelle'} offre d'emploi</h1>
      <div className="bg-base-100 rounded-xl shadow-xl border p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control"><label className="label">Titre *</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" placeholder="Ex: Développeur Full Stack"/></div>
          <div className="form-control"><label className="label">Département</label><select name="department" value={formData.department} onChange={handleChange} className="select select-bordered"><option value="">Sélectionner</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="form-control"><label className="label">Poste</label><select name="position" value={formData.position} onChange={handleChange} className="select select-bordered"><option value="">Sélectionner</option>{positions.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
          <div className="form-control"><label className="label">Type de contrat</label><select name="contract_type" value={formData.contract_type} onChange={handleChange} className="select select-bordered">{contractTypes.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div className="form-control"><label className="label">Localisation</label><input type="text" name="location" value={formData.location} onChange={handleChange} className="input input-bordered" placeholder="Dakar, Sénégal"/></div>
          <div className="form-control"><label className="label">Expérience requise (années)</label><input type="number" name="experience_required" value={formData.experience_required} onChange={handleChange} className="input input-bordered"/></div>
          <div className="form-control"><label className="label">Date limite</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="input input-bordered"/></div>
          <div className="form-control"><label className="label">Statut</label><select name="status" value={formData.status} onChange={handleChange} className="select select-bordered"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="in_progress">En cours</option><option value="closed">Clôturé</option></select></div>
          <div className="md:col-span-2"><label className="label">Description *</label><textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="textarea textarea-bordered w-full" placeholder="Description du poste..."/></div>
          <div className="md:col-span-2"><label className="label">Prérequis *</label><textarea name="requirements" rows={4} value={formData.requirements} onChange={handleChange} className="textarea textarea-bordered w-full" placeholder="Compétences requises..."/></div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t"><button onClick={()=>navigate('/recruitments')} className="btn btn-ghost">Annuler</button><button onClick={handleSubmit} disabled={loading} className="btn btn-primary gap-2">{loading ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4"/>}{isEdit ? 'Modifier' : 'Créer'}</button></div>
      </div>
    </div>
  );
};

export default RecruitmentForm;