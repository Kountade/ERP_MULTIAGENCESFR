import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Shield,
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  ChevronRight,
  Globe,
  Award,
  Clock,
  Zap,
  HeartHandshake,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageType, setMessageType] = useState('error')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentYear] = useState(new Date().getFullYear())

  // Charger l'email sauvegardé
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (data) => {
    setLoading(true)
    setShowMessage(false)

    try {
      const response = await AxiosInstance.post('login/', {
        email: data.email,
        password: data.password,
      })
      
      localStorage.setItem('Token', response.data.token)
      localStorage.setItem('User', JSON.stringify(response.data.user))
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      setMessageText('Connexion réussie ! Redirection en cours...')
      setMessageType('success')
      setShowMessage(true)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      let errorMessage = 'Échec de connexion. Veuillez réessayer.'
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect'
        } else if (error.response.status === 403) {
          errorMessage = 'Compte désactivé. Contactez l\'administrateur.'
        } else if (error.response.status === 429) {
          errorMessage = 'Trop de tentatives. Veuillez patienter 5 minutes.'
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.request) {
        errorMessage = 'Serveur inaccessible. Vérifiez votre connexion internet.'
      }
      
      setMessageText(errorMessage)
      setMessageType('error')
      setShowMessage(true)
      
      setTimeout(() => {
        setShowMessage(false)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  // Liste des fonctionnalités avec icônes - utilisant les couleurs du thème
  const features = [
    { icon: Building2, text: 'Gestion multi-agences' },
    { icon: Users, text: 'Rôles et permissions granulaires' },
    { icon: LayoutDashboard, text: 'Dashboard personnalisé' },
    { icon: TrendingUp, text: 'Reporting et analytics avancés' },
    { icon: Shield, text: 'Sécurité des données' },
    { icon: Globe, text: 'Accès multi-sites' }
  ]

  // Statistiques
  const stats = [
    { value: '500+', label: 'Entreprises clientes', icon: Building2 },
    { value: '99.9%', label: 'Disponibilité', icon: Zap },
    { value: '24/7', label: 'Support technique', icon: Clock },
    { value: '15+', label: "Années d'expertise", icon: Award }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      {/* Overlay avec les couleurs du thème */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-200/98 via-base-200/95 to-base-300/98"></div>
      
      {/* Pattern décoratif avec couleurs du thème */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full filter blur-3xl"></div>
      </div>

      {/* Message Alert amélioré */}
      {showMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md animate-slideDown">
          <div className={`alert shadow-xl border-l-4 ${
            messageType === 'error' 
              ? 'alert-error border-l-error' 
              : 'alert-success border-l-success'
          }`}>
            <div className="flex items-center gap-3">
              {messageType === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{messageText}</span>
            </div>
            <button 
              onClick={() => setShowMessage(false)} 
              className="btn btn-sm btn-ghost btn-circle"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteneur principal */}
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-base-100 min-h-[700px] backdrop-blur-sm">
          
          {/* Colonne gauche - Section branding avec couleurs du thème */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
            
            {/* Éléments décoratifs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-content/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-content/5 rounded-full filter blur-3xl"></div>
            
            <div className="relative z-10 p-10 xl:p-12 text-primary-content flex flex-col justify-between h-full">
              
              {/* En-tête de la colonne gauche */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary-content/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary-content" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">SEYDI GROUP</h1>
                    <p className="text-xs opacity-80">Enterprise Resource Planning</p>
                  </div>
                </div>
                
                <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                  Gérez votre entreprise
                  <span className="text-primary-content/90"> en toute simplicité</span>
                </h2>
                
                <p className="text-base opacity-90 leading-relaxed mb-8">
                  Solution ERP complète pour optimiser la gestion multi-agences, 
                  améliorer la productivité et booster votre croissance.
                </p>
              </div>
              
              {/* Features avec icônes */}
              <div className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-primary-content/10 flex items-center justify-center group-hover:bg-primary-content/30 transition-all duration-300">
                      <feature.icon className="w-4 h-4 text-primary-content" />
                    </div>
                    <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary-content/10">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <stat.icon className="w-4 h-4 text-primary-content" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-xs opacity-70">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Citation */}
              <div className="mt-6 pt-6 border-t border-primary-content/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary-content mt-0.5" />
                  <div>
                    <p className="text-xs italic opacity-80 leading-relaxed">
                      "L'excellence n'est pas un acte, mais une habitude. Notre engagement envers la qualité 
                      fait la différence."
                    </p>
                    <p className="text-xs font-medium mt-2 text-primary-content">
                      - Direction SEYDI GROUP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire */}
          <div className="flex items-center justify-center p-6 md:p-8 xl:p-12 bg-base-100">
            <div className="w-full max-w-md">
              
              {/* Indicateur de progression */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-8 h-0.5 bg-base-300"></div>
                  <div className="w-2 h-2 rounded-full bg-base-300"></div>
                  <div className="w-8 h-0.5 bg-base-300"></div>
                  <div className="w-2 h-2 rounded-full bg-base-300"></div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
                
                {/* En-tête du formulaire */}
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg relative group">
                    <div className="absolute inset-0 bg-primary-content/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img src={logo} alt="Logo SEYDI GROUP" className="w-12 h-12 object-contain relative z-10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-base-content">
                      Bienvenue
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                      Connectez-vous pour accéder à votre espace
                    </p>
                  </div>
                </div>

                {/* Champ Email */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Email professionnel
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <input
                      type="email"
                      placeholder="exemple@sey digroup.com"
                      className={`input input-bordered w-full pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ${
                        errors.email ? 'input-error' : ''
                      }`}
                      {...register('email', {
                        required: "L'email est requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Format d'email invalide"
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error flex items-center gap-1 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Champ Password */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Mot de passe
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Entrez votre mot de passe"
                      className={`input input-bordered w-full pl-10 pr-12 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 ${
                        errors.password ? 'input-error' : ''
                      }`}
                      {...register('password', {
                        required: "Le mot de passe est requis",
                        minLength: {
                          value: 6,
                          message: "Minimum 6 caractères"
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-base-content/40 hover:text-base-content/60 transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-base-content/40 hover:text-base-content/60 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error flex items-center gap-1 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Options supplémentaires */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-base-300 checked:bg-primary checked:border-primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-base-content/60">
                      Se souvenir de moi
                    </span>
                  </label>
                  
                  <Link 
                    to="/request/password_reset" 
                    className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-200 flex items-center gap-1"
                  >
                    Mot de passe oublié ?
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full h-12 bg-primary hover:bg-primary/90 text-primary-content border-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Connexion en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Se connecter</span>
                    </div>
                  )}
                </button>

                {/* Séparateur élégant */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-base-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-base-100 text-base-content/40">
                      ou
                    </span>
                  </div>
                </div>

                {/* Section création de compte */}
                <div className="text-center space-y-3">
                  <p className="text-sm text-base-content/60">
                    Nouveau chez SEYDI GROUP ?
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-content transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </div>

                {/* Section sécurité */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3 h-3 text-success" />
                  <span className="text-xs text-base-content/40">
                    Connexion sécurisée - Vos données sont protégées
                  </span>
                </div>

                {/* Footer */}
                <div className="text-center pt-4">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <Link to="/terms" className="text-xs text-base-content/40 hover:text-primary transition-colors">
                      Conditions d'utilisation
                    </Link>
                    <span className="text-xs text-base-content/40">•</span>
                    <Link to="/privacy" className="text-xs text-base-content/40 hover:text-primary transition-colors">
                      Confidentialité
                    </Link>
                    <span className="text-xs text-base-content/40">•</span>
                    <Link to="/support" className="text-xs text-base-content/40 hover:text-primary transition-colors">
                      Support
                    </Link>
                  </div>
                  <p className="text-xs text-base-content/40">
                    © {currentYear} SEYDI GROUP – ERP Multi-Agences. Tous droits réservés.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login