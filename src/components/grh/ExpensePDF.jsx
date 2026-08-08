// src/components/expenses/ExpensePDF.jsx

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
    { src: 'https://fonts.gstatic.com/s/helvetica/v12/...' }
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
  detailCard: {
    marginTop: 5,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  detailRowLast: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  detailLabel: {
    width: '30%',
    fontSize: 9,
    color: '#546e7a',
  },
  detailValue: {
    width: '70%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
    borderStyle: 'solid',
  },
  statusApproved: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderStyle: 'solid',
  },
  statusPaid: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'solid',
  },
  statusRejected: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderStyle: 'solid',
  },
  statusCancelled: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#9e9e9e',
    borderStyle: 'solid',
  },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextPending: { color: '#ff9800' },
  statusTextApproved: { color: '#4caf50' },
  statusTextPaid: { color: '#2196f3' },
  statusTextRejected: { color: '#f44336' },
  statusTextCancelled: { color: '#9e9e9e' },
  amountBox: {
    marginTop: 10,
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
  amountLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    fontFamily: 'Helvetica',
  },
  receiptSection: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  receiptText: {
    fontSize: 9,
    color: '#546e7a',
    textAlign: 'center',
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
    fontFamily: 'Helvetica',
    transform: 'rotate(-30deg)',
  },
  commentBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffcc80',
    borderStyle: 'solid',
  },
  commentLabel: {
    fontSize: 8,
    color: '#e65100',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentText: {
    fontSize: 9,
    color: '#424242',
    marginTop: 2,
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

// Formatage date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Type de frais
const getTypeLabel = (type) => {
  const labels = {
    transport: 'Transport',
    meal: 'Repas',
    accommodation: 'Hébergement',
    supplies: 'Fournitures',
    client: 'Client',
    other: 'Autre'
  };
  return labels[type] || type;
};

// Composant principal
const ExpensePDF = ({ expense }) => {
  // 📊 Récupération des données
  const expenseData = expense || {};
  const status = expenseData.status || 'pending';
  
  // Mapping des statuts pour le style
  const statusStyles = {
    pending: {
      container: styles.statusPending,
      text: styles.statusTextPending,
      label: 'En attente'
    },
    approved: {
      container: styles.statusApproved,
      text: styles.statusTextApproved,
      label: 'Validé'
    },
    paid: {
      container: styles.statusPaid,
      text: styles.statusTextPaid,
      label: 'Payé'
    },
    rejected: {
      container: styles.statusRejected,
      text: styles.statusTextRejected,
      label: 'Rejeté'
    },
    cancelled: {
      container: styles.statusCancelled,
      text: styles.statusTextCancelled,
      label: 'Annulé'
    }
  };

  const statusStyle = statusStyles[status] || statusStyles.pending;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>NOTE DE FRAIS</Text>

        {/* En-tête SEYDI GROUP avec logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoSvg} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>SEYDI GROUP</Text>
              <Text style={styles.companySub}>S.A.R.L au capital de 50 000 000 GNF</Text>
              <Text style={styles.companySub}>RC: 2025/G/001 - NIF: 123456789</Text>
              <Text style={styles.companySub}>Conakry, République de Guinée</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>NOTE DE FRAIS</Text>
            <Text style={styles.documentRef}>
              N° {expenseData.reference || `EXP-${String(expenseData.id || '').padStart(4, '0')}`}
            </Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Employé</Text>
            <Text style={styles.infoValue}>
              {expenseData.employee_name || expenseData.employee?.full_name || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Type de frais</Text>
            <Text style={styles.infoValue}>
              {getTypeLabel(expenseData.expense_type)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date de la dépense</Text>
            <Text style={styles.infoValue}>
              {formatDate(expenseData.date)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Statut</Text>
            <View style={[styles.statusBadge, statusStyle.container]}>
              <Text style={[styles.statusText, statusStyle.text]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Détails de la note */}
        <Text style={styles.sectionTitle}>DÉTAILS DE LA NOTE</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>
              {expenseData.description || 'Sans description'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant</Text>
            <Text style={styles.detailValue}>
              {formatGNF(expenseData.amount)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Catégorie</Text>
            <Text style={styles.detailValue}>
              {getTypeLabel(expenseData.expense_type)}
            </Text>
          </View>
          {expenseData.approved_by_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Validé par</Text>
              <Text style={styles.detailValue}>
                {expenseData.approved_by_name}
              </Text>
            </View>
          )}
          {expenseData.payment_date && (
            <View style={styles.detailRowLast}>
              <Text style={styles.detailLabel}>Date de paiement</Text>
              <Text style={styles.detailValue}>
                {formatDate(expenseData.payment_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Montant total */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>MONTANT TOTAL</Text>
          <Text style={styles.amountValue}>{formatGNF(expenseData.amount)}</Text>
        </View>

        {/* Commentaires / Rejet */}
        {expenseData.status === 'rejected' && expenseData.rejection_reason && (
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>Motif du rejet</Text>
            <Text style={styles.commentText}>
              {expenseData.rejection_reason}
            </Text>
          </View>
        )}

        {expenseData.comments && expenseData.status !== 'rejected' && (
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>Commentaires</Text>
            <Text style={styles.commentText}>
              {expenseData.comments}
            </Text>
          </View>
        )}

        {/* Reçu */}
        {expenseData.receipt && (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptText}>
              Un reçu est joint à cette note de frais
            </Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature de l'employé</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {formatDate(expenseData.date)}
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

export default ExpensePDF;