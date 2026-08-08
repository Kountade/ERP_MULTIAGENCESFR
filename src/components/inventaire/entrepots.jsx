// src/pages/entrepots/Entrepots.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, MapPin, Phone, Mail, User, Plus, Eye,
  Warehouse as WarehouseIcon, Package, Box, AlertCircle,
  Search, Filter, RefreshCw, ChevronRight
} from 'lucide-react';
import AxiosInstance from '../AxiosInstance';

const Entrepots = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [userAgence, setUserAgence] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Récupérer les informations de l'utilisateur connecté
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('User');
      const user = userData ? JSON.parse(userData) : null;
      const agenceCourante = JSON.parse(localStorage.getItem('AgenceCourante') || '{}');
      
      let role = 'autre';
      if (user?.role_global === 'pdg') {
        role = 'pdg';
      } else if (user?.role_global === 'drh') {
        role = 'drh';
      } else if (user?.roles_agence) {
        const currentRole = user.roles_agence.find(
          r => r.agence_id === agenceCourante.id && r.est_actif
        );
        if (currentRole) {
          role = currentRole.role;
        }
      }
      
      return { user, role, agenceCourante };
    } catch {
      return { user: null, role: 'autre', agenceCourante: {} };
    }
  };

  // Récupérer les entrepôts
  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get('/warehouses/');
      
      // Les entrepôts sont déjà filtrés par le backend selon l'agence de l'utilisateur
      setWarehouses(response.data);
      
      // Récupérer les infos utilisateur pour l'affichage
      const { agenceCourante, role } = getUserInfo();
      setUserAgence(agenceCourante);
      setUserRole(role);
      
    } catch (error) {
      console.error('Erreur lors du chargement des entrepôts:', error);
      setError('Impossible de charger les entrepôts. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Filtrer les entrepôts
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = searchTerm === '' || 
      warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || warehouse.warehouse_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Types d'entrepôts pour le filtre
  const warehouseTypes = [
    { value: 'main', label: 'Entrepôt principal', icon: Building2 },
    { value: 'secondary', label: 'Entrepôt secondaire', icon: WarehouseIcon },
    { value: 'store', label: 'Magasin', icon: Package },
    { value: 'transit', label: 'Zone de transit', icon: Box },
    { value: 'returns', label: 'Zone de retour', icon: AlertCircle },
    { value: 'quarantine', label: 'Zone de quarantaine', icon: AlertCircle },
  ];

  const getTypeLabel = (type) => {
    const found = warehouseTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeIcon = (type) => {
    const found = warehouseTypes.find(t => t.value === type);
    const Icon = found?.icon || WarehouseIcon;
    return <Icon className="w-4 h-4" />;
  };

  // Vérifier si l'utilisateur peut créer un entrepôt
  const canCreateWarehouse = () => {
    return userRole === 'pdg' || userRole === 'drh' || userRole === 'chef_agence';
  };

  return (
    <div className="p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <WarehouseIcon className="w-7 h-7 text-primary" />
            Entrepôts
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gestion des entrepôts et magasins
          </p>
          {userAgence?.nom && (
            <div className="mt-2 text-xs text-base-content/50 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Agence : <span className="font-semibold text-primary">{userAgence.nom}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-base-content/40">
                {userRole === 'chef_agence' && 'Chef d\'agence'}
                {userRole === 'pdg' && 'PDG - Accès total'}
                {userRole === 'drh' && 'DRH'}
              </span>
            </div>
          )}
        </div>
        
        {canCreateWarehouse() && (
          <Link to="/entrepots/nouveau" className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Nouvel entrepôt
          </Link>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-base-content/60" />
              <span className="font-medium">Filtres</span>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchWarehouses} className="btn btn-sm btn-outline gap-1">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Recherche</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Nom, code ou ville..."
                  className="input input-bordered w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Type d'entrepôt</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {warehouseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* États de chargement et erreur */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste des entrepôts */}
      {!loading && !error && (
        <>
          {filteredWarehouses.length === 0 ? (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body text-center py-12">
                <WarehouseIcon className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                <h3 className="text-lg font-medium">Aucun entrepôt trouvé</h3>
                <p className="text-base-content/60">
                  {searchTerm || selectedType 
                    ? "Aucun entrepôt ne correspond à vos critères"
                    : "Aucun entrepôt n'est configuré pour votre agence"}
                </p>
                {(searchTerm || selectedType) && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedType(''); }}
                    className="btn btn-outline btn-sm w-fit mx-auto mt-2"
                  >
                    Effacer les filtres
                  </button>
                )}
                {canCreateWarehouse() && !searchTerm && !selectedType && (
                  <Link to="/entrepots/nouveau" className="btn btn-primary btn-sm w-fit mx-auto mt-2">
                    Créer un entrepôt
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <div key={warehouse.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    {/* En-tête de la carte */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getTypeIcon(warehouse.warehouse_type)}
                        </div>
                        <div>
                          <h2 className="card-title text-lg">{warehouse.name}</h2>
                          <p className="text-xs font-mono text-base-content/50">{warehouse.code}</p>
                        </div>
                      </div>
                      <div className="badge badge-primary badge-sm">
                        {getTypeLabel(warehouse.warehouse_type)}
                      </div>
                    </div>

                    {/* Informations d'adresse */}
                    <div className="space-y-2 mt-2 text-sm">
                      <div className="flex items-start gap-2 text-base-content/70">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {warehouse.address}<br />
                          {warehouse.postal_code} {warehouse.city}<br />
                          {warehouse.country}
                        </span>
                      </div>
                      
                      {warehouse.phone && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <Phone className="w-4 h-4" />
                          <span>{warehouse.phone}</span>
                        </div>
                      )}
                      
                      {warehouse.email && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm truncate">{warehouse.email}</span>
                        </div>
                      )}
                      
                      {warehouse.manager && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <User className="w-4 h-4" />
                          <span>Responsable : {warehouse.manager.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Statistiques */}
                    <div className="divider my-2"></div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1 text-base-content/60">
                        <Package className="w-4 h-4" />
                        <span>{warehouse.locations_count || 0} emplacements</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`badge badge-sm ${warehouse.is_active ? 'badge-success' : 'badge-error'}`}>
                          {warehouse.is_active ? 'Actif' : 'Inactif'}
                        </div>
                        {warehouse.is_default && (
                          <div className="badge badge-sm badge-info">Défaut</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card-actions justify-end mt-4">
                      <Link 
                        to={`/entrepots/${warehouse.id}`} 
                        className="btn btn-sm btn-outline gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Légende */}
      {!loading && !error && filteredWarehouses.length > 0 && (
        <div className="mt-6 p-3 bg-base-200 rounded-lg text-xs text-base-content/60">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Entrepôt principal</span>
            <span className="flex items-center gap-1"><WarehouseIcon className="w-3 h-3" /> Entrepôt secondaire</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Magasin</span>
            <span className="flex items-center gap-1"><Box className="w-3 h-3" /> Zone de transit</span>
            <span className="flex items-center gap-1 text-success">● Actif</span>
            <span className="flex items-center gap-1 text-info">● Entrepôt par défaut</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entrepots;