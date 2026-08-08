// src/components/sales/DashboardCommercial.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ShoppingCart, DollarSign, TrendingUp, Clock, AlertCircle,
  RefreshCw, Calendar, Users, FileText, CreditCard, Receipt,
  Package, CheckCircle, XCircle, Wallet, BarChart3, PieChart,
  ArrowUp, ArrowDown, Eye, Printer, Download, Filter
} from 'lucide-react'

const DashboardCommercial = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentVentes, setRecentVentes] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('today') // today, week, month, year

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [dashboardRes, ventesRes, topProductsRes] = await Promise.all([
        AxiosInstance.get('/dashboard/ventes/'),
        AxiosInstance.get('/ventes/?ordering=-date_vente&limit=5'),
        AxiosInstance.get('/dashboard/top-products/').catch(() => ({ data: [] }))
      ])
      setStats(dashboardRes.data)
      setRecentVentes(ventesRes.data || [])
      setTopProducts(topProductsRes.data || [])
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatPrice = (price) => {
    if (!price) return '0 FCFA'
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  // Cartes principales
  const mainCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats?.total_ca),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      border: 'border-green-200'
    },
    {
      title: 'CA du jour',
      value: formatPrice(stats?.ca_jour),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      border: 'border-blue-200'
    },
    {
      title: 'Ventes en attente',
      value: stats?.ventes_en_attente || 0,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      border: 'border-orange-200'
    },
    {
      title: 'Impayés',
      value: formatPrice(stats?.impayes),
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      border: 'border-red-200'
    }
  ]

  // Cartes secondaires
  const secondaryCards = [
    {
      title: 'Total ventes',
      value: formatNumber(stats?.total_ventes),
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/ventes'
    },
    {
      title: 'Ventes complétées',
      value: formatNumber(stats?.ventes_completed),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/ventes?status=completed'
    },
    {
      title: 'Ventes annulées',
      value: formatNumber(stats?.ventes_annulees),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/ventes?status=cancelled'
    },
    {
      title: 'Clients actifs',
      value: formatNumber(stats?.total_clients),
      icon: Users,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      link: '/clients'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Tableau de bord commercial
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Vue d'ensemble de l'activité commerciale
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={refreshData} 
                disabled={refreshing}
                className="btn btn-outline btn-sm gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button className="btn btn-outline btn-sm gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button className="btn btn-primary btn-sm gap-2" onClick={() => navigate('/point-de-vente')}>
                <ShoppingCart className="w-4 h-4" />
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtre période */}
        <div className="flex justify-end mb-6">
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${period === 'today' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('today')}
            >
              Aujourd'hui
            </button>
            <button 
              className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('week')}
            >
              Cette semaine
            </button>
            <button 
              className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('month')}
            >
              Ce mois
            </button>
            <button 
              className={`btn btn-sm ${period === 'year' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('year')}
            >
              Cette année
            </button>
          </div>
        </div>

        {/* Cartes principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mainCards.map((card, index) => (
            <div key={index} className={`card bg-white shadow-md hover:shadow-lg transition-all border-l-4 ${card.border}`}>
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cartes secondaires */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {secondaryCards.map((card, index) => (
            <div 
              key={index} 
              className="card bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => card.link && navigate(card.link)}
            >
              <div className="card-body p-4 text-center">
                <div className={`p-2 rounded-full ${card.bgColor} w-10 h-10 mx-auto mb-2 flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-500">{card.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Graphique et Top produits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique des ventes */}
          <div className="lg:col-span-2 card bg-white shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Évolution des ventes</h2>
                </div>
                <select className="select select-xs select-bordered w-32">
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                  <option>12 derniers mois</option>
                </select>
              </div>
              
              {/* Graphique simplifié (barres) */}
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 45, 78, 55, 89, 72, 58].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-lg"
                      style={{ height: `${height}%` }}
                    >
                      <div 
                        className="w-full bg-primary rounded-t-lg transition-all"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top produits */}
          <div className="card bg-white shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Top produits</h2>
              </div>
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Aucune donnée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">#{i+1}</span>
                        <div>
                          <p className="font-medium text-sm">{product.product__name}</p>
                          <p className="text-xs text-gray-500">{formatNumber(product.total_quantity)} vendus</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">{formatPrice(product.total_ca)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dernières ventes */}
        <div className="card bg-white shadow-md">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Dernières ventes</h2>
              </div>
              <button 
                className="btn btn-ghost btn-sm text-primary"
                onClick={() => navigate('/ventes')}
              >
                Voir toutes <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {recentVentes.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Aucune vente récente</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="bg-gray-50">
                      <th>Référence</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVentes.map((vente) => (
                      <tr key={vente.id} className="hover:bg-gray-50">
                        <td className="font-mono text-sm">{vente.reference}</td>
                        <td>{vente.client_nom || 'Anonyme'}</td>
                        <td className="text-sm">{formatDate(vente.date_vente)}</td>
                        <td className="font-semibold">{formatPrice(vente.total)}</td>
                        <td>
                          <span className={`badge ${
                            vente.status === 'completed' ? 'badge-success' :
                            vente.status === 'pending_approval' ? 'badge-warning' :
                            vente.status === 'approved' ? 'badge-info' :
                            vente.status === 'rejected' ? 'badge-error' :
                            'badge-ghost'
                          }`}>
                            {vente.status === 'completed' ? 'Complétée' :
                             vente.status === 'pending_approval' ? 'En attente' :
                             vente.status === 'approved' ? 'Approuvée' :
                             vente.status === 'rejected' ? 'Rejetée' : vente.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => navigate(`/ventes/${vente.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Liens rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-8">
          <button 
            onClick={() => navigate('/point-de-vente')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <ShoppingCart className="w-4 h-4" /> Point de vente
          </button>
          <button 
            onClick={() => navigate('/ventes')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <ShoppingCart className="w-4 h-4" /> Ventes
          </button>
          <button 
            onClick={() => navigate('/clients')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <Users className="w-4 h-4" /> Clients
          </button>
          <button 
            onClick={() => navigate('/devis')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <FileText className="w-4 h-4" /> Devis
          </button>
          <button 
            onClick={() => navigate('/factures')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <Receipt className="w-4 h-4" /> Factures
          </button>
          <button 
            onClick={() => navigate('/paiements')}
            className="btn btn-outline btn-sm gap-2 justify-center"
          >
            <CreditCard className="w-4 h-4" /> Paiements
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardCommercial