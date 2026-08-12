// src/components/transferts/TransfertPDF.js
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

const formatCurrency = (amt) => `${formatNumber(amt)} FCFA`;

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

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

// ========== FONCTION POUR OBTENIR LE STATUT ==========
const getStatusInfo = (status) => {
  const map = {
    draft: { label: 'Brouillon', color: [117, 117, 117], bg: [245, 245, 245] },
    pending_approval: { label: 'En attente', color: [255, 152, 0], bg: [255, 243, 224] },
    approved: { label: 'Approuvé', color: [33, 150, 243], bg: [227, 242, 253] },
    rejected: { label: 'Rejeté', color: [244, 67, 54], bg: [255, 235, 238] },
    in_transit: { label: 'En transit', color: [76, 175, 80], bg: [232, 245, 233] },
    partial: { label: 'Réception partielle', color: [255, 152, 0], bg: [255, 243, 224] },
    completed: { label: 'Terminé', color: [76, 175, 80], bg: [232, 245, 233] },
    cancelled: { label: 'Annulé', color: [117, 117, 117], bg: [245, 245, 245] },
  };
  return map[status] || map.draft;
};

// ========== COMPOSANT PRINCIPAL ==========
const TransfertPDF = async (transfer, options = {}) => {
  if (!transfer || typeof transfer !== 'object') {
    throw new Error('Données du transfert invalides');
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
      name: 'BUROK GROUP ',
      address: 'Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@burokgroup.com',
      rccm: 'SN DKR 2023 B 123',
      capital: '10 000 000 '
    };

    // ========== DONNÉES DU TRANSFERT ==========
    const data = transfer || {};
    const items = data.items || [];
    const fromAgence = data.from_agence || {};
    const toAgence = data.to_agence || {};
    const fromWarehouse = data.from_warehouse || {};
    const toWarehouse = data.to_warehouse || {};

    const reference = data.reference || 'Sans référence';
    const createdAt = data.created_at || new Date().toISOString().split('T')[0];
    const updatedAt = data.updated_at || '';
    const notes = data.notes || '';
    const rejectedReason = data.rejected_reason || '';

    const statusInfo = getStatusInfo(data.status);

    // Calcul des totaux
    const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const totalReceived = items.reduce((sum, item) => sum + (parseFloat(item.quantity_received) || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);
    const completionPercent = totalQuantity > 0 ? ((totalReceived / totalQuantity) * 100).toFixed(1) : 0;
    const totalEnLettres = nombreEnLettres(totalAmount);

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
    const watermarkText = options.watermark || 'BON DE TRANSFERT';
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
    doc.text(`N° RCCM : ${company.rccm}`, textStartX, y + 14.5);
    doc.text(company.address.toUpperCase(), textStartX, y + 18.5);
    
    doc.setFontSize(13.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('BON DE TRANSFERT', pageWidth - margins.right, y + 5.5, { align: 'right' });
    
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
    
    doc.text('DATE CRÉATION', gridX1 + 4, gridY + 4.5);
    doc.text('DERNIÈRE MODIF.', gridX2 + 4, gridY + 4.5);
    doc.text('TYPE', gridX3 + 4, gridY + 4.5);
    doc.text('STATUT', gridX4 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(formatDate(createdAt), gridX1 + 4, gridY + 12);
    doc.text(formatDate(updatedAt), gridX2 + 4, gridY + 12);
    doc.text('Transfert de stock', gridX3 + 4, gridY + 12);

    // Badge de statut
    const statusX = gridX4 + 4;
    const statusY = gridY + 5;
    const statusW = 45;
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
    // AGENCES
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('AGENCES', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    // Deux colonnes pour les agences
    const agenceBoxHeight = 30;
    const agenceWidth = (contentWidth - 6) / 2;

    // Agence source
    const agenceSourceX = margins.left;
    const agenceDestX = margins.left + agenceWidth + 6;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(agenceSourceX, y, agenceWidth, agenceBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(agenceSourceX, y, agenceWidth, agenceBoxHeight, 2, 2, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('AGENCE SOURCE', agenceSourceX + 4, y + 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);
    doc.text(`Nom : ${fromAgence.nom || 'N/A'}`, agenceSourceX + 4, y + 12);
    doc.text(`Type : ${fromAgence.type_agence === 'principale' ? 'Principale' : 'Secondaire'}`, agenceSourceX + 4, y + 18);
    doc.text(`Entrepôt : ${fromWarehouse.name || 'N/A'}`, agenceSourceX + 4, y + 24);

    // Agence destination
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(agenceDestX, y, agenceWidth, agenceBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(agenceDestX, y, agenceWidth, agenceBoxHeight, 2, 2, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('AGENCE DESTINATION', agenceDestX + 4, y + 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);
    doc.text(`Nom : ${toAgence.nom || 'N/A'}`, agenceDestX + 4, y + 12);
    doc.text(`Type : ${toAgence.type_agence === 'principale' ? 'Principale' : 'Secondaire'}`, agenceDestX + 4, y + 18);
    doc.text(`Entrepôt : ${toWarehouse.name || 'N/A'}`, agenceDestX + 4, y + 24);

    y += agenceBoxHeight + 8;

    // ================================================================
    // TABLEAU DES ARTICLES
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('ARTICLES', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    // Colonnes ajustées
    const colRefX = margins.left;
    const colDescX = margins.left + 35;
    const colQtyX = margins.left + 82;
    const colRecuX = margins.left + 105;
    const colPriceX = margins.left + 128;
    const colTotalX = pageWidth - margins.right - 2;

    const headerY = y;
    doc.setFillColor(26, 35, 126);
    doc.roundedRect(colRefX, headerY, contentWidth, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Réf.', colRefX + 3, headerY + 4.5);
    doc.text('Désignation', colDescX + 3, headerY + 4.5);
    doc.text('Qté', colQtyX + 3, headerY + 4.5);
    doc.text('Reçu', colRecuX + 3, headerY + 4.5);
    doc.text('Prix U.', colPriceX + 3, headerY + 4.5);
    doc.text('Total', colTotalX - 3, headerY + 4.5, { align: 'right' });

    y = headerY + 7;
    let currentY = y;
    let rowIndex = 0;

    if (items.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Aucun article dans ce transfert.', colRefX + 3, currentY + 5);
      currentY += 10;
    } else {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const productRef = item.product?.reference || '-';
        const productName = item.product?.name || item.product_name || 'Produit inconnu';
        const qty = parseFloat(item.quantity) || 0;
        const received = parseFloat(item.quantity_received) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const total = qty * price;

        if (currentY > pageHeight - 70) {
          doc.addPage();
          addWatermark(doc, watermarkText, watermarkOptions);
          
          currentY = margins.top;
          doc.setFillColor(26, 35, 126);
          doc.roundedRect(colRefX, currentY, contentWidth, 7, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text('Réf.', colRefX + 3, currentY + 4.5);
          doc.text('Désignation', colDescX + 3, currentY + 4.5);
          doc.text('Qté', colQtyX + 3, currentY + 4.5);
          doc.text('Reçu', colRecuX + 3, currentY + 4.5);
          doc.text('Prix U.', colPriceX + 3, currentY + 4.5);
          doc.text('Total', colTotalX - 3, currentY + 4.5, { align: 'right' });
          currentY += 7;
        }

        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(colRefX, currentY - 0.5, contentWidth, 6.5, 'F');
        }

        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.1);
        doc.line(colRefX, currentY, colRefX, currentY + 6);
        doc.line(colDescX, currentY, colDescX, currentY + 6);
        doc.line(colQtyX, currentY, colQtyX, currentY + 6);
        doc.line(colRecuX, currentY, colRecuX, currentY + 6);
        doc.line(colPriceX, currentY, colPriceX, currentY + 6);
        doc.line(colTotalX, currentY, colTotalX, currentY + 6);

        doc.setTextColor(33, 33, 33);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(productRef, colRefX + 3, currentY + 4);
        doc.text(productName, colDescX + 3, currentY + 4);
        doc.text(qty.toString(), colQtyX + 3, currentY + 4);
        doc.text(received.toString(), colRecuX + 3, currentY + 4);
        doc.text(formatCurrency(price), colPriceX + 3, currentY + 4);
        
        const totalText = formatCurrency(total);
        const maxWidth = colTotalX - colPriceX - 6;
        if (doc.getTextWidth(totalText) > maxWidth) {
          doc.setFontSize(6.5);
          doc.text(totalText, colTotalX - 3, currentY + 4, { align: 'right' });
          doc.setFontSize(7.5);
        } else {
          doc.text(totalText, colTotalX - 3, currentY + 4, { align: 'right' });
        }

        currentY += 6.5;
        rowIndex++;
      }
    }

    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.3);
    doc.line(colRefX, currentY, pageWidth - margins.right, currentY);
    y = currentY + 5;

    // ================================================================
    // TOTAUX
    // ================================================================
    let ay = y;

    // 1. Bloc TOTAL
    const amountBoxWidth = 80;
    const amountBoxX = pageWidth - margins.right - amountBoxWidth;
    const amountBoxHeight = 12;

    doc.setFillColor(26, 35, 126);
    doc.roundedRect(amountBoxX - 7, ay - 2, amountBoxWidth + 8, amountBoxHeight, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('VALEUR TOTALE', amountBoxX + 4, ay + 6);

    const totalFormatted = formatCurrency(totalAmount);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    let fontSizeTotal = 12;
    let textWidthTotal = doc.getTextWidth(totalFormatted);
    if (textWidthTotal > amountBoxWidth - 10) {
      fontSizeTotal = 10;
      doc.setFontSize(fontSizeTotal);
      if (doc.getTextWidth(totalFormatted) > amountBoxWidth - 10) {
        fontSizeTotal = 8;
        doc.setFontSize(fontSizeTotal);
      }
    }
    doc.text(totalFormatted, amountBoxX + amountBoxWidth, ay + 6, { align: 'right' });

    ay += amountBoxHeight + 4;

    // 2. Montant en toutes lettres
    const lettresBoxHeight = 14;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Montant en toutes lettres :', margins.left + 6, ay + 9);

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
      doc.text(splitLettres, lettresStartX, ay + 5);
    } else {
      doc.text(totalEnLettres, lettresStartX, ay + 9);
    }

    ay += lettresBoxHeight + 6;

    // 3. Résumé des quantités
    const quantiteBoxHeight = 16;
    doc.setFillColor(232, 234, 246);
    doc.roundedRect(margins.left, ay, contentWidth, quantiteBoxHeight, 2, 2, 'F');
    doc.setDrawColor(197, 202, 233);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, ay, contentWidth, quantiteBoxHeight, 2, 2, 'S');

    const quantiteColWidth = contentWidth / 4;
    const qX1 = margins.left;
    const qX2 = margins.left + quantiteColWidth;
    const qX3 = margins.left + quantiteColWidth * 2;
    const qX4 = margins.left + quantiteColWidth * 3;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('ARTICLES', qX1 + 6, ay + 6);
    doc.text('QTÉ TOTALE', qX2 + 6, ay + 6);
    doc.text('QTÉ REÇUE', qX3 + 6, ay + 6);
    doc.text('AVANCEMENT', qX4 + 6, ay + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(items.length.toString(), qX1 + 6, ay + 13);
    doc.text(formatNumber(totalQuantity), qX2 + 6, ay + 13);
    doc.text(formatNumber(totalReceived), qX3 + 6, ay + 13);
    doc.text(`${completionPercent}%`, qX4 + 6, ay + 13);

    ay += quantiteBoxHeight + 6;

    // ================================================================
    // NOTES
    // ================================================================
    if (notes && typeof notes === 'string' && notes.trim()) {
      const notesBoxHeight = 20;
      doc.setFillColor(255, 243, 224);
      doc.roundedRect(margins.left, ay, contentWidth, notesBoxHeight, 2, 2, 'F');
      doc.setDrawColor(255, 204, 128);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, ay, contentWidth, notesBoxHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 81, 0);
      doc.text('Notes', margins.left + 6, ay + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitNotes = doc.splitTextToSize(notes, contentWidth - 12);
      doc.text(splitNotes, margins.left + 6, ay + 12);
      
      ay += notesBoxHeight + 6;
    }

    // ================================================================
    // MOTIF DE REJET
    // ================================================================
    if (data.status === 'rejected' && rejectedReason && typeof rejectedReason === 'string' && rejectedReason.trim()) {
      const rejectBoxHeight = 20;
      doc.setFillColor(255, 235, 238);
      doc.roundedRect(margins.left, ay, contentWidth, rejectBoxHeight, 2, 2, 'F');
      doc.setDrawColor(244, 67, 54);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, ay, contentWidth, rejectBoxHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(198, 40, 40);
      doc.text('Motif du rejet', margins.left + 6, ay + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitReject = doc.splitTextToSize(rejectedReason, contentWidth - 12);
      doc.text(splitReject, margins.left + 6, ay + 12);
      
      ay += rejectBoxHeight + 6;
    }

    y = ay;

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
    doc.text('Signature agence source', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text('Cachet et signature', signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Signature agence destination', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text('Cachet et signature', signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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
    doc.text('SEYDI GROUP SARL - DAKAR, SÉNÉGAL', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Tél: ${company.phone} - Email: ${company.email}`, pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(`RCCM: ${company.rccm} - Capital: ${company.capital}`, pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text(`Généré le ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, footerY + 12, { align: 'center' });

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

    doc.save(`Transfert_${reference}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur TransfertPDF:', error);
    throw error;
  }
};

// ========== FONCTION DE TÉLÉCHARGEMENT ==========
export const downloadTransfertPDF = async (transfer, filename = null) => {
  try {
    if (!transfer || typeof transfer !== 'object') {
      throw new Error('Les données du transfert sont invalides');
    }

    const result = await TransfertPDF(transfer);
    return result;
  } catch (error) {
    console.error('Erreur lors du téléchargement du bon de transfert :', error);
    throw error;
  }
};

// Export par défaut
export default TransfertPDF;