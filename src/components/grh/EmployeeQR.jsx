// src/components/drh/EmployeeQR.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AxiosInstance from '../AxiosInstance'
import {
  ArrowLeft,
  QrCode,
  Download,
  Printer,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  User,
  BadgeCheck,
  Briefcase,
  Building2,
  Info,
  Loader2
} from 'lucide-react'

const EmployeeQR = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [employee, setEmployee] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // Fonction pour convertir une URL relative en absolue
  const toAbsoluteUrl = (relativeUrl) => {
    if (!relativeUrl) return null
    if (relativeUrl.startsWith('http')) return relativeUrl
    const origin = window.location.origin
    return `${origin}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const empResponse = await AxiosInstance.get(`/employees/${id}/`)
      setEmployee(empResponse.data)

      const qrResponse = await AxiosInstance.get(`/employees/${id}/qr_code/`)
      let url = qrResponse.data.qr_code_url
      if (url) {
        url = toAbsoluteUrl(url)
        console.log('QR Code URL absolue:', url)
      }
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const handleRegenerateQR = async () => {
    setGenerating(true)
    try {
      await AxiosInstance.post(`/employees/${id}/regenerate_qr/`)
      const qrResponse = await AxiosInstance.get(`/employees/${id}/qr_code/`)
      let url = qrResponse.data.qr_code_url
      if (url) {
        url = toAbsoluteUrl(url)
      }
      setQrCodeUrl(url)
      showNotification('QR code régénéré avec succès', 'success')
    } catch (error) {
      console.error('Error regenerating QR:', error)
      showNotification('Erreur lors de la régénération du QR code', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `qr_${employee?.employee_number}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showNotification('QR code téléchargé avec succès', 'success')
    } else {
      showNotification('Impossible de télécharger, QR code manquant', 'warning')
    }
  }

  const handlePrint = () => {
    if (!qrCodeUrl) {
      showNotification('Impossible d\'imprimer, QR code manquant', 'warning')
      return
    }
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${employee?.full_name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { text-align: center; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); padding: 40px; max-width: 450px; }
            .logo { font-size: 24px; font-weight: bold; color: #003C3f; margin-bottom: 20px; }
            h2 { color: #003C3f; margin: 0 0 10px 0; }
            img { width: 250px; height: 250px; margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; }
            .info { margin-top: 20px; }
            .info p { margin: 8px 0; }
            .badge { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
            .company { color: #DA4A0E; font-size: 14px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🏢 SEYDI GROUP</div>
            <h2>Badge employé</h2>
            <div class="company">ERP Multi-Agences</div>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <div class="info">
              <p><strong>${employee?.full_name}</strong></p>
              <p>Matricule: ${employee?.employee_number}</p>
              <p>Poste: ${employee?.position_title || employee?.position?.title || '-'}</p>
              <p>Département: ${employee?.department_name || employee?.department?.name || '-'}</p>
            </div>
            <div class="badge">
              🔍 Présentez ce badge au lecteur QR pour le pointage
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="avatar placeholder mb-4">
            <div className="bg-warning/10 text-warning rounded-full w-20 h-20">
              <User className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Employé non trouvé</h1>
          <p className="text-base-content/70 mb-6">L'employé que vous recherchez n'existe pas ou a été supprimé.</p>
          <button 
            onClick={() => navigate('/employees')} 
            className="btn btn-primary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg text-sm sm:text-base`}>
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
      <div className="mb-6">
        <button
          onClick={() => navigate(`/employees/${id}`)}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/70 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au profil
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
              QR Code
            </h1>
            <p className="text-sm text-base-content/60 mt-1 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-primary" />
              {employee.full_name} - {employee.employee_number}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="btn btn-outline gap-2"
              disabled={!qrCodeUrl}
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button 
              onClick={handlePrint}
              className="btn btn-outline gap-2"
              disabled={!qrCodeUrl}
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button 
              onClick={handleRegenerateQR}
              disabled={generating}
              className="btn btn-outline gap-2 text-primary border-primary/30 hover:border-primary disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Régénérer
            </button>
          </div>
        </div>
      </div>

      {/* Carte QR Code */}
      <div className="flex justify-center">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-6 sm:p-8 max-w-md w-full text-center">
          {/* En-tête carte */}
          <div className="mb-4">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-base-content">Badge employé</h2>
            <p className="text-xs text-base-content/50">SEYDI GROUP ERP</p>
          </div>

          {/* QR Code */}
          {qrCodeUrl ? (
            <div className="bg-base-200 rounded-xl p-4 inline-block mx-auto">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                onError={() => {
                  console.error('Erreur chargement image QR')
                  showNotification('Erreur de chargement du QR code', 'error')
                }}
              />
            </div>
          ) : (
            <div className="bg-base-200 rounded-xl p-6 text-center">
              <QrCode className="w-20 h-20 mx-auto text-base-content/30 mb-3" />
              <p className="text-sm text-base-content/50 mb-3">Aucun QR code disponible</p>
              <button 
                onClick={handleRegenerateQR}
                disabled={generating}
                className="btn btn-sm btn-primary gap-2"
              >
                {generating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Générer
              </button>
            </div>
          )}

          {/* Informations employé */}
          <div className="mt-5 space-y-1">
            <h3 className="text-lg font-bold text-base-content">{employee.full_name}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span>Matricule: {employee.employee_number}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Poste: {employee.position_title || employee.position?.title || '-'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Département: {employee.department_name || employee.department?.name || '-'}</span>
            </div>
          </div>

          {/* Footer badge */}
          <div className="mt-5 pt-4 border-t border-base-200">
            <p className="text-xs text-base-content/50 flex items-center justify-center gap-1">
              <QrCode className="w-3 h-3" />
              Présentez ce badge au lecteur QR pour le pointage
            </p>
          </div>
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="bg-base-100 rounded-xl shadow-md border border-base-200 p-5 mt-6">
        <div className="flex items-start gap-3">
          <div className="bg-info/10 text-info rounded-lg p-2">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base-content mb-2">Instructions d'utilisation</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-base-content/70">
              <li>Imprimez ce badge ou affichez-le sur votre téléphone</li>
              <li>Utilisez le lecteur QR Code pour pointer vos arrivées et départs</li>
              <li>Si le badge est perdu ou endommagé, cliquez sur "Régénérer" pour créer un nouveau QR code</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeQR