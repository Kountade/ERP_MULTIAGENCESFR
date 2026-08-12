// src/components/achats/PaiementsListePDF.js
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// ========== FONCTIONS DE FORMATAGE ==========
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatCurrency = (amt) => {
  const num = parseFloat(amt) || 0;
  return `${formatNumber(num)} FCFA`;
};

const formatDate = (d) => {
  if (!d) return '-';
  try {
    let date;
    if (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = d.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(d);
    }
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

const formatDateTime = (d) => {
  if (!d) return '-';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return d;
  }
};

// ========== FONCTION POUR EXTRAIRE LE MONTANT ==========
const getAmount = (payment) => {
  if (!payment) return 0;
  let amount = payment.amount || payment.montant || payment.total || 0;
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/,/g, ''));
  }
  return isNaN(amount) ? 0 : amount;
};

// ========== FONCTION POUR AJOUTER UN FILIGRANE OBLIQUE ==========
const addWatermark = (doc, text, options = {}) => {
  const {
    fontSize = 40,
    color = [200, 200, 200],
    opacity = 0.08,
    angle = -45,
    repeat = true,
    spacing = 100
  } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentFontSize = doc.internal.getFontSize();
  const currentTextColor = doc.internal.getTextColor();
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);
  
  doc.setGState(new doc.GState({ opacity: opacity }));
  
  const diagonal = Math.sqrt(pageWidth * pageWidth + pageHeight * pageHeight);
  const textWidth = doc.getTextWidth(text);
  
  const numX = Math.ceil((diagonal + textWidth) / (textWidth + spacing));
  const numY = Math.ceil(diagonal / spacing);
  
  const offsetX = (pageWidth - numX * (textWidth + spacing)) / 2;
  const offsetY = (pageHeight - numY * spacing) / 2;
  
  if (!repeat) {
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    doc.text(text, centerX, centerY, { 
      align: 'center',
      angle: angle,
      baseline: 'middle'
    });
  } else {
    for (let i = 0; i < numY; i++) {
      for (let j = 0; j < numX; j++) {
        const x = offsetX + j * (textWidth + spacing);
        const y = offsetY + i * spacing;
        doc.text(text, x, y, {
          angle: angle,
          baseline: 'middle'
        });
      }
    }
  }
  
  doc.setFontSize(currentFontSize);
  doc.setTextColor(currentTextColor[0], currentTextColor[1], currentTextColor[2]);
  doc.setGState(new doc.GState({ opacity: 1 }));
};

// ========== COMPOSANT PRINCIPAL ==========
const PaiementsListePDF = async (paiements, filters = {}, options = {}) => {
  if (!paiements || !Array.isArray(paiements)) {
    throw new Error('Les données des paiements sont invalides');
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 15, right: 15, top: 18, bottom: 18 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    // ========== INFORMATIONS DE L'ENTREPRISE ==========
    const company = {
      name: 'BUROK GROUP',
      address: 'Dakar, Sénégal',
      phone: '+221 33 800 00 00',
      email: 'contact@burokgroup.sn',
      rccm: '2025/G/001',
      nif: '123456789',
      capital: '50 000 000'
    };

    // ========== ANALYSE DES DONNÉES ==========
    const payments = paiements || [];
    const totalAmount = payments.reduce((sum, p) => sum + getAmount(p), 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const failedCount = payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length;

    // Construction du libellé du filtre
    let filterLabel = 'Tous les paiements';
    let filterDetails = [];

    if (filters.searchTerm) {
      filterDetails.push(`🔍 Recherche: "${filters.searchTerm}"`);
    }

    if (filters.filterType === 'today') {
      filterLabel = '📅 Paiements du jour';
    } else if (filters.filterType === 'month') {
      filterLabel = '📆 Paiements du mois (30 derniers jours)';
    } else if (filters.filterType === 'invoice' && filters.invoiceNumber) {
      filterLabel = `📄 Paiements de la facture ${filters.invoiceNumber}`;
      if (filters.supplierName) {
        filterDetails.push(`Fournisseur: ${filters.supplierName}`);
      }
    }

    filterDetails.push(`📊 ${payments.length} paiement(s) trouvé(s)`);
    filterDetails.push(`💰 Montant total: ${formatCurrency(totalAmount)}`);

    // ========== CHARGEMENT DU LOGO ==========
    const loadLogo = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    let logoData = null;
    try { logoData = await loadLogo(logoSvg); } catch { /* ignore */ }

    // Filigrane
    const watermarkText = options.watermark || 'LISTE DES PAIEMENTS';
    const watermarkOptions = {
      fontSize: options.watermarkSize || 40,
      color: options.watermarkColor || [200, 200, 200],
      opacity: options.watermarkOpacity || 0.08,
      angle: options.watermarkAngle || -45,
      repeat: options.watermarkRepeat !== undefined ? options.watermarkRepeat : true,
      spacing: options.watermarkSpacing || 100
    };

    // ================================================================
    // EN-TÊTE
    // ================================================================
    const logoWidth = 26;
    const logoHeight = 26;
    
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
    }

    const textStartX = margins.left + logoWidth + 7;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(company.name, textStartX, y + 6);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`S.A.R.L au capital de ${company.capital}`, textStartX, y + 12);
    doc.text(`RC: ${company.rccm} - NIF: ${company.nif}`, textStartX, y + 17);
    doc.text(company.address.toUpperCase(), textStartX, y + 22);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('LISTE DES PAIEMENTS', pageWidth - margins.right, y + 6, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(filterLabel, pageWidth - margins.right, y + 12, { align: 'right' });
    doc.text(`Généré le ${formatDateTime(new Date().toISOString())}`, pageWidth - margins.right, y + 17, { align: 'right' });

    y += 30;
    doc.setDrawColor(26, 35, 126);
    doc.setLineWidth(0.4);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 8;

    // ================================================================
    // INFORMATIONS DE FILTRE
    // ================================================================
    if (filterDetails.length > 0) {
      const filterHeight = 8 + (filterDetails.length * 5);
      doc.setFillColor(filters.searchTerm ? 255 : 245, filters.searchTerm ? 243 : 245, filters.searchTerm ? 224 : 245);
      doc.roundedRect(margins.left, y, contentWidth, filterHeight, 2, 2, 'F');
      doc.setDrawColor(filters.searchTerm ? 255 : 224, filters.searchTerm ? 204 : 224, filters.searchTerm ? 128 : 224);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, y, contentWidth, filterHeight, 2, 2, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(84, 110, 122);
      
      let filterY = y + 4;
      for (let idx = 0; idx < filterDetails.length; idx++) {
        doc.text(filterDetails[idx], margins.left + 6, filterY);
        filterY += 5;
      }
      
      y += filterHeight + 6;
    }

    // ================================================================
    // STATISTIQUES
    // ================================================================
    const statsY = y;
    const statsHeight = 22;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margins.left, statsY, contentWidth, statsHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, statsY, contentWidth, statsHeight, 2, 2, 'S');

    const statColWidth = contentWidth / 5;
    const statX1 = margins.left;
    const statX2 = margins.left + statColWidth;
    const statX3 = margins.left + statColWidth * 2;
    const statX4 = margins.left + statColWidth * 3;
    const statX5 = margins.left + statColWidth * 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 144, 156);
    
    doc.text('Total paiements', statX1 + 6, statsY + 7);
    doc.text('Terminés', statX2 + 6, statsY + 7);
    doc.text('En attente', statX3 + 6, statsY + 7);
    doc.text('Échoués/Annulés', statX4 + 6, statsY + 7);
    doc.text('Montant total', statX5 + 6, statsY + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(payments.length.toString(), statX1 + 6, statsY + 16);
    doc.setTextColor(76, 175, 80);
    doc.text(completedCount.toString(), statX2 + 6, statsY + 16);
    doc.setTextColor(255, 152, 0);
    doc.text(pendingCount.toString(), statX3 + 6, statsY + 16);
    doc.setTextColor(244, 67, 54);
    doc.text(failedCount.toString(), statX4 + 6, statsY + 16);
    doc.setTextColor(26, 35, 126);
    doc.text(formatCurrency(totalAmount), statX5 + 6, statsY + 16);

    y = statsY + statsHeight + 8;

    // ================================================================
    // TABLEAU
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('DÉTAIL DES PAIEMENTS', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    if (payments.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 144, 156);
      doc.text('Aucun paiement ne correspond à votre recherche', pageWidth / 2, y + 10, { align: 'center' });
      y += 20;
    } else {
      // Colonnes
      const colNumX = margins.left;
      const colPaymentX = margins.left + 18;
      const colInvoiceX = margins.left + 48;
      const colSupplierX = margins.left + 88;
      const colDateX = margins.left + 130;
      const colAmountX = pageWidth - margins.right - 2;

      // En-tête du tableau
      const headerY = y;
      doc.setFillColor(232, 234, 246);
      doc.rect(colNumX, headerY, contentWidth, 7, 'F');
      doc.setDrawColor(197, 202, 233);
      doc.setLineWidth(0.5);
      doc.line(colNumX, headerY + 7, pageWidth - margins.right, headerY + 7);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126);
      doc.text('N°', colNumX + 3, headerY + 4.5);
      doc.text('N° Paiement', colPaymentX + 3, headerY + 4.5);
      doc.text('Facture', colInvoiceX + 3, headerY + 4.5);
      doc.text('Fournisseur', colSupplierX + 3, headerY + 4.5);
      doc.text('Date', colDateX + 3, headerY + 4.5);
      doc.text('Montant', colAmountX - 3, headerY + 4.5, { align: 'right' });

      y = headerY + 7;
      let currentY = y;
      let rowIndex = 0;

      for (let idx = 0; idx < payments.length; idx++) {
        const payment = payments[idx];
        const amount = getAmount(payment);

        if (currentY > pageHeight - 60) {
          doc.addPage();
          addWatermark(doc, watermarkText, watermarkOptions);
          
          currentY = margins.top;
          doc.setFillColor(232, 234, 246);
          doc.rect(colNumX, currentY, contentWidth, 7, 'F');
          doc.setDrawColor(197, 202, 233);
          doc.setLineWidth(0.5);
          doc.line(colNumX, currentY + 7, pageWidth - margins.right, currentY + 7);

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 35, 126);
          doc.text('N°', colNumX + 3, currentY + 4.5);
          doc.text('N° Paiement', colPaymentX + 3, currentY + 4.5);
          doc.text('Facture', colInvoiceX + 3, currentY + 4.5);
          doc.text('Fournisseur', colSupplierX + 3, currentY + 4.5);
          doc.text('Date', colDateX + 3, currentY + 4.5);
          doc.text('Montant', colAmountX - 3, currentY + 4.5, { align: 'right' });
          currentY += 7;
        }

        // Alternance des couleurs
        if (rowIndex % 2 === 0) {
          doc.setFillColor(255, 255, 255);
          doc.rect(colNumX, currentY - 0.5, contentWidth, 6.5, 'F');
        } else {
          doc.setFillColor(250, 250, 250);
          doc.rect(colNumX, currentY - 0.5, contentWidth, 6.5, 'F');
        }

        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.1);
        doc.line(colNumX, currentY, pageWidth - margins.right, currentY);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(66, 66, 66);
        
        // N°
        doc.text((idx + 1).toString(), colNumX + 3, currentY + 4);
        
        // N° Paiement
        doc.text(payment.payment_number || '-', colPaymentX + 3, currentY + 4);
        
        // Facture
        doc.text(payment.invoice?.invoice_number || payment.invoice_number || '-', colInvoiceX + 3, currentY + 4);
        
        // Fournisseur
        const supplierName = payment.invoice?.supplier?.company_name || payment.supplier_name || '-';
        const supplierMaxWidth = colDateX - colSupplierX - 6;
        let supplierText = supplierName;
        if (doc.getTextWidth(supplierName) > supplierMaxWidth) {
          supplierText = supplierName.substring(0, Math.floor(supplierMaxWidth / 3.5)) + '...';
        }
        doc.text(supplierText, colSupplierX + 3, currentY + 4);
        
        // Date
        doc.text(formatDate(payment.payment_date), colDateX + 3, currentY + 4);
        
        // Montant
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        const amountText = formatCurrency(amount);
        const amountMaxWidth = colAmountX - colDateX - 6;
        if (doc.getTextWidth(amountText) > amountMaxWidth) {
          doc.setFontSize(6.5);
          doc.text(amountText, colAmountX - 3, currentY + 4, { align: 'right' });
          doc.setFontSize(8);
        } else {
          doc.text(amountText, colAmountX - 3, currentY + 4, { align: 'right' });
        }

        currentY += 6.5;
        rowIndex++;
      }

      doc.setDrawColor(180, 180, 190);
      doc.setLineWidth(0.3);
      doc.line(colNumX, currentY, pageWidth - margins.right, currentY);
      y = currentY + 5;

      // ================================================================
      // TOTAL
      // ================================================================
      const totalBoxHeight = 16;
      doc.setFillColor(232, 234, 246);
      doc.roundedRect(margins.left, y, contentWidth, totalBoxHeight, 2, 2, 'F');
      doc.setDrawColor(197, 202, 233);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, y, contentWidth, totalBoxHeight, 2, 2, 'S');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126);
      doc.text(`Total: ${payments.length} paiement(s)`, margins.left + 8, y + 11);

      const totalFormatted = formatCurrency(totalAmount);
      doc.setFontSize(12);
      let fontSizeTotal = 12;
      let textWidthTotal = doc.getTextWidth(totalFormatted);
      if (textWidthTotal > 70) {
        fontSizeTotal = 10;
        doc.setFontSize(fontSizeTotal);
        if (doc.getTextWidth(totalFormatted) > 70) {
          fontSizeTotal = 8;
          doc.setFontSize(fontSizeTotal);
        }
      }
      doc.text(totalFormatted, pageWidth - margins.right - 8, y + 11, { align: 'right' });

      y += totalBoxHeight + 8;

      // ================================================================
      // RÉSUMÉ DES STATUTS
      // ================================================================
      const summaryHeight = 20;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margins.left, y, contentWidth, summaryHeight, 2, 2, 'F');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126);
      doc.text('RÉSUMÉ DES STATUTS', margins.left + 6, y + 6);

      const summaryColWidth = contentWidth / 4;
      const sX1 = margins.left;
      const sX2 = margins.left + summaryColWidth;
      const sX3 = margins.left + summaryColWidth * 2;
      const sX4 = margins.left + summaryColWidth * 3;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 144, 156);
      
      doc.text('Terminés', sX1 + 6, y + 13);
      doc.text('En attente', sX2 + 6, y + 13);
      doc.text('Échoués/Annulés', sX3 + 6, y + 13);
      doc.text('Montant total', sX4 + 6, y + 13);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(76, 175, 80);
      doc.text(completedCount.toString(), sX1 + 6, y + 18);
      doc.setTextColor(255, 152, 0);
      doc.text(pendingCount.toString(), sX2 + 6, y + 18);
      doc.setTextColor(244, 67, 54);
      doc.text(failedCount.toString(), sX3 + 6, y + 18);
      doc.setTextColor(26, 35, 126);
      doc.text(formatCurrency(totalAmount), sX4 + 6, y + 18);

      y += summaryHeight + 8;
    }

    // ================================================================
    // SIGNATURES
    // ================================================================
    const signatureY = y + 8;
    const signatureWidth = 80;
    const signatureX1 = margins.left;
    const signatureX2 = pageWidth - margins.right - signatureWidth;

    doc.setDrawColor(66, 66, 66);
    doc.setLineWidth(0.5);
    doc.line(signatureX1, signatureY + 5, signatureX1 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Signature du fournisseur', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Signature SEYDI GROUP', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text('Responsable financier', signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    y = signatureY + 20;

    // ================================================================
    // PIED DE PAGE
    // ================================================================
    const footerY = pageHeight - margins.bottom - 10;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(`${company.name} - ${company.address}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Tél: ${company.phone} - Email: ${company.email}`, pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(`RC: ${company.rccm} - NIF: ${company.nif}`, pageWidth / 2, footerY + 8, { align: 'center' });

    // ================================================================
    // NUMÉROTATION DES PAGES ET FILIGRANE FINAL
    // ================================================================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addWatermark(doc, watermarkText, watermarkOptions);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 170);
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, pageHeight - margins.bottom, { align: 'right' });
    }

    const filename = options.filename || `Liste_paiements_${formatDate(new Date().toISOString())}.pdf`;
    doc.save(filename);
    return true;

  } catch (error) {
    console.error('Erreur PaiementsListePDF:', error);
    throw error;
  }
};

// ========== FONCTION DE TÉLÉCHARGEMENT ==========
export const downloadPaiementsListePDF = async (paiements, filters = {}, filename = null) => {
  try {
    if (!paiements || !Array.isArray(paiements)) {
      throw new Error('Les données des paiements sont invalides');
    }

    const options = { ...filters };
    if (filename) options.filename = filename;
    
    const result = await PaiementsListePDF(paiements, filters, options);
    return result;
  } catch (error) {
    console.error('Erreur lors du téléchargement de la liste des paiements :', error);
    throw error;
  }
};

// Export par défaut
export default PaiementsListePDF;