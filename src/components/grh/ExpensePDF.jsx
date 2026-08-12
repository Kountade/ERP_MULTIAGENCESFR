// src/components/expenses/ExpensePDF.jsx

import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

// ========== FONCTION POUR ÉCRIRE LES NOMBRES EN LETTRES ==========
const nombreEnLettres = (montant) => {
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const centaine = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];

  const sousBloc = (n) => {
    if (n === 0) return '';
    let lettres = '';
    const cents = Math.floor(n / 100);
    const reste = n % 100;
    if (cents > 0) {
      lettres += centaine[cents];
      if (reste > 0) lettres += ' ';
    }
    if (reste > 0) {
      if (reste < 10) lettres += unite[reste];
      else if (reste < 20) {
        const u = reste - 10;
        if (u === 0) lettres += 'dix';
        else if (u === 1) lettres += 'onze';
        else if (u === 2) lettres += 'douze';
        else if (u === 3) lettres += 'treize';
        else if (u === 4) lettres += 'quatorze';
        else if (u === 5) lettres += 'quinze';
        else if (u === 6) lettres += 'seize';
        else lettres += dizaine[1] + (u ? '-' + unite[u] : '');
      } else {
        const d = Math.floor(reste / 10);
        const u = reste % 10;
        if (d === 7 || d === 9) {
          lettres += dizaine[d - 1] + '-' + (u === 0 ? '' : (u === 1 ? 'onze' : unite[u + 10]));
        } else {
          lettres += dizaine[d];
          if (u === 1 && d !== 8) lettres += ' et un';
          else if (u > 0) lettres += '-' + unite[u];
        }
      }
    }
    return lettres.trim();
  };

  const milliers = Math.floor(montant / 1000);
  const resteMilliers = montant % 1000;
  let result = '';
  if (milliers > 0) {
    if (milliers === 1) result += 'mille';
    else result += sousBloc(milliers) + ' mille';
    if (resteMilliers > 0) result += ' ';
  }
  if (resteMilliers > 0) result += sousBloc(resteMilliers);
  if (result === '') result = 'zéro';
  return result.charAt(0).toUpperCase() + result.slice(1) + ' Francs Guinéens';
};

// ========== FONCTIONS DE FORMATAGE ==========
const formatNumber = (n) => {
  const num = parseFloat(n) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatCurrency = (amt) => `${formatNumber(amt)} GNF`;

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

// ========== FONCTION POUR AJOUTER UN FILIGRANE OBLIQUE ==========
const addWatermark = (doc, text, options = {}) => {
  const {
    fontSize = 40,
    color = [200, 200, 200],
    opacity = 0.15,
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

// ========== TYPE DE FRAIS ==========
const getTypeLabel = (type) => {
  const labels = {
    transport: 'Transport',
    meal: 'Repas',
    accommodation: 'Hébergement',
    supplies: 'Fournitures',
    client: 'Client',
    other: 'Autre'
  };
  return labels[type] || type;
};

// ========== STATUT AVEC STYLE ==========
const getStatusStyle = (status) => {
  const statusMap = {
    pending: { label: 'En attente', bg: [255, 243, 224], border: [255, 152, 0], text: [255, 152, 0] },
    approved: { label: 'Validé', bg: [232, 245, 233], border: [76, 175, 80], text: [76, 175, 80] },
    paid: { label: 'Payé', bg: [227, 242, 253], border: [33, 150, 243], text: [33, 150, 243] },
    rejected: { label: 'Rejeté', bg: [255, 235, 238], border: [244, 67, 54], text: [244, 67, 54] },
    cancelled: { label: 'Annulé', bg: [245, 245, 245], border: [158, 158, 158], text: [158, 158, 158] }
  };
  return statusMap[status] || statusMap.pending;
};

// ========== COMPOSANT PRINCIPAL ==========
const ExpensePDF = async (expense, options = {}) => {
  if (!expense || typeof expense !== 'object') {
    throw new Error('Données de la dépense invalides');
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
      name: 'SEYDI GROUP',
      address: 'Conakry, République de Guinée',
      phone: '+224 600 00 00 00',
      email: 'contact@seydigroup.gn',
      rccm: 'RC: 2025/G/001',
      nif: 'NIF: 123456789',
      capital: '50 000 000 GNF'
    };

    // ========== DONNÉES DE LA DÉPENSE ==========
    const expenseData = expense || {};
    const status = expenseData.status || 'pending';
    const statusStyle = getStatusStyle(status);
    
    const reference = expenseData.reference || `EXP-${String(expenseData.id || '').padStart(4, '0')}`;
    const date = expenseData.date || new Date().toISOString().split('T')[0];
    const expenseType = expenseData.expense_type || 'other';
    const typeLabel = getTypeLabel(expenseType);
    const amount = parseFloat(expenseData.amount) || 0;
    const description = expenseData.description || 'Sans description';
    const employeeName = expenseData.employee_name || expenseData.employee?.full_name || 'Non spécifié';
    
    // Données optionnelles
    const approvedByName = expenseData.approved_by_name || '';
    const paymentDate = expenseData.payment_date || '';
    const rejectionReason = expenseData.rejection_reason || '';
    const comments = expenseData.comments || '';
    const hasReceipt = expenseData.receipt || false;

    const amountEnLettres = nombreEnLettres(amount);
    const docTitle = 'NOTE DE FRAIS';

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
    const watermarkText = options.watermark || 'NOTE DE FRAIS';
    const watermarkOptions = {
      fontSize: options.watermarkSize || 40,
      color: options.watermarkColor || [200, 200, 200],
      opacity: options.watermarkOpacity || 0.15,
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
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, margins.left, y + 5);
    }

    const textStartX = margins.left + logoWidth + 7;
    doc.setFontSize(13.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(company.name, textStartX, y + 5.5);
    
    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`Capital social : ${company.capital}`, textStartX, y + 10.5);
    doc.text(`${company.rccm} - ${company.nif}`, textStartX, y + 14.5);
    doc.text(company.address.toUpperCase(), textStartX, y + 18.5);
    
    doc.setFontSize(13.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(docTitle, pageWidth - margins.right, y + 5.5, { align: 'right' });
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`N° ${reference}`, pageWidth - margins.right, y + 10.5, { align: 'right' });
    doc.text(`Émis le ${formatDate(new Date().toISOString())}`, pageWidth - margins.right, y + 14.5, { align: 'right' });

    y += 27;
    doc.setDrawColor(26, 35, 126);
    doc.setLineWidth(0.4);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 8;

    // ================================================================
    // GRILLE D'INFORMATIONS
    // ================================================================
    const gridY = y;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, gridY, contentWidth, 18, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, gridY, contentWidth, 18, 2, 2, 'S');

    const colWidth = contentWidth / 4;
    const gridX1 = margins.left;
    const gridX2 = margins.left + colWidth;
    const gridX3 = margins.left + colWidth * 2;
    const gridX4 = margins.left + colWidth * 3;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 144, 156);
    
    doc.text('EMPLOYÉ', gridX1 + 4, gridY + 4.5);
    doc.text('TYPE DE FRAIS', gridX2 + 4, gridY + 4.5);
    doc.text('DATE DE LA DÉPENSE', gridX3 + 4, gridY + 4.5);
    doc.text('STATUT', gridX4 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(employeeName, gridX1 + 4, gridY + 12);
    doc.text(typeLabel, gridX2 + 4, gridY + 12);
    doc.text(formatDate(date), gridX3 + 4, gridY + 12);

    // Badge de statut
    const statusX = gridX4 + 4;
    const statusY = gridY + 4.5;
    const statusText = statusStyle.label;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const statusWidth = doc.getTextWidth(statusText) + 10;
    
    doc.setFillColor(statusStyle.bg[0], statusStyle.bg[1], statusStyle.bg[2]);
    doc.setDrawColor(statusStyle.border[0], statusStyle.border[1], statusStyle.border[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(statusX, statusY, statusWidth + 6, 8, 2, 2, 'FD');
    
    doc.setTextColor(statusStyle.text[0], statusStyle.text[1], statusStyle.text[2]);
    doc.text(statusText, statusX + 3, statusY + 5.5);

    y = gridY + 22;

    // ================================================================
    // DÉTAILS DE LA NOTE
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('DÉTAILS DE LA NOTE', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    const detailY = y;
    const detailHeight = 70;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, detailY, contentWidth, detailHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, detailY, contentWidth, detailHeight, 2, 2, 'S');

    let detailRowY = detailY + 4;
    const labelX = margins.left + 6;
    const valueX = margins.left + 50;

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Description', labelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    const descLines = doc.splitTextToSize(description, contentWidth - 60);
    doc.text(descLines, valueX, detailRowY);
    detailRowY += (descLines.length * 5) + 4;

    // Montant
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Montant', labelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(formatCurrency(amount), valueX, detailRowY);
    detailRowY += 6;

    // Catégorie
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Catégorie', labelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(typeLabel, valueX, detailRowY);
    detailRowY += 6;

    // Validé par (si disponible)
    if (approvedByName) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Validé par', labelX, detailRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(approvedByName, valueX, detailRowY);
      detailRowY += 6;
    }

    // Date de paiement (si disponible)
    if (paymentDate) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Date de paiement', labelX, detailRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(formatDate(paymentDate), valueX, detailRowY);
      detailRowY += 6;
    }

    y = detailY + detailHeight + 8;

    // ================================================================
    // MONTANT TOTAL
    // ================================================================
    const amountBoxWidth = 70;
    const amountBoxX = pageWidth - margins.right - amountBoxWidth;
    const amountBoxHeight = 12;

    doc.setFillColor(26, 35, 126);
    doc.roundedRect(amountBoxX - 7, y - 2, amountBoxWidth + 8, amountBoxHeight, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MONTANT TOTAL', amountBoxX + 4, y + 6);

    const totalFormatted = formatCurrency(amount);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    let fontSizeTotal = 12;
    let textWidthTotal = doc.getTextWidth(totalFormatted);
    if (textWidthTotal > amountBoxWidth - 10) {
      fontSizeTotal = 10;
      doc.setFontSize(fontSizeTotal);
    }
    doc.text(totalFormatted, amountBoxX + amountBoxWidth, y + 6, { align: 'right' });

    y += amountBoxHeight + 4;

    // ================================================================
    // MONTANT EN TOUTES LETTRES
    // ================================================================
    const lettresBoxHeight = 14;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, y, contentWidth, lettresBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, y, contentWidth, lettresBoxHeight, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Montant en toutes lettres :', margins.left + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);

    const lettresStartX = margins.left + 65;
    const lettresAvailableWidth = contentWidth - 70;

    let lettresFontSize = 8;
    doc.setFontSize(lettresFontSize);
    let lettresWidth = doc.getTextWidth(amountEnLettres);

    while (lettresWidth > lettresAvailableWidth && lettresFontSize > 5) {
      lettresFontSize -= 0.5;
      doc.setFontSize(lettresFontSize);
      lettresWidth = doc.getTextWidth(amountEnLettres);
    }

    if (lettresWidth > lettresAvailableWidth) {
      const splitLettres = doc.splitTextToSize(amountEnLettres, lettresAvailableWidth);
      doc.text(splitLettres, lettresStartX, y + 5);
    } else {
      doc.text(amountEnLettres, lettresStartX, y + 9);
    }

    y += lettresBoxHeight + 6;

    // ================================================================
    // COMMENTAIRES / REJET
    // ================================================================
    if (status === 'rejected' && rejectionReason) {
      const commentHeight = 20;
      doc.setFillColor(255, 235, 238);
      doc.roundedRect(margins.left, y, contentWidth, commentHeight, 2, 2, 'F');
      doc.setDrawColor(244, 67, 54);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, y, contentWidth, commentHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(211, 47, 47);
      doc.text('Motif du rejet', margins.left + 6, y + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitNotes = doc.splitTextToSize(rejectionReason, contentWidth - 12);
      doc.text(splitNotes, margins.left + 6, y + 12);
      
      y += commentHeight + 6;
    } else if (comments && status !== 'rejected') {
      const commentHeight = 20;
      doc.setFillColor(255, 248, 230);
      doc.roundedRect(margins.left, y, contentWidth, commentHeight, 2, 2, 'F');
      doc.setDrawColor(255, 204, 128);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, y, contentWidth, commentHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 81, 0);
      doc.text('Commentaires', margins.left + 6, y + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitNotes = doc.splitTextToSize(comments, contentWidth - 12);
      doc.text(splitNotes, margins.left + 6, y + 12);
      
      y += commentHeight + 6;
    }

    // ================================================================
    // REÇU
    // ================================================================
    if (hasReceipt) {
      const receiptHeight = 14;
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margins.left, y, contentWidth, receiptHeight, 2, 2, 'F');
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([3, 2]);
      doc.roundedRect(margins.left, y, contentWidth, receiptHeight, 2, 2, 'S');
      doc.setLineDashPattern([], 0);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(84, 110, 122);
      doc.text('Un reçu est joint à cette note de frais', pageWidth / 2, y + 9, { align: 'center' });
      
      y += receiptHeight + 6;
    }

    // ================================================================
    // SIGNATURES
    // ================================================================
    const signatureY = y + 8;
    const signatureWidth = 85;
    const signatureX1 = margins.left;
    const signatureX2 = pageWidth - margins.right - signatureWidth;

    doc.setDrawColor(66, 66, 66);
    doc.setLineWidth(0.5);
    doc.line(signatureX1, signatureY + 5, signatureX1 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text(`Signature de l'employé`, signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(`Date: ${formatDate(date)}`, signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text(`Signature de l'employeur`, signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(company.name, signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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
    doc.text(`${company.rccm} - ${company.nif}`, pageWidth / 2, footerY + 8, { align: 'center' });

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

    doc.save(`Note_frais_${reference}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur ExpensePDF:', error);
    throw error;
  }
};

export default ExpensePDF;