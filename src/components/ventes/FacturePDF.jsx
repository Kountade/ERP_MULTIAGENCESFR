// src/components/sales/FacturePDF.jsx
import jsPDF from 'jspdf'
import logoSvg from '../../assets/logo.svg'

const FacturePDF = async (facture) => {
  if (!facture || typeof facture !== 'object') {
    throw new Error('Données de la facture invalides')
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    
    // === CONFIGURATION ===
    const pageWidth = 210
    const margins = { left: 15, right: 15, top: 18, bottom: 18 }
    const contentWidth = pageWidth - margins.left - margins.right
    let y = margins.top

    // === TOUT EN NOIR ===
    const black = '#000000'

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
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      } catch { return '-' }
    }

    // === DONNÉES ===
    const items = facture.items || []
    const client = facture.client || {}

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
      doc.addImage(logoData, 'PNG', margins.left, y, 40, 20)
    } else {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(black)
      doc.text('SEYDI GROUP', margins.left, y + 8)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(black)
      doc.text('SEYDI GROUP SARL', margins.left, y + 14)
      doc.text('Solutions Digitales', margins.left, y + 19)
    }

    const companyBox = { x: pageWidth - margins.right - 85, y: y, w: 85, h: 35 }
    doc.setDrawColor(black)
    doc.setLineWidth(0.2)
    doc.rect(companyBox.x, companyBox.y, companyBox.w, companyBox.h, 'S')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('SOCIÉTÉ', companyBox.x + companyBox.w / 2, companyBox.y + 4, { align: 'center' })
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(black)
    doc.text('SEYDI GROUP SARL', companyBox.x + 4, companyBox.y + 10)
    doc.text('Dakar, Sénégal', companyBox.x + 4, companyBox.y + 16)
    doc.text('+221 33 123 45 67', companyBox.x + 4, companyBox.y + 22)
    doc.setFontSize(9)
    doc.text('contact@seydigroup.com', companyBox.x + 4, companyBox.y + 28)

    y = companyBox.y + companyBox.h + 8

    doc.setDrawColor(black)
    doc.setLineWidth(0.5)
    doc.line(margins.left, y, pageWidth - margins.right, y)
    y += 8

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(black)
    doc.text(`Réf: ${facture.reference || 'N° FACTURE'}`, pageWidth / 2, y, { align: 'center' })
    y += 12

    // ============================================================
    // INFORMATIONS
    // ============================================================
    const infoBox = { x: margins.left, y: y, w: contentWidth, h: 46 }
    doc.setDrawColor(black)
    doc.setLineWidth(0.3)
    doc.rect(infoBox.x, infoBox.y, infoBox.w, infoBox.h, 'S')
    
    const midX = infoBox.x + infoBox.w / 2
    doc.line(midX, infoBox.y, midX, infoBox.y + infoBox.h)

    let infoY = infoBox.y + 6
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('CLIENT', infoBox.x + 4, infoY)
    infoY += 7
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.setFontSize(10)
    doc.text('Nom :', infoBox.x + 4, infoY)
    doc.setFont('helvetica', 'normal')
    const clientName = client.raison_sociale || client.nom || 
                      (client.prenom ? `${client.nom} ${client.prenom}` : client.nom) || '-'
    doc.text(clientName.substring(0, 28), infoBox.x + 22, infoY)
    infoY += 6
    
    doc.setFont('helvetica', 'bold')
    doc.text('Adresse :', infoBox.x + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text((client.adresse || '-').substring(0, 28), infoBox.x + 22, infoY)
    infoY += 6
    
    doc.setFont('helvetica', 'bold')
    doc.text('Tél :', infoBox.x + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(client.telephone || '-', infoBox.x + 22, infoY)

    infoY = infoBox.y + 6
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('DÉTAILS', midX + 4, infoY)
    infoY += 7
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('Date :', midX + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(facture.date_facture), midX + 24, infoY)
    infoY += 6
    
    doc.setFont('helvetica', 'bold')
    doc.text('Échéance :', midX + 4, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(facture.date_echeance), midX + 24, infoY)
    infoY += 6
    
    doc.setFont('helvetica', 'bold')
    doc.text('Type :', midX + 4, infoY)
    doc.setFont('helvetica', 'normal')
    const types = { proforma: 'Proforma', finale: 'Finale', avoir: 'Avoir' }
    doc.text(types[facture.type_facture] || 'Finale', midX + 24, infoY)

    y = infoBox.y + infoBox.h + 10

    // ============================================================
    // TABLEAU DES ARTICLES - Largeurs ajustées pour éviter débordement
    // ============================================================
    const cols = {
      ref: { w: 23, align: 'center' },
      designation: { w: 54, align: 'left' },
      qte: { w: 17, align: 'center' },
      pu: { w: 36, align: 'right' },
      total: { w: 38, align: 'right' }
    }
    
    let currentX = margins.left
    const posRef = currentX
    currentX += cols.ref.w
    const posDesignation = currentX
    currentX += cols.designation.w
    const posQte = currentX
    currentX += cols.qte.w
    const posPu = currentX
    currentX += cols.pu.w
    const posTotal = currentX
    
    const rowH = 10
    const tableTop = y

    doc.setFillColor('#ffffff')
    doc.rect(margins.left, tableTop, contentWidth, rowH, 'F')
    doc.setDrawColor(black)
    doc.setLineWidth(0.2)
    doc.rect(margins.left, tableTop, contentWidth, rowH, 'S')
    doc.line(posDesignation, tableTop, posDesignation, tableTop + rowH)
    doc.line(posQte, tableTop, posQte, tableTop + rowH)
    doc.line(posPu, tableTop, posPu, tableTop + rowH)
    doc.line(posTotal, tableTop, posTotal, tableTop + rowH)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    const headerY = tableTop + rowH / 2 + 1.5
    doc.text('RÉF', posRef + cols.ref.w / 2, headerY, { align: 'center' })
    doc.text('DÉSIGNATION', posDesignation + cols.designation.w / 2, headerY, { align: 'center' })
    doc.text('QTÉ', posQte + cols.qte.w / 2, headerY, { align: 'center' })
    doc.text('PRIX HT', posPu + cols.pu.w / 2, headerY, { align: 'center' })
    doc.text('TOTAL HT', posTotal + cols.total.w / 2, headerY, { align: 'center' })

    y = tableTop + rowH

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    if (items.length) {
      items.forEach((item) => {
        if (y + rowH > 270) {
          doc.addPage()
          y = margins.top + 10
          doc.setFillColor('#ffffff')
          doc.rect(margins.left, y, contentWidth, rowH, 'F')
          doc.rect(margins.left, y, contentWidth, rowH, 'S')
          doc.line(posDesignation, y, posDesignation, y + rowH)
          doc.line(posQte, y, posQte, y + rowH)
          doc.line(posPu, y, posPu, y + rowH)
          doc.line(posTotal, y, posTotal, y + rowH)
          doc.text('RÉF', posRef + cols.ref.w / 2, y + rowH / 2 + 1.5, { align: 'center' })
          doc.text('DÉSIGNATION', posDesignation + cols.designation.w / 2, y + rowH / 2 + 1.5, { align: 'center' })
          doc.text('QTÉ', posQte + cols.qte.w / 2, y + rowH / 2 + 1.5, { align: 'center' })
          doc.text('PRIX HT', posPu + cols.pu.w / 2, y + rowH / 2 + 1.5, { align: 'center' })
          doc.text('TOTAL HT', posTotal + cols.total.w / 2, y + rowH / 2 + 1.5, { align: 'center' })
          y += rowH
        }

        const code = item.product_reference || item.reference || '-'
        const name = (item.product_name || item.product?.name || '-').substring(0, 32)
        const qty = parseFloat(item.quantity) || 0
        const price = parseFloat(item.prix_unitaire) || 0
        const total = parseFloat(item.total) || qty * price

        doc.rect(margins.left, y, contentWidth, rowH, 'S')
        doc.line(posDesignation, y, posDesignation, y + rowH)
        doc.line(posQte, y, posQte, y + rowH)
        doc.line(posPu, y, posPu, y + rowH)
        doc.line(posTotal, y, posTotal, y + rowH)

        const cellY = y + rowH / 2 + 1.5
        doc.text(code, posRef + cols.ref.w / 2, cellY, { align: 'center' })
        doc.text(name, posDesignation + 2, cellY)
        doc.text(formatNumber(qty), posQte + cols.qte.w / 2, cellY, { align: 'center' })
        // Alignement à droite avec une marge de sécurité
        doc.text(formatNumber(price), posPu + cols.pu.w - 12, cellY, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(formatNumber(total), posTotal + cols.total.w - 12, cellY, { align: 'right' })
        doc.setFont('helvetica', 'normal')

        y += rowH
      })
    } else {
      doc.rect(margins.left, y, contentWidth, rowH, 'S')
      doc.setTextColor(black)
      doc.text('Aucun article', margins.left + contentWidth / 2, y + rowH / 2 + 1.5, { align: 'center' })
      y += rowH
    }

    y += 5
    doc.setDrawColor(black)
    doc.line(margins.left, y, pageWidth - margins.right, y)
    y += 8

    // ============================================================
    // TOTAUX
    // ============================================================
    const sousTotal = parseFloat(facture.sous_total) || 0
    const tva = parseFloat(facture.tva) || 0
    const totalTTC = parseFloat(facture.total_ttc) || 0
    const paye = parseFloat(facture.montant_paye) || 0
    const reste = parseFloat(facture.montant_restant) || 0

    const totalBox = { x: pageWidth - margins.right - 95, y: y, w: 95, h: 60 }
    doc.setDrawColor(black)
    doc.setLineWidth(0.3)
    doc.rect(totalBox.x, totalBox.y, totalBox.w, totalBox.h, 'S')

    let ty = totalBox.y + 7
    doc.setFontSize(10)
    
    doc.setFont('helvetica', 'bold')
    doc.text('SOUS-TOTAL HT', totalBox.x + 5, ty)
    doc.setFont('helvetica', 'normal')
    const sousTotalStr = formatCurrency(sousTotal)
    doc.text(sousTotalStr, totalBox.x + totalBox.w - 15, ty, { align: 'right' })
    ty += 9

    doc.setFont('helvetica', 'bold')
    doc.text('TVA (18%)', totalBox.x + 5, ty)
    doc.setFont('helvetica', 'normal')
    const tvaStr = formatCurrency(tva)
    doc.text(tvaStr, totalBox.x + totalBox.w - 15, ty, { align: 'right' })
    ty += 9

    doc.setDrawColor(black)
    doc.setLineWidth(0.2)
    doc.line(totalBox.x + 5, ty - 3, totalBox.x + totalBox.w - 15, ty - 3)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL TTC', totalBox.x + 5, ty)
    doc.setFontSize(12)
    doc.setTextColor(black)
    const totalTTCStr = formatCurrency(totalTTC)
    doc.text(totalTTCStr, totalBox.x + totalBox.w - 15, ty, { align: 'right' })
    ty += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(black)
    doc.text('MONTANT PAYÉ', totalBox.x + 5, ty)
    const payeStr = formatCurrency(paye)
    doc.text(payeStr, totalBox.x + totalBox.w - 15, ty, { align: 'right' })
    ty += 9

    doc.setFont('helvetica', 'bold')
    doc.text('RESTE À PAYER', totalBox.x + 5, ty)
    const resteStr = formatCurrency(reste)
    doc.text(resteStr, totalBox.x + totalBox.w - 15, ty, { align: 'right' })

    y = totalBox.y + totalBox.h + 10

    // ============================================================
    // INFORMATIONS COMPLÉMENTAIRES
    // ============================================================
    if (facture.conditions_paiement && facture.conditions_paiement !== 'Paiement à 30 jours') {
      doc.setDrawColor(black)
      doc.setLineWidth(0.2)
      const lines = doc.splitTextToSize(facture.conditions_paiement, contentWidth - 10)
      const boxH = Math.max(14, lines.length * 5 + 8)
      if (y + boxH < 270) {
        doc.rect(margins.left, y, contentWidth, boxH, 'S')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(black)
        doc.text('CONDITIONS', margins.left + 4, y + 4)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(black)
        doc.text(lines, margins.left + 4, y + 9)
        y += boxH + 6
      }
    }

    if (facture.notes) {
      const lines = doc.splitTextToSize(facture.notes, contentWidth - 10)
      const boxH = Math.max(14, lines.length * 5 + 8)
      if (y + boxH < 270) {
        doc.rect(margins.left, y, contentWidth, boxH, 'S')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(black)
        doc.text('NOTES', margins.left + 4, y + 4)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(black)
        doc.text(lines, margins.left + 4, y + 9)
        y += boxH + 6
      }
    }

    // ============================================================
    // PIED DE PAGE
    // ============================================================
    const footerY = 280
    doc.setDrawColor(black)
    doc.setLineWidth(0.2)
    doc.line(margins.left, footerY - 10, pageWidth - margins.right, footerY - 10)
    
    doc.setFontSize(9)
    doc.setTextColor(black)
    doc.setFont('helvetica', 'normal')
    doc.text('SEYDI GROUP SARL - Dakar, Sénégal - Tél: +221 33 123 45 67', pageWidth / 2, footerY - 5, { align: 'center' })
    doc.text(`Facture électronique du ${formatDate(new Date())}`, pageWidth / 2, footerY - 1, { align: 'center' })

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(black)
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, footerY, { align: 'right' })
    }

    doc.save(`Facture_${facture.reference || 'facture'}.pdf`)
    return true

  } catch (error) {
    console.error('Erreur FacturePDF:', error)
    throw error
  }
}

export default FacturePDF