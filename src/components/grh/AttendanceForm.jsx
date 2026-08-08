// src/components/drh/AttendanceForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft,
  Save,
  QrCode,
  User,
  LogIn,
  LogOut,
  Scan,
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { action } = useParams(); // 'checkin' ou 'checkout'
  const isCheckin = action === 'checkin';
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    method: 'manual',
    qr_token: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', actionBtn: null });

  useEffect(() => {
    AxiosInstance.get('/employees/')
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  }, []);

  const showNotification = (message, type = 'success', actionBtn = null) => {
    setNotification({ show: true, message, type, actionBtn });
    if (!actionBtn) {
      setTimeout(() => setNotification({ show: false, message: '', type: 'success', actionBtn: null }), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.employee_id) {
      showNotification('Veuillez sélectionner un employé', 'error');
      return;
    }

    if (formData.method === 'qr' && !formData.qr_token) {
      showNotification('Veuillez scanner ou entrer le token QR', 'error');
      return;
    }

    setLoading(true);
    const endpoint = isCheckin ? '/attendance/checkin/' : '/attendance/checkout/';
    const payload = {
      employee_id: parseInt(formData.employee_id),
      method: formData.method
    };
    if (formData.method === 'qr' && formData.qr_token) payload.qr_token = formData.qr_token;

    try {
      await AxiosInstance.post(endpoint, payload);
      showNotification(
        `${isCheckin ? 'Arrivée' : 'Départ'} enregistré(e) avec succès`,
        'success'
      );
      setTimeout(() => navigate('/attendance'), 1500);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'enregistrement';
      
      // Si l'erreur est "Aucun check-in trouvé" et qu'on est en checkout, proposer d'aller vers checkin
      if (!isCheckin && errorMsg.includes('Aucun check-in')) {
        showNotification(
          errorMsg,
          'warning',
          <button 
            onClick={() => navigate('/attendance/checkin')}
            className="btn btn-sm btn-warning gap-1"
          >
            <LogIn className="w-3 h-3" />
            Pointer l'arrivée
          </button>
        );
      } else {
        showNotification(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const title = isCheckin ? 'Pointer l\'arrivée' : 'Pointer le départ';
  const Icon = isCheckin ? LogIn : LogOut;
  const iconColor = isCheckin ? 'text-success' : 'text-warning';

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
            {notification.actionBtn && (
              <div className="flex-none">
                {notification.actionBtn}
              </div>
            )}
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
          onClick={() => navigate('/attendance')}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>
        
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isCheckin ? 'bg-success/10' : 'bg-warning/10'}`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              {isCheckin ? 'Enregistrez votre arrivée' : 'Enregistrez votre départ'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-lg mx-auto">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Sélection employé */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Employé <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-base-content/40" />
                </div>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="select select-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Sélectionnez l'employé qui pointe
                </span>
              </label>
            </div>

            {/* Méthode de pointage */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Méthode de pointage
                </span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="manual"
                    checked={formData.method === 'manual'}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="text-sm">Manuel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="qr"
                    checked={formData.method === 'qr'}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="text-sm">QR Code</span>
                </label>
              </div>
            </div>

            {/* QR Code - Conditionnel */}
            {formData.method === 'qr' && (
              <div className="form-control w-full animate-fadeIn">
                <label className="label">
                  <span className="label-text font-semibold text-base-content">
                    Token QR <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <QrCode className="w-4 h-4 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="qr_token"
                    value={formData.qr_token}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-9 focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Scannez ou entrez le token"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Scan className="w-4 h-4 text-primary cursor-pointer hover:text-primary/70 transition-colors" 
                      onClick={() => {
                        // Simuler un scan QR (à implémenter avec une vraie librairie)
                        showNotification('Fonctionnalité de scan à implémenter', 'info');
                      }}
                    />
                  </div>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Utilisez le QR Code du badge employé
                  </span>
                </label>
              </div>
            )}

            {/* Horloge en temps réel */}
            <div className="bg-base-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-base-content">Heure actuelle</span>
              </div>
              <p className="text-2xl font-mono font-bold text-primary">
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Bouton de validation */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn w-full gap-2 text-white border-none transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 ${isCheckin ? 'btn-success' : 'btn-warning'}`}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Valider
                </>
              )}
            </button>

            {/* Message d'information */}
            <div className="alert alert-info shadow-lg">
              <AlertCircle className="w-4 h-4" />
              <div>
                <span className="font-semibold">Information :</span>
                {isCheckin 
                  ? " L'heure d'arrivée est enregistrée automatiquement. Les retards sont calculés par rapport à l'horaire théorique (8h00)."
                  : " L'heure de départ est enregistrée automatiquement. N'oubliez pas de pointer votre départ."
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AttendanceForm;