// src/components/drh/PayrollForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save,
  ArrowLeft,
  Calculator,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Car,
  Phone,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
  Briefcase,
  FileText,
  Percent,
  Lock
} from 'lucide-react';

const PayrollForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_salary: '',
    performance_bonus: 0,
    seniority_bonus: 0,
    overtime_amount: 0,
    transport_bonus: 0,
    phone_bonus: 0,
    other_bonus: 0,
    social_security: 0,
    income_tax: 0,
    pension_fund: 0,
    health_insurance: 0,
    unpaid_leave: 0,
    other_deductions: 0
  });
  const [calculated, setCalculated] = useState({ gross: 0, net: 0, deductions: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  const years = [2023, 2024, 2025, 2026];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  // Récupérer la liste des employés
  useEffect(() => {
    AxiosInstance.get('/employees/')
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));

    if (isEdit) {
      AxiosInstance.get(`/payroll/${id}/`)
        .then(res => {
          const p = res.data;
          setFormData({
            employee: p.employee,
            month: p.month,
            year: p.year,
            base_salary: p.base_salary,
            performance_bonus: p.performance_bonus || 0,
            seniority_bonus: p.seniority_bonus || 0,
            overtime_amount: p.overtime_amount || 0,
            transport_bonus: p.transport_bonus || 0,
            phone_bonus: p.phone_bonus || 0,
            other_bonus: p.other_bonus || 0,
            social_security: p.social_security || 0,
            income_tax: p.income_tax || 0,
            pension_fund: p.pension_fund || 0,
            health_insurance: p.health_insurance || 0,
            unpaid_leave: p.unpaid_leave || 0,
            other_deductions: p.other_deductions || 0
          });
          // Récupérer les infos de l'employé pour affichage
          if (p.employee) {
            AxiosInstance.get(`/employees/${p.employee}/`)
              .then(res => setSelectedEmployee(res.data))
              .catch(err => console.error(err));
          }
          const gross = calculateGross(p);
          const deductions = calculateDeductions(p);
          setCalculated({ 
            gross: gross, 
            net: gross - deductions,
            deductions: deductions
          });
        })
        .catch(err => console.error(err))
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [id, isEdit]);

  // Fonction pour récupérer le salaire de base d'un employé
  const fetchEmployeeSalary = async (employeeId) => {
    if (!employeeId) {
      setSelectedEmployee(null);
      setFormData(prev => ({ ...prev, base_salary: '' }));
      return;
    }

    try {
      const response = await AxiosInstance.get(`/employees/${employeeId}/`);
      const employee = response.data;
      setSelectedEmployee(employee);
      
      // Mettre à jour le salaire de base avec celui de l'employé
      setFormData(prev => ({ 
        ...prev, 
        base_salary: employee.base_salary || 0 
      }));
      
      // Recalculer après mise à jour
      setTimeout(calculate, 50);
    } catch (err) {
      console.error('Erreur lors de la récupération du salaire:', err);
      showNotification('Erreur lors de la récupération du salaire de l\'employé', 'error');
    }
  };

  const calculateGross = (data) => {
    return Number(data.base_salary || 0) +
      Number(data.performance_bonus || 0) +
      Number(data.seniority_bonus || 0) +
      Number(data.overtime_amount || 0) +
      Number(data.transport_bonus || 0) +
      Number(data.phone_bonus || 0) +
      Number(data.other_bonus || 0);
  };

  const calculateDeductions = (data) => {
    return Number(data.social_security || 0) +
      Number(data.income_tax || 0) +
      Number(data.pension_fund || 0) +
      Number(data.health_insurance || 0) +
      Number(data.unpaid_leave || 0) +
      Number(data.other_deductions || 0);
  };

  const calculate = () => {
    const gross = calculateGross(formData);
    const deductions = calculateDeductions(formData);
    const net = gross - deductions;
    setCalculated({ gross, net, deductions });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si c'est le champ employee, récupérer le salaire automatiquement
    if (name === 'employee') {
      setFormData(prev => ({ ...prev, [name]: value }));
      fetchEmployeeSalary(value);
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    // Pour les autres champs, mise à jour normale
    setFormData(prev => ({ ...prev, [name]: value }));
    setTimeout(calculate, 10);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee) newErrors.employee = 'Veuillez sélectionner un employé';
    if (!formData.base_salary) newErrors.base_salary = 'Le salaire de base est requis';
    if (formData.base_salary && parseFloat(formData.base_salary) <= 0) newErrors.base_salary = 'Le salaire doit être supérieur à 0';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setLoading(true);
    const payload = { 
      ...formData, 
      base_salary: Number(formData.base_salary),
      performance_bonus: Number(formData.performance_bonus),
      seniority_bonus: Number(formData.seniority_bonus),
      overtime_amount: Number(formData.overtime_amount),
      transport_bonus: Number(formData.transport_bonus),
      phone_bonus: Number(formData.phone_bonus),
      other_bonus: Number(formData.other_bonus),
      social_security: Number(formData.social_security),
      income_tax: Number(formData.income_tax),
      pension_fund: Number(formData.pension_fund),
      health_insurance: Number(formData.health_insurance),
      unpaid_leave: Number(formData.unpaid_leave),
      other_deductions: Number(formData.other_deductions)
    };
    
    try {
      if (isEdit) await AxiosInstance.put(`/payroll/${id}/`, payload);
      else await AxiosInstance.post('/payroll/', payload);
      showNotification(`Fiche de paie ${isEdit ? 'modifiée' : 'créée'} avec succès`, 'success');
      setTimeout(() => navigate('/payroll'), 1500);
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.full_name : '';
  };

  const getEmployeeInfo = (employeeId) => {
    return employees.find(e => e.id === employeeId);
  };

  // Fonction pour formater les nombres en Franc Guinéen
  const formatGNF = (amount) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
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
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/payroll')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            {isEdit ? 'Modifier la fiche de paie' : 'Nouvelle fiche de paie'}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            {isEdit ? 'Modifiez les informations de la fiche' : 'Créez une nouvelle fiche de paie'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Informations générales */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-5 border-b border-base-200 bg-base-200/50">
              <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <Briefcase className="w-5 h-5 text-primary" />
                Informations générales
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Employé <span className="text-error">*</span></span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-base-content/40" />
                    </div>
                    <select
                      name="employee"
                      value={formData.employee}
                      onChange={handleChange}
                      className={`select select-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary ${errors.employee ? 'select-error' : ''}`}
                    >
                      <option value="">Sélectionner un employé</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.employee_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.employee && (
                    <span className="text-error text-xs mt-1">{errors.employee}</span>
                  )}
                  {selectedEmployee && (
                    <div className="mt-2 text-xs bg-base-200 p-2 rounded-lg">
                      <span className="font-medium">Salaire enregistré: </span>
                      <span className="text-primary font-bold">{formatGNF(selectedEmployee.base_salary || 0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Mois</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-base-content/40" />
                      </div>
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="select select-bordered w-full pl-9"
                      >
                        {months.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Année</span>
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Salaire et primes */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-5 border-b border-base-200 bg-base-200/50">
              <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <TrendingUp className="w-5 h-5 text-success" />
                Salaire et primes
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Salaire de base 
                      <span className="text-error">*</span>
                      <span className="ml-2 text-xs text-base-content/60">
                        (Récupéré automatiquement)
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="base_salary"
                      value={formData.base_salary}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-9 pr-12 bg-base-200/50 ${errors.base_salary ? 'input-error' : ''}`}
                      placeholder="0"
                      disabled={true}
                      readOnly={true}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-base-content/30" />
                    </div>
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                  {errors.base_salary && (
                    <span className="text-error text-xs mt-1">{errors.base_salary}</span>
                  )}
                  <div className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Ce champ est automatiquement rempli depuis le salaire de l'employé
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Prime de performance</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="performance_bonus"
                      value={formData.performance_bonus}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Prime d'ancienneté</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TrendingUp className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="seniority_bonus"
                      value={formData.seniority_bonus}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Heures supplémentaires</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="overtime_amount"
                      value={formData.overtime_amount}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Indemnité transport</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Car className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="transport_bonus"
                      value={formData.transport_bonus}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Indemnité téléphone</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="phone_bonus"
                      value={formData.phone_bonus}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text">Autres primes</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="other_bonus"
                      value={formData.other_bonus}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Déductions */}
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
            <div className="p-5 border-b border-base-200 bg-base-200/50">
              <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <TrendingDown className="w-5 h-5 text-error" />
                Déductions
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Sécurité sociale</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="social_security"
                      value={formData.social_security}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Impôt sur le revenu</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="income_tax"
                      value={formData.income_tax}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Fonds de pension</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TrendingUp className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="pension_fund"
                      value={formData.pension_fund}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Mutuelle</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Heart className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="health_insurance"
                      value={formData.health_insurance}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Congé sans solde</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="unpaid_leave"
                      value={formData.unpaid_leave}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
                
                <div className="form-control w-full md:col-span-2">
                  <label className="label">
                    <span className="label-text">Autres déductions</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      name="other_deductions"
                      value={formData.other_deductions}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-9 pr-12"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-base-content/40 text-xs font-semibold">GNF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau récapitulatif */}
        <div className="lg:col-span-1">
          <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-base-200 bg-base-200/50">
              <h2 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <FileText className="w-5 h-5 text-primary" />
                Récapitulatif
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {selectedEmployee && (
                <div className="bg-base-200/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-base-content">{selectedEmployee.full_name}</p>
                  <p className="text-xs text-base-content/60">{selectedEmployee.employee_number}</p>
                  <p className="text-xs text-base-content/60 mt-1">
                    {selectedEmployee.position_title || 'Pas de poste'} 
                    {selectedEmployee.department_name && ` - ${selectedEmployee.department_name}`}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Salaire brut</span>
                <span className="font-bold text-lg text-primary">{formatGNF(calculated.gross)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Total déductions</span>
                <span className="font-medium text-error">{formatGNF(calculated.deductions)}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-base-content">Net à payer</span>
                <span className="text-2xl font-bold text-primary">{formatGNF(calculated.net)}</span>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={calculate}
                  className="btn btn-outline flex-1 gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Recalculer
                </button>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.employee}
                className="btn btn-primary w-full gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Modifier' : 'Créer'} la fiche
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Récapitulatif employé pour édition */}
          {isEdit && formData.employee && (
            <div className="bg-base-200 rounded-xl p-4 mt-4">
              <h3 className="text-sm font-semibold text-base-content mb-2">Employé sélectionné</h3>
              <p className="text-sm text-base-content/80">{getEmployeeName(formData.employee)}</p>
              <p className="text-xs text-base-content/60 mt-1">
                Période: {months.find(m => m.value === formData.month)?.label} {formData.year}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollForm;