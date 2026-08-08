// src/components/PasswordReset.jsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import MyMessage from './Message'
import AxiosInstance from './AxiosInstance'

const PasswordReset = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    console.log('Token reçu:', token)
    
    const { handleSubmit, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            password: '',
            password2: ''
        }
    })
    
    const [ShowMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('success')

    // Vérifier si les mots de passe correspondent
    const password = watch('password')
    const password2 = watch('password2')
    const passwordsMatch = password === password2 && password !== ''

    const submission = (data) => {
        setLoading(true)
        
        // Vérification supplémentaire
        if (data.password !== data.password2) {
            setMessageText('Les mots de passe ne correspondent pas')
            setMessageType('error')
            setShowMessage(true)
            setLoading(false)
            setTimeout(() => setShowMessage(false), 5000)
            return
        }

        AxiosInstance.post(`api/password_reset/confirm/`, {
            password: data.password,
            token: token,
        })
        .then((response) => {
            console.log('✅ Réinitialisation réussie:', response)
            setMessageText('Votre mot de passe a été réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion dans quelques secondes.')
            setMessageType('success')
            setShowMessage(true)
            
            setTimeout(() => {
                navigate('/')
            }, 6000)
        })
        .catch((error) => {
            console.error('❌ Erreur de réinitialisation:', error)
            
            if (error.response) {
                if (error.response.status === 400) {
                    setMessageText('Token invalide ou expiré. Veuillez refaire une demande de réinitialisation.')
                } else if (error.response.data && error.response.data.error) {
                    setMessageText(error.response.data.error)
                } else {
                    setMessageText('Échec de la réinitialisation. Veuillez réessayer.')
                }
            } else if (error.request) {
                setMessageText('Impossible de contacter le serveur. Vérifiez votre connexion.')
            } else {
                setMessageText('Une erreur est survenue. Veuillez réessayer.')
            }
            
            setMessageType('error')
            setShowMessage(true)
            setTimeout(() => setShowMessage(false), 5000)
        })
        .finally(() => {
            setLoading(false)
        })
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4">
            {/* Message de notification */}
            {ShowMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <MyMessage 
                        text={messageText} 
                        color={messageType === 'success' ? '#69C9AB' : '#EC5A76'}
                        type={messageType}
                    />
                </div>
            )}
            
            {/* Formulaire de réinitialisation */}
            <form onSubmit={handleSubmit(submission)} className="w-full max-w-md">
                <div className="card w-full bg-base-100 shadow-2xl">
                    <div className="card-body p-8">
                        {/* Titre */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Réinitialisation
                            </h2>
                            <p className="text-base-content/60 mt-2">
                                Créez un nouveau mot de passe
                            </p>
                        </div>

                        {/* Nouveau mot de passe */}
                        <div className="form-control mb-4">
                            <MyPassField
                                label="Nouveau mot de passe"
                                name="password"
                                control={control}
                                placeholder="Entrez votre nouveau mot de passe"
                                required
                                rules={{ 
                                    required: "Le mot de passe est requis",
                                    minLength: {
                                        value: 6,
                                        message: "Le mot de passe doit contenir au moins 6 caractères"
                                    }
                                }}
                            />
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div className="form-control mb-4">
                            <MyPassField
                                label="Confirmer le mot de passe"
                                name="password2"
                                control={control}
                                placeholder="Confirmez votre nouveau mot de passe"
                                required
                                rules={{ 
                                    required: "Veuillez confirmer votre mot de passe",
                                    validate: (value) => value === password || "Les mots de passe ne correspondent pas"
                                }}
                            />
                        </div>

                        {/* Indicateur de correspondance des mots de passe */}
                        {password && password2 && (
                            <div className="mb-4">
                                {passwordsMatch ? (
                                    <div className="flex items-center gap-2 text-success text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Les mots de passe correspondent</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-error text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Les mots de passe ne correspondent pas</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Force du mot de passe (optionnel) */}
                        {password && !passwordsMatch && (
                            <div className="mb-4">
                                <PasswordStrengthIndicator password={password} />
                            </div>
                        )}

                        {/* Bouton de réinitialisation */}
                        <div className="form-control mt-2">
                            <MyButton 
                                label={loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={loading || (password && password2 && !passwordsMatch)}
                            />
                        </div>

                        {/* Lien de retour */}
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="link link-secondary text-sm"
                            >
                                ← Retour à la connexion
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Animation styles */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

// Composant indicateur de force du mot de passe
function PasswordStrengthIndicator({ password }) {
    const getStrength = () => {
        let strength = 0
        if (password.length >= 8) strength++
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
        if (password.match(/[0-9]/)) strength++
        if (password.match(/[^a-zA-Z0-9]/)) strength++
        return strength
    }

    const strength = getStrength()
    const strengthText = ['Très faible', 'Faible', 'Moyen', 'Fort']
    const strengthColors = ['bg-error', 'bg-warning', 'bg-info', 'bg-success']
    const strengthTextColors = ['text-error', 'text-warning', 'text-info', 'text-success']

    if (password.length === 0) return null

    return (
        <div className="w-full">
            <div className="flex gap-1 h-1.5 mb-2">
                {[0, 1, 2, 3].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                            level < strength ? strengthColors[strength - 1] : 'bg-base-300'
                        }`}
                    />
                ))}
            </div>
            <p className={`text-xs ${strengthTextColors[strength - 1] || 'text-base-content/60'}`}>
                Force : {strengthText[strength - 1] || 'Très faible'}
            </p>
        </div>
    )
}

export default PasswordReset