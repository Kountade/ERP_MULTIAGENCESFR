// src/components/achats/PaiementsFournisseurRecu.jsx

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
    width: '35%',
    fontSize: 9,
    color: '#546e7a',
  },
  detailValue: {
    width: '65%',
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
  statusProcessing: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'solid',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderStyle: 'solid',
  },
  statusFailed: {
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
  statusTextProcessing: { color: '#2196f3' },
  statusTextCompleted: { color: '#4caf50' },
  statusTextFailed: { color: '#f44336' },
  statusTextCancelled: { color: '#9e9e9e' },
  amountBox: {
    marginTop: 10,
    padding: 15,
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

// Composant principal
const PaiementFournisseurRecu = ({ paiement }) => {
  const data = paiement || {};
  const statusStyle = getStatusStyle(data.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>REÇU DE PAIEMENT</Text>

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
            <Text style={styles.documentTitle}>REÇU DE PAIEMENT</Text>
            <Text style={styles.documentRef}>
              N° {data.payment_number || `PAY-${String(data.id || '').padStart(4, '0')}`}
            </Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Fournisseur</Text>
            <Text style={styles.infoValue}>
              {data.invoice?.supplier?.company_name || data.supplier_name || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Facture</Text>
            <Text style={styles.infoValue}>
              {data.invoice?.invoice_number || data.invoice_number || '-'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date de paiement</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.payment_date)}
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

        {/* Détails du paiement */}
        <Text style={styles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Numéro de paiement</Text>
            <Text style={styles.detailValue}>
              {data.payment_number || '-'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Facture</Text>
            <Text style={styles.detailValue}>
              {data.invoice?.invoice_number || data.invoice_number || '-'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fournisseur</Text>
            <Text style={styles.detailValue}>
              {data.invoice?.supplier?.company_name || data.supplier_name || '-'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Méthode de paiement</Text>
            <Text style={styles.detailValue}>
              {getMethodLabel(data.payment_method)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Agence</Text>
            <Text style={styles.detailValue}>
              {data.agence?.nom || '-'}
            </Text>
          </View>
          {data.reference_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>N° de référence</Text>
              <Text style={styles.detailValue}>
                {data.reference_number}
              </Text>
            </View>
          )}
          {data.payment_date && (
            <View style={styles.detailRowLast}>
              <Text style={styles.detailLabel}>Date de paiement</Text>
              <Text style={styles.detailValue}>
                {formatDate(data.payment_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Montant total */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>MONTANT PAYÉ</Text>
          <Text style={styles.amountValue}>{formatXOF(data.amount)}</Text>
        </View>

        {/* Informations du mouvement de trésorerie */}
        {data.mouvement_tresorerie && (
          <View style={styles.detailCard}>
            <Text style={[styles.detailLabel, { marginBottom: 4 }]}>
              Informations de trésorerie
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>N° Mouvement</Text>
              <Text style={styles.detailValue}>
                {data.mouvement_tresorerie.id || '-'}
              </Text>
            </View>
            {data.caisse && (
              <View style={styles.detailRowLast}>
                <Text style={styles.detailLabel}>Caisse</Text>
                <Text style={styles.detailValue}>
                  {data.caisse.nom || '-'}
                </Text>
              </View>
            )}
            {data.compte_bancaire && (
              <View style={styles.detailRowLast}>
                <Text style={styles.detailLabel}>Compte bancaire</Text>
                <Text style={styles.detailValue}>
                  {data.compte_bancaire.nom || data.compte_bancaire.iban || '-'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {data.notes && (
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>Notes</Text>
            <Text style={styles.commentText}>
              {data.notes}
            </Text>
          </View>
        )}

        {/* Reçu */}
        {data.receipt_file && (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptText}>
              ✓ Un reçu est joint à ce paiement
            </Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature du fournisseur</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {formatDate(data.payment_date)}
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

export default PaiementFournisseurRecu;