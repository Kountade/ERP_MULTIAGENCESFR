// src/components/drh/PayrollSlipPDF.jsx

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

// ========== COMPOSANT PRINCIPAL ==========
const PayrollSlipPDF = async (payroll, options = {}) => {
  if (!payroll || typeof payroll !== 'object') {
    throw new Error('Données de paie invalides');
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

    // ========== DONNÉES DE LA PAIE ==========
    const payrollData = payroll || {};
    
    // 🔍 DIAGNOSTIC
    console.log('🔍 Données payroll reçues:', payrollData);
    console.log('📋 Clés disponibles:', Object.keys(payrollData || {}));

    // 📊 Récupération des données - NOMS EXACTS du modèle Payroll
    const baseSalary = parseFloat(payrollData?.base_salary) || 0;
    
    // Primes (augmentations)
    const performanceBonus = parseFloat(payrollData?.performance_bonus) || 0;
    const seniorityBonus = parseFloat(payrollData?.seniority_bonus) || 0;
    const overtimeAmount = parseFloat(payrollData?.overtime_amount) || 0;
    const transportBonus = parseFloat(payrollData?.transport_bonus) || 0;
    const phoneBonus = parseFloat(payrollData?.phone_bonus) || 0;
    const otherBonus = parseFloat(payrollData?.other_bonus) || 0;
    
    // Total des primes
    const totalBonuses = performanceBonus + seniorityBonus + overtimeAmount + 
                         transportBonus + phoneBonus + otherBonus;
    
    // Déductions (réductions)
    const socialSecurity = parseFloat(payrollData?.social_security) || 0;
    const incomeTax = parseFloat(payrollData?.income_tax) || 0;
    const pensionFund = parseFloat(payrollData?.pension_fund) || 0;
    const healthInsurance = parseFloat(payrollData?.health_insurance) || 0;
    const unpaidLeave = parseFloat(payrollData?.unpaid_leave) || 0;
    const otherDeductions = parseFloat(payrollData?.other_deductions) || 0;
    
    // Total des déductions
    const totalDeductions = socialSecurity + incomeTax + pensionFund + 
                            healthInsurance + unpaidLeave + otherDeductions;
    
    // Salaire brut - comme dans votre modèle
    const grossSalary = baseSalary + totalBonuses;
    
    // Salaire net - comme dans votre modèle
    const netSalary = grossSalary - totalDeductions;

    console.log('💰 Salaire de base:', baseSalary);
    console.log('💰 Total primes:', totalBonuses);
    console.log('💰 Salaire BRUT:', grossSalary);
    console.log('💰 Total déductions:', totalDeductions);
    console.log('💰 NET À PAYER:', netSalary);

    // ========== INFORMATIONS EMPLOYÉ ==========
    const employeeName = payrollData?.employee_name || payrollData?.employee?.full_name || 'Non spécifié';
    const employeeNumber = payrollData?.employee?.employee_number || payrollData?.employee_id || 'N/A';
    const month = payrollData?.month || 'MM';
    const year = payrollData?.year || 'YYYY';
    const period = `${month}/${year}`;
    const status = payrollData?.status_display || payrollData?.status || 'Brouillon';
    const payrollNumber = payrollData?.payroll_number || '2025/001';

    const docTitle = 'BULLETIN DE PAIE';
    const netEnLettres = nombreEnLettres(netSalary);

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
    const watermarkText = options.watermark || 'BULLETIN DE PAIE';
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
    doc.text(docTitle, pageWidth - margins.right, y + 5.5, { align: 'right' });
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(84, 110, 122);
    doc.text(`N° ${payrollNumber}`, pageWidth - margins.right, y + 10.5, { align: 'right' });
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
    doc.text('MATRICULE', gridX2 + 4, gridY + 4.5);
    doc.text('PÉRIODE', gridX3 + 4, gridY + 4.5);
    doc.text('STATUT', gridX4 + 4, gridY + 4.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(employeeName, gridX1 + 4, gridY + 12);
    doc.text(employeeNumber, gridX2 + 4, gridY + 12);
    doc.text(period, gridX3 + 4, gridY + 12);
    doc.text(status, gridX4 + 4, gridY + 12);

    y = gridY + 22;

    // ================================================================
    // DÉTAIL DES ÉMOLUMENTS - TABLEAU
    // ================================================================
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('DÉTAIL DES ÉMOLUMENTS', margins.left, y);
    y += 2;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(margins.left, y, pageWidth - margins.right, y);
    y += 6;

    // Colonnes ajustées
    const colDescX = margins.left;
    const colBaseX = margins.left + 90;
    const colRateX = margins.left + 125;
    const colAmountX = pageWidth - margins.right - 2;

    // En-tête du tableau
    const headerY = y;
    doc.setFillColor(26, 35, 126);
    doc.roundedRect(colDescX, headerY, contentWidth, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Désignation', colDescX + 3, headerY + 4.5);
    doc.text('Base', colBaseX + 3, headerY + 4.5);
    doc.text('Taux', colRateX + 3, headerY + 4.5);
    doc.text('Montant', colAmountX - 3, headerY + 4.5, { align: 'right' });

    y = headerY + 7;
    let currentY = y;
    let rowIndex = 0;

    // ========== CONSTRUCTION DES LIGNES DE PAIE ==========
    const payLines = [];
    
    // 1. Salaire de base
    if (baseSalary > 0) {
      payLines.push({ description: 'Salaire de base', amount: baseSalary, isBase: true });
    }
    
    // 2. Primes (augmentations)
    if (performanceBonus > 0) {
      payLines.push({ description: 'Prime de performance', amount: performanceBonus, isBonus: true });
    }
    if (seniorityBonus > 0) {
      payLines.push({ description: "Prime d'ancienneté", amount: seniorityBonus, isBonus: true });
    }
    if (overtimeAmount > 0) {
      payLines.push({ description: 'Heures supplémentaires', amount: overtimeAmount, isBonus: true });
    }
    if (transportBonus > 0) {
      payLines.push({ description: 'Indemnité de transport', amount: transportBonus, isBonus: true });
    }
    if (phoneBonus > 0) {
      payLines.push({ description: 'Indemnité téléphonique', amount: phoneBonus, isBonus: true });
    }
    if (otherBonus > 0) {
      payLines.push({ description: 'Autres primes', amount: otherBonus, isBonus: true });
    }
    
    // 3. Déductions (réductions) - montants négatifs
    if (socialSecurity > 0) {
      payLines.push({ description: 'CNSS (Sécurité sociale)', amount: -socialSecurity, isDeduction: true });
    }
    if (incomeTax > 0) {
      payLines.push({ description: 'IRPP (Impôt sur le revenu)', amount: -incomeTax, isDeduction: true });
    }
    if (pensionFund > 0) {
      payLines.push({ description: 'Fonds de pension', amount: -pensionFund, isDeduction: true });
    }
    if (healthInsurance > 0) {
      payLines.push({ description: 'Assurance santé', amount: -healthInsurance, isDeduction: true });
    }
    if (unpaidLeave > 0) {
      payLines.push({ description: 'Congé sans solde', amount: -unpaidLeave, isDeduction: true });
    }
    if (otherDeductions > 0) {
      payLines.push({ description: 'Autres déductions', amount: -otherDeductions, isDeduction: true });
    }

    // Si pas de données, afficher un message
    if (payLines.length === 0) {
      payLines.push({ description: 'Aucune donnée disponible', amount: 0 });
    }

    // Affichage des lignes
    for (let idx = 0; idx < payLines.length; idx++) {
      const line = payLines[idx];
      const isNegative = line.amount < 0;
      const isPositive = line.amount > 0 && (line.isBonus || line.isBase === false);
      const absAmount = Math.abs(line.amount);

      if (currentY > pageHeight - 70) {
        doc.addPage();
        addWatermark(doc, watermarkText, watermarkOptions);
        
        currentY = margins.top;
        doc.setFillColor(26, 35, 126);
        doc.roundedRect(colDescX, currentY, contentWidth, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('Désignation', colDescX + 3, currentY + 4.5);
        doc.text('Base', colBaseX + 3, currentY + 4.5);
        doc.text('Taux', colRateX + 3, currentY + 4.5);
        doc.text('Montant', colAmountX - 3, currentY + 4.5, { align: 'right' });
        currentY += 7;
      }

      // Alternance des couleurs
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(colDescX, currentY - 0.5, contentWidth, 6.5, 'F');
      }

      // Lignes de séparation
      doc.setDrawColor(224, 224, 224);
      doc.setLineWidth(0.1);
      doc.line(colDescX, currentY, colDescX, currentY + 6);
      doc.line(colBaseX, currentY, colBaseX, currentY + 6);
      doc.line(colRateX, currentY, colRateX, currentY + 6);
      doc.line(colAmountX, currentY, colAmountX, currentY + 6);

      // Couleur du texte selon le type
      let textColor = [33, 33, 33];
      let amountColor = [33, 33, 33];
      let suffixe = '';

      if (isNegative) {
        textColor = [211, 47, 47];
        amountColor = [211, 47, 47];
        suffixe = ' ✖';
      } else if (isPositive) {
        textColor = [46, 125, 50];
        amountColor = [46, 125, 50];
        suffixe = ' ✚';
      }

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(line.description + suffixe, colDescX + 3, currentY + 4);
      
      // Base (seulement pour le salaire de base)
      if (line.isBase) {
        doc.text('100%', colBaseX + 3, currentY + 4);
        doc.text(formatCurrency(absAmount), colRateX + 3, currentY + 4);
      } else {
        doc.text('-', colBaseX + 3, currentY + 4);
        doc.text('-', colRateX + 3, currentY + 4);
      }
      
      // Montant
      doc.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
      if (isNegative) {
        doc.setFont('helvetica', 'bold');
        doc.text(`- ${formatCurrency(absAmount)}`, colAmountX - 3, currentY + 4, { align: 'right' });
      } else if (isPositive) {
        doc.setFont('helvetica', 'bold');
        doc.text(`+ ${formatCurrency(absAmount)}`, colAmountX - 3, currentY + 4, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(absAmount), colAmountX - 3, currentY + 4, { align: 'right' });
      }

      currentY += 6.5;
      rowIndex++;
    }

    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.3);
    doc.line(colDescX, currentY, pageWidth - margins.right, currentY);
    y = currentY + 5;

    // ================================================================
    // TOTAUX
    // ================================================================
    let ay = y;

    // Salaire de base
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(66, 66, 66);
    doc.text('Salaire de base', margins.left + 100, ay + 3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text(formatCurrency(baseSalary), pageWidth - margins.right - 3, ay + 3, { align: 'right' });
    ay += 5;

    // Total primes
    if (totalBonuses > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(46, 125, 50);
      doc.text('Total primes (+)', margins.left + 100, ay + 3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50);
      doc.text(`+ ${formatCurrency(totalBonuses)}`, pageWidth - margins.right - 3, ay + 3, { align: 'right' });
      ay += 5;
    }

    // Salaire brut
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('SALAIRE BRUT', margins.left + 100, ay + 3);
    doc.text(formatCurrency(grossSalary), pageWidth - margins.right - 3, ay + 3, { align: 'right' });
    ay += 5;

    // Total déductions
    if (totalDeductions > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(211, 47, 47);
      doc.text('Total déductions (-)', margins.left + 100, ay + 3);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(211, 47, 47);
      doc.text(`- ${formatCurrency(totalDeductions)}`, pageWidth - margins.right - 3, ay + 3, { align: 'right' });
      ay += 8;
    }

    // ================================================================
    // NET À PAYER
    // ================================================================
    const netBoxHeight = 14;
    doc.setFillColor(232, 234, 246);
    doc.roundedRect(margins.left, ay, contentWidth, netBoxHeight, 2, 2, 'F');
    doc.setDrawColor(197, 202, 233);
    doc.setLineWidth(0.5);
    doc.roundedRect(margins.left, ay, contentWidth, netBoxHeight, 2, 2, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 35, 126);
    doc.text('NET À PAYER (GNF)', margins.left + 6, ay + 9);

    const netFormatted = formatCurrency(netSalary);
    doc.setFontSize(16);
    doc.setTextColor(26, 35, 126);
    let fontSizeNet = 16;
    let textWidthNet = doc.getTextWidth(netFormatted);
    if (textWidthNet > 60) {
      fontSizeNet = 12;
      doc.setFontSize(fontSizeNet);
    }
    doc.text(netFormatted, pageWidth - margins.right - 3, ay + 9, { align: 'right' });

    ay += netBoxHeight + 4;

    // ================================================================
    // MONTANT EN LETTRES
    // ================================================================
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(84, 110, 122);
    doc.text(`Arrêté le présent bulletin à la somme de ${netEnLettres}.`, pageWidth - margins.right, ay + 3, { align: 'right' });

    y = ay + 8;

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
    doc.text('Signature de l\'employé', signatureX1 + (signatureWidth / 2), signatureY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 144, 156);
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, signatureX1 + (signatureWidth / 2), signatureY + 12, { align: 'center' });

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

    doc.save(`Bulletin_paie_${payrollNumber}.pdf`);
    return true;

  } catch (error) {
    console.error('Erreur PayrollSlipPDF:', error);
    throw error;
  }
};

export default PayrollSlipPDF;