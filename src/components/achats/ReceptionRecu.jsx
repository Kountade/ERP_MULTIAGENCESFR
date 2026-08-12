// src/components/achats/ReceptionRecu.js
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

// ========== FONCTIONS D'EXTRACTION DES DONNÉES ==========
const getUnitPrice = (item) => {
  if (!item) return 0;
  let price = item.unit_price || 
              item.price || 
              item.order_item?.unit_price || 
              item.order_item?.price || 
              0;
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/,/g, ''));
  }
  return isNaN(price) ? 0 : price;
};

const getQuantity = (item) => {
  if (!item) return 0;
  let qty = item.quantity || 
            item.qty || 
            item.order_item?.quantity || 
            0;
  if (typeof qty === 'string') {
    qty = parseFloat(qty.replace(/,/g, ''));
  }
  return isNaN(qty) ? 0 : qty;
};

const getProductName = (item) => {
  if (!item) return 'N/A';
  return item.product_name || 
         item.name ||
         item.order_item?.product?.name || 
         item.product?.name || 
         'N/A';
};

const getProductReference = (item) => {
  if (!item) return '-';
  return item.product_reference || 
         item.reference ||
         item.order_item?.product?.reference || 
         item.product?.reference || 
         '-';
};

const getLineTotal = (item) => {
  const qty = getQuantity(item);
  const price = getUnitPrice(item);
  return qty * price;
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
const ReceptionRecu = async (reception, options = {}) => {
  if (!reception || typeof reception !== 'object') {
    throw new Error('Données de la réception invalides');
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
      address: 'Dakar, Sénégal',
      phone: '+221 33 800 00 00',
      email: 'contact@seydigroup.sn',
      rccm: '2025/G/001',
      nif: '123456789',
      capital: '50 000 000 FCFA'
    };

    // ========== DONNÉES DE LA RÉCEPTION ==========
    const data = reception || {};
    const items = data.items || [];

    const receiptNumber = data.receipt_number || `REC-${String(data.id || '').padStart(4, '0')}`;
    const orderNumber = data.order_number || data.purchase_order?.order_number || '-';
    const supplierName = data.supplier_name || data.purchase_order?.supplier?.company_name || '-';
    const receiptDate = data.receipt_date || new Date().toISOString().split('T')[0];

    // Calcul des totaux
    let totalValue = 0;
    const itemsWithDetails = items.map(item => {
      const qty = getQuantity(item);
      const price = getUnitPrice(item);
      const total = qty * price;
      totalValue += total;
      
      return {
        ...item,
        quantity: qty,
        unit_price: price,
        total: total,
        product_name: getProductName(item),
        product_reference: getProductReference(item)
      };
    });

    const totalCosts = parseFloat(data.total_costs) || 0;
    const grandTotal = totalValue + totalCosts;
    const totalEnLettres = nombreEnLettres(grandTotal);

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
    const watermarkText = options.watermark || 'REÇU DE RÉCEPTION';
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
    doc.text('REÇU DE RÉCEPTION', pageWidth - margins.right, y + 6, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`N° ${receiptNumber}`, pageWidth - margins.right, y + 12, { align: 'right' });
    doc.text(`Émis le ${formatDateTime(new Date().toISOString())}`, pageWidth - margins.right, y + 17, { align: 'right' });

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
    
    doc.text('N° RÉCEPTION', gridX1 + 4, gridY + 4.5);
    doc.text('COMMANDE', gridX2 + 4, gridY + 4.5);
    doc.text('FOURNISSEUR', gridX3 + 4, gridY + 4.5);
    doc.text('DATE', gridX4 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(receiptNumber, gridX1 + 4, gridY + 12);
    doc.text(orderNumber, gridX2 + 4, gridY + 12);
    doc.text(supplierName, gridX3 + 4, gridY + 12);
    doc.text(formatDate(receiptDate), gridX4 + 4, gridY + 12);

    y = gridY + 22;

    // ================================================================
    // TABLEAU DES ARTICLES
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('ARTICLES REÇUS', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    // Colonnes
    const colNumX = margins.left;
    const colProductX = margins.left + 18;
    const colQtyX = margins.left + 80;
    const colPriceX = margins.left + 105;
    const colTotalX = pageWidth - margins.right - 2;

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
    doc.text('Produit', colProductX + 3, headerY + 4.5);
    doc.text('Qté', colQtyX + 3, headerY + 4.5);
    doc.text('Prix unitaire', colPriceX + 3, headerY + 4.5);
    doc.text('Total', colTotalX - 3, headerY + 4.5, { align: 'right' });

    y = headerY + 7;
    let currentY = y;
    let rowIndex = 0;

    if (itemsWithDetails.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 144, 156);
      doc.text('Aucun article dans cette réception', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 20;
    } else {
      for (let idx = 0; idx < itemsWithDetails.length; idx++) {
        const item = itemsWithDetails[idx];

        if (currentY > pageHeight - 70) {
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
          doc.text('Produit', colProductX + 3, currentY + 4.5);
          doc.text('Qté', colQtyX + 3, currentY + 4.5);
          doc.text('Prix unitaire', colPriceX + 3, currentY + 4.5);
          doc.text('Total', colTotalX - 3, currentY + 4.5, { align: 'right' });
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
        
        // Produit
        const productName = item.product_name;
        const productRef = item.product_reference;
        let displayName = productName;
        if (productRef && productRef !== '-') {
          displayName = `${productName} (${productRef})`;
        }
        const productMaxWidth = colQtyX - colProductX - 6;
        if (doc.getTextWidth(displayName) > productMaxWidth) {
          doc.setFontSize(6.5);
          doc.text(displayName, colProductX + 3, currentY + 4);
          doc.setFontSize(8);
        } else {
          doc.text(displayName, colProductX + 3, currentY + 4);
        }
        
        // Qté
        doc.text(item.quantity.toString(), colQtyX + 3, currentY + 4);
        
        // Prix unitaire
        doc.text(formatCurrency(item.unit_price), colPriceX + 3, currentY + 4);
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 35, 126);
        const totalText = formatCurrency(item.total);
        const totalMaxWidth = colTotalX - colPriceX - 6;
        if (doc.getTextWidth(totalText) > totalMaxWidth) {
          doc.setFontSize(6.5);
          doc.text(totalText, colTotalX - 3, currentY + 4, { align: 'right' });
          doc.setFontSize(8);
        } else {
          doc.text(totalText, colTotalX - 3, currentY + 4, { align: 'right' });
        }

        currentY += 6.5;
        rowIndex++;
      }

      doc.setDrawColor(180, 180, 190);
      doc.setLineWidth(0.3);
      doc.line(colNumX, currentY, pageWidth - margins.right, currentY);
      y = currentY + 5;
    }

    // ================================================================
    // TOTAUX
    // ================================================================
    let ay = y;

    // Bloc des totaux
    const totalBoxHeight = (totalCosts > 0) ? 28 : 20;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margins.left, ay, contentWidth, totalBoxHeight, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text('Valeur des marchandises', margins.left + 6, ay + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(formatCurrency(totalValue), pageWidth - margins.right - 6, ay + 7, { align: 'right' });

    if (totalCosts > 0) {
      ay += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(84, 110, 122);
      doc.text('Frais annexes', margins.left + 6, ay + 7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 152, 0);
      doc.text(formatCurrency(totalCosts), pageWidth - margins.right - 6, ay + 7, { align: 'right' });
    }

    ay += 6;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left + 6, ay, pageWidth - margins.right - 6, ay);
    ay += 4;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('TOTAL RÉCEPTION', margins.left + 6, ay + 7);
    
    const totalFormatted = formatCurrency(grandTotal);
    doc.setFontSize(14);
    let fontSizeTotal = 14;
    let textWidthTotal = doc.getTextWidth(totalFormatted);
    if (textWidthTotal > 70) {
      fontSizeTotal = 12;
      doc.setFontSize(fontSizeTotal);
      if (doc.getTextWidth(totalFormatted) > 70) {
        fontSizeTotal = 10;
        doc.setFontSize(fontSizeTotal);
      }
    }
    doc.text(totalFormatted, pageWidth - margins.right - 6, ay + 7, { align: 'right' });

    ay += totalBoxHeight + 6;

    // ================================================================
    // MONTANT EN TOUTES LETTRES
    // ================================================================
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

    ay += lettresBoxHeight + 8;

    y = ay;

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
    doc.text('Signature du réceptionnaire', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(`Date: ${formatDate(receiptDate)}`, signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Signature SEYDI GROUP', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text('Responsable logistique', signatureX2 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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

    const filename = options.filename || `Reçu_reception_${receiptNumber}.pdf`;
    doc.save(filename);
    return true;

  } catch (error) {
    console.error('Erreur ReceptionRecu:', error);
    throw error;
  }
};

// ========== FONCTION DE TÉLÉCHARGEMENT ==========
export const downloadReceptionRecu = async (reception, filename = null) => {
  try {
    if (!reception || typeof reception !== 'object') {
      throw new Error('Les données de la réception sont invalides');
    }

    const options = {};
    if (filename) options.filename = filename;
    
    const result = await ReceptionRecu(reception, options);
    return result;
  } catch (error) {
    console.error('Erreur lors du téléchargement du reçu de réception :', error);
    throw error;
  }
};

// Export par défaut
export default ReceptionRecu;