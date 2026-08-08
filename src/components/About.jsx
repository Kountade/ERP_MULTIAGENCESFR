// src/components/About.jsx (Version améliorée)
import React from 'react'

const About = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* En-tête */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-primary">
                            About Page
                        </h1>
                    </div>
                    <p className="text-base-content/80 leading-relaxed">
                        This is the about page of the application. Here you can find information about the purpose, features, and functionality of this application.
                    </p>
                </div>
            </div>

            {/* Section d'informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-md">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-2">
                            📖 Notre Mission
                        </h2>
                        <p className="text-base-content/70">
                            Fournir une solution complète et intuitive pour la gestion des cabinets médicaux.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-md">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-2">
                            🎯 Notre Vision
                        </h2>
                        <p className="text-base-content/70">
                            Simplifier la gestion administrative et médicale pour un meilleur suivi des patients.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section des fonctionnalités */}
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">
                        Fonctionnalités
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            'Gestion des patients',
                            'Planification des rendez-vous',
                            'Dossier médical électronique',
                            'Prescriptions et ordonnances',
                            'Facturation et paiements',
                            'Gestion du personnel'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-base-content/80">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Version */}
            <div className="text-center mt-8">
                <p className="text-sm text-base-content/50">
                    Version 1.0.0 | © {new Date().getFullYear()} Cabinet Médical
                </p>
            </div>
        </div>
    )
}

export default About