// src/components/drh/Attendance.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  RefreshCw,
  Search,
  Filter,
  Clock,
  Calendar,
  User,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Attendance = () => {
  const navigate = useNavigate();

  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    avgHours: 0
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      AxiosInstance.get('/attendance/'),
      AxiosInstance.get('/employees/')
    ])
      .then(([attendanceRes, employeesRes]) => {
        setAttendances(attendanceRes.data || []);
        setEmployees(employeesRes.data || []);
        
        // Calculer les statistiques
        const total = attendanceRes.data?.length || 0;
        const present = attendanceRes.data?.filter(a => a.check_in_time).length || 0;
        const late = attendanceRes.data?.filter(a => a.late_minutes > 0).length || 0;
        const avgHours = attendanceRes.data?.reduce((sum, a) => sum + (a.hours_worked || 0), 0) / total || 0;
        
        setStats({ total, present, late, avgHours: avgHours.toFixed(1) });
      })
      .catch(err => {
        console.error(err);
        showNotification('Erreur de chargement', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = () => {
    navigate('/attendance/checkin');
  };

  const handleCheckOut = () => {
    navigate('/attendance/checkout');
  };

  const filteredAttendances = attendances.filter(a => {
    const matchesSearch = !searchTerm || 
      (a.employee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEmployee = !filterEmployee || a.employee?.toString() === filterEmployee;
    const matchesDate = !filterDate || a.date === filterDate;
    return matchesSearch && matchesEmployee && matchesDate;
  });

  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
  const paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTime = (datetime) => {
    if (!datetime) return '-';
    return new Date(datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Ajuster itemsPerPage selon la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(10);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement des pointages...
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
            Présences / Pointages
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Gestion des présences et pointages des employés
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={fetchData}
            className="btn btn-sm sm:btn-md btn-outline gap-1 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button 
            onClick={handleCheckIn}
            className="btn btn-sm sm:btn-md btn-success gap-1 sm:gap-2"
          >
            <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Pointer arrivée</span>
          </button>
          <button 
            onClick={handleCheckOut}
            className="btn btn-sm sm:btn-md btn-warning gap-1 sm:gap-2"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Pointer départ</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-primary">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Total pointages</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.total}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-success">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Présents</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.present}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-warning">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Retards</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.late}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-xl shadow-md border border-base-200 p-2 sm:p-3 lg:p-4">
          <div className="stat-figure text-info">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="stat-title text-xs sm:text-sm font-semibold">Moyenne heures</div>
          <div className="stat-value text-lg sm:text-2xl lg:text-3xl font-black">{stats.avgHours}h</div>
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
              value={filterEmployee}
              onChange={(e) => {
                setFilterEmployee(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id.toString()}>{emp.full_name}</option>
              ))}
            </select>
            
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-base-content/40" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="input input-bordered w-full pl-9 text-sm"
              />
            </div>
            
            <button 
              className="btn btn-outline gap-2"
              onClick={() => {
                setFilterDate('');
                setFilterEmployee('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des pointages */}
      <div className="bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-xs sm:table-sm lg:table-md w-full">
            <thead>
              <tr className="text-xs sm:text-sm bg-base-200">
                <th>Employé</th>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Heures travaillées</th>
                <th>Retard (min)</th>
             </tr>
            </thead>
            <tbody>
              {paginatedAttendances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                    <p className="text-base-content/50">Aucun pointage trouvé</p>
                   </td>
                 </tr>
              ) : (
                paginatedAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-base-200 transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{attendance.employee_name}</span>
                      </div>
                    </td>
                    <td>{formatDate(attendance.date)}</td>
                    <td>
                      {attendance.check_in_time ? (
                        <div className="flex items-center gap-1">
                          <LogIn className="w-3 h-3 text-success" />
                          <span>{formatTime(attendance.check_in_time)}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {attendance.check_out_time ? (
                        <div className="flex items-center gap-1">
                          <LogOut className="w-3 h-3 text-warning" />
                          <span>{formatTime(attendance.check_out_time)}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {attendance.hours_worked ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{attendance.hours_worked} h</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {attendance.late_minutes > 0 ? (
                        <div className="flex items-center gap-1 text-warning">
                          <AlertCircle className="w-3 h-3" />
                          <span>{attendance.late_minutes} min</span>
                        </div>
                      ) : (
                        <span className="text-success">✓</span>
                      )}
                    </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>

        {/* Pagination */}
        {filteredAttendances.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-base-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-base-content/60 order-2 sm:order-1">
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAttendances.length)} sur {filteredAttendances.length}
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

      {/* Message d'information */}
      <div className="alert alert-info shadow-lg">
        <AlertCircle className="w-4 h-4" />
        <div>
          <span className="font-semibold">Information :</span> Les pointages sont enregistrés automatiquement. Les retards sont calculés par rapport à l'horaire théorique (8h00).
        </div>
      </div>
    </div>
  );
};

export default Attendance;