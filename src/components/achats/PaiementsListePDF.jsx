// src/components/achats/PaiementsListePDF.jsx

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
  filterInfoHighlight: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffcc80',
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
  colPayment: { width: '18%' },
  colInvoice: { width: '18%' },
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

// ⭐ Formatage FCFA - Corrigé pour gérer les chaînes
const formatXOF = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
  
  // Si c'est une chaîne, la convertir en nombre
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  if (isNaN(num) || num === 0) return '0 FCFA';
  
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
};

// ⭐ Fonction pour extraire le montant correctement
const getAmount = (payment) => {
  if (!payment) return 0;
  
  // Essayer différents champs possibles
  let amount = payment.amount || payment.montant || payment.total || 0;
  
  // Si c'est une chaîne, la convertir
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/,/g, ''));
  }
  
  return isNaN(amount) ? 0 : amount;
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Terminé',
    failed: 'Échoué',
    cancelled: 'Annulé'
  };
  return labels[status] || status || 'Inconnu';
};

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

// Composant principal
const PaiementsListePDF = ({ paiements, filters = {} }) => {
  const payments = paiements || [];
  
  // ⭐ Calcul du total avec getAmount
  const totalAmount = payments.reduce((sum, p) => sum + getAmount(p), 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length;
  
  // Construire le libellé du filtre
  let filterLabel = 'Tous les paiements';
  let filterDetails = [];
  
  if (filters.searchTerm) {
    filterDetails.push(`🔍 Recherche: "${filters.searchTerm}"`);
  }
  
  if (filters.filterType === 'today') {
    filterLabel = '📅 Paiements du jour';
  } else if (filters.filterType === 'month') {
    filterLabel = '📆 Paiements du mois (30 derniers jours)';
  } else if (filters.filterType === 'invoice' && filters.invoiceNumber) {
    filterLabel = `📄 Paiements de la facture ${filters.invoiceNumber}`;
    if (filters.supplierName) {
      filterDetails.push(`Fournisseur: ${filters.supplierName}`);
    }
  }

  filterDetails.push(`📊 ${payments.length} paiement(s) trouvé(s)`);
  filterDetails.push(`💰 Montant total: ${formatXOF(totalAmount)}`);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>LISTE DES PAIEMENTS</Text>

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
            <Text style={styles.documentTitle}>LISTE DES PAIEMENTS</Text>
            <Text style={styles.documentRef}>{filterLabel}</Text>
            <Text style={styles.documentRef}>
              Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations de filtre */}
        {filterDetails.length > 0 && (
          <View style={[styles.filterInfo, filters.searchTerm && styles.filterInfoHighlight]}>
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
            <Text style={styles.statsLabel}>Total paiements</Text>
            <Text style={styles.statsValue}>{payments.length}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Terminés</Text>
            <Text style={[styles.statsValue, { color: '#4caf50' }]}>{completedCount}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>En attente</Text>
            <Text style={[styles.statsValue, { color: '#ff9800' }]}>{pendingCount}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Échoués/Annulés</Text>
            <Text style={[styles.statsValue, { color: '#f44336' }]}>{failedCount}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Montant total</Text>
            <Text style={[styles.statsValue, { color: '#1a237e' }]}>{formatXOF(totalAmount)}</Text>
          </View>
        </View>

        {/* Tableau */}
        <Text style={styles.sectionTitle}>DÉTAIL DES PAIEMENTS</Text>

        {payments.length === 0 ? (
          <Text style={{ padding: 20, textAlign: 'center', fontSize: 10, color: '#78909c' }}>
            Aucun paiement ne correspond à votre recherche
          </Text>
        ) : (
          <>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colNum]}>N°</Text>
              <Text style={[styles.tableHeaderText, styles.colPayment]}>N° Paiement</Text>
              <Text style={[styles.tableHeaderText, styles.colInvoice]}>Facture</Text>
              <Text style={[styles.tableHeaderText, styles.colSupplier]}>Fournisseur</Text>
              <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Montant</Text>
            </View>

            {/* Lignes du tableau */}
            {payments.map((payment, index) => {
              const amount = getAmount(payment);
              return (
                <View key={payment.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.colText, styles.colNum]}>{index + 1}</Text>
                  <Text style={[styles.colText, styles.colPayment]}>
                    {payment.payment_number || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colInvoice]}>
                    {payment.invoice?.invoice_number || payment.invoice_number || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colSupplier]}>
                    {payment.invoice?.supplier?.company_name || payment.supplier_name || '-'}
                  </Text>
                  <Text style={[styles.colText, styles.colDate]}>
                    {formatDate(payment.payment_date)}
                  </Text>
                  <Text style={[styles.colTextBold, styles.colAmount]}>
                    {formatXOF(amount)}
                  </Text>
                </View>
              );
            })}

            {/* Ligne de total */}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>
                Total: {payments.length} paiement(s)
              </Text>
              <Text style={styles.totalValue}>
                {formatXOF(totalAmount)}
              </Text>
            </View>

            {/* Résumé des statuts */}
            <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 }}>
                RÉSUMÉ DES STATUTS
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View>
                  <Text style={{ fontSize: 8, color: '#78909c' }}>Terminés</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#4caf50' }}>{completedCount}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 8, color: '#78909c' }}>En attente</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ff9800' }}>{pendingCount}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 8, color: '#78909c' }}>Échoués/Annulés</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#f44336' }}>{failedCount}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 8, color: '#78909c' }}>Montant total</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1a237e' }}>{formatXOF(totalAmount)}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature du fournisseur</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature SEYDI GROUP</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Responsable financier
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            SEYDI GROUP - Dakar, Sénégal
          </Text>
          <Text style={styles.footerText}>
            Tél: (+221) 33 800 00 00 - Email: contact@seydigroup.sn
          </Text>
          <Text style={styles.footerText}>
            Page 1/1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaiementsListePDF;