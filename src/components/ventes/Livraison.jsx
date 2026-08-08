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
      name: 'SEYDI GROUP SARL',
      address: 'Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@seydigroup.com',
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

    // Options de livraison
    const dateLivraison = options.date_livraison || '';
    const adresseLivraison = options.adresse_livraison || clientAdr;
    const contactLivraison = options.contact_livraison || clientTel;
    const instructions = options.instructions || '';

    // Articles et totaux
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

    // ==================== EN-TÊTE ====================
    const logoWidth = 30;
    const logoHeight = 15;
    if (logoData) {
      doc.addImage(logoData, 'PNG', margins.left, y, logoWidth, logoHeight);
    } else {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, margins.left, y + 6);
    }

    const textStartX = margins.left + logoWidth + 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(company.name, textStartX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(company.address, textStartX, y + 8);
    doc.text(`RCCM: ${company.rccm} | Capital: ${company.capital}`, textStartX, y + 12);
    doc.text(`Tél: ${company.phone} | Email: ${company.email}`, textStartX, y + 16);
    y = y + 30;

    // ==================== TITRE (rouge) ====================
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    doc.text('BON DE LIVRAISON', margins.left, y);
    const titreWidth = doc.getTextWidth('BON DE LIVRAISON');
    doc.text(` ${blReference}`, margins.left + titreWidth, y);
    y += 20;

    // ==================== INFOS CLIENT (2 colonnes) ====================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Colonne gauche
    doc.setFont('helvetica', 'bold');
    doc.text('Client', margins.left, y);
    doc.setFont('helvetica', 'normal');
    doc.text(clientFull, margins.left, y + 5);
    doc.text(clientTel || '-', margins.left, y + 10);
    doc.text(clientEmail || '-', margins.left, y + 15);

    // Colonne droite - Date + Agence
    const colDroiteX = pageWidth - margins.right - 80;
    doc.setFont('helvetica', 'bold');
    doc.text('Date', colDroiteX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(dateVente), colDroiteX, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Agence', colDroiteX, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(agenceNom, colDroiteX, y + 17);

    doc.setFont('helvetica', 'bold');
    doc.text('Vendeur', colDroiteX, y + 24);
    doc.setFont('helvetica', 'normal');
    doc.text(vendeurNom, colDroiteX, y + 29);

    // Adresse de livraison
    if (adresseLivraison) {
      doc.setFont('helvetica', 'bold');
      doc.text('Adresse de livraison', margins.left, y + 24);
      doc.setFont('helvetica', 'normal');
      const adrLines = doc.splitTextToSize(adresseLivraison, 70);
      doc.text(adrLines, margins.left, y + 29);
    }

    y += 45;

    // ==================== TABLEAU DES ARTICLES (design amélioré) ====================
    // Définition des colonnes
    const colDescX = margins.left;
    const colRefX = margins.left + 70;
    const colQtyX = margins.left + 105;
    const colPriceX = margins.left + 135;
    const colTotalX = pageWidth - margins.right;

    // En-tête du tableau avec fond gris
    const headerY = y;
    doc.setFillColor(60, 60, 70);
    doc.rect(colDescX, headerY, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Désignation', colDescX + 2, headerY + 5.5);
    doc.text('Référence', colRefX + 2, headerY + 5.5);
    doc.text('Qté', colQtyX + 2, headerY + 5.5);
    doc.text('Prix unit.', colPriceX + 2, headerY + 5.5);
    doc.text('Total', colTotalX - 2, headerY + 5.5, { align: 'right' });

    y = headerY + 8;
    let currentY = y;
    let rowIndex = 0;

    if (items.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Aucun article', colDescX + 2, currentY + 5);
      currentY += 10;
    } else {
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const productName = item.product_name || item.product?.name || 'Produit';
        const productRef = item.product_reference || item.product?.reference || '-';
        const qty = item.quantity || 0;
        const price = parseFloat(item.prix_unitaire) || 0;
        const itemTotal = parseFloat(item.total) || (qty * price);

        // Vérifier si on doit sauter de page
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margins.top;
          // Ré-afficher l'en-tête
          doc.setFillColor(60, 60, 70);
          doc.rect(colDescX, currentY, contentWidth, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Désignation', colDescX + 2, currentY + 5.5);
          doc.text('Référence', colRefX + 2, currentY + 5.5);
          doc.text('Qté', colQtyX + 2, currentY + 5.5);
          doc.text('Prix unit.', colPriceX + 2, currentY + 5.5);
          doc.text('Total', colTotalX - 2, currentY + 5.5, { align: 'right' });
          currentY += 8;
        }

        // Alternance des couleurs de ligne (gris très clair)
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 248, 250);
          doc.rect(colDescX, currentY - 1, contentWidth, 7, 'F');
        }

        // Bordures verticales fines
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(colDescX, currentY - 1, colDescX, currentY + 6);
        doc.line(colRefX, currentY - 1, colRefX, currentY + 6);
        doc.line(colQtyX, currentY - 1, colQtyX, currentY + 6);
        doc.line(colPriceX, currentY - 1, colPriceX, currentY + 6);
        doc.line(colTotalX, currentY - 1, colTotalX, currentY + 6);

        // Contenu
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(productName, colDescX + 2, currentY + 4.5);
        doc.text(productRef, colRefX + 2, currentY + 4.5);
        doc.text(qty.toString(), colQtyX + 2, currentY + 4.5);
        doc.text(formatCurrency(price), colPriceX + 2, currentY + 4.5);
        doc.text(formatCurrency(itemTotal), colTotalX - 2, currentY + 4.5, { align: 'right' });

        currentY += 7;
        rowIndex++;
      }
    }

    // Ligne de séparation sous le tableau
    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.3);
    doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
    y = currentY + 5;

    // ==================== TOTAUX (alignés à droite) ====================
    const amountBlockW = 60;
    const amountBlockX = pageWidth - margins.right - amountBlockW;
    let ay = y;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Ligne Sous-total
    doc.text('Sous-total', amountBlockX, ay);
    doc.text(formatNumber(sousTotal), pageWidth - margins.right, ay, { align: 'right' });
    ay += 5;

    // Ligne TVA (si > 0)
    if (tva > 0) {
      doc.text('TVA 18%', amountBlockX, ay);
      doc.text(formatNumber(tva), pageWidth - margins.right, ay, { align: 'right' });
      ay += 5;
    }

    // Séparateur
    doc.setDrawColor(180, 180, 190);
    doc.line(amountBlockX, ay, pageWidth - margins.right, ay);
    ay += 3;

    // Ligne Total (gras et rouge)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text('TOTAL TTC', amountBlockX, ay);
    doc.text(formatNumber(total), pageWidth - margins.right, ay, { align: 'right' });
    ay += 7;

    // Montant en toutes lettres (plus petit, noir)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('Montant en toutes lettres :', amountBlockX, ay);
    const lettresWidth = doc.getTextWidth(totalEnLettres);
    const maxLettresWidth = 70;
    if (lettresWidth > maxLettresWidth) {
      const splitLettres = doc.splitTextToSize(totalEnLettres, maxLettresWidth);
      doc.text(splitLettres, amountBlockX + 45, ay);
    } else {
      doc.text(totalEnLettres, amountBlockX + 45, ay);
    }

    y = ay + 15;

    // ==================== SIGNATURE ====================
    const signatureY = y + 10;
    const signatureWidth = 80;
    const signatureX = pageWidth - margins.right - signatureWidth;

    // Ligne de signature
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(signatureX, signatureY + 5, signatureX + signatureWidth, signatureY + 5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(company.name, signatureX + (signatureWidth / 2), signatureY, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Signature et cachet', signatureX + (signatureWidth / 2), signatureY + 12, { align: 'center' });

    y = signatureY + 25;

    // ==================== INSTRUCTIONS ====================
    if (instructions && typeof instructions === 'string' && instructions.trim()) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(margins.left, y, contentWidth, 16, 'S');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('INSTRUCTIONS SPÉCIALES', margins.left + 4, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(instructions, contentWidth - 8);
      doc.text(splitNotes, margins.left + 4, y + 9);
      y += 20;
    }

    // ==================== PIED DE PAGE ====================
    const footerY = pageHeight - margins.bottom - 15;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 140);
    doc.text(`${company.name} - ${company.address} - Tél: ${company.phone} - Email: ${company.email}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`RCCM: ${company.rccm} - Capital: ${company.capital}`, pageWidth / 2, footerY + 4.5, { align: 'center' });

    // ==================== NUMÉROTATION DES PAGES ====================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 170);
      doc.text(`Page ${i}/${pageCount}`, pageWidth - margins.right, pageHeight - margins.bottom, { align: 'right' });
    }

    // ==================== SAUVEGARDE ====================
    doc.save(`Bon_livraison_${blReference}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur Livraison:', error);
    throw error;
  }
};

export default Livraison;