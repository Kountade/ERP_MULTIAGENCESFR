// src/components/PasswordResetRequest.jsx (Version simple)
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import MyTextField from './forms/MyTextField'
import MyButton from './forms/MyButton'
import MyMessage from './Message'
import AxiosInstance from './AxiosInstance'

const PasswordResetRequest = () => {
    const navigate = useNavigate()
    const { handleSubmit, control } = useForm()
    const [ShowMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(false)

    const submission = (data) => {
        setLoading(true)
        
        AxiosInstance.post(`api/password_reset/`, {
            email: data.email,
        })
        .then(() => {
            setShowMessage(true)
            setTimeout(() => navigate('/'), 5000)
        })
        .catch(() => {
            setShowMessage(true)
            setTimeout(() => navigate('/'), 5000)
        })
        .finally(() => setLoading(false))
    }
    
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            {ShowMessage && (
                <div className="fixed top-4 right-4 z-50">
                    <MyMessage 
                        text="Si votre email existe, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe."
                        color="#69C9AB" 
                    />
                </div>
            )}
            
            <form onSubmit={handleSubmit(submission)} className="w-full max-w-md">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl justify-center mb-4">
                            Mot de passe oublié
                        </h2>
                        
                        <p className="text-sm text-center text-base-content/60 mb-4">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </p>

                        <MyTextField
                            label="Email"
                            name="email"
                            control={control}
                            required
                        />

                        <MyButton 
                            label={loading ? "Envoi..." : "Envoyer"}
                            type="submit"
                            disabled={loading}
                        />

                        <Link to="/login" className="link link-primary text-sm text-center mt-2">
                            ← Retour à la connexion
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PasswordResetRequest