// src/components/drh/PayrollSlipPDF.jsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Enregistrer les polices
Font.register({
  family: 'Times-Roman',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/timesnewroman/v12/...' }
  ]
});

// Styles professionnels
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1a237e',
    borderBottomStyle: 'solid',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Times-Roman',
    letterSpacing: 1,
  },
  companySub: {
    fontSize: 9,
    color: '#546e7a',
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Times-Roman',
    letterSpacing: 2,
  },
  documentRef: {
    fontSize: 9,
    color: '#546e7a',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 7,
    color: '#78909c',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    fontFamily: 'Times-Roman',
    letterSpacing: 0.5,
  },
  table: {
    marginTop: 5,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a237e',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    fontSize: 9,
    color: '#424242',
  },
  tableCellRight: {
    fontSize: 9,
    color: '#424242',
    textAlign: 'right',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'right',
  },
  colDesc: { width: '45%', paddingRight: 4 },
  colBase: { width: '20%', textAlign: 'right', paddingRight: 4 },
  colHours: { width: '15%', textAlign: 'right', paddingRight: 4 },
  colAmount: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#1a237e',
    borderTopStyle: 'solid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#424242',
    width: '70%',
    textAlign: 'right',
    paddingRight: 20,
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
    width: '20%',
    textAlign: 'right',
  },
  totalAmountRed: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d32f2f',
    width: '20%',
    textAlign: 'right',
  },
  netPay: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: '#e8eaf6',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#c5cae9',
    borderStyle: 'solid',
  },
  netLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
    width: '70%',
    textAlign: 'right',
    paddingRight: 20,
    fontFamily: 'Times-Roman',
    letterSpacing: 1,
  },
  netAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    width: '20%',
    textAlign: 'right',
    fontFamily: 'Times-Roman',
  },
  amountInWords: {
    marginTop: 6,
    fontSize: 8,
    color: '#546e7a',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderTopStyle: 'solid',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#78909c',
  },
  signature: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureBlock: {
    textAlign: 'center',
    marginLeft: 40,
  },
  signatureLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#424242',
    borderBottomStyle: 'solid',
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#546e7a',
  },
  watermark: {
    position: 'absolute',
    bottom: 150,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 40,
    color: 'rgba(26, 35, 126, 0.05)',
    fontFamily: 'Times-Roman',
    transform: 'rotate(-30deg)',
  },
});

// Formatage GNF avec espace
const formatGNF = (amount) => {
  if (!amount && amount !== 0) return '0 GNF';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return '0 GNF';
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} GNF`;
};

// Composant principal - MAPPAGE EXACT avec votre modèle Django
const PayrollSlipPDF = ({ payroll }) => {
  // 🔍 DIAGNOSTIC
  console.log('🔍 Données payroll reçues:', payroll);
  console.log('📋 Clés disponibles:', Object.keys(payroll || {}));

  // 📊 Récupération des données - NOMS EXACTS du modèle Payroll
  const baseSalary = parseFloat(payroll?.base_salary) || 0;
  
  // Primes (augmentations)
  const performanceBonus = parseFloat(payroll?.performance_bonus) || 0;
  const seniorityBonus = parseFloat(payroll?.seniority_bonus) || 0;
  const overtimeAmount = parseFloat(payroll?.overtime_amount) || 0;
  const transportBonus = parseFloat(payroll?.transport_bonus) || 0;
  const phoneBonus = parseFloat(payroll?.phone_bonus) || 0;
  const otherBonus = parseFloat(payroll?.other_bonus) || 0;
  
  // Total des primes
  const totalBonuses = performanceBonus + seniorityBonus + overtimeAmount + 
                       transportBonus + phoneBonus + otherBonus;
  
  // Déductions (réductions)
  const socialSecurity = parseFloat(payroll?.social_security) || 0;
  const incomeTax = parseFloat(payroll?.income_tax) || 0;
  const pensionFund = parseFloat(payroll?.pension_fund) || 0;
  const healthInsurance = parseFloat(payroll?.health_insurance) || 0;
  const unpaidLeave = parseFloat(payroll?.unpaid_leave) || 0;
  const otherDeductions = parseFloat(payroll?.other_deductions) || 0;
  
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

  // 📝 Construction des lignes de paie
  const payLines = [];
  
  // 1. Salaire de base
  if (baseSalary > 0) {
    payLines.push({ description: 'Salaire de base', amount: baseSalary });
  }
  
  // 2. Primes (augmentations)
  if (performanceBonus > 0) {
    payLines.push({ description: 'Prime de performance', amount: performanceBonus });
  }
  if (seniorityBonus > 0) {
    payLines.push({ description: "Prime d'ancienneté", amount: seniorityBonus });
  }
  if (overtimeAmount > 0) {
    payLines.push({ description: 'Heures supplémentaires', amount: overtimeAmount });
  }
  if (transportBonus > 0) {
    payLines.push({ description: 'Indemnité de transport', amount: transportBonus });
  }
  if (phoneBonus > 0) {
    payLines.push({ description: 'Indemnité téléphonique', amount: phoneBonus });
  }
  if (otherBonus > 0) {
    payLines.push({ description: 'Autres primes', amount: otherBonus });
  }
  
  // 3. Déductions (réductions) - montants négatifs
  if (socialSecurity > 0) {
    payLines.push({ description: 'CNSS (Sécurité sociale)', amount: -socialSecurity });
  }
  if (incomeTax > 0) {
    payLines.push({ description: 'IRPP (Impôt sur le revenu)', amount: -incomeTax });
  }
  if (pensionFund > 0) {
    payLines.push({ description: 'Fonds de pension', amount: -pensionFund });
  }
  if (healthInsurance > 0) {
    payLines.push({ description: 'Assurance santé', amount: -healthInsurance });
  }
  if (unpaidLeave > 0) {
    payLines.push({ description: 'Congé sans solde', amount: -unpaidLeave });
  }
  if (otherDeductions > 0) {
    payLines.push({ description: 'Autres déductions', amount: -otherDeductions });
  }

  // Si pas de données, afficher un message
  if (payLines.length === 0) {
    payLines.push({ description: 'Aucune donnée disponible', amount: 0 });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>BULLETIN DE PAIE</Text>

        {/* En-tête SEYDI GROUP */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>SEYDI GROUP</Text>
            <Text style={styles.companySub}>S.A.R.L au capital de 50 000 000 GNF</Text>
            <Text style={styles.companySub}>RC: 2025/G/001 - NIF: 123456789</Text>
            <Text style={styles.companySub}>Conakry, République de Guinée</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>BULLETIN DE PAIE</Text>
            <Text style={styles.documentRef}>
              N° {payroll?.payroll_number || '2025/001'}
            </Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations employé */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Employé</Text>
            <Text style={styles.infoValue}>
              {payroll?.employee_name || payroll?.employee?.full_name || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Matricule</Text>
            <Text style={styles.infoValue}>
              {payroll?.employee?.employee_number || payroll?.employee_id || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Période</Text>
            <Text style={styles.infoValue}>
              {payroll?.month || 'MM'}/{payroll?.year || 'YYYY'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={styles.infoValue}>
              {payroll?.status_display || payroll?.status || 'Brouillon'}
            </Text>
          </View>
        </View>

        {/* Détails de la paie */}
        <Text style={styles.sectionTitle}>DÉTAIL DES ÉMOLUMENTS</Text>
        
        <View style={styles.table}>
          {/* En-tête */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Désignation</Text>
            <Text style={[styles.tableHeaderText, styles.colBase]}>Base</Text>
            <Text style={[styles.tableHeaderText, styles.colHours]}>Taux</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Montant</Text>
          </View>

          {/* Lignes */}
          {payLines.map((line, index) => {
            const isEven = index % 2 === 0;
            const rowStyle = isEven ? styles.tableRow : styles.tableRowAlt;
            const isNegative = line.amount < 0;
            const isPositive = line.amount > 0 && index > 0; // prime
            
            return (
              <View style={rowStyle} key={index}>
                <Text style={[
                  styles.tableCell, 
                  styles.colDesc,
                  isNegative && { color: '#d32f2f' },
                  isPositive && { color: '#2e7d32' }
                ]}>
                  {line.description}
                  {isPositive && ' ✚'}
                  {isNegative && ' ✖'}
                </Text>
                <Text style={[styles.tableCellRight, styles.colBase]}>
                  {line.amount && index === 0 ? formatGNF(line.amount) : '-'}
                </Text>
                <Text style={[styles.tableCellRight, styles.colHours]}>
                  {line.amount && index === 0 ? '100%' : '-'}
                </Text>
                <Text style={[
                  isNegative ? styles.tableCell : styles.tableCellBold,
                  styles.colAmount,
                  isNegative && { color: '#d32f2f' },
                  isPositive && { color: '#2e7d32' }
                ]}>
                  {formatGNF(line.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totaux */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Salaire de base</Text>
            <Text style={styles.totalAmount}>{formatGNF(baseSalary)}</Text>
          </View>
          
          {totalBonuses > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: '#2e7d32' }]}>Total primes (+)</Text>
              <Text style={[styles.totalAmount, { color: '#2e7d32' }]}>+ {formatGNF(totalBonuses)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontSize: 11, fontWeight: 'bold' }]}>
              SALAIRE BRUT
            </Text>
            <Text style={[styles.totalAmount, { fontSize: 11, fontWeight: 'bold' }]}>
              {formatGNF(grossSalary)}
            </Text>
          </View>
          
          {totalDeductions > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: '#d32f2f' }]}>Total déductions (-)</Text>
              <Text style={[styles.totalAmountRed]}>- {formatGNF(totalDeductions)}</Text>
            </View>
          )}
        </View>

        {/* Net à payer */}
        <View style={styles.netPay}>
          <Text style={styles.netLabel}>NET À PAYER (GNF)</Text>
          <Text style={styles.netAmount}>{formatGNF(netSalary)}</Text>
        </View>

        {/* Montant en lettres */}
        <Text style={styles.amountInWords}>
          Arrêté le présent bulletin à la somme de {formatGNF(netSalary)} en francs guinéens.
        </Text>

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature de l'employé</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature de l'employeur</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              SEYDI GROUP
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            SEYDI GROUP - Conakry, République de Guinée
          </Text>
          <Text style={styles.footerText}>
            Tél: (+224) 600 00 00 00 - Email: contact@seydigroup.gn
          </Text>
          <Text style={styles.footerText}>
            Page 1/1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PayrollSlipPDF;