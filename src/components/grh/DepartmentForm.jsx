// src/components/grh/DepartmentForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Building2,
  Save,
  XCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Code,
  Users,
} from 'lucide-react';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager: '',
    parent_department: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const fetchDependencies = async () => {
    try {
      const [employeesRes, deptsRes] = await Promise.all([
        AxiosInstance.get('/employees/'),
        AxiosInstance.get('/departments/'),
      ]);
      setEmployees(employeesRes.data || []);
      let depts = deptsRes.data || [];
      if (isEditMode && id) {
        depts = depts.filter((d) => d.id !== parseInt(id));
      }
      setDepartments(depts);
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement des dépendances', 'error');
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await AxiosInstance.get(`/departments/${id}/`);
      const dept = response.data;
      setFormData({
        name: dept.name || '',
        code: dept.code || '',
        description: dept.description || '',
        manager: dept.manager?.id?.toString() || '',
        parent_department: dept.parent_department?.id?.toString() || '',
        is_active: dept.is_active !== undefined ? dept.is_active : true,
      });
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du chargement du département', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    if (isEditMode) fetchDepartment();
    else setInitialLoading(false);
  }, [id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.code?.trim()) newErrors.code = 'Le code est requis';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const dataToSend = {
      name: formData.name,
      code: formData.code,
      description: formData.description || '',
      manager: formData.manager ? parseInt(formData.manager, 10) : null,
      parent_department: formData.parent_department ? parseInt(formData.parent_department, 10) : null,
      is_active: formData.is_active,
    };

    try {
      if (isEditMode) {
        await AxiosInstance.put(`/departments/${id}/`, dataToSend);
        showNotification('Département modifié avec succès', 'success');
      } else {
        await AxiosInstance.post('/departments/', dataToSend);
        showNotification('Département créé avec succès', 'success');
      }
      setTimeout(() => navigate('/departments'), 2000);
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        const newErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          newErrors[key] = Array.isArray(error.response.data[key])
            ? error.response.data[key][0]
            : error.response.data[key];
        });
        setErrors(newErrors);
      }
      showNotification(error.response?.data?.detail || "Erreur lors de l'enregistrement", 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-base-200 min-h-screen">
      {/* Toast notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setNotification({ ...notification, show: false })}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <button onClick={() => navigate('/departments')} className="btn btn-ghost btn-sm normal-case gap-2 mb-2 text-base-content/70">
            <ArrowLeft size={16} /> Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-base-content">
            {isEditMode ? 'Modifier le département' : 'Nouveau département'}
          </h1>
          <p className="text-base-content/70 text-sm">
            {isEditMode ? 'Modifiez les informations du département' : 'Créez un nouveau département'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => navigate('/departments')}>
            <XCircle size={16} /> Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <Save size={16} />}
            {loading ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card bg-base-100 shadow-md rounded-2xl overflow-hidden border border-base-200">
        <div className="card-body p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="form-control">
              <label className="label"><span className="label-text">Nom du département *</span></label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ex: Ressources Humaines"
                />
              </div>
              {errors.name && <span className="label-text-alt text-error">{errors.name}</span>}
            </div>

            {/* Code */}
            <div className="form-control">
              <label className="label"><span className="label-text">Code *</span></label>
              <div className="relative">
                <Code size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 ${errors.code ? 'input-error' : ''}`}
                  placeholder="Ex: RH"
                />
              </div>
              {errors.code && <span className="label-text-alt text-error">{errors.code}</span>}
            </div>

            {/* Description */}
            <div className="form-control md:col-span-2">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered"
                placeholder="Description du département..."
              />
            </div>

            {/* Manager */}
            <div className="form-control">
              <label className="label"><span className="label-text">Responsable (Manager)</span></label>
              <div className="relative">
                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <select name="manager" value={formData.manager} onChange={handleChange} className="select select-bordered w-full pl-10">
                  <option value="">Non défini</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_number})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Département parent */}
            <div className="form-control">
              <label className="label"><span className="label-text">Département parent</span></label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <select name="parent_department" value={formData.parent_department} onChange={handleChange} className="select select-bordered w-full pl-10">
                  <option value="">Aucun (département racine)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch actif */}
            <div className="form-control md:col-span-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="toggle toggle-success" />
                <span className="label-text">Département actif</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;