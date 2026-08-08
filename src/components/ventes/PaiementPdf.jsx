// src/components/paiements/PaiementPdf.jsx
import jsPDF from 'jspdf';
import logoSvg from '../../assets/logo.svg';

/**
 * Génère un reçu de paiement professionnel (1 page, économique en encre)
 * @param {Object} paiement - L'objet paiement (champs enrichis)
 * @returns {Promise<boolean>}
 */
const PaiementPdf = async (paiement) => {
  if (!paiement || typeof paiement !== 'object') {
    throw new Error('Données du paiement invalides');
  }

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 18, right: 18, top: 12, bottom: 15 };
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    // === SOCIÉTÉ ===
    const company = {
      name: 'SEYDI GROUP SARL',
      address: 'Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@seydigroup.com',
      rccm: 'SN DKR 2023 B 123',
      capital: '10 000 000 FCFA'
    };

    // === FORMATAGE ===
    const formatNumber = (n) => new Intl.NumberFormat('fr-FR').format(parseFloat(n) || 0);
    const formatCurrency = (amt) => `${formatNumber(amt)} FCFA`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    // === DONNÉES (priorité facture) ===
    const clientNom = paiement.facture_client_nom && paiement.facture_client_nom !== 'Anonyme'
      ? paiement.facture_client_nom
      : paiement.client_nom || paiement.client?.nom || 'Client inconnu';
    const clientPrenom = paiement.facture_client_prenom || paiement.client_prenom || '';
    const clientRaison = paiement.facture_client_raison_sociale || paiement.client_raison_sociale || '';
    const clientEmail = paiement.facture_client_email || paiement.client_email || '';
    const clientTel = paiement.facture_client_telephone || paiement.client_telephone || '';
    const clientAdr = paiement.facture_client_adresse || paiement.client_adresse || '';

    const factureRef = paiement.facture_ref || paiement.facture?.reference || '-';
    const factureDate = paiement.facture_date || paiement.facture?.date_facture;
    const factureTotal = paiement.facture_total ?? paiement.facture?.total_ttc ?? 0;
    const factureRestant = paiement.facture_restant ?? paiement.facture?.montant_restant ?? 0;

    const methodeMap = {
      especes: 'Espèces', carte: 'Carte bancaire', cheque: 'Chèque',
      virement: 'Virement', mobile_money: 'Mobile Money', autre: 'Autre'
    };
    const methode = methodeMap[paiement.methode] || paiement.methode || '-';
    const statutMap = {
      pending: 'En attente', completed: 'Complété', failed: 'Échoué', refunded: 'Remboursé'
    };
    const statut = statutMap[paiement.statut] || paiement.statut || 'Complété';

    // === LOGO ===
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

    // ============================================================
    // 1. EN-TÊTE COMPACT
    // ============================================================
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

    // 2. TITRE
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('REÇU DE PAIEMENT', pageWidth / 2, y, { align: 'center' });
    y += 5.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${paiement.reference || 'Sans référence'}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // ============================================================
    // 3. DÉTAILS PAIEMENT (encadré réduit)
    // ============================================================
    const boxH = 30;
    doc.setFillColor(248, 248, 248);
    doc.rect(margins.left, y, contentWidth, boxH, 'F');
    doc.setDrawColor(160, 160, 160);
    doc.rect(margins.left, y, contentWidth, boxH, 'S');
    doc.setFillColor(220, 220, 220);
    doc.rect(margins.left, y, contentWidth, 6, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('DÉTAILS DU PAIEMENT', margins.left + 5, y + 4.5);

    const col1 = margins.left + 10;
    const col2 = margins.left + 105;
    let iy = y + 11;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('Date :', col1, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(paiement.date_paiement), col1 + 14, iy);
    iy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Méthode :', col1, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(methode, col1 + 19, iy);
    iy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Statut :', col1, iy);
    doc.setTextColor(paiement.statut === 'completed' ? '#2e7d32' : '#e65100');
    doc.setFont('helvetica', 'bold');
    doc.text(statut, col1 + 15, iy);
    doc.setTextColor(70, 70, 70);
    // colonne droite
    iy = y + 11;
    doc.setFont('helvetica', 'bold');
    doc.text('Réf. externe :', col2, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(paiement.reference_externe || '-', col2 + 23, iy);
    iy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Encaissé par :', col2, iy);
    doc.setFont('helvetica', 'normal');
    doc.text(paiement.encaisse_par?.email || paiement.encaisse_par_nom || '-', col2 + 25, iy);
    y += boxH + 6;

    // ============================================================
    // 4. MONTANT (cadre blanc, épuré)
    // ============================================================
    doc.setDrawColor(160, 160, 160);
    doc.rect(margins.left, y, contentWidth, 20, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('MONTANT ENCAISSÉ', pageWidth / 2, y + 6.5, { align: 'center' });
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(paiement.montant || 0), pageWidth / 2, y + 16, { align: 'center' });
    y += 20 + 6;

    // ============================================================
    // 5. CLIENT (encadré réduit)
    // ============================================================
    const clientFull = clientRaison || (clientPrenom ? `${clientNom} ${clientPrenom}` : clientNom);
    if (clientNom !== 'Client inconnu') {
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
        doc.setFont('helvetica', 'bold');
        doc.text('Email :', col1, cy);
        doc.setFont('helvetica', 'normal');
        doc.text(clientEmail.substring(0, 30), col1 + 17, cy);
        cy += 5.5;
      }
      if (clientTel) {
        doc.setFont('helvetica', 'bold');
        doc.text('Tél :', col1, cy);
        doc.setFont('helvetica', 'normal');
        doc.text(clientTel, col1 + 13, cy);
        cy += 5.5;
      }
      if (clientAdr) {
        doc.setFont('helvetica', 'bold');
        doc.text('Adresse :', col1, cy);
        doc.setFont('helvetica', 'normal');
        doc.text(clientAdr.substring(0, 30), col1 + 18, cy);
      }
      y += ch + 5;
    }

    // ============================================================
    // 6. FACTURE ASSOCIÉE (encadré réduit)
    // ============================================================
    if (factureRef !== '-') {
      const fh = 28;
      doc.setFillColor(248, 248, 248);
      doc.rect(margins.left, y, contentWidth, fh, 'F');
      doc.setDrawColor(160, 160, 160);
      doc.rect(margins.left, y, contentWidth, fh, 'S');
      doc.setFillColor(220, 220, 220);
      doc.rect(margins.left, y, contentWidth, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('FACTURE ASSOCIÉE', margins.left + 5, y + 4.5);
      let fy = y + 10;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 70, 70);
      doc.text('Référence :', col1, fy);
      doc.setFont('helvetica', 'normal');
      doc.text(factureRef, col1 + 23, fy);
      fy += 5.5;
      if (factureDate) {
        doc.setFont('helvetica', 'bold');
        doc.text('Date :', col1, fy);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(factureDate), col1 + 14, fy);
        fy += 5.5;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Total TTC :', col1, fy);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(factureTotal), col1 + 23, fy);
      fy += 5.5;
      doc.setFont('helvetica', 'bold');
      doc.text('Reste à payer :', col1, fy);
      doc.setTextColor(factureRestant > 0 ? '#c62828' : '#2e7d32');
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(factureRestant), col1 + 27, fy);
      y += fh + 5;
    }

    // ============================================================
    // 7. NOTES (optionnel, compact)
    // ============================================================
    if (paiement.notes) {
      const noteLines = doc.splitTextToSize(paiement.notes, contentWidth - 10);
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

    // ============================================================
    // 8. SIGNATURES (sur la même page)
    // ============================================================
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

    // ============================================================
    // 9. PIED DE PAGE (réduit)
    // ============================================================
    const footY = pageHeight - margins.bottom - 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margins.left, footY - 3, pageWidth - margins.right, footY - 3);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${company.name} - ${company.address} - Tél: ${company.phone}`, pageWidth / 2, footY, { align: 'center' });
    doc.text(`RCCM: ${company.rccm} | Capital: ${company.capital}`, pageWidth / 2, footY + 3.5, { align: 'center' });
    doc.text(`Généré le ${formatDate(new Date().toISOString())}`, pageWidth / 2, footY + 7, { align: 'center' });

    doc.save(`Reçu_paiement_${paiement.reference || 'paiement'}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur PaiementPdf:', error);
    throw error;
  }
};

export default PaiementPdf;

