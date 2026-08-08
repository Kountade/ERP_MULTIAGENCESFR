// src/pages/transferts/TransfertPdf.jsx
import jsPDF from 'jspdf'
import logoSvg from '../../assets/logo.svg'

const TransfertPdf = async (transfer) => {
  if (!transfer || typeof transfer !== 'object') {
    throw new Error('Données du transfert invalides')
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    
    // === CONFIGURATION ===
    const pageWidth = 210
    const margins = { left: 15, right: 15, top: 15, bottom: 15 }
    const contentWidth = pageWidth - margins.left - margins.right
    let y = margins.top

    // === COULEURS ===
    const primaryColor = '#2563eb'
    const secondaryColor = '#475569'
    const successColor = '#059669'
    const warningColor = '#d97706'
    const errorColor = '#dc2626'
    const black = '#000000'
    const gray = '#64748b'
    const lightGray = '#f1f5f9'
    const borderColor = '#e2e8f0'

    // === FONCTIONS ===
    const formatNumber = (n) => {
      const num = parseFloat(n) || 0
      return new Intl.NumberFormat('fr-FR').format(num)
    }
    
    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0
      return `${formatNumber(num)} FCFA`
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        })
      } catch { return '-' }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch { return '-' }
    }

    const getStatusConfig = (status) => {
      const configs = {
        draft: { label: 'BROUILLON', color: gray, bg: lightGray },
        pending_approval: { label: 'EN ATTENTE', color: warningColor, bg: '#fef3c7' },
        approved: { label: 'APPROUVÉ', color: primaryColor, bg: '#dbeafe' },
        rejected: { label: 'REJETÉ', color: errorColor, bg: '#fee2e2' },
        in_transit: { label: 'EN TRANSIT', color: successColor, bg: '#d1fae5' },
        partial: { label: 'RÉCEPTION PARTIELLE', color: warningColor, bg: '#fef3c7' },
        completed: { label: 'TERMINÉ', color: successColor, bg: '#d1fae5' },
        cancelled: { label: 'ANNULÉ', color: errorColor, bg: '#fee2e2' }
      }
      return configs[status] || configs.draft
    }

    // === DONNÉES ===
    const items = transfer.items || []
    const fromAgence = transfer.from_agence || {}
    const toAgence = transfer.to_agence || {}
    const fromWarehouse = transfer.from_warehouse || {}
    const toWarehouse = transfer.to_warehouse || {}
    const statusConfig = getStatusConfig(transfer.status)
    
    const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)
    const totalReceived = items.reduce((sum, item) => sum + (parseFloat(item.quantity_received) || 0), 0)
    const totalAmount = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0)

    // === LOGO ===
    const loadLogo = (src) => new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = src
    })

    const logoData = await loadLogo(logoSvg)

    // ============================================================
    // EN-TÊTE
    // ============================================================
    
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, 35, 17)
    } else {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(black)
      doc.text('SEYDI GROUP', margins.left, y + 6)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(black)
      doc.text('SEYDI GROUP SARL', margins.left, y + 12)
      doc.text('Solutions Digitales', margins.left, y + 17)
    }

    const companyBox = { x: pageWidth - margins.right - 75, y: y, w: 75, h: 30 }
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.rect(companyBox.x, companyBox.y, companyBox.w, companyBox.h, 'S')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('SOCIÉTÉ', companyBox.x + companyBox.w / 2, companyBox.y + 4, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(black)
    doc.text('SEYDI GROUP SARL', companyBox.x + 3, companyBox.y + 9)
    doc.text('Dakar, Sénégal', companyBox.x + 3, companyBox.y + 14)
    doc.text('+221 33 123 45 67', companyBox.x + 3, companyBox.y + 19)
    doc.setFontSize(8)
    doc.text('contact@seydigroup.com', companyBox.x + 3, companyBox.y + 24)

    y = companyBox.y + companyBox.h + 5

    // ============================================================
    // TITRE PRINCIPAL (sans trait bleu avant)
    // ============================================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor)
    doc.text('BON DE TRANSFERT DE STOCK', pageWidth / 2, y, { align: 'center' })
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryColor)
    doc.text('Document de transfert entre entrepôts', pageWidth / 2, y, { align: 'center' })
    y += 6

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor)
    doc.text(`Réf: ${transfer.reference || 'N° TRANSFERT'}`, pageWidth / 2, y, { align: 'center' })
    y += 8

    // Trait bleu après le titre (uniquement celui-ci)
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(0.5)
    doc.line(margins.left, y, pageWidth - margins.right, y)
    y += 6

    // ============================================================
    // STATUT
    // ============================================================
    const statusBox = { x: margins.left, y: y, w: contentWidth, h: 9 }
    doc.setFillColor(statusConfig.bg)
    doc.rect(statusBox.x, statusBox.y, statusBox.w, statusBox.h, 'F')
    doc.setDrawColor(statusConfig.color)
    doc.setLineWidth(0.3)
    doc.rect(statusBox.x, statusBox.y, statusBox.w, statusBox.h, 'S')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(statusConfig.color)
    doc.text(`STATUT: ${statusConfig.label}`, pageWidth / 2, y + 6, { align: 'center' })
    y += 12

    // ============================================================
    // INFORMATIONS GÉNÉRALES
    // ============================================================
    const infoBox = { x: margins.left, y: y, w: contentWidth, h: 24 }
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.rect(infoBox.x, infoBox.y, infoBox.w, infoBox.h, 'S')
    
    const midX = infoBox.x + infoBox.w / 2
    doc.line(midX, infoBox.y, midX, infoBox.y + infoBox.h)

    let infoY = infoBox.y + 4
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('GÉNÉRAL', infoBox.x + 4, infoY)
    infoY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('Date création :', infoBox.x + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(transfer.created_at), infoBox.x + 35, infoY)
    infoY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Dernière modif :', infoBox.x + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(transfer.updated_at), infoBox.x + 35, infoY)

    infoY = infoBox.y + 4
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('DOCUMENT', midX + 4, infoY)
    infoY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('Type :', midX + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text('Transfert de stock', midX + 20, infoY)
    infoY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Généré le :', midX + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(new Date()), midX + 20, infoY)

    y = infoBox.y + infoBox.h + 6

    // ============================================================
    // AGENCES
    // ============================================================
    const agenceBox = { x: margins.left, y: y, w: contentWidth, h: 38 }
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.rect(agenceBox.x, agenceBox.y, agenceBox.w, agenceBox.h, 'S')
    
    const agenceMidX = agenceBox.x + agenceBox.w / 2
    doc.line(agenceMidX, agenceBox.y, agenceMidX, agenceBox.y + agenceBox.h)

    let agenceY = agenceBox.y + 4
    
    // Agence source
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor)
    doc.text('AGENCE SOURCE', agenceBox.x + 4, agenceY)
    agenceY += 6
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('Nom :', agenceBox.x + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(fromAgence.nom || 'N/A', agenceBox.x + 25, agenceY)
    agenceY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Type :', agenceBox.x + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(fromAgence.type_agence === 'principale' ? 'Principale' : 'Secondaire', agenceBox.x + 25, agenceY)
    agenceY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Entrepôt :', agenceBox.x + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(fromWarehouse.name || 'N/A', agenceBox.x + 25, agenceY)

    // Agence destination
    agenceY = agenceBox.y + 4
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor)
    doc.text('AGENCE DESTINATION', agenceMidX + 4, agenceY)
    agenceY += 6
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('Nom :', agenceMidX + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(toAgence.nom || 'N/A', agenceMidX + 25, agenceY)
    agenceY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Type :', agenceMidX + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(toAgence.type_agence === 'principale' ? 'Principale' : 'Secondaire', agenceMidX + 25, agenceY)
    agenceY += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Entrepôt :', agenceMidX + 4, agenceY)
    doc.setFont('helvetica', 'normal')
    doc.text(toWarehouse.name || 'N/A', agenceMidX + 25, agenceY)

    y = agenceBox.y + agenceBox.h + 6

    // ============================================================
    // TABLEAU DES ARTICLES - Ordre: RÉFÉRENCE puis DÉSIGNATION
    // ============================================================
    const cols = {
      reference: { w: 35, align: 'center' },
      designation: { w: 65, align: 'left' },
      qte: { w: 22, align: 'center' },
      recu: { w: 22, align: 'center' },
      pu: { w: 32, align: 'right' },
      total: { w: 34, align: 'right' }
    }
    
    let currentX = margins.left
    const posRef = currentX
    currentX += cols.reference.w
    const posDesignation = currentX
    currentX += cols.designation.w
    const posQte = currentX
    currentX += cols.qte.w
    const posRecu = currentX
    currentX += cols.recu.w
    const posPu = currentX
    currentX += cols.pu.w
    const posTotal = currentX
    
    const rowH = 8
    const tableTop = y

    // En-tête du tableau
    doc.setFillColor(lightGray)
    doc.rect(margins.left, tableTop, contentWidth, rowH, 'F')
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.1)
    doc.rect(margins.left, tableTop, contentWidth, rowH, 'S')
    doc.line(posDesignation, tableTop, posDesignation, tableTop + rowH)
    doc.line(posQte, tableTop, posQte, tableTop + rowH)
    doc.line(posRecu, tableTop, posRecu, tableTop + rowH)
    doc.line(posPu, tableTop, posPu, tableTop + rowH)
    doc.line(posTotal, tableTop, posTotal, tableTop + rowH)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    const headerY = tableTop + rowH / 2 + 1.5
    doc.text('RÉFÉRENCE', posRef + cols.reference.w / 2, headerY, { align: 'center' })
    doc.text('DÉSIGNATION', posDesignation + 2, headerY)
    doc.text('QTÉ', posQte + cols.qte.w / 2, headerY, { align: 'center' })
    doc.text('REÇU', posRecu + cols.recu.w / 2, headerY, { align: 'center' })
    doc.text('PRIX U.', posPu + cols.pu.w - 3, headerY, { align: 'right' })
    doc.text('TOTAL', posTotal + cols.total.w - 3, headerY, { align: 'right' })

    y = tableTop + rowH

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    if (items.length) {
      items.forEach((item, index) => {
        const reference = (item.product?.reference || '-').substring(0, 15)
        const designation = (item.product?.name || item.product_name || '-').substring(0, 35)
        const qty = parseFloat(item.quantity) || 0
        const received = parseFloat(item.quantity_received) || 0
        const price = parseFloat(item.unit_price) || 0
        const total = qty * price

        doc.rect(margins.left, y, contentWidth, rowH, 'S')
        doc.line(posDesignation, y, posDesignation, y + rowH)
        doc.line(posQte, y, posQte, y + rowH)
        doc.line(posRecu, y, posRecu, y + rowH)
        doc.line(posPu, y, posPu, y + rowH)
        doc.line(posTotal, y, posTotal, y + rowH)

        const cellY = y + rowH / 2 + 1.5
        doc.text(reference, posRef + cols.reference.w / 2, cellY, { align: 'center' })
        doc.text(designation, posDesignation + 2, cellY)
        doc.text(formatNumber(qty), posQte + cols.qte.w / 2, cellY, { align: 'center' })
        doc.text(formatNumber(received), posRecu + cols.recu.w / 2, cellY, { align: 'center' })
        doc.text(formatNumber(price), posPu + cols.pu.w - 3, cellY, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(formatNumber(total), posTotal + cols.total.w - 3, cellY, { align: 'right' })
        doc.setFont('helvetica', 'normal')

        y += rowH
      })
    } else {
      doc.rect(margins.left, y, contentWidth, rowH, 'S')
      doc.text('Aucun article', margins.left + contentWidth / 2, y + rowH / 2 + 1.5, { align: 'center' })
      y += rowH
    }

    y += 3
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.line(margins.left, y, pageWidth - margins.right, y)
    y += 4

    // ============================================================
    // RÉCAPITULATIF
    // ============================================================
    const recapBox = { x: margins.left, y: y, w: contentWidth, h: 35 }
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.rect(recapBox.x, recapBox.y, recapBox.w, recapBox.h, 'S')
    
    const recapMidX = recapBox.x + recapBox.w * 0.5
    doc.line(recapMidX, recapBox.y, recapMidX, recapBox.y + recapBox.h)

    let ry = recapBox.y + 4
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('RÉCAPITULATIF', recapBox.x + recapBox.w / 2, ry, { align: 'center' })
    ry += 6

    doc.setFontSize(8)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Articles :', recapBox.x + 5, ry)
    doc.setFont('helvetica', 'normal')
    doc.text(`${items.length} article(s)`, recapBox.x + 40, ry)
    ry += 5

    doc.setFont('helvetica', 'bold')
    doc.text('Qté totale :', recapBox.x + 5, ry)
    doc.setFont('helvetica', 'normal')
    doc.text(`${formatNumber(totalQuantity)} unités`, recapBox.x + 40, ry)
    ry += 5

    doc.setFont('helvetica', 'bold')
    doc.text('Qté reçue :', recapBox.x + 5, ry)
    doc.setFont('helvetica', 'normal')
    const receivedPercent = totalQuantity > 0 ? (totalReceived / totalQuantity * 100).toFixed(1) : 0
    doc.text(`${formatNumber(totalReceived)} (${receivedPercent}%)`, recapBox.x + 40, ry)

    ry = recapBox.y + 4
    ry += 6
    ry += 5
    ry += 5
    
    doc.setFont('helvetica', 'bold')
    doc.text('Taux réception :', recapMidX + 5, ry)
    doc.setFont('helvetica', 'normal')
    const completionPercent = totalQuantity > 0 ? (totalReceived / totalQuantity * 100).toFixed(1) : 0
    doc.text(`${completionPercent}%`, recapMidX + 45, ry)
    ry += 6

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor)
    doc.text('VALEUR TOTALE :', recapMidX + 5, ry)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(totalAmount), recapMidX + 45, ry)

    y = recapBox.y + recapBox.h + 5

    // ============================================================
    // NOTES
    // ============================================================
    if (transfer.notes) {
      const notesLines = doc.splitTextToSize(transfer.notes, contentWidth - 10)
      const notesBoxH = Math.min(20, notesLines.length * 4 + 8)
      if (y + notesBoxH < 270) {
        doc.setDrawColor(borderColor)
        doc.setLineWidth(0.2)
        doc.rect(margins.left, y, contentWidth, notesBoxH, 'S')
        
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(black)
        doc.text('NOTES', margins.left + 4, y + 4)
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(gray)
        doc.text(notesLines, margins.left + 4, y + 8)
        y += notesBoxH + 4
      }
    }

    // Motif de rejet
    if (transfer.status === 'rejected' && transfer.rejected_reason) {
      const reasonLines = doc.splitTextToSize(transfer.rejected_reason, contentWidth - 10)
      const reasonBoxH = Math.min(16, reasonLines.length * 4 + 8)
      if (y + reasonBoxH < 270) {
        doc.setFillColor('#fee2e2')
        doc.rect(margins.left, y, contentWidth, reasonBoxH, 'F')
        doc.setDrawColor(errorColor)
        doc.setLineWidth(0.3)
        doc.rect(margins.left, y, contentWidth, reasonBoxH, 'S')
        
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(errorColor)
        doc.text('MOTIF DU REJET', margins.left + 4, y + 4)
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(black)
        doc.text(reasonLines, margins.left + 4, y + 8)
        y += reasonBoxH + 4
      }
    }

    // ============================================================
    // SIGNATURES
    // ============================================================
    if (y + 25 < 280) {
      const signatureY = y
      
      doc.setDrawColor(borderColor)
      doc.setLineWidth(0.2)
      doc.line(margins.left, signatureY, pageWidth - margins.right, signatureY)
      y += 4
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(black)
      doc.text('SIGNATURES', pageWidth / 2, signatureY + 4, { align: 'center' })
      
      const signBoxW = (contentWidth - 10) / 2
      
      doc.setDrawColor(borderColor)
      doc.setLineWidth(0.2)
      doc.rect(margins.left, signatureY + 7, signBoxW, 18, 'S')
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(gray)
      doc.text('Cachet et signature de l\'agence source', margins.left + signBoxW / 2, signatureY + 13, { align: 'center' })
      doc.text('Date: _____________', margins.left + signBoxW / 2, signatureY + 20, { align: 'center' })
      
      doc.rect(margins.left + signBoxW + 10, signatureY + 7, signBoxW, 18, 'S')
      doc.text('Cachet et signature de l\'agence destination', margins.left + signBoxW + 10 + signBoxW / 2, signatureY + 13, { align: 'center' })
      doc.text('Date: _____________', margins.left + signBoxW + 10 + signBoxW / 2, signatureY + 20, { align: 'center' })
      
      y = signatureY + 28
    }

    // ============================================================
    // PIED DE PAGE
    // ============================================================
    const footerY = 287
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.2)
    doc.line(margins.left, footerY - 8, pageWidth - margins.right, footerY - 8)
    
    doc.setFontSize(7)
    doc.setTextColor(gray)
    doc.setFont('helvetica', 'normal')
    doc.text('SEYDI GROUP SARL - Dakar, Sénégal - Tél: +221 33 123 45 67', pageWidth / 2, footerY - 4, { align: 'center' })
    doc.text(`Document généré le ${formatDateTime(new Date())}`, pageWidth / 2, footerY, { align: 'center' })
    doc.text('Ce document fait foi de transfert de stock entre les deux agences', pageWidth / 2, footerY + 4, { align: 'center' })

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(gray)
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, footerY + 4, { align: 'right' })
    }

    doc.save(`Transfert_${transfer.reference || 'transfert'}.pdf`)
    return true

  } catch (error) {
    console.error('Erreur TransfertPdf:', error)
    throw error
  }
}

export default TransfertPdf