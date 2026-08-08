// src/components/Navbar.jsx - Version Complète Optimisée
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Building2, 
  Tags, 
  LogOut, 
  UserCircle, 
  Settings, 
  Warehouse, 
  ShoppingCart,
  Handshake,
  Store,
  Receipt,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Shield,
  Briefcase,
  Clock,
  Calendar,
  MapPin,
  UserPlus,
  TrendingUp,
  CreditCard,
  UsersRound,
  Crown,
  Boxes,
  AlertTriangle,
  CheckCircle,
  Search,
  HelpCircle,
  History,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  DollarSign,
  Grid3x3,
  Ruler,
  Award,
  ClipboardCheck,
  LineChart,
  MoveHorizontal,
  GraduationCap,
  BarChart3,
  RefreshCw,
  Plus,
  Calculator,
  BookOpen,
  Landmark,
  FileSpreadsheet,
  PieChart,
  Wallet,
  Banknote,
  Scale,
  ChartNoAxesColumn,
  ReceiptText,
  Notebook,
  BadgeDollarSign,
  Home,
  Info,
  AlertCircle,
  Check,
  Loader2,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  Download,
  Printer,
  FileCheck
} from 'lucide-react'

import logo from '../assets/logo.svg'
import AxiosInstance from './AxiosInstance'

// Configuration des rôles
const ROLE_GLOBAL_CONFIG = {
  pdg: { label: 'PDG', color: 'error', icon: Crown, description: 'Accès total - Toutes agences', level: 100 },
  drh: { label: 'DRH', color: 'secondary', icon: UsersRound, description: 'Ressources Humaines - Toutes agences', level: 90 },
  autre: { label: 'Utilisateur', color: 'neutral', icon: UserCircle, description: 'Compte standard', level: 50 }
}

const ROLE_AGENCE_CONFIG = {
  chef_agence: { label: "Chef d'agence", color: 'primary', icon: Store, description: 'Gestion complète de l\'agence', level: 80 },
  gestionnaire_stock: { label: 'Gestionnaire stock', color: 'info', icon: Boxes, description: 'Gestion des stocks', level: 60 },
  commercial: { label: 'Commercial', color: 'warning', icon: Handshake, description: 'Force de vente', level: 60 },
  comptable: { label: 'Comptable', color: 'success', icon: Calculator, description: 'Gestion comptable et financière', level: 70 }
}

const Navbar = ({ content, mode, toggleColorMode }) => {
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  // États
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAgencesMenuOpen, setIsAgencesMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openSections, setOpenSections] = useState({
    'TABLEAU DE BORD': true,
    'COMMERCIAL': false,
    'ACHATS': false,
    'STOCK & LOGISTIQUE': false,
    'COMPTABILITÉ & FINANCE': false,
    'RESSOURCES HUMAINES': false,
    'ADMINISTRATION': false,
    'MON ESPACE': false
  })
  
  const [userInitial, setUserInitial] = useState('')
  const [userFullName, setUserFullName] = useState('')
  const [agences, setAgences] = useState([])
  const [agenceCourante, setAgenceCourante] = useState(null)
  const [effectiveRole, setEffectiveRole] = useState('autre')
  const [roleType, setRoleType] = useState('global')
  const [userData, setUserData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [userAgencesIds, setUserAgencesIds] = useState([])
  
  // États comptabilité
  const [ecrituresEnAttente, setEcrituresEnAttente] = useState(0)
  const [facturesImpayees, setFacturesImpayees] = useState(0)
  const [tresorerie, setTresorerie] = useState(0)
  const [clotureEnCours, setClotureEnCours] = useState(false)
  const [balancesDisponibles, setBalancesDisponibles] = useState(0)
  
  // Données pour les différentes sections
  const [achatsALivrer, setAchatsALivrer] = useState(0)
  const [alertsCount, setAlertsCount] = useState(0)
  const [fournisseursCount, setFournisseursCount] = useState(0)
  const [stocksFaibles, setStocksFaibles] = useState(0)
  const [ventesImpayees, setVentesImpayees] = useState(0)
  const [absencesEnAttente, setAbsencesEnAttente] = useState(0)

  // Récupérer l'utilisateur
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  const user = getUserData()
  const userRole = user?.role_global || 'autre'
  const userEmail = user?.email || ''
  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''
  const userName = firstName || lastName || user?.username || userEmail?.split('@')[0] || 'Utilisateur'

  // Horloge
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Déterminer le rôle effectif
  const determineEffectiveRole = (userData, currentAgence) => {
    if (!userData) return { role: 'autre', type: 'global' }
    if (userData.role_global === 'pdg') return { role: 'pdg', type: 'global' }
    if (userData.role_global === 'drh') return { role: 'drh', type: 'global' }
    if (currentAgence && userData.roles_agence) {
      const roleInAgence = userData.roles_agence.find(r => r.agence_id === currentAgence.id && r.est_actif)
      if (roleInAgence) return { role: roleInAgence.role, type: 'agence' }
    }
    return { role: 'autre', type: 'global' }
  }

  const checkUserAccessToAgence = (agenceId, rolesAgence) => {
    if (!rolesAgence) return false
    return rolesAgence.some(r => r.agence_id === agenceId && r.est_actif)
  }

  const isUserComptable = (rolesAgence) => {
    if (!rolesAgence || !Array.isArray(rolesAgence)) return false
    return rolesAgence.some(r => r.role === 'comptable' && r.est_actif === true)
  }

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const agencesRes = await AxiosInstance.get('/agences/')
        const toutesLesAgences = agencesRes.data || []
        
        let userRolesAgence = []
        let userFullData = null
        
        if (user?.id) {
          const userRes = await AxiosInstance.get(`/users/${user.id}/`)
          userFullData = userRes.data
          userRolesAgence = userFullData.roles_agence || []
          
          const accessibleIds = userRolesAgence
            .filter(r => r.est_actif)
            .map(r => r.agence_id)
          setUserAgencesIds(accessibleIds)
        }
        
        const agencesAvecAcces = toutesLesAgences.map(agence => {
          const hasAccess = user?.role_global === 'pdg' || 
                           user?.role_global === 'drh' || 
                           checkUserAccessToAgence(agence.id, userRolesAgence)
          return { ...agence, hasAccess }
        })
        
        setAgences(agencesAvecAcces)
        
        const savedAgence = localStorage.getItem('AgenceCourante')
        let currentAgence = null
        
        if (savedAgence) {
          const parsed = JSON.parse(savedAgence)
          const hasAccess = user?.role_global === 'pdg' || 
                           user?.role_global === 'drh' || 
                           checkUserAccessToAgence(parsed.id, userRolesAgence)
          if (hasAccess) {
            currentAgence = parsed
          }
        }
        
        if (!currentAgence && agencesAvecAcces.length > 0) {
          const accessibleAgence = agencesAvecAcces.find(a => a.hasAccess)
          if (accessibleAgence) {
            currentAgence = accessibleAgence
            localStorage.setItem('AgenceCourante', JSON.stringify(accessibleAgence))
          } else if (agencesAvecAcces.length > 0) {
            currentAgence = agencesAvecAcces[0]
            localStorage.setItem('AgenceCourante', JSON.stringify(agencesAvecAcces[0]))
          }
        }
        
        setAgenceCourante(currentAgence)
        
        const isComptable = isUserComptable(userRolesAgence)
        const isPDGorDRH = user?.role_global === 'pdg' || user?.role_global === 'drh'
        
        if (isComptable) {
          setEffectiveRole('comptable')
          setRoleType('agence')
          setOpenSections(prev => ({
            ...prev,
            'COMPTABILITÉ & FINANCE': true
          }))
        } else if (userFullData) {
          const { role, type } = determineEffectiveRole(userFullData, currentAgence)
          setEffectiveRole(role)
          setRoleType(type)
        } else {
          setEffectiveRole(userRole)
          setRoleType('global')
        }
        
        const isComptableOrAdmin = isComptable || isPDGorDRH
        const agenceId = currentAgence?.id
        const params = (!isPDGorDRH && agenceId && isComptable) ? `?agence_id=${agenceId}` : ''
        
        if (isComptableOrAdmin) {
          try {
            const ecrituresRes = await AxiosInstance.get(`/ecritures/?status=brouillon${params}`).catch(() => ({ data: [] }))
            setEcrituresEnAttente(ecrituresRes.data?.length || 0)
            
            const facturesRes = await AxiosInstance.get(`/factures-comptables/?status=impayee${params}`).catch(() => ({ data: [] }))
            setFacturesImpayees(facturesRes.data?.length || 0)
            
            const tresorerieRes = await AxiosInstance.get(`/tresorerie/${params}`).catch(() => ({ data: { solde_final: 0 } }))
            setTresorerie(tresorerieRes.data?.solde_final || 0)
            
            const clotureRes = await AxiosInstance.get(`/clotures/?status=en_cours${params}`).catch(() => ({ data: [] }))
            setClotureEnCours((clotureRes.data?.length || 0) > 0)
            
            const balancesRes = await AxiosInstance.get(`/balances/${params}`).catch(() => ({ data: [] }))
            setBalancesDisponibles(balancesRes.data?.length || 0)
            
          } catch (e) {
            console.log('⚠️ Erreur chargement données comptables:', e)
          }
        }
        
        const [achatsRes, alertsRes, fournisseursRes, stocksRes, ventesRes, absencesRes] = await Promise.all([
          AxiosInstance.get(`/purchase-orders/?status=confirmed${params}`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/purchase-alerts/?is_active=true${params}`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/suppliers/${params}`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/stock-movements/?low_stock=true${params}`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/sale-orders/?payment_status=pending${params}`).catch(() => ({ data: [] })),
          AxiosInstance.get(`/leaves/?status=pending${params}`).catch(() => ({ data: [] }))
        ])
        
        setAchatsALivrer(achatsRes.data?.length || 0)
        setAlertsCount(alertsRes.data?.length || 0)
        setFournisseursCount(fournisseursRes.data?.length || 0)
        setStocksFaibles(stocksRes.data?.length || 0)
        setVentesImpayees(ventesRes.data?.length || 0)
        setAbsencesEnAttente(absencesRes.data?.length || 0)
        
        const notifs = []
        if (stocksRes.data?.length) {
          notifs.push({ id: 'stocks', title: 'Stock faible', message: `${stocksRes.data.length} produit(s) en rupture`, link: '/stocks', type: 'warning', time: 'maintenant' })
        }
        if (ventesRes.data?.length) {
          notifs.push({ id: 'ventes', title: 'Paiements en attente', message: `${ventesRes.data.length} vente(s) impayée(s)`, link: '/ventes', type: 'error', time: "aujourd'hui" })
        }
        if (achatsRes.data?.length) {
          notifs.push({ id: 'achats', title: 'Commandes à livrer', message: `${achatsRes.data.length} commande(s) en attente`, link: '/commandes-fournisseurs', type: 'info', time: "aujourd'hui" })
        }
        if (alertsRes.data?.length) {
          notifs.push({ id: 'alerts', title: 'Alertes fournisseurs', message: `${alertsRes.data.length} alerte(s) à traiter`, link: '/purchase-alerts', type: 'warning', time: "aujourd'hui" })
        }
        if (ecrituresEnAttente > 0) {
          notifs.push({ id: 'ecritures', title: 'Écritures en attente', message: `${ecrituresEnAttente} écriture(s) à valider`, link: '/ecritures', type: 'info', time: "aujourd'hui" })
        }
        if (facturesImpayees > 0) {
          notifs.push({ id: 'factures', title: 'Factures impayées', message: `${facturesImpayees} facture(s) impayée(s)`, link: '/factures-comptables', type: 'error', time: "aujourd'hui" })
        }
        if (absencesRes.data?.length) {
          notifs.push({ id: 'absences', title: 'Absences en attente', message: `${absencesRes.data.length} demande(s) de congé en attente`, link: '/leaves', type: 'info', time: "aujourd'hui" })
        }
        
        setNotifications(notifs)
        setNotificationCount(notifs.length)
        
      } catch (error) {
        console.error('❌ Erreur chargement:', error)
        setEffectiveRole(userRole)
        setRoleType('global')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Initiale utilisateur
  useEffect(() => {
    if (firstName && lastName) {
      setUserInitial(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase())
      setUserFullName(`${firstName} ${lastName}`)
    } else if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase())
      setUserFullName(userName)
    }
  }, [firstName, lastName, userName])

  // ============================================
  // 🚀 PERMISSIONS - NOUVELLES FONCTIONS
  // ============================================
  
  // Rôles de base
  const isPDG = effectiveRole === 'pdg' && roleType === 'global'
  const isDRH = effectiveRole === 'drh' && roleType === 'global'
  const isChefAgence = effectiveRole === 'chef_agence'
  const isGestionnaireStock = effectiveRole === 'gestionnaire_stock'
  const isCommercial = effectiveRole === 'commercial'
  const isComptable = effectiveRole === 'comptable'

  // Permissions existantes
  const canViewAgences = () => isPDG
  const canViewUsers = () => isPDG || isDRH
  const canViewSales = () => isPDG || isChefAgence || isCommercial
  const canViewPurchases = () => isPDG
  const canViewSuppliers = () => isPDG
  const canViewInventory = () => isPDG || isChefAgence || isGestionnaireStock
  const canViewDeliveries = () => isPDG || isChefAgence || isGestionnaireStock
  const canViewHR = () => isPDG || isDRH
  const canManageHR = () => isPDG || isDRH
  const canViewAdmin = () => isPDG
  const canViewComptabilite = () => isPDG || isDRH || isComptable || isChefAgence
  const canManageAccounting = () => isPDG || isDRH || isComptable
  const canViewAccountingReports = () => isPDG || isDRH || isComptable || isChefAgence

  // ============================================
  // 🔥 NOUVELLES PERMISSIONS POUR NOTES DE FRAIS
  // ============================================
  
  // ✅ Tout utilisateur connecté peut voir ses propres notes
  const canViewMyExpenses = () => {
    return true // Tous les utilisateurs authentifiés
  }

  // ✅ Peut soumettre une note de frais
  const canSubmitExpense = () => {
    // Tous les utilisateurs peuvent soumettre (sauf si restreint)
    return true
  }

  // ✅ Peut approuver les notes de son équipe
  const canApproveExpenses = () => {
    return isPDG || isDRH || isChefAgence
  }

  // ✅ Peut voir toutes les notes (pour gestion)
  const canViewAllExpenses = () => {
    return isPDG || isDRH || isComptable || isChefAgence
  }

  // ✅ Peut rembourser (comptable)
  const canPayExpenses = () => {
    return isPDG || isDRH || isComptable
  }

  // ✅ Peut gérer les notes de frais (admin)
  const canManageExpenses = () => {
    return isPDG || isDRH || isChefAgence || isComptable
  }

  // ✅ Accès à la section RH (incluant notes de frais)
  const canAccessHR = () => {
    return canViewHR() || canViewAllExpenses()
  }

  // ✅ Accès aux notes de frais dans le menu
  const canAccessExpenses = () => {
    return canViewMyExpenses() || canViewAllExpenses()
  }

  // ============================================
  // FIN PERMISSIONS
  // ============================================

  const getRoleConfig = () => {
    if (roleType === 'global') return ROLE_GLOBAL_CONFIG[effectiveRole] || ROLE_GLOBAL_CONFIG.autre
    return ROLE_AGENCE_CONFIG[effectiveRole] || ROLE_GLOBAL_CONFIG.autre
  }

  const roleConfig = getRoleConfig()
  const RoleIcon = roleConfig.icon

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const changerAgence = (agence) => {
    if (!agence.hasAccess && !isPDG && !isDRH) {
      alert(`Vous n'avez pas accès à l'agence ${agence.nom}`)
      return
    }
    
    setAgenceCourante(agence)
    localStorage.setItem('AgenceCourante', JSON.stringify(agence))
    
    if (userData) {
      const { role, type } = determineEffectiveRole(userData, agence)
      setEffectiveRole(role)
      setRoleType(type)
    }
    
    setIsAgencesMenuOpen(false)
    window.location.reload()
  }

  const logoutUser = () => {
    setIsUserMenuOpen(false)
    localStorage.removeItem('Token')
    localStorage.removeItem('User')
    localStorage.removeItem('AgenceCourante')
    navigate('/')
  }

  // ============================================
  // 📋 MENU SECTIONS - AVEC PERMISSIONS MISES À JOUR
  // ============================================
  
  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: true },
        { id: 'statistiques', text: 'Statistiques', icon: TrendingUp, path: '/statistiques', permission: true },
        { id: 'analyses', text: 'Analyses', icon: LineChart, path: '/analyses', permission: isPDG || isComptable }
      ]
    },
    {
      name: 'COMMERCIAL',
      icon: ShoppingCart,
      permission: canViewSales(),
      items: [
        { id: 'dashboard-commercial', text: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/ventes', permission: canViewSales() },
        { id: 'pos', text: 'Point de Vente', icon: ShoppingBag, path: '/point-de-vente', permission: canViewSales() },
        { id: 'ventes', text: 'Ventes', icon: ShoppingCart, path: '/ventes', permission: canViewSales(), badge: ventesImpayees },
        { id: 'clients', text: 'Clients', icon: Users, path: '/clients', permission: canViewSales() },
        { id: 'devis', text: 'Devis', icon: FileText, path: '/devis', permission: canViewSales() },
        { id: 'factures', text: 'Factures', icon: Receipt, path: '/factures', permission: canViewSales() },
        { id: 'paiements', text: 'Paiements', icon: CreditCard, path: '/paiements', permission: canViewSales() }
      ]
    },
    {
      name: 'ACHATS',
      icon: ShoppingBag,
      permission: canViewPurchases() || canViewSuppliers(),
      items: [
        { id: 'fournisseurs', text: 'Fournisseurs', icon: Building2, path: '/fournisseurs', permission: canViewSuppliers(), badge: fournisseursCount },
        { id: 'commandes', text: 'Commandes', icon: FileText, path: '/commandes-fournisseurs', permission: canViewPurchases(), badge: achatsALivrer },
        { id: 'receptions', text: 'Réceptions', icon: Truck, path: '/receptions', permission: canViewPurchases() },
        { id: 'frais', text: 'Frais de réception', icon: DollarSign, path: '/frais', permission: canViewPurchases() },
        { id: 'catalogue', text: 'Catalogue', icon: ClipboardList, path: '/supplier-catalogs', permission: canViewPurchases() },
        { id: 'prix', text: 'Historique prix', icon: History, path: '/price-history', permission: canViewPurchases() },
        { id: 'alertes', text: 'Alertes', icon: AlertTriangle, path: '/purchase-alerts', permission: canViewPurchases(), badge: alertsCount }
      ]
    },
    {
      name: 'STOCK & LOGISTIQUE',
      icon: Package,
      permission: canViewInventory() || canViewDeliveries(),
      items: [
        { id: 'categories', text: 'Catégories', icon: Tags, path: '/categories', permission: canViewInventory() },
        { id: 'produits', text: 'Produits', icon: Package, path: '/produits', permission: canViewInventory() },
        { id: 'variants', text: 'Variantes', icon: Grid3x3, path: '/variants', permission: canViewInventory() },
        { id: 'marques', text: 'Marques', icon: Award, path: '/brands', permission: canViewInventory() },
        { id: 'unites', text: 'Unités', icon: Ruler, path: '/units', permission: canViewInventory() },
        { id: 'reception', text: 'Réception stock', icon: Truck, path: '/stock-receipt', permission: canViewInventory() },
        { id: 'stocks', text: 'Stocks', icon: Boxes, path: '/stocks', permission: canViewInventory() },
        { id: 'add-stock', text: 'Ajouter du stock', icon: Package, path: '/stocks/ajouter', permission: canViewInventory() },
        { id: 'entrepots', text: 'Entrepôts', icon: Warehouse, path: '/entrepots', permission: canViewInventory() },
        { id: 'mouvements', text: 'Mouvements', icon: TrendingUp, path: '/mouvements-stock', permission: canViewInventory() },
        { id: 'transferts', text: 'Transferts', icon: MoveHorizontal, path: '/transferts', permission: canViewInventory() },
        { id: 'inventaire', text: 'Inventaire', icon: ClipboardCheck, path: '/inventaire', permission: canViewInventory() },
        { id: 'livraisons', text: 'Livraisons', icon: Truck, path: '/livraisons', permission: canViewDeliveries() }
      ]
    },
    {
      name: 'COMPTABILITÉ & FINANCE',
      icon: Calculator,
      permission: canViewComptabilite(),
      items: [
        { id: 'dashboard-compta', text: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard/comptabilite', permission: canViewComptabilite() },
        { id: 'ecritures', text: 'Écritures comptables', icon: Notebook, path: '/ecritures', permission: canManageAccounting(), badge: ecrituresEnAttente },
        { id: 'journaux', text: 'Journaux', icon: BookOpen, path: '/journaux', permission: canManageAccounting() },
        { id: 'plan-comptable', text: 'Plan comptable', icon: FileSpreadsheet, path: '/plan-comptable', permission: canManageAccounting() },
        { id: 'balances', text: 'Balances', icon: Scale, path: '/balances', permission: canViewAccountingReports(), badge: balancesDisponibles },
        { id: 'factures-comptables', text: 'Factures comptables', icon: ReceiptText, path: '/factures-comptables', permission: canViewAccountingReports(), badge: facturesImpayees },
        { id: 'reglements', text: 'Règlements', icon: Banknote, path: '/reglements', permission: canViewAccountingReports() },
        { id: 'tresorerie', text: 'Trésorerie', icon: Wallet, path: '/tresorerie', permission: canViewAccountingReports() },
        { id: 'compte-resultat', text: 'Compte de résultat', icon: ChartNoAxesColumn, path: '/compte-resultat', permission: canViewAccountingReports() },
        { id: 'bilan', text: 'Bilan comptable', icon: Landmark, path: '/bilan', permission: canViewAccountingReports() },
        { id: 'indicateurs', text: 'Indicateurs KPI', icon: PieChart, path: '/indicateurs', permission: canViewAccountingReports() },
        { id: 'cloture', text: 'Clôture comptable', icon: ClipboardCheck, path: '/cloture', permission: canManageAccounting(), badge: clotureEnCours ? 1 : 0 },
        { id: 'analyses', text: 'Analyses financières', icon: LineChart, path: '/analyses-financieres', permission: canViewAccountingReports() }
      ]
    },
    // ============================================
    // 🔥 SECTION RESSOURCES HUMAINES - MODIFIÉE
    // ============================================
    {
      name: 'RESSOURCES HUMAINES',
      icon: Users,
      permission: canAccessHR(), // 👈 MODIFIÉ: RH ou ceux qui voient les notes
      items: [
        // Gestion RH - Réservé au PDG/DRH
        { 
          id: 'departements', 
          text: 'Départements', 
          icon: Building2, 
          path: '/departments', 
          permission: canManageHR() 
        },
        { 
          id: 'postes', 
          text: 'Postes', 
          icon: Briefcase, 
          path: '/positions', 
          permission: canManageHR() 
        },
        { 
          id: 'employes', 
          text: 'Employés', 
          icon: Users, 
          path: '/employees', 
          permission: canManageHR() 
        },
        { 
          id: 'conges', 
          text: 'Congés', 
          icon: Calendar, 
          path: '/leaves', 
          permission: canManageHR(), 
          badge: absencesEnAttente 
        },
        { 
          id: 'pointage', 
          text: 'Pointage', 
          icon: ClockIcon, 
          path: '/attendance', 
          permission: canManageHR() 
        },
        { 
          id: 'paie', 
          text: 'Paie', 
          icon: DollarSign, 
          path: '/payroll', 
          permission: isPDG || canManageHR() 
        },
        { 
          id: 'recrutement', 
          text: 'Recrutements', 
          icon: UserPlus, 
          path: '/recruitments', 
          permission: canManageHR() 
        },
        { 
          id: 'candidats', 
          text: 'Candidats', 
          icon: UserPlus, 
          path: '/candidates', 
          permission: canManageHR() 
        },
        { 
          id: 'formations', 
          text: 'Formations', 
          icon: GraduationCap, 
          path: '/trainings', 
          permission: canManageHR() 
        },
        { 
          id: 'evaluations', 
          text: 'Évaluations', 
          icon: TrendingUp, 
          path: '/performance', 
          permission: canManageHR() 
        },
        // ============================================
        // 🔥 NOTES DE FRAIS - ACCÈS ÉLARGI
        // ============================================
        { 
          id: 'notes-frais', 
          text: 'Notes de frais', 
          icon: Receipt, 
          path: '/expenses', 
          permission: canAccessExpenses(), // 👈 MODIFIÉ: accessible à tous
          badge: notifications.filter(n => n.type === 'error' && n.id === 'expenses').length || 0
        },
        { 
          id: 'documents', 
          text: 'Documents RH', 
          icon: FileText, 
          path: '/documents', 
          permission: canManageHR() 
        },
        { 
          id: 'statistiques', 
          text: 'Statistiques RH', 
          icon: BarChart3, 
          path: '/stats', 
          permission: canViewHR() || isPDG 
        }
      ]
    },
    // ============================================
    // FIN SECTION RH
    // ============================================
    {
      name: 'ADMINISTRATION',
      icon: Settings,
      permission: canViewAdmin(),
      items: [
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users, path: '/utilisateurs', permission: canViewUsers() },
        { id: 'agences', text: 'Agences', icon: Building2, path: '/agences', permission: canViewAgences() },
        { id: 'roles', text: 'Rôles', icon: Shield, path: '/roles', permission: canViewUsers() },
        { id: 'audit', text: 'Journal', icon: ClipboardList, path: '/audit', permission: isPDG }
      ]
    },
    {
      name: 'MON ESPACE',
      icon: UserCircle,
      items: [
        { id: 'profile', text: 'Mon Profil', icon: UserCircle, path: '/profile', permission: true },
        { id: 'settings', text: 'Paramètres', icon: Settings, path: '/settings', permission: true },
        { id: 'support', text: 'Support', icon: HelpCircle, path: '/support', permission: true }
      ]
    }
  ]

  // Raccourci clavier recherche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const searchResults = searchQuery.length > 1 ? 
    menuSections.flatMap(section => 
      section.items.filter(item => 
        item.permission &&
        (item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ).map(item => ({ ...item, section: section.name }))
    ) : []

  const canSwitchAgence = () => {
    if (isPDG || isDRH) return agences.length > 1
    const accessibleAgences = agences.filter(a => a.hasAccess)
    return accessibleAgences.length > 1
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      
      {/* Overlay recherche */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="flex items-start justify-center pt-20 px-4" onClick={e => e.stopPropagation()}>
            <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden border border-primary/20">
              <div className="p-4 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Rechercher un menu... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-base-content placeholder:text-base-content/40"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-lg hover:bg-base-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-base-content">{item.text}</p>
                        <p className="text-xs text-base-content/40">{item.section}</p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Aucun résultat pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Tapez pour rechercher un menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation supérieure */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary/90 shadow-xl border-b-2 border-accent">
        <div className="px-4 sm:px-6 lg:pl-72">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo et menu toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
              >
                {sidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/dashboard" className="hidden lg:flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-content/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-accent">
                    <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
                  </div>
                </div>
                <div>
                  <h1 className="text-primary-content font-bold text-lg tracking-wide">SEYDY GROUP</h1>
                  <p className="text-primary-content/60 text-[10px] font-medium">ERP Management</p>
                </div>
              </Link>

              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center border-2 border-accent">
                  <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-primary-content font-bold text-sm">SEYDY GROUP</span>
              </div>
            </div>

            {/* Centre - Date/Heure */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedDate}</span>
                <div className="w-px h-4 bg-primary-content/30 mx-1"></div>
                <ClockIcon className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedTime}</span>
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              
              {/* Recherche */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title="Rechercher (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Sélecteur d'agence */}
              {agences.length > 0 && agenceCourante && (
                <div className="relative">
                  <button
                    onClick={() => canSwitchAgence() && setIsAgencesMenuOpen(!isAgencesMenuOpen)}
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      canSwitchAgence() 
                        ? 'bg-primary-content/10 text-primary-content hover:bg-primary-content/20 cursor-pointer' 
                        : 'bg-primary-content/5 text-primary-content/80 cursor-default'
                    }`}
                    disabled={!canSwitchAgence()}
                  >
                    <Store className="w-4 h-4" />
                    <span className="max-w-32 truncate">{agenceCourante.nom}</span>
                    {canSwitchAgence() && <ChevronDown className="w-3 h-3" />}
                  </button>
                  
                  {canSwitchAgence() && isAgencesMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsAgencesMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                        <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
                          <p className="text-xs font-semibold text-primary">
                            {isPDG || isDRH ? 'TOUTES LES AGENCES' : 'MES AGENCES'}
                          </p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {agences.map((agence) => {
                            const isCurrent = agenceCourante?.id === agence.id
                            const hasAccess = agence.hasAccess || isPDG || isDRH
                            
                            return (
                              <button
                                key={agence.id}
                                onClick={() => changerAgence(agence)}
                                disabled={!hasAccess && !isCurrent}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                                  isCurrent 
                                    ? 'bg-primary/10 border-l-3 border-primary' 
                                    : hasAccess 
                                      ? 'hover:bg-primary/5' 
                                      : 'opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <Store className={`w-5 h-5 ${
                                  agence.type_agence === 'principale' ? 'text-primary' : 'text-accent'
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-base-content">{agence.nom}</p>
                                    {!hasAccess && !isCurrent && (
                                      <span className="badge badge-neutral badge-xs">Non accessible</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-base-content/40">{agence.ville || agence.type_display}</p>
                                </div>
                                {isCurrent && (
                                  <CheckCircle className="w-4 h-4 text-success" />
                                )}
                                {!hasAccess && !isCurrent && (
                                  <AlertTriangle className="w-4 h-4 text-warning" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Badge rôle */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <RoleIcon className="w-4 h-4 text-primary-content" />
                <span className="text-primary-content text-xs font-medium">{roleConfig.label}</span>
                {isComptable && (
                  <span className="badge badge-success badge-xs ml-1">Comptable</span>
                )}
              </div>

              {/* Badge Trésorerie pour le comptable */}
              {isComptable && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/20 border border-success/30">
                  <Wallet className="w-3.5 h-3.5 text-success" />
                  <span className={`text-xs font-medium ${tresorerie >= 0 ? 'text-success' : 'text-error'}`}>
                    {tresorerie >= 0 ? '+' : ''}{tresorerie.toLocaleString()} FCFA
                  </span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-accent text-accent-content text-xs rounded-full flex items-center justify-center font-bold px-1">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                      <div className="p-3 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">Notifications</p>
                          {notificationCount > 0 && (
                            <span className="text-xs bg-primary-content/20 px-2 py-0.5 rounded-full">{notificationCount} nouvelle(s)</span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto divide-y divide-base-200">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              setIsNotificationsOpen(false)
                              navigate(notif.link)
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                          >
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'warning' ? 'bg-warning/20' : 
                              notif.type === 'error' ? 'bg-error/20' : 'bg-info/20'
                            }`}>
                              {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning" /> : 
                               notif.type === 'error' ? <AlertTriangle className="w-4 h-4 text-error" /> :
                               <ShoppingBag className="w-4 h-4 text-info" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-base-content">{notif.title}</p>
                              <p className="text-xs text-base-content/40">{notif.message}</p>
                              <p className="text-xs text-primary/60 mt-1">{notif.time}</p>
                            </div>
                          </button>
                        ))}
                        {notifications.length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                            <p className="text-sm text-base-content/50">Tout est bon !</p>
                            <p className="text-xs text-base-content/40">Aucune notification</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mode thème */}
              <button
                onClick={toggleColorMode}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={mode === 'dark' ? "Mode clair" : "Mode sombre"}
              >
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Menu utilisateur */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-content/10 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-content font-bold border-2 border-primary-content shadow-md">
                    {userInitial || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-content hidden sm:block" />
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-content/20 flex items-center justify-center text-xl font-bold">
                            {userInitial || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{userFullName || userName}</p>
                            <p className="text-xs text-primary-content/70 truncate">{userEmail}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className={`badge badge-${roleConfig.color} badge-sm`}>
                                {roleConfig.label}
                              </span>
                              {agenceCourante && !isPDG && !isDRH && (
                                <span className="badge badge-primary badge-sm">{agenceCourante.nom}</span>
                              )}
                              {isComptable && (
                                <span className="badge badge-success badge-sm">Comptable</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <UserCircle className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Mon profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Paramètres</span>
                        </Link>
                        <div className="border-t border-base-200 my-1"></div>
                        <button
                          onClick={logoutUser}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 transition-colors text-error"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed left-0 top-16 bottom-0 z-30
        bg-base-100 shadow-xl border-r border-primary/20
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-20'}
        hidden lg:block
      `}>
        <div className="h-full flex flex-col">
          
          {/* Logo dans la sidebar */}
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} bg-gradient-to-r from-primary/5 to-transparent`}>
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-3`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-base-content text-sm">SEYDY GROUP</h2>
                  <p className="text-xs text-base-content/50">ERP Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Profil utilisateur */}
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} ${roleConfig.color === 'error' ? 'bg-error/5' : roleConfig.color === 'primary' ? 'bg-primary/5' : 'bg-base-200'}`}>
            <div className={`flex items-center ${!sidebarOpen && 'flex-col'} gap-3`}>
              <div className="avatar placeholder">
                <div className={`bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-xl ${sidebarOpen ? 'w-12 h-12' : 'w-10 h-10'} shadow-lg ring-2 ring-primary/20`}>
                  <span className={`${sidebarOpen ? 'text-xl' : 'text-lg'} font-bold`}>{userInitial || 'U'}</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-base-content">{userFullName || userName}</p>
                  <p className="text-xs text-base-content/50 truncate">{userEmail}</p>
                  <div className={`badge badge-${roleConfig.color} badge-sm mt-1`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleConfig.label}
                  </div>
                  {isComptable && (
                    <div className="badge badge-success badge-sm mt-1 ml-1">
                      <Calculator className="w-3 h-3 mr-1" />
                      Comptable
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu de navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuSections.map((section, idx) => {
              const visibleItems = section.items.filter(item => item.permission)
              if (visibleItems.length === 0) return null
              const SectionIcon = section.icon
              const isOpen = openSections[section.name]
              const isComptaSection = section.name === 'COMPTABILITÉ & FINANCE'
              const isRHSection = section.name === 'RESSOURCES HUMAINES'
              
              return (
                <div key={idx} className="mb-1">
                  <button
                    onClick={() => handleSectionToggle(section.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${!sidebarOpen && 'justify-center'}
                      ${isOpen 
                        ? isComptaSection ? 'bg-success/10 text-success' : 
                          isRHSection ? 'bg-secondary/10 text-secondary' : 
                          'bg-primary/10 text-primary'
                        : 'text-base-content/70 hover:bg-primary/5 hover:text-primary'
                      }
                    `}
                  >
                    <SectionIcon className={`w-5 h-5 ${isOpen && isComptaSection ? 'text-success' : isOpen && isRHSection ? 'text-secondary' : isOpen ? 'text-primary' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-xs font-semibold tracking-wide uppercase">
                          {section.name}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  
                  {sidebarOpen && isOpen && (
                    <div className={`ml-6 mt-2 space-y-1 border-l-2 pl-4 ${
                      isComptaSection ? 'border-success' : 
                      isRHSection ? 'border-secondary' : 
                      'border-primary'
                    }`}>
                      {visibleItems.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = path === item.path
                        const isExpenseItem = item.id === 'notes-frais'
                        
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                              ${isActive 
                                ? isComptaSection ? 'bg-success text-success-content shadow-md' : 
                                  isRHSection ? 'bg-secondary text-secondary-content shadow-md' : 
                                  'bg-primary text-primary-content shadow-md'
                                : 'text-base-content/60 hover:bg-primary/10 hover:text-primary'
                              }
                              ${isExpenseItem && !isActive ? 'hover:bg-secondary/10 hover:text-secondary' : ''}
                            `}
                          >
                            <ItemIcon className={`w-4 h-4 ${isActive ? (isComptaSection ? 'text-success-content' : isRHSection ? 'text-secondary-content' : 'text-primary-content') : ''}`} />
                            <span className="flex-1">{item.text}</span>
                            {item.badge > 0 && (
                              <span className={`badge ${isComptaSection && isActive ? 'badge-outline badge-error' : 'badge-error'} badge-xs`}>
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-primary/20 bg-base-100">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-base-content/50">v4.0.0</span>
                </div>
                <span className="badge badge-primary badge-sm">ERP 2025</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-6">
                <div className="loading loading-spinner loading-lg text-primary w-16 h-16"></div>
                <p className="text-xl font-semibold text-base-content/70 animate-pulse">
                  Chargement de l'application...
                </p>
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      </main>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-base-100 z-50 shadow-2xl lg:hidden overflow-y-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center p-2 shadow-lg">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-primary-content font-bold text-lg">SEYDY GROUP</h2>
                    <p className="text-primary-content/70 text-xs">{roleConfig.label}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-content p-2 rounded-lg hover:bg-primary-content/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {agenceCourante && !isPDG && !isDRH && (
                <div className="bg-primary-content/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-primary-content/70" />
                    <p className="text-primary-content/70 text-xs">AGENCE ACTUELLE</p>
                  </div>
                  <p className="text-primary-content font-semibold text-sm">{agenceCourante.nom}</p>
                </div>
              )}
            </div>

            <div className="py-4 px-3 space-y-1">
              {menuSections.map((section, idx) => {
                const visibleItems = section.items.filter(item => item.permission)
                if (visibleItems.length === 0) return null
                const SectionIcon = section.icon
                const isOpen = openSections[section.name]
                const isComptaSection = section.name === 'COMPTABILITÉ & FINANCE'
                const isRHSection = section.name === 'RESSOURCES HUMAINES'
                
                return (
                  <div key={idx} className="mb-2">
                    <button
                      onClick={() => handleSectionToggle(section.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        isComptaSection ? 'hover:bg-success/10' : 
                        isRHSection ? 'hover:bg-secondary/10' : 
                        'hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className={`w-5 h-5 ${isComptaSection ? 'text-success' : isRHSection ? 'text-secondary' : 'text-primary'}`} />
                        <span className="text-xs font-bold uppercase">{section.name}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isOpen && (
                      <div className={`ml-6 mt-2 space-y-1 border-l-2 pl-4 ${
                        isComptaSection ? 'border-success' : 
                        isRHSection ? 'border-secondary' : 
                        'border-primary'
                      }`}>
                        {visibleItems.map((item) => {
                          const ItemIcon = item.icon
                          const isActive = path === item.path
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                                ${isActive 
                                  ? isComptaSection ? 'bg-success text-success-content' : 
                                    isRHSection ? 'bg-secondary text-secondary-content' : 
                                    'bg-primary text-primary-content'
                                  : 'hover:bg-primary/10'
                                }
                              `}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.text}</span>
                              {item.badge > 0 && (
                                <span className="badge badge-error badge-xs ml-auto">{item.badge > 99 ? '99+' : item.badge}</span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default Navbar