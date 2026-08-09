// src/components/achats/ReceptionsListePDF.jsx

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';
import logoSvg from '../../assets/logo.svg';

// Enregistrer les polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0b.woff2',
      fontWeight: 'normal'
    },
    {
      src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.woff2',
      fontWeight: 'bold'
    }
  ]
});

// Styles
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
    letterSpacing: 1,
  },
  companySub: {
    fontSize: 8,
    color: '#546e7a',
    marginTop: 1,
  },
  headerRight: {
    textAlign: 'right',
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
    letterSpacing: 2,
  },
  documentRef: {
    fontSize: 9,
    color: '#546e7a',
    marginTop: 2,
  },
  filterInfo: {
    fontSize: 9,
    marginBottom: 15,
    color: '#546e7a',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 10,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8eaf6',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#c5cae9',
    borderBottomStyle: 'solid',
    marginTop: 5,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a237e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    backgroundColor: '#fafafa',
  },
  colNum: { width: '8%' },
  colReceipt: { width: '18%' },
  colOrder: { width: '18%' },
  colSupplier: { width: '22%' },
  colDate: { width: '15%', textAlign: 'center' },
  colAmount: { width: '19%', textAlign: 'right' },
  colText: {
    fontSize: 9,
    color: '#424242',
  },
  colTextBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    textAlign: 'center',
  },
  statsLabel: {
    fontSize: 8,
    color: '#78909c',
  },
  statsValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 2,
  },
  totalBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e8eaf6',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c5cae9',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
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
    marginTop: 20,
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
    color: 'rgba(26, 35, 126, 0.03)',
    fontFamily: 'Helvetica',
    transform: 'rotate(-30deg)',
  },
});

// Formatage
const formatXOF = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num) || num === 0) return '0 FCFA';
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
};

const getTotalValue = (reception) => {
  if (!reception) return 0;
  let total = parseFloat(reception.total_value) || 0;
  if (typeof total === 'string') {
    total = parseFloat(total.replace(/,/g, ''));
  }
  return isNaN(total) ? 0 : total;
};

const getTotalCosts = (reception) => {
  if (!reception) return 0;
  let costs = parseFloat(reception.total_costs) || 0;
  if (typeof costs === 'string') {
    costs = parseFloat(costs.replace(/,/g, ''));
  }
  return isNaN(costs) ? 0 : costs;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    let date;
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
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

// Composant principal
const ReceptionsListePDF = ({ receptions, filters = {} }) => {
  const receipts = receptions || [];
  
  // Calcul des totaux
  const totalValue = receipts.reduce((sum, r) => sum + getTotalValue(r), 0);
  const totalCosts = receipts.reduce((sum, r) => sum + getTotalCosts(r), 0);
  const grandTotal = totalValue + totalCosts;
  const itemCount = receipts.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  // Construire le libellé du filtre
  let filterLabel = 'Toutes les réceptions';
  let filterDetails = [];
  
  if (filters.searchTerm) {
    filterDetails.push(`🔍 Recherche: "${filters.searchTerm}"`);
  }
  
  if (filters.dateRange?.start && filters.dateRange?.end) {
    filterDetails.push(`📅 Du ${formatDate(filters.dateRange.start)} au ${formatDate(filters.dateRange.end)}`);
  } else if (filters.dateRange?.start) {
    filterDetails.push(`📅 À partir du ${formatDate(filters.dateRange.start)}`);
  } else if (filters.dateRange?.end) {
    filterDetails.push(`📅 Jusqu'au ${formatDate(filters.dateRange.end)}`);
  }

  filterDetails.push(`📊 ${receipts.length} réception(s) trouvée(s)`);
  filterDetails.push(`💰 Montant total: ${formatXOF(grandTotal)}`);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>LISTE DES RÉCEPTIONS</Text>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoSvg} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>SEYDI GROUP</Text>
              <Text style={styles.companySub}>S.A.R.L au capital de 50 000 000 FCFA</Text>
              <Text style={styles.companySub}>RC: 2025/G/001 - NIF: 123456789</Text>
              <Text style={styles.companySub}>Dakar, Sénégal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>LISTE DES RÉCEPTIONS</Text>
            <Text style={styles.documentRef}>{filterLabel}</Text>
            <Text style={styles.documentRef}>
              Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations de filtre */}
        {filterDetails.length > 0 && (
          <View style={styles.filterInfo}>
            {filterDetails.map((detail, index) => (
              <Text key={index} style={{ marginBottom: index < filterDetails.length - 1 ? 2 : 0 }}>
                {detail}
              </Text>
            ))}
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsBox}>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Total réceptions</Text>
            <Text style={styles.statsValue}>{receipts.length}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Articles reçus</Text>
            <Text style={styles.statsValue}>{itemCount}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Valeur totale</Text>
            <Text style={[styles.statsValue, { color: '#1a237e' }]}>{formatXOF(totalValue)}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Frais totaux</Text>
            <Text style={[styles.statsValue, { color: '#ff9800' }]}>{formatXOF(totalCosts)}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Total général</Text>
            <Text style={[styles.statsValue, { color: '#4caf50' }]}>{formatXOF(grandTotal)}</Text>
          </View>
        </View>

        {/* Tableau */}
        <Text style={styles.sectionTitle}>DÉTAIL DES RÉCEPTIONS</Text>

        {receipts.length === 0 ? (
          <Text style={{ padding: 20, textAlign: 'center', fontSize: 10, color: '#78909c' }}>
            Aucune réception ne correspond à votre recherche
          </Text>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colNum]}>N°</Text>
              <Text style={[styles.tableHeaderText, styles.colReceipt]}>N° Réception</Text>
              <Text style={[styles.tableHeaderText, styles.colOrder]}>Commande</Text>
              <Text style={[styles.tableHeaderText, styles.colSupplier]}>Fournisseur</Text>
              <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Total</Text>
            </View>

            {receipts.map((receipt, index) => {
              const total = getTotalValue(receipt) + getTotalCosts(receipt);
              return (
                <View key={receipt.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.colText, styles.colNum]}>{index + 1}</Text>
                  <Text style={[styles.colText, styles.colReceipt]}>
                    {receipt.receipt_number || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colOrder]}>
                    {receipt.order_number || receipt.purchase_order?.order_number || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colSupplier]}>
                    {receipt.supplier_name || receipt.purchase_order?.supplier?.company_name || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colDate]}>
                    {formatDate(receipt.receipt_date)}
                  </Text>
                  <Text style={[styles.colTextBold, styles.colAmount]}>
                    {formatXOF(total)}
                  </Text>
                </View>
              );
            })}

            {/* Ligne de total */}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>
                Total: {receipts.length} réception(s)
              </Text>
              <Text style={styles.totalValue}>
                {formatXOF(grandTotal)}
              </Text>
            </View>
          </>
        )}

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature du responsable</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature SEYDI GROUP</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Responsable logistique
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>SEYDI GROUP - Dakar, Sénégal</Text>
          <Text style={styles.footerText}>Tél: (+221) 33 800 00 00</Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceptionsListePDF;