// src/components/Register.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { 
    UserPlus, Mail, Lock, User, Phone, Building2, Store, 
    Crown, Users, Briefcase, AlertCircle, ArrowRight
} from 'lucide-react'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyMessage from './Message'
import AxiosInstance from './AxiosInstance'

// Configuration des rôles globaux
const ROLES_GLOBAUX = [
    { value: 'pdg', label: 'PDG', description: 'Accès total à toutes les agences', level: 100, icon: '👑', requiresApproval: true },
    { value: 'drh', label: 'DRH', description: 'Gestion RH toutes agences', level: 90, icon: '👥', requiresApproval: true },
    { value: 'autre', label: 'Autre', description: 'Rôle spécifique par agence', level: 50, icon: '👤' }
]

// Configuration des rôles par agence
const ROLES_AGENCE = [
    { value: 'chef_agence', label: "Chef d'agence", description: "Gestion complète de l'agence", icon: '👔' },
    { value: 'gestionnaire_stock', label: 'Gestionnaire de stock', description: 'Gestion des stocks', icon: '📦' },
    { value: 'commercial', label: 'Commercial', description: 'Gestion commerciale', icon: '🤝' }
]

const Register = () => {
    const navigate = useNavigate()

    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('error')
    const [isLoading, setIsLoading] = useState(false)
    const [agences, setAgences] = useState([])
    const [rolesAgenceDisponibles, setRolesAgenceDisponibles] = useState([])
    const [loadingAgences, setLoadingAgences] = useState(false)

    // Charger la liste des agences
    useEffect(() => {
        fetchAgencesPubliques()
    }, [])

    const fetchAgencesPubliques = async () => {
        try {
            const response = await AxiosInstance.get('agences/?est_active=true')
            setAgences(response.data)
        } catch (error) {
            console.error('Erreur chargement agences publiques:', error)
        }
    }

    // Mettre à jour les rôles disponibles quand l'agence change
    const updateRolesDisponibles = async (agenceId) => {
        if (!agenceId) {
            setRolesAgenceDisponibles([])
            return
        }
        
        setLoadingAgences(true)
        try {
            const response = await AxiosInstance.get(`agences/${agenceId}/roles_disponibles/`)
            const rolesData = response.data.roles
            const rolesFiltres = ROLES_AGENCE.filter(role => 
                rolesData.some(r => r.value === role.value)
            )
            setRolesAgenceDisponibles(rolesFiltres)
        } catch (error) {
            console.error('Erreur chargement rôles:', error)
            setRolesAgenceDisponibles([])
        } finally {
            setLoadingAgences(false)
        }
    }

    // Schéma de validation
    const schema = yup.object({
        email: yup.string().email('Email invalide').required('Email requis'),
        password: yup.string().required('Mot de passe requis').min(8, '8 caractères minimum'),
        password2: yup.string().required('Confirmation requise').oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
        role_global: yup.string().required('Rôle global requis'),
        agence_id: yup.number().when('role_global', {
            is: (val) => val === 'autre',
            then: (schema) => schema.required('L\'agence est obligatoire').typeError('Agence requise'),
            otherwise: (schema) => schema.nullable().notRequired()
        }),
        role_agence: yup.string().when('role_global', {
            is: (val) => val === 'autre',
            then: (schema) => schema.required('Le rôle dans l\'agence est obligatoire'),
            otherwise: (schema) => schema.nullable().notRequired()
        }),
        first_name: yup.string().optional(),
        last_name: yup.string().optional(),
        phone: yup.string().optional()
    })

    const { handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { 
            role_global: 'autre',
            first_name: '', 
            last_name: '', 
            phone: '',
            agence_id: '',
            role_agence: ''
        }
    })

    const watchedRoleGlobal = watch('role_global')
    const watchedAgenceId = watch('agence_id')

    // Mettre à jour les rôles disponibles quand l'agence change
    useEffect(() => {
        if (watchedAgenceId && watchedRoleGlobal === 'autre') {
            updateRolesDisponibles(watchedAgenceId)
        }
    }, [watchedAgenceId, watchedRoleGlobal])

    // Réinitialiser le rôle agence quand l'agence change
    useEffect(() => {
        setValue('role_agence', '')
    }, [watchedAgenceId, setValue])

    const submission = (data) => {
        setIsLoading(true)
        setShowMessage(false)

        const { password2, ...submitData } = data
        
        // Nettoyer les données inutiles
        if (submitData.role_global !== 'autre') {
            delete submitData.agence_id
            delete submitData.role_agence
        }

        console.log('📝 Données d\'inscription:', submitData)

        AxiosInstance.post(`register/`, submitData)
            .then((response) => {
                const roleInfo = ROLES_GLOBAUX.find(r => r.value === data.role_global)
                const message = roleInfo?.requiresApproval 
                    ? '✅ Inscription réussie ! En attente de validation par l\'administrateur.'
                    : '✅ Inscription réussie ! Vous pouvez maintenant vous connecter.'
                
                setMessageText(message)
                setMessageType('success')
                setShowMessage(true)
                
                setTimeout(() => navigate('/'), 3000)
            })
            .catch((error) => {
                console.error('❌ Erreur inscription:', error)
                let errorMessage = 'Échec de l\'inscription'
                
                if (error.response?.data?.email) {
                    errorMessage = 'Cet email est déjà utilisé'
                } else if (error.response?.data?.agence_id) {
                    errorMessage = 'Agence invalide'
                } else if (error.response?.data?.role_agence) {
                    errorMessage = error.response.data.role_agence[0]
                } else if (error.response?.data?.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors[0]
                } else if (error.request) {
                    errorMessage = 'Impossible de contacter le serveur'
                }
                
                setMessageText(errorMessage)
                setMessageType('error')
                setShowMessage(true)
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <div className="min-h-screen bg-base-200 py-8 px-4">
            {/* Fond décoratif avec les couleurs du thème */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
            </div>
            
            {/* Message de notification */}
            {showMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <MyMessage 
                        text={messageText} 
                        color={messageType === 'success' ? 'var(--color-success)' : 'var(--color-error)'} 
                    />
                </div>
            )}

            <div className="w-full max-w-2xl mx-auto relative z-10">
                <div className="card bg-base-100 shadow-xl border border-primary/20">
                    <div className="card-body p-6">
                        {/* En-tête AFRITEXIA */}
                        <div className="text-center mb-6">
                            <div className="inline-flex justify-center items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-base-content">AFRITEXIA</h1>
                            <div className="h-0.5 w-12 bg-primary mx-auto my-2"></div>
                            <p className="text-sm text-base-content/60">Création de compte</p>
                        </div>

                        <form onSubmit={handleSubmit(submission)}>
                            {/* Email */}
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                        <Mail className="h-4 w-4 text-primary" />
                                        Email
                                    </span>
                                </label>
                                <MyTextField
                                    name="email"
                                    control={control}
                                    type="email"
                                    placeholder="votre@email.com"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Mots de passe */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                            <Lock className="h-4 w-4 text-primary" />
                                            Mot de passe
                                        </span>
                                    </label>
                                    <MyPassField
                                        name="password"
                                        control={control}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                            <Lock className="h-4 w-4 text-primary" />
                                            Confirmation
                                        </span>
                                    </label>
                                    <MyPassField
                                        name="password2"
                                        control={control}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-medium text-base-content">Prénom</span>
                                    </label>
                                    <MyTextField
                                        name="first_name"
                                        control={control}
                                        type="text"
                                        placeholder="Prénom"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-medium text-base-content">Nom</span>
                                    </label>
                                    <MyTextField
                                        name="last_name"
                                        control={control}
                                        type="text"
                                        placeholder="Nom"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                            <Phone className="h-4 w-4 text-primary" />
                                            Téléphone
                                        </span>
                                    </label>
                                    <MyTextField
                                        name="phone"
                                        control={control}
                                        type="tel"
                                        placeholder="+221 XX XXX XX XX"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="divider text-base-content/40 text-xs">INFORMATIONS PROFESSIONNELLES</div>

                            {/* Rôle global */}
                            <div className="form-control w-full mb-4">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                        <Crown className="h-4 w-4 text-primary" />
                                        Type d'utilisateur
                                    </span>
                                </label>
                                <select
                                    {...control.register('role_global')}
                                    disabled={isLoading}
                                    className="select select-bordered w-full focus:border-primary focus:outline-none"
                                >
                                    {ROLES_GLOBAUX.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.icon} {role.label} - {role.description}
                                        </option>
                                    ))}
                                </select>
                                {errors.role_global && (
                                    <span className="text-error text-xs mt-1">{errors.role_global.message}</span>
                                )}
                            </div>

                            {/* Champs spécifiques pour les utilisateurs d'agence */}
                            {watchedRoleGlobal === 'autre' && (
                                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                                <Store className="h-4 w-4 text-primary" />
                                                Agence
                                            </span>
                                        </label>
                                        <select
                                            {...control.register('agence_id')}
                                            disabled={isLoading || agences.length === 0}
                                            className="select select-bordered w-full focus:border-primary focus:outline-none"
                                        >
                                            <option value="">Sélectionner une agence</option>
                                            {agences.map((agence) => (
                                                <option key={agence.id} value={agence.id}>
                                                    🏢 {agence.nom} ({agence.type_display})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.agence_id && (
                                            <span className="text-error text-xs mt-1">{errors.agence_id.message}</span>
                                        )}
                                    </div>

                                    {watchedAgenceId && (
                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text font-medium flex items-center gap-2 text-base-content">
                                                    <Briefcase className="h-4 w-4 text-primary" />
                                                    Rôle dans l'agence
                                                </span>
                                            </label>
                                            <select
                                                {...control.register('role_agence')}
                                                disabled={isLoading || loadingAgences || rolesAgenceDisponibles.length === 0}
                                                className="select select-bordered w-full focus:border-primary focus:outline-none"
                                            >
                                                <option value="">Sélectionner un rôle</option>
                                                {rolesAgenceDisponibles.map((role) => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.icon} {role.label} - {role.description}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingAgences && (
                                                <span className="text-info text-xs mt-1 flex items-center gap-1">
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                    Chargement des rôles...
                                                </span>
                                            )}
                                            {errors.role_agence && (
                                                <span className="text-error text-xs mt-1">{errors.role_agence.message}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Info pour PDG/DRH */}
                            {(watchedRoleGlobal === 'pdg' || watchedRoleGlobal === 'drh') && (
                                <div className="alert bg-info/10 border border-info/30 text-info-content mt-4">
                                    <AlertCircle className="h-5 w-5 text-info" />
                                    <span className="text-sm">
                                        {watchedRoleGlobal === 'pdg' 
                                            ? '👑 Le PDG aura accès à toutes les agences et pourra en créer de nouvelles.'
                                            : '👥 Le DRH pourra gérer les ressources humaines de toutes les agences.'}
                                    </span>
                                </div>
                            )}

                            {/* Boutons d'action */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn bg-primary text-primary-content border-primary hover:bg-primary/90 flex-1"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Inscription en cours...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-5 w-5" />
                                            S'inscrire
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Séparateur */}
                            <div className="divider text-base-content/40 text-xs">OU</div>

                            {/* Lien connexion */}
                            <div className="text-center">
                                <Link to="/" className="text-sm text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1 transition-all">
                                    Déjà un compte ?
                                    <span className="font-semibold">Se connecter</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>

                            {/* Mentions légales */}
                            <p className="text-center text-xs text-base-content/40 mt-4">
                                En créant un compte, vous acceptez nos conditions d'utilisation
                            </p>
                        </form>

                        {/* Footer */}
                        <div className="text-center pt-4 mt-4 border-t border-base-200">
                            <p className="text-xs text-base-content/40">
                                © 2025 AFRITEXIA ERP
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default Register