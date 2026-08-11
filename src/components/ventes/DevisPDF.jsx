// src/components/sales/DevisPDF.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

/**
 * Génère un PDF de devis professionnel (sans TVA)
 * @param {Object} devis - L'objet devis complet (avec client, items, etc.)
 * @returns {Promise<boolean>}
 */
const DevisPDF = async (devis) => {
  if (!devis || typeof devis !== 'object') {
    console.error('Devis invalide', devis);
    throw new Error('Données du devis invalides');
  }

  console.log('DevisPDF - données reçues:', devis);
  console.log('Items:', devis.items);

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 18, right: 18, top: 12, bottom: 15 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    // Société
    const company = {
      name: 'SEYDI GROUP SARL',
      address: 'Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@seydigroup.com',
      rccm: 'SN DKR 2023 B 123',
      capital: '10 000 000 FCFA'
    };

    const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(parseFloat(n) || 0);
    const formatCurrency = (amt) => `${formatNumber(amt)} FCFA`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    // Client
    const clientNom = devis.client?.nom || 'Client inconnu';
    const clientPrenom = devis.client?.prenom || '';
    const clientRaison = devis.client?.raison_sociale || '';
    const clientEmail = devis.client?.email || '';
    const clientTel = devis.client?.telephone || '';
    const clientAdr = devis.client?.adresse || '';
    const clientFull = clientRaison || (clientPrenom ? `${clientNom} ${clientPrenom}` : clientNom);

    const agenceNom = devis.agence?.nom || '-';
    const vendeur = devis.vendeur?.email || '-';
    const statutMap = {
      draft: 'Brouillon', sent: 'Envoyé', accepted: 'Accepté',
      refused: 'Refusé', converted: 'Converti', expired: 'Expiré', cancelled: 'Annulé'
    };
    const statut = statutMap[devis.status] || devis.status || '-';

    // Logo
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

    // ========== EN-TÊTE ==========
    const logoW = 30, logoH = 13;
    if (logoData) doc.addImage(logoData, 'PNG', margins.left, y, logoW, logoH);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(company.name, margins.left + logoW + 4, y + 4);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(company.address, margins.left + logoW + 4, y + 9);
    doc.setFontSize(6);
    doc.text(`RCCM: ${company.rccm} | Capital: ${company.capital}`, margins.left + logoW + 4, y + 13);
    y += 20;
    doc.setDrawColor(180, 180, 180);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 5;

    // Titre
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DEVIS', pageWidth / 2, y, { align: 'center' });
    y += 5.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${devis.reference || 'Sans référence'}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // ========== INFORMATIONS GÉNÉRALES ==========
    const boxH = 35;
    doc.setFillColor(248, 248, 248);
    doc.rect(margins.left, y, contentWidth, boxH, 'F');
    doc.setDrawColor(160, 160, 160);
    doc.rect(margins.left, y, contentWidth, boxH, 'S');
    doc.setFillColor(220, 220, 220);
    doc.rect(margins.left, y, contentWidth, 6, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('INFORMATIONS DU DEVIS', margins.left + 5, y + 4.5);

    const col1 = margins.left + 10;
    const col2 = margins.left + 105;
    let iy = y + 11;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('Date création :', col1, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(devis.date_creation), col1 + 28, iy);
    iy += 6;
    doc.text('Date expiration :', col1, iy);
    doc.text(formatDate(devis.date_expiration), col1 + 32, iy);
    iy += 6;
    doc.text('Agence :', col1, iy);
    doc.text(agenceNom, col1 + 17, iy);
    iy += 6;
    doc.text('Vendeur :', col1, iy);
    doc.text(vendeur, col1 + 19, iy);

    iy = y + 11;
    doc.text('Statut :', col2, iy);
    doc.setTextColor(statut === 'Accepté' ? '#2e7d32' : (statut === 'Refusé' ? '#c62828' : '#e65100'));
    doc.setFont('helvetica', 'bold');
    doc.text(statut, col2 + 16, iy);
    y += boxH + 6;

    // ========== CLIENT ==========
    if (clientFull !== 'Client inconnu') {
      const ch = 28;
      doc.setFillColor(248, 248, 248);
      doc.rect(margins.left, y, contentWidth, ch, 'F');
      doc.setDrawColor(160, 160, 160);
      doc.rect(margins.left, y, contentWidth, ch, 'S');
      doc.setFillColor(220, 220, 220);
      doc.rect(margins.left, y, contentWidth, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('INFORMATIONS CLIENT', margins.left + 5, y + 4.5);
      let cy = y + 10;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text('Nom :', col1, cy);
      doc.setFont('helvetica', 'normal');
      doc.text(clientFull.substring(0, 30), col1 + 14, cy);
      cy += 5.5;
      if (clientEmail) {
        doc.text('Email :', col1, cy);
        doc.text(clientEmail.substring(0, 30), col1 + 17, cy);
        cy += 5.5;
      }
      if (clientTel) {
        doc.text('Tél :', col1, cy);
        doc.text(clientTel, col1 + 13, cy);
        cy += 5.5;
      }
      if (clientAdr) {
        doc.text('Adresse :', col1, cy);
        doc.text(clientAdr.substring(0, 30), col1 + 18, cy);
      }
      y += ch + 5;
    }

    // ========== TABLEAU DES ARTICLES ==========
    const items = devis.items || [];
    if (items.length === 0) {
      // Aucun article : afficher un message
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Aucun article dans ce devis.', margins.left, y + 5);
      y += 15;
    } else {
      const tableHeaders = ['Désignation', 'Réf.', 'Qté', 'Prix unit.', 'Remise', 'Total'];
      const colWidths = [55, 25, 15, 25, 20, 25];
      let startX = margins.left;
      let tableY = y;

      // En-tête du tableau
      doc.setFillColor(80, 80, 80);
      doc.rect(startX, tableY, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      let xPos = startX;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos + 2, tableY + 4.5);
        xPos += colWidths[i];
      });
      tableY += 7;

      // Lignes
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      let totalSous = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const qty = item.quantity || 0;
        const price = item.prix_unitaire || 0;
        const remise = item.remise || 0;
        const totalItem = (qty * price) - remise;
        totalSous += totalItem;

        const row = [
          (item.product_name || '').substring(0, 30),
          (item.product_reference || '').substring(0, 10),
          qty.toString(),
          formatCurrency(price),
          formatCurrency(remise),
          formatCurrency(totalItem)
        ];
        let lineHeight = 5;
        for (let j = 0; j < row.length; j++) {
          const x = startX + (colWidths.slice(0, j).reduce((a, b) => a + b, 0));
          doc.text(row[j], x + 2, tableY + 3.5);
        }
        tableY += lineHeight;

        // Saut de page si nécessaire
        if (tableY > pageHeight - margins.bottom - 50) {
          doc.addPage();
          tableY = margins.top;
          // Réimprimer l'en-tête
          doc.setFillColor(80, 80, 80);
          doc.rect(startX, tableY, contentWidth, 7, 'F');
          doc.setTextColor(255, 255, 255);
          xPos = startX;
          tableHeaders.forEach((header, idx) => {
            doc.text(header, xPos + 2, tableY + 4.5);
            xPos += colWidths[idx];
          });
          tableY += 7;
          doc.setTextColor(0, 0, 0);
        }
      }
      y = tableY + 5;

      // ========== TOTAUX ==========
      const remiseTotale = devis.remise || 0;
      const totalFinal = devis.total || totalSous;
      doc.setDrawColor(160, 160, 160);
      doc.rect(margins.left, y, contentWidth, 25, 'S');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text('RÉCAPITULATIF', pageWidth / 2, y + 5, { align: 'center' });
      doc.setFontSize(7.5);
      let ty = y + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Sous-total :', margins.left + 10, ty);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(totalSous), margins.left + 35, ty);
      ty += 5;
      if (remiseTotale > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Remise :', margins.left + 10, ty);
        doc.setFont('helvetica', 'normal');
        doc.text(`- ${formatCurrency(remiseTotale)}`, margins.left + 35, ty);
        ty += 5;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL TTC :', margins.left + 10, ty);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(totalFinal), margins.left + 35, ty);
      y += 28;
    }

    // ========== CONDITIONS ET NOTES ==========
    if (devis.conditions) {
      const condLines = doc.splitTextToSize(devis.conditions, contentWidth - 10);
      const nh = Math.max(10, condLines.length * 4 + 6);
      doc.setDrawColor(160, 160, 160);
      doc.rect(margins.left, y, contentWidth, nh, 'S');
      doc.setFillColor(248, 248, 248);
      doc.rect(margins.left, y, contentWidth, 5, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text('CONDITIONS GÉNÉRALES', margins.left + 5, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(condLines, margins.left + 5, y + 8);
      y += nh + 5;
    }
    if (devis.notes) {
      const noteLines = doc.splitTextToSize(devis.notes, contentWidth - 10);
      const nh = Math.max(10, noteLines.length * 4 + 6);
      doc.setDrawColor(160, 160, 160);
      doc.rect(margins.left, y, contentWidth, nh, 'S');
      doc.setFillColor(248, 248, 248);
      doc.rect(margins.left, y, contentWidth, 5, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text('NOTES', margins.left + 5, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(noteLines, margins.left + 5, y + 8);
      y += nh + 5;
    }

    // ========== SIGNATURES ==========
    const signY = y + 4;
    doc.setDrawColor(160, 160, 160);
    doc.line(margins.left, signY, pageWidth - margins.right, signY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('VALIDATION', pageWidth / 2, signY + 4, { align: 'center' });

    const sigW = (contentWidth - 12) / 2;
    const sigH = 22;
    const sigTop = signY + 7;
    // Signature client
    doc.rect(margins.left, sigTop, sigW, sigH, 'S');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('LE CLIENT', margins.left + sigW / 2, sigTop + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Nom et signature', margins.left + 4, sigTop + 11);
    doc.text('Date: _______________', margins.left + 4, sigTop + 17);
    // Signature entreprise
    const sigRight = margins.left + sigW + 12;
    doc.rect(sigRight, sigTop, sigW, sigH, 'S');
    doc.setFont('helvetica', 'bold');
    doc.text('L\'ENTREPRISE', sigRight + sigW / 2, sigTop + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(company.name, sigRight + 4, sigTop + 11);
    doc.text('Signature et cachet', sigRight + 4, sigTop + 17);

    // ========== PIED DE PAGE ==========
    const footY = pageHeight - margins.bottom - 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margins.left, footY - 3, pageWidth - margins.right, footY - 3);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${company.name} - ${company.address} - Tél: ${company.phone}`, pageWidth / 2, footY, { align: 'center' });
    doc.text(`RCCM: ${company.rccm} | Capital: ${company.capital}`, pageWidth / 2, footY + 3.5, { align: 'center' });
    doc.text(`Généré le ${formatDate(new Date().toISOString())}`, pageWidth / 2, footY + 7, { align: 'center' });

    doc.save(`Devis_${devis.reference || 'sans_ref'}.pdf`);
    return true;
  } catch (error) {
    console.error('Erreur DevisPDF:', error);
    throw error;
  }
};

export default DevisPDF;