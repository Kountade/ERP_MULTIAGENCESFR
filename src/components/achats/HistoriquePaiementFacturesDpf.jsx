// src/components/achats/HistoriquePaiementFacturesDpf.jsx

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

// Enregistrer les polices avec fallback
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
    marginTop: 8,
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
  colDate: { width: '15%' },
  colMethod: { width: '18%' },
  colRef: { width: '17%' },
  colStatus: { width: '15%' },
  colAmount: { width: '27%', textAlign: 'right' },
  colText: {
    fontSize: 9,
    color: '#424242',
  },
  colTextBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusProcessing: {
    backgroundColor: '#e3f2fd',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusFailed: {
    backgroundColor: '#ffebee',
  },
  statusCancelled: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusTextPending: { color: '#ff9800' },
  statusTextProcessing: { color: '#2196f3' },
  statusTextCompleted: { color: '#4caf50' },
  statusTextFailed: { color: '#f44336' },
  statusTextCancelled: { color: '#9e9e9e' },
  summaryBox: {
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
  summaryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
  },
  summaryValue: {
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
    color: 'rgba(26, 35, 126, 0.05)',
    fontFamily: 'Helvetica',
    transform: 'rotate(-30deg)',
  },
  noData: {
    padding: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#78909c',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  summaryDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryDetailLabel: {
    fontSize: 9,
    color: '#546e7a',
  },
  summaryDetailValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#e8eaf6',
    borderTopWidth: 2,
    borderTopColor: '#c5cae9',
    borderTopStyle: 'solid',
    marginTop: 2,
  },
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
  },
});

// Formatage FCFA
const formatXOF = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return '0 FCFA';
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
};

// Formatage date amélioré
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

// Méthode de paiement
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

// Statut
const getStatusStyle = (status) => {
  const stylesMap = {
    pending: {
      container: 'statusPending',
      text: 'statusTextPending',
      label: 'En attente'
    },
    processing: {
      container: 'statusProcessing',
      text: 'statusTextProcessing',
      label: 'En cours'
    },
    completed: {
      container: 'statusCompleted',
      text: 'statusTextCompleted',
      label: 'Terminé'
    },
    failed: {
      container: 'statusFailed',
      text: 'statusTextFailed',
      label: 'Échoué'
    },
    cancelled: {
      container: 'statusCancelled',
      text: 'statusTextCancelled',
      label: 'Annulé'
    }
  };
  return stylesMap[status] || stylesMap.pending;
};

// Composant principal - Historique des paiements d'une facture
const HistoriquePaiementFacturesDpf = ({ facture, paiements }) => {
  const data = facture || {};
  const payments = paiements || [];
  const statusStyle = getStatusStyle(data.status);

  // Calcul des totaux
  const totalPaye = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const totalRestant = (data.total || 0) - totalPaye;
  const pourcentagePaye = data.total > 0 ? (totalPaye / data.total) * 100 : 0;

  // Statistiques supplémentaires
  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>HISTORIQUE DES PAIEMENTS</Text>

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
            <Text style={styles.documentTitle}>HISTORIQUE DES PAIEMENTS</Text>
            <Text style={styles.documentRef}>
              Facture N° {data.invoice_number || `INV-${String(data.id || '').padStart(4, '0')}`}
            </Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations de la facture */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Fournisseur</Text>
            <Text style={styles.infoValue}>
              {data.supplier?.company_name || data.supplier_name || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>N° Facture</Text>
            <Text style={styles.infoValue}>
              {data.invoice_number || '-'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date d'échéance</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.due_date)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Statut</Text>
            <View style={[styles.statusBadge, styles[statusStyle.container]]}>
              <Text style={[styles.statusText, styles[statusStyle.text]]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Résumé des paiements */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Total paiements</Text>
            <Text style={styles.infoValue}>{paymentStats.total}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Terminés</Text>
            <Text style={[styles.infoValue, { color: '#4caf50' }]}>{paymentStats.completed}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>En attente</Text>
            <Text style={[styles.infoValue, { color: '#ff9800' }]}>{paymentStats.pending}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Échoués/Annulés</Text>
            <Text style={[styles.infoValue, { color: '#f44336' }]}>{paymentStats.failed}</Text>
          </View>
        </View>

        {/* Barre de progression */}
        {data.total > 0 && (
          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 8, color: '#546e7a' }}>Progression du paiement</Text>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1a237e' }}>
                {Math.round(pourcentagePaye)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(pourcentagePaye, 100)}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Tableau des paiements */}
        <Text style={styles.sectionTitle}>LISTE DES PAIEMENTS</Text>

        {payments.length === 0 ? (
          <View style={styles.noData}>
            <Text>Aucun paiement enregistré pour cette facture</Text>
          </View>
        ) : (
          <>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colNum]}>N°</Text>
              <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.colMethod]}>Méthode</Text>
              <Text style={[styles.tableHeaderText, styles.colRef]}>Référence</Text>
              <Text style={[styles.tableHeaderText, styles.colStatus]}>Statut</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Montant</Text>
            </View>

            {/* Lignes du tableau */}
            {payments.map((payment, index) => {
              const pStatus = getStatusStyle(payment.status);
              return (
                <View key={payment.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.colText, styles.colNum]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.colText, styles.colDate]}>
                    {formatDate(payment.payment_date)}
                  </Text>
                  <Text style={[styles.colText, styles.colMethod]}>
                    {getMethodLabel(payment.payment_method)}
                  </Text>
                  <Text style={[styles.colText, styles.colRef]}>
                    {payment.reference_number || payment.payment_number || '-'}
                  </Text>
                  <View style={[styles.colStatus, styles.statusBadge, styles[pStatus.container]]}>
                    <Text style={[styles.statusText, styles[pStatus.text]]}>
                      {pStatus.label}
                    </Text>
                  </View>
                  <Text style={[styles.colTextBold, styles.colAmount]}>
                    {formatXOF(payment.amount)}
                  </Text>
                </View>
              );
            })}

            {/* Ligne de total */}
            <View style={styles.totalRow}>
              <Text style={[styles.totalText, { width: '73%' }]}>
                TOTAL GÉNÉRAL
              </Text>
              <Text style={[styles.totalText, { width: '27%', textAlign: 'right' }]}>
                {formatXOF(paymentStats.totalAmount)}
              </Text>
            </View>
          </>
        )}

        {/* Récapitulatif des montants */}
        <View style={styles.summaryBox}>
          <View>
            <Text style={styles.summaryLabel}>MONTANT TOTAL</Text>
            <Text style={{ fontSize: 10, color: '#546e7a', marginTop: 2 }}>
              {formatXOF(data.total)}
            </Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.summaryLabel}>TOTAL PAYÉ</Text>
            <Text style={{ fontSize: 10, color: '#4caf50', marginTop: 2 }}>
              {formatXOF(totalPaye)}
            </Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.summaryLabel}>RESTANT DÛ</Text>
            <Text style={{ fontSize: 10, color: totalRestant > 0 ? '#f44336' : '#4caf50', marginTop: 2 }}>
              {formatXOF(totalRestant)}
            </Text>
          </View>
        </View>

        {/* Détail des totaux */}
        <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 }}>
            DÉTAIL DES PAIEMENTS
          </Text>
          <View style={styles.summaryDetail}>
            <Text style={styles.summaryDetailLabel}>Nombre total de paiements</Text>
            <Text style={styles.summaryDetailValue}>{paymentStats.total}</Text>
          </View>
          <View style={styles.summaryDetail}>
            <Text style={styles.summaryDetailLabel}>Paiements terminés</Text>
            <Text style={[styles.summaryDetailValue, { color: '#4caf50' }]}>{paymentStats.completed}</Text>
          </View>
          <View style={styles.summaryDetail}>
            <Text style={styles.summaryDetailLabel}>Paiements en attente</Text>
            <Text style={[styles.summaryDetailValue, { color: '#ff9800' }]}>{paymentStats.pending}</Text>
          </View>
          <View style={styles.summaryDetail}>
            <Text style={styles.summaryDetailLabel}>Paiements échoués/annulés</Text>
            <Text style={[styles.summaryDetailValue, { color: '#f44336' }]}>{paymentStats.failed}</Text>
          </View>
        </View>

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

export default HistoriquePaiementFacturesDpf;