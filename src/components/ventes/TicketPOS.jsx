// src/components/pos/TicketPOS.jsx
import jsPDF from 'jspdf'

const TicketPOS = async (vente) => {
  if (!vente || typeof vente !== 'object') {
    throw new Error('Données de la vente invalides')
  }

  try {
    // ============================================================
    // FORMAT 80mm x 210mm
    // ============================================================
    const doc = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm', 
      format: [80, 210]
    })

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const pageWidth = 80
    const margins = { left: 4, right: 4, top: 4, bottom: 4 }
    let y = margins.top
    const lineHeight = 4.5

    // ============================================================
    // FONCTIONS
    // ============================================================
    const formatNumber = (n) => {
      const num = parseFloat(n) || 0
      return new Intl.NumberFormat('fr-FR').format(num)
    }

    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0
      return formatNumber(num) + ' FCFA'
    }

    const formatDate = (dateString) => {
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

    const centerText = (text, size = 10, style = 'normal') => {
      doc.setFontSize(size)
      doc.setFont('helvetica', style)
      doc.text(text, pageWidth / 2, y, { align: 'center' })
      y += lineHeight
      return y
    }

    const leftText = (text, size = 9, style = 'normal') => {
      doc.setFontSize(size)
      doc.setFont('helvetica', style)
      doc.text(text, margins.left, y)
      y += lineHeight
      return y
    }

    const twoColumnText = (left, right, size = 9, leftStyle = 'normal', rightStyle = 'normal') => {
      doc.setFontSize(size)
      doc.setFont('helvetica', leftStyle)
      doc.text(left, margins.left, y)
      doc.setFont('helvetica', rightStyle)
      doc.text(right, pageWidth - margins.right - 2, y, { align: 'right' })
      y += lineHeight
      return y
    }

    const separator = () => {
      doc.setFontSize(5)
      doc.text('---------------------------', pageWidth / 2, y, { align: 'center' })
      y += 3
      return y
    }

    const doubleSeparator = () => {
      doc.setFontSize(5)
      doc.text('===========================', pageWidth / 2, y, { align: 'center' })
      y += 3
      return y
    }

    const sectionSpacer = (height = 2) => {
      y += height
      return y
    }

    // ============================================================
    // DONNEES - CORRECTION IMPORTANTE
    // ============================================================
    // Récupérer les items depuis différentes sources possibles
    let items = []
    
    // Essayer plusieurs sources pour les items
    if (vente.items && Array.isArray(vente.items) && vente.items.length > 0) {
      items = vente.items
    } else if (vente.items_data && Array.isArray(vente.items_data) && vente.items_data.length > 0) {
      items = vente.items_data
    } else if (vente.vente_items && Array.isArray(vente.vente_items) && vente.vente_items.length > 0) {
      items = vente.vente_items
    }
    
    // Récupérer les totaux
    const sousTotal = parseFloat(vente.sous_total || vente.subtotal || 0)
    const total = parseFloat(vente.total || vente.total_ttc || sousTotal)
    const paye = parseFloat(vente.montant_paye || vente.paid_amount || 0)
    const reste = parseFloat(vente.reste_a_payer || vente.montant_restant || vente.remaining_amount || 0)
    const taxAmount = parseFloat(vente.tax_amount || vente.tva || 0)

    console.log('TicketPOS - Données reçues:', {
      itemsCount: items.length,
      sousTotal,
      total,
      paye,
      reste,
      taxAmount,
      venteKeys: Object.keys(vente)
    })

    // ============================================================
    // 1. EN-TETE
    // ============================================================
    
    y = centerText('SEYDI GROUP', 14, 'bold')
    y = centerText('SEYDI GROUP SARL', 9, 'normal')
    y = centerText('Solutions Digitales et Commerce', 7, 'normal')
    
    y = sectionSpacer(2)
    
    y = centerText('Tel: +221 33 123 45 67', 7, 'normal')
    y = centerText('contact@seydigroup.com', 7, 'normal')
    y = centerText('Dakar, Senegal', 7, 'normal')
    
    y = sectionSpacer(3)

    y = separator()
    y = sectionSpacer(2)

    // --- NUMERO ET DATE ---
    y = centerText('TICKET N° ' + (vente.reference || vente.sale_number || '---'), 10, 'bold')
    y = centerText(formatDate(vente.date_vente || vente.created_at || new Date()), 7, 'normal')
    
    // Client
    const client = vente.client || {}
    if (client.nom) {
      y = centerText('Client: ' + client.nom + (client.prenom ? ' ' + client.prenom : ''), 7, 'normal')
    }
    
    y = sectionSpacer(2)

    y = separator()
    y = sectionSpacer(2)

    // ============================================================
    // 2. TABLEAU DES ARTICLES
    // ============================================================
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    
    const colQte = margins.left
    const colDesignation = margins.left + 9
    const colPrix = pageWidth - margins.right - 18
    const colTotal = pageWidth - margins.right - 2
    
    doc.text('Qte', colQte, y)
    doc.text('Designation', colDesignation, y)
    doc.text('Prix', colPrix, y, { align: 'right' })
    doc.text('Total', colTotal, y, { align: 'right' })
    y += 2.5
    
    doc.setFontSize(4.5)
    doc.text('---------------------------', pageWidth / 2, y, { align: 'center' })
    y += 2.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)

    if (items && items.length > 0) {
      items.forEach((item, index) => {
        // Récupérer les valeurs avec différentes possibilités
        const qty = parseFloat(item.quantity || item.qty || 1) || 0
        const price = parseFloat(item.prix_unitaire || item.unit_price || item.price || item.prix) || 0
        const totalItem = parseFloat(item.total || item.total_price || item.sous_total) || qty * price
        const name = (item.product_name || item.product?.name || item.name || 'Produit').substring(0, 16)

        // Afficher la ligne
        doc.text(qty.toString(), colQte, y)
        doc.text(name, colDesignation, y)
        doc.text(formatNumber(price), colPrix, y, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(formatNumber(totalItem), colTotal, y, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        
        y += 4

        // Si on arrive en bas de page, ajouter une nouvelle page
        if (y > 170) {
          doc.addPage()
          y = margins.top + 10
        }
      })
      
      // Afficher le nombre total d'articles
      y += 2
      doc.setFontSize(6)
      doc.setFont('helvetica', 'italic')
      doc.text('Total articles: ' + items.length, margins.left, y)
      y += 3
      
    } else {
      y = centerText('Aucun article', 7, 'bold')
      y += 3
    }

    y = sectionSpacer(1.5)
    y = separator()
    y = sectionSpacer(1.5)

    // ============================================================
    // 3. TOTAUX - SANS TVA
    // ============================================================
    // Sous-total
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Sous-total', margins.left, y)
    doc.text(formatCurrency(sousTotal), pageWidth - margins.right - 2, y, { align: 'right' })
    y += lineHeight

    // TVA (0%)
    doc.text('TVA (0%)', margins.left, y)
    doc.text(formatCurrency(taxAmount), pageWidth - margins.right - 2, y, { align: 'right' })
    y += lineHeight

    y = sectionSpacer(1)
    y = doubleSeparator()
    y = sectionSpacer(1)

    // TOTAL - en gras
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL', margins.left, y)
    doc.text(formatCurrency(total), pageWidth - margins.right - 2, y, { align: 'right' })
    y += lineHeight + 2

    // Payé
    if (paye > 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Paye', margins.left, y)
      doc.text(formatCurrency(paye), pageWidth - margins.right - 2, y, { align: 'right' })
      y += lineHeight
    }

    // Reste
    if (reste > 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Reste', margins.left, y)
      doc.text(formatCurrency(reste), pageWidth - margins.right - 2, y, { align: 'right' })
      y += lineHeight
    }

    y = sectionSpacer(2)
    y = separator()
    y = sectionSpacer(2)

    // ============================================================
    // 4. PAIEMENT
    // ============================================================
    const modePaiement = vente.mode_paiement || vente.payment_method || vente.methode_paiement || 'Especes'
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Paiement: ' + modePaiement, margins.left, y)
    y += lineHeight
    y = sectionSpacer(1)

    const remise = parseFloat(vente.remise || vente.discount || 0)
    if (remise > 0) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Remise: ' + formatNumber(remise) + '%', margins.left, y)
      y += lineHeight
      y = sectionSpacer(1)
    }

    y = separator()
    y = sectionSpacer(2)

    // ============================================================
    // 5. NOTES
    // ============================================================
    if (vente.notes) {
      const notes = doc.splitTextToSize(vente.notes, pageWidth - margins.left - margins.right - 4)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('Notes:', margins.left, y)
      y += lineHeight
      notes.forEach(line => {
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text('  ' + line, margins.left, y)
        y += lineHeight
      })
      y = sectionSpacer(1)
    }

    y = separator()
    y = sectionSpacer(3)

    // ============================================================
    // 6. PIED DE PAGE
    // ============================================================
    y = centerText('MERCI DE VOTRE CONFIANCE', 11, 'bold')
    y = centerText('A tres bientot !', 8, 'normal')
    y = centerText('Votre satisfaction est notre priorite', 7, 'normal')
    y = centerText('contact@seydigroup.com', 7, 'normal')
    
    y = sectionSpacer(3)

    // Code barre
    doc.setFontSize(5)
    const barCode = vente.reference || vente.sale_number || 'TICKET'
    y = centerText('*' + barCode + '*', 5, 'normal')
    
    y = sectionSpacer(2)

    // Fin
    doc.setFontSize(4.5)
    doc.text('---------------------------', pageWidth / 2, y, { align: 'center' })
    y += 2.5
    
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR')
    y = centerText('Imprime le ' + dateStr, 4.5, 'normal')

    // ============================================================
    // PAGES
    // ============================================================
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(4)
      doc.text('Page ' + i + '/' + pageCount, pageWidth - margins.right, 205, { align: 'right' })
    }

    // ============================================================
    // SAUVEGARDE
    // ============================================================
    const fileName = 'Ticket_' + (vente.reference || vente.sale_number || 'ticket') + '.pdf'
    doc.save(fileName)
    return doc

  } catch (error) {
    console.error('Erreur TicketPOS:', error)
    throw error
  }
}

export default TicketPOS