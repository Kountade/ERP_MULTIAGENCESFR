// src/components/achats/PaiementsFournisseurRecu.js
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
  return result.charAt(0).toUpperCase() + result.slice(1) + ' Francs CFA';
};

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

// ========== FONCTION POUR AJOUTER UN FILIGRANE OBLIQUE ==========
const addWatermark = (doc, text, options = {}) => {
  const {
    fontSize = 40,
    color = [200, 200, 200],
    opacity = 0.10,
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

// ========== FONCTIONS UTILITAIRES ==========
const getMethodLabel = (method) => {
  const labels = {
    cash: 'Espèces',
    bank_transfer: 'Virement bancaire',
    check: 'Chèque',
    card: 'Carte bancaire',
    mobile_money: 'Mobile Money',
    other: 'Autre'
  };
  return labels[method] || method || 'Non spécifié';
};

const getStatusInfo = (status) => {
  const map = {
    pending: { label: 'En attente', color: [255, 152, 0], bg: [255, 243, 224] },
    processing: { label: 'En cours', color: [33, 150, 243], bg: [227, 242, 253] },
    completed: { label: 'Terminé', color: [76, 175, 80], bg: [232, 245, 233] },
    failed: { label: 'Échoué', color: [244, 67, 54], bg: [255, 235, 238] },
    cancelled: { label: 'Annulé', color: [117, 117, 117], bg: [245, 245, 245] }
  };
  return map[status] || map.pending;
};

// ========== COMPOSANT PRINCIPAL ==========
const PaiementFournisseurRecu = async (paiement, options = {}) => {
  if (!paiement || typeof paiement !== 'object') {
    throw new Error('Données du paiement fournisseur invalides');
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

    // ========== DONNÉES DU PAIEMENT ==========
    const data = paiement || {};
    const statusInfo = getStatusInfo(data.status);

    const paymentNumber = data.payment_number || `PAY-${String(data.id || '').padStart(4, '0')}`;
    const supplierName = data.invoice?.supplier?.company_name || data.supplier_name || 'Non spécifié';
    const invoiceNumber = data.invoice?.invoice_number || data.invoice_number || '-';
    const paymentDate = data.payment_date || new Date().toISOString().split('T')[0];
    const amount = parseFloat(data.amount) || 0;
    const paymentMethod = getMethodLabel(data.payment_method);
    const agenceNom = data.agence?.nom || '-';
    const referenceNumber = data.reference_number || '';
    const notes = data.notes || '';
    const hasReceipt = data.receipt_file || false;
    
    // Informations de trésorerie
    const mouvementTresorerie = data.mouvement_tresorerie || null;
    const caisse = data.caisse || null;
    const compteBancaire = data.compte_bancaire || null;

    const totalEnLettres = nombreEnLettres(amount);

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
    const watermarkText = options.watermark || 'REÇU DE PAIEMENT';
    const watermarkOptions = {
      fontSize: options.watermarkSize || 40,
      color: options.watermarkColor || [200, 200, 200],
      opacity: options.watermarkOpacity || 0.10,
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
    doc.text('REÇU DE PAIEMENT', pageWidth - margins.right, y + 6, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`N° ${paymentNumber}`, pageWidth - margins.right, y + 12, { align: 'right' });
    doc.text(`Émis le ${formatDate(new Date().toISOString())}`, pageWidth - margins.right, y + 17, { align: 'right' });

    y += 30;
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
    
    doc.text('FOURNISSEUR', gridX1 + 4, gridY + 4.5);
    doc.text('FACTURE', gridX2 + 4, gridY + 4.5);
    doc.text('DATE PAIEMENT', gridX3 + 4, gridY + 4.5);
    doc.text('STATUT', gridX4 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(supplierName, gridX1 + 4, gridY + 12);
    doc.text(invoiceNumber, gridX2 + 4, gridY + 12);
    doc.text(formatDate(paymentDate), gridX3 + 4, gridY + 12);

    // Badge de statut
    const statusX = gridX4 + 4;
    const statusY = gridY + 5;
    const statusW = 40;
    const statusH = 10;
    doc.setFillColor(statusInfo.bg[0], statusInfo.bg[1], statusInfo.bg[2]);
    doc.setDrawColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(statusX, statusY, statusW, statusH, 2, 2, 'FD');
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
    doc.text(statusInfo.label.toUpperCase(), statusX + statusW / 2, statusY + 7, { align: 'center' });

    y = gridY + 22;

    // ================================================================
    // DÉTAILS DU PAIEMENT
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('DÉTAILS DU PAIEMENT', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    const detailY = y;
    const detailBoxHeight = (referenceNumber || mouvementTresorerie) ? 36 : 30;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, detailY, contentWidth, detailBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, detailY, contentWidth, detailBoxHeight, 2, 2, 'S');

    let detailRowY = detailY + 4;
    const detailLabelX = margins.left + 6;
    const detailValueX = margins.left + 65;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Numéro de paiement', detailLabelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(paymentNumber, detailValueX, detailRowY);

    detailRowY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Facture', detailLabelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(invoiceNumber, detailValueX, detailRowY);

    detailRowY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Fournisseur', detailLabelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(supplierName, detailValueX, detailRowY);

    detailRowY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Méthode de paiement', detailLabelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(paymentMethod, detailValueX, detailRowY);

    detailRowY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Agence', detailLabelX, detailRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(agenceNom, detailValueX, detailRowY);

    if (referenceNumber) {
      detailRowY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('N° de référence', detailLabelX, detailRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(referenceNumber, detailValueX, detailRowY);
    }

    if (paymentDate) {
      detailRowY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Date de paiement', detailLabelX, detailRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(formatDate(paymentDate), detailValueX, detailRowY);
    }

    y = detailY + detailBoxHeight + 8;

    // ================================================================
    // MONTANT PAYÉ
    // ================================================================
    const amountBoxHeight = 18;
    doc.setFillColor(232, 234, 246);
    doc.roundedRect(margins.left, y, contentWidth, amountBoxHeight, 2, 2, 'F');
    doc.setDrawColor(197, 202, 233);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, y, contentWidth, amountBoxHeight, 2, 2, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('MONTANT PAYÉ', margins.left + 8, y + 12);

    const montantFormatted = formatCurrency(amount);
    doc.setFontSize(16);
    doc.setTextColor(26, 35, 126);
    let fontSizeMontant = 16;
    let textWidthMontant = doc.getTextWidth(montantFormatted);
    if (textWidthMontant > 70) {
      fontSizeMontant = 14;
      doc.setFontSize(fontSizeMontant);
      if (doc.getTextWidth(montantFormatted) > 70) {
        fontSizeMontant = 12;
        doc.setFontSize(fontSizeMontant);
      }
    }
    doc.text(montantFormatted, pageWidth - margins.right - 8, y + 12, { align: 'right' });

    y += amountBoxHeight + 6;

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
    let lettresWidth = doc.getTextWidth(totalEnLettres);

    while (lettresWidth > lettresAvailableWidth && lettresFontSize > 5) {
      lettresFontSize -= 0.5;
      doc.setFontSize(lettresFontSize);
      lettresWidth = doc.getTextWidth(totalEnLettres);
    }

    if (lettresWidth > lettresAvailableWidth) {
      const splitLettres = doc.splitTextToSize(totalEnLettres, lettresAvailableWidth);
      doc.text(splitLettres, lettresStartX, y + 5);
    } else {
      doc.text(totalEnLettres, lettresStartX, y + 9);
    }

    y += lettresBoxHeight + 8;

    // ================================================================
    // INFORMATIONS DE TRÉSORERIE
    // ================================================================
    if (mouvementTresorerie || caisse || compteBancaire) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126);
      doc.text('INFORMATIONS DE TRÉSORERIE', margins.left, y);
      y += 2;
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.5);
      doc.line(margins.left, y, pageWidth - margins.right, y);
      y += 6;

      const tresoY = y;
      const tresoHeight = (mouvementTresorerie ? 18 : 0) + (caisse || compteBancaire ? 12 : 0);
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(margins.left, tresoY, contentWidth, tresoHeight || 12, 2, 2, 'F');
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, tresoY, contentWidth, tresoHeight || 12, 2, 2, 'S');

      let tresoRowY = tresoY + 4;

      if (mouvementTresorerie) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('N° Mouvement', margins.left + 6, tresoRowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(26, 35, 126);
        doc.text(mouvementTresorerie.id || '-', margins.left + 65, tresoRowY);
        tresoRowY += 6;
      }

      if (caisse) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Caisse', margins.left + 6, tresoRowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(26, 35, 126);
        doc.text(caisse.nom || '-', margins.left + 65, tresoRowY);
        tresoRowY += 6;
      }

      if (compteBancaire) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(84, 110, 122);
        doc.text('Compte bancaire', margins.left + 6, tresoRowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(26, 35, 126);
        doc.text(compteBancaire.nom || compteBancaire.iban || '-', margins.left + 65, tresoRowY);
        tresoRowY += 6;
      }

      y = tresoY + tresoHeight + 8;
    }

    // ================================================================
    // NOTES
    // ================================================================
    if (notes && typeof notes === 'string' && notes.trim()) {
      const notesBoxHeight = 20;
      doc.setFillColor(255, 243, 224);
      doc.roundedRect(margins.left, y, contentWidth, notesBoxHeight, 2, 2, 'F');
      doc.setDrawColor(255, 204, 128);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, y, contentWidth, notesBoxHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 81, 0);
      doc.text('Notes', margins.left + 6, y + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitNotes = doc.splitTextToSize(notes, contentWidth - 12);
      doc.text(splitNotes, margins.left + 6, y + 12);
      
      y += notesBoxHeight + 8;
    }

    // ================================================================
    // REÇU
    // ================================================================
    if (hasReceipt) {
      const receiptBoxHeight = 16;
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margins.left, y, contentWidth, receiptBoxHeight, 2, 2, 'F');
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2]);
      doc.roundedRect(margins.left, y, contentWidth, receiptBoxHeight, 2, 2, 'S');
      doc.setLineDashPattern([]);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(84, 110, 122);
      doc.text('✓ Un reçu est joint à ce paiement', pageWidth / 2, y + 10, { align: 'center' });
      
      y += receiptBoxHeight + 8;
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
    doc.text(`Date: ${formatDate(paymentDate)}`, signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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

    const filename = options.filename || `Reçu_paiement_${paymentNumber}.pdf`;
    doc.save(filename);
    return true;

  } catch (error) {
    console.error('Erreur PaiementFournisseurRecu:', error);
    throw error;
  }
};

// ========== FONCTION DE TÉLÉCHARGEMENT ==========
export const downloadPaiementFournisseurRecu = async (paiement, filename = null) => {
  try {
    if (!paiement || typeof paiement !== 'object') {
      throw new Error('Les données du paiement fournisseur sont invalides');
    }

    const options = {};
    if (filename) options.filename = filename;
    
    const result = await PaiementFournisseurRecu(paiement, options);
    return result;
  } catch (error) {
    console.error('Erreur lors du téléchargement du reçu de paiement fournisseur :', error);
    throw error;
  }
};

// Export par défaut
export default PaiementFournisseurRecu;