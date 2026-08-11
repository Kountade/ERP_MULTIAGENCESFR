// src/components/ventes/Livraison.jsx
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

// ========== COMPOSANT PRINCIPAL ==========
const Livraison = async (vente, options = {}) => {
  if (!vente || typeof vente !== 'object') {
    throw new Error('Données de la vente invalides');
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
      name: 'BUROK EMPIRE',
      address: 'Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@burokempire.com',
      rccm: 'SN DKR 2023 B 123',
      capital: '10 000 000 FCFA'
    };

    // ========== DONNÉES CLIENT ==========
    const client = vente.client || {};
    const clientNom = client.raison_sociale || client.nom || 'Client anonyme';
    const clientPrenom = client.prenom || '';
    const clientFull = clientPrenom ? `${clientNom} ${clientPrenom}` : clientNom;
    const clientEmail = client.email || '';
    const clientTel = client.telephone || '';
    const clientAdr = client.adresse || '';

    // ========== DONNÉES VENTE ==========
    const reference = vente.reference || 'Sans référence';
    const dateVente = vente.date_vente || new Date().toISOString().split('T')[0];
    const typeVente = vente.type_vente || 'comptoir';
    const agenceNom = vente.agence?.nom || 'Agence principale';
    const vendeurNom = vente.vendeur?.email || vente.vendeur_nom || 'Commercial';

    const dateLivraison = options.date_livraison || '';
    const adresseLivraison = options.adresse_livraison || clientAdr;
    const contactLivraison = options.contact_livraison || clientTel;
    const instructions = options.instructions || '';

    const items = vente.items || [];
    const sousTotal = parseFloat(vente.sous_total) || 0;
    const tva = parseFloat(vente.tva) || 0;
    const total = parseFloat(vente.total) || 0;

    const blReference = `BL-${reference}`;
    const totalEnLettres = nombreEnLettres(total);

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
    const watermarkText = options.watermark || 'BON DE LIVRAISON';
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
    doc.text('BON DE LIVRAISON', pageWidth - margins.right, y + 5.5, { align: 'right' });
    
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

    const colWidth = contentWidth / 5;
    const gridX1 = margins.left;
    const gridX2 = margins.left + colWidth;
    const gridX3 = margins.left + colWidth * 2;
    const gridX4 = margins.left + colWidth * 3;
    const gridX5 = margins.left + colWidth * 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 144, 156);
    
    doc.text('DATE VENTE', gridX1 + 4, gridY + 4.5);
    doc.text('AGENCE', gridX2 + 4, gridY + 4.5);
    doc.text('VENDEUR', gridX3 + 4, gridY + 4.5);
    doc.text('TYPE', gridX4 + 4, gridY + 4.5);
    doc.text('DATE LIVRAISON', gridX5 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(formatDate(dateVente), gridX1 + 4, gridY + 12);
    doc.text(agenceNom, gridX2 + 4, gridY + 12);
    doc.text(vendeurNom, gridX3 + 4, gridY + 12);
    
    const typeLabel = typeVente === 'comptoir' ? 'Comptoir' :
                     typeVente === 'livraison' ? 'Livraison' :
                     typeVente === 'en_ligne' ? 'En ligne' : typeVente;
    doc.text(typeLabel, gridX4 + 4, gridY + 12);
    doc.text(dateLivraison ? formatDate(dateLivraison) : 'Non spécifiée', gridX5 + 4, gridY + 12);

    y = gridY + 22;

    // ================================================================
    // INFORMATIONS CLIENT
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('INFORMATIONS CLIENT', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    const clientY = y;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, clientY, contentWidth, 30, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, clientY, contentWidth, 30, 2, 2, 'S');

    let clientRowY = clientY + 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Nom / Raison sociale', margins.left + 6, clientRowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 35, 126);
    doc.text(clientFull, margins.left + 50, clientRowY);

    clientRowY += 6;
    if (clientEmail) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Email', margins.left + 6, clientRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(clientEmail, margins.left + 50, clientRowY);
      clientRowY += 6;
    }
    if (clientTel) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Téléphone', margins.left + 6, clientRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(clientTel, margins.left + 50, clientRowY);
      clientRowY += 6;
    }
    if (clientAdr) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Adresse', margins.left + 6, clientRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      doc.text(clientAdr, margins.left + 50, clientRowY);
      clientRowY += 6;
    }
    if (adresseLivraison && adresseLivraison !== clientAdr) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(84, 110, 122);
      doc.text('Adresse de livraison', margins.left + 6, clientRowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 35, 126);
      const adrLines = doc.splitTextToSize(adresseLivraison, contentWidth - 56);
      doc.text(adrLines, margins.left + 50, clientRowY);
    }

    y = clientY + 34;

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
    const colDescX = margins.left;
    const colRefX = margins.left + 45;
    const colQtyX = margins.left + 75;
    const colPriceX = margins.left + 95;
    const colRemiseX = margins.left + 118;
    const colTotalX = pageWidth - margins.right - 2;

    const headerY = y;
    doc.setFillColor(26, 35, 126);
    doc.roundedRect(colDescX, headerY, contentWidth, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Désignation', colDescX + 3, headerY + 4.5);
    doc.text('Réf.', colRefX + 3, headerY + 4.5);
    doc.text('Qté', colQtyX + 3, headerY + 4.5);
    doc.text('Prix unit.', colPriceX + 3, headerY + 4.5);
    doc.text('Remise', colRemiseX + 3, headerY + 4.5);
    doc.text('Total', colTotalX - 3, headerY + 4.5, { align: 'right' });

    y = headerY + 7;
    let currentY = y;
    let rowIndex = 0;

    if (items.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Aucun article dans cette commande.', colDescX + 3, currentY + 5);
      currentY += 10;
    } else {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const productName = item.product_name || item.product?.name || 'Produit inconnu';
        const productRef = item.product_reference || item.product?.reference || '-';
        const qty = item.quantity || 0;
        const price = parseFloat(item.prix_unitaire) || 0;
        const remise = parseFloat(item.remise) || 0;
        const itemTotal = parseFloat(item.total) || (qty * price - remise);

        if (currentY > pageHeight - 60) {
          doc.addPage();
          addWatermark(doc, watermarkText, watermarkOptions);
          
          currentY = margins.top;
          doc.setFillColor(26, 35, 126);
          doc.roundedRect(colDescX, currentY, contentWidth, 7, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text('Désignation', colDescX + 3, currentY + 4.5);
          doc.text('Réf.', colRefX + 3, currentY + 4.5);
          doc.text('Qté', colQtyX + 3, currentY + 4.5);
          doc.text('Prix unit.', colPriceX + 3, currentY + 4.5);
          doc.text('Remise', colRemiseX + 3, currentY + 4.5);
          doc.text('Total', colTotalX - 3, currentY + 4.5, { align: 'right' });
          currentY += 7;
        }

        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(colDescX, currentY - 0.5, contentWidth, 6.5, 'F');
        }

        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(0.1);
        doc.line(colDescX, currentY, colDescX, currentY + 6);
        doc.line(colRefX, currentY, colRefX, currentY + 6);
        doc.line(colQtyX, currentY, colQtyX, currentY + 6);
        doc.line(colPriceX, currentY, colPriceX, currentY + 6);
        doc.line(colRemiseX, currentY, colRemiseX, currentY + 6);
        doc.line(colTotalX, currentY, colTotalX, currentY + 6);

        doc.setTextColor(33, 33, 33);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(productName, colDescX + 3, currentY + 4);
        doc.text(productRef, colRefX + 3, currentY + 4);
        doc.text(qty.toString(), colQtyX + 3, currentY + 4);
        doc.text(formatCurrency(price), colPriceX + 3, currentY + 4);
        doc.text(remise > 0 ? formatCurrency(remise) : '-', colRemiseX + 3, currentY + 4);
        
        const totalText = formatCurrency(itemTotal);
        const maxWidth = colTotalX - colRemiseX - 6;
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
    doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
    y = currentY + 5;

    // ================================================================
    // TOTAUX - Style structuré comme l'exemple
    // ================================================================
    let ay = y;

    // 1. Bloc TOTAL (comme amountBox)
    const amountBoxWidth = 70;
    const amountBoxX = pageWidth - margins.right - amountBoxWidth;
    const amountBoxHeight = 12;

    // Fond pour le bloc TOTAL
    doc.setFillColor(26, 35, 126);
    doc.roundedRect(amountBoxX - 7, ay - 2, amountBoxWidth + 8, amountBoxHeight, 2, 2, 'F');

    // Label TOTAL
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL', amountBoxX + 4, ay + 6);

    // Valeur du total
    const totalFormatted = formatCurrency(total);
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

    // 2. Montant en toutes lettres (comme lettresBox)
    const lettresBoxHeight = 14;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'F');
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, ay, contentWidth, lettresBoxHeight, 2, 2, 'S');

    // Label "Montant en toutes lettres :"
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Montant en toutes lettres :', margins.left + 6, ay + 9);

    // Valeur en lettres
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);

    const lettresStartX = margins.left + 65;
    const lettresAvailableWidth = contentWidth - 70;

    // Ajuster la taille de la police si nécessaire
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

    // 3. Instructions spéciales (comme notesBox)
    if (instructions && typeof instructions === 'string' && instructions.trim()) {
      const notesBoxHeight = 20;
      doc.setFillColor(255, 248, 230);
      doc.roundedRect(margins.left, ay, contentWidth, notesBoxHeight, 2, 2, 'F');
      doc.setDrawColor(255, 204, 128);
      doc.setLineWidth(0.5);
      doc.roundedRect(margins.left, ay, contentWidth, notesBoxHeight, 2, 2, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(230, 81, 0);
      doc.text('Instructions spéciales', margins.left + 6, ay + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(66, 66, 66);
      const splitNotes = doc.splitTextToSize(instructions, contentWidth - 12);
      doc.text(splitNotes, margins.left + 6, ay + 12);
      
      ay += notesBoxHeight + 6;
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
    doc.text('Signature du client', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text('Nom et date', signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    doc.line(signatureX2, signatureY + 5, signatureX2 + signatureWidth, signatureY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(84, 110, 122);
    doc.text('Signature de l\'entreprise', signatureX2 + (signatureWidth / 2), signatureY, { align: 'center' });
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
    doc.text('BUROK EMPIRE - DAKAR, SÉNÉGAL', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Tél: ${company.phone} - Email: ${company.email}`, pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text(`RCCM: ${company.rccm}`, pageWidth / 2, footerY + 8, { align: 'center' });

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

    doc.save(`Bon_livraison_${blReference}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur Livraison:', error);
    throw error;
  }
};

export default Livraison;