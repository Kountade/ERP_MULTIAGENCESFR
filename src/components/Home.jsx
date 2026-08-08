// src/components/Home.jsx
import React, { useEffect, useState } from 'react'
import { 
    Users, Package, ShoppingCart, TrendingUp, 
    AlertTriangle, Clock, CheckCircle, ArrowRight,
    Pill, Truck, DollarSign, Activity
} from 'lucide-react'
import AxiosInstance from './AxiosInstance'

const Home = () => {
    const [stats, setStats] = useState({
        totalProduits: 0,
        stocksFaibles: 0,
        ventesJour: 0,
        chiffreAffaires: 0
    })
    const [recentActivities, setRecentActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = localStorage.getItem('User')
        if (userData) {
            setUser(JSON.parse(userData))
        }
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            // Simuler des données pour le dashboard
            // Remplacer par vos vrais appels API
            setStats({
                totalProduits: 1247,
                stocksFaibles: 12,
                ventesJour: 43,
                chiffreAffaires: 2847.50
            })
            setRecentActivities([
                { id: 1, type: 'vente', description: 'Vente #2024-089 - Client Dupont', time: '10:30', amount: '45,80 €' },
                { id: 2, type: 'stock', description: 'Réception commande fournisseur COOPER', time: '09:15', amount: '24 unités' },
                { id: 3, type: 'ordonnance', description: 'Ordonnance validée - Dr. Martin', time: '08:45', amount: '3 produits' },
                { id: 4, type: 'alerte', description: 'Stock faible : DOLIPRANE 1000mg', time: '08:00', amount: 'Seuil critique' }
            ])
        } catch (error) {
            console.error('Erreur chargement dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const roleDisplay = {
        'gerant': 'Gérant',
        'pharmacien': 'Pharmacien',
        'preparateur': 'Préparateur'
    }[user?.role] || 'Utilisateur'

    const statCards = [
        { 
            label: 'Produits en stock', 
            value: stats.totalProduits, 
            icon: Package, 
            color: 'bg-blue-50 text-blue-600',
            change: '+12 ce mois'
        },
        { 
            label: 'Stocks faibles', 
            value: stats.stocksFaibles, 
            icon: AlertTriangle, 
            color: 'bg-amber-50 text-amber-600',
            change: 'Action requise',
            alert: true
        },
        { 
            label: 'Ventes aujourd\'hui', 
            value: stats.ventesJour, 
            icon: ShoppingCart, 
            color: 'bg-emerald-50 text-emerald-600',
            change: '+8 vs hier'
        },
        { 
            label: 'Chiffre d\'affaires', 
            value: `${stats.chiffreAffaires.toLocaleString()} €`, 
            icon: DollarSign, 
            color: 'bg-purple-50 text-purple-600',
            change: 'Aujourd\'hui'
        }
    ]

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="loading loading-spinner loading-lg text-emerald-600"></div>
                    <p className="text-gray-500">Chargement du tableau de bord...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* En-tête */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Pill className="h-8 w-8 text-emerald-600" />
                            Tableau de bord
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Bienvenue, {user?.username || 'Utilisateur'} 
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-emerald-600 font-medium">{roleDisplay}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cartes statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div 
                            key={index} 
                            className={`card bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${stat.alert ? 'border-l-4 border-l-amber-500' : ''}`}
                        >
                            <div className="card-body p-5">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs text-gray-400">{stat.change}</span>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activités récentes */}
                <div className="lg:col-span-2">
                    <div className="card bg-white shadow-sm border border-gray-100">
                        <div className="card-body p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                    Activités récentes
                                </h2>
                                <button className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                                    Voir tout <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {activity.type === 'vente' && (
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                                                </div>
                                            )}
                                            {activity.type === 'stock' && (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Truck className="h-4 w-4 text-blue-600" />
                                                </div>
                                            )}
                                            {activity.type === 'ordonnance' && (
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4 text-purple-600" />
                                                </div>
                                            )}
                                            {activity.type === 'alerte' && (
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{activity.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accès rapides et infos */}
                <div className="space-y-5">
                    {/* Accès rapides */}
                    <div className="card bg-white shadow-sm border border-gray-100">
                        <div className="card-body p-5">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                Accès rapides
                            </h2>
                            <div className="space-y-2">
                                <a href="/point-de-vente" className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                    <span className="font-medium">Nouvelle vente</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a href="/produits" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                                    <span className="font-medium">Gestion des produits</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a href="/inventaire" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                                    <span className="font-medium">Inventaire</span>
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* État de la pharmacie */}
                    <div className="card bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md">
                        <div className="card-body p-5 text-white">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                État de la pharmacie
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">Système</span>
                                    <span className="font-medium">Opérationnel</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">Dernière sauvegarde</span>
                                    <span className="font-medium">Aujourd'hui, 06:00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100">Version</span>
                                    <span className="font-medium">PharmaGest v1.0.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home