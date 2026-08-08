// src/components/comptabilite/EcriturePdf.jsx
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Enregistrer les polices
Font.register({
  family: 'Helvetica'
})

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
    fontFamily: 'Helvetica',
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
  statusValide: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderStyle: 'solid',
  },
  statusAnnulee: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderStyle: 'solid',
  },
  statusCloturee: {
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
  statusTextValide: { color: '#4caf50' },
  statusTextAnnulee: { color: '#f44336' },
  statusTextCloturee: { color: '#9e9e9e' },
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
  colCompte: { width: '20%' },
  colLibelle: { width: '40%' },
  colDebit: { width: '20%', textAlign: 'right', paddingRight: 4 },
  colCredit: { width: '20%', textAlign: 'right' },
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
  amountDebit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  amountCredit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
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
})

// Formatage monétaire
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 FCFA'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0 FCFA'
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getStatusConfig = (status) => {
  const configs = {
    brouillon: { label: 'Brouillon', style: 'statusPending', textStyle: 'statusTextPending' },
    valide: { label: 'Validée', style: 'statusValide', textStyle: 'statusTextValide' },
    annulee: { label: 'Annulée', style: 'statusAnnulee', textStyle: 'statusTextAnnulee' },
    cloturee: { label: 'Clôturée', style: 'statusCloturee', textStyle: 'statusTextCloturee' }
  }
  return configs[status] || configs.brouillon
}

const EcriturePdf = ({ ecriture }) => {
  const data = ecriture || {}
  const statusConfig = getStatusConfig(data.status)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>ÉCRITURE COMPTABLE</Text>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>SEYDI GROUP</Text>
            <Text style={styles.companySub}>S.A.R.L au capital de 50 000 000 GNF</Text>
            <Text style={styles.companySub}>RC: 2025/G/001 - NIF: 123456789</Text>
            <Text style={styles.companySub}>Conakry, République de Guinée</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>ÉCRITURE COMPTABLE</Text>
            <Text style={styles.documentRef}>N° {data.reference || 'N/A'}</Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Journal</Text>
            <Text style={styles.infoValue}>
              {data.journal_code} - {data.journal_nom || data.journal}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date d'écriture</Text>
            <Text style={styles.infoValue}>{formatDate(data.date_ecriture)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Agence</Text>
            <Text style={styles.infoValue}>{data.agence_nom || '-'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Statut</Text>
            <View style={[styles.statusBadge, styles[statusConfig.style]]}>
              <Text style={[styles.statusText, styles[statusConfig.textStyle]]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Détails */}
        <Text style={styles.sectionTitle}>DÉTAILS DE L'ÉCRITURE</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Libellé</Text>
            <Text style={styles.detailValue}>{data.libelle || 'Sans libellé'}</Text>
          </View>
          {data.piece_justificative && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pièce justificative</Text>
              <Text style={styles.detailValue}>{data.piece_justificative}</Text>
            </View>
          )}
          {data.notes && (
            <View style={styles.detailRowLast}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{data.notes}</Text>
            </View>
          )}
        </View>

        {/* Lignes d'écriture */}
        <Text style={styles.sectionTitle}>LIGNES D'ÉCRITURE</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colCompte]}>Compte</Text>
            <Text style={[styles.tableHeaderText, styles.colLibelle]}>Libellé</Text>
            <Text style={[styles.tableHeaderText, styles.colDebit]}>Débit</Text>
            <Text style={[styles.tableHeaderText, styles.colCredit]}>Crédit</Text>
          </View>

          {data.lignes && data.lignes.length > 0 ? (
            data.lignes.map((ligne, index) => {
              const isEven = index % 2 === 0
              const rowStyle = isEven ? styles.tableRow : styles.tableRowAlt
              return (
                <View style={rowStyle} key={index}>
                  <Text style={[styles.tableCell, styles.colCompte]}>
                    {ligne.compte_code} - {ligne.compte_nom}
                  </Text>
                  <Text style={[styles.tableCell, styles.colLibelle]}>
                    {ligne.libelle || '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colDebit]}>
                    {ligne.debit > 0 ? formatCurrency(ligne.debit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colCredit]}>
                    {ligne.credit > 0 ? formatCurrency(ligne.credit) : '-'}
                  </Text>
                </View>
              )
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colCompte]}>-</Text>
              <Text style={[styles.tableCell, styles.colLibelle]}>Aucune ligne</Text>
              <Text style={[styles.tableCellRight, styles.colDebit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colCredit]}>-</Text>
            </View>
          )}
        </View>

        {/* Totaux */}
        <View style={styles.amountBox}>
          <View>
            <Text style={styles.amountDebit}>
              Total Débit: {formatCurrency(data.total_debit)}
            </Text>
            <Text style={styles.amountCredit}>
              Total Crédit: {formatCurrency(data.total_credit)}
            </Text>
          </View>
          <View>
            <Text style={[styles.amountLabel, { fontSize: 14 }]}>
              {data.est_equilibree ? '✅ ÉQUILIBRÉE' : '❌ NON ÉQUILIBRÉE'}
            </Text>
            {data.est_equilibree && (
              <Text style={{ fontSize: 8, color: '#78909c', textAlign: 'right', marginTop: 2 }}>
                {formatCurrency(data.total_debit)} = {formatCurrency(data.total_credit)}
              </Text>
            )}
          </View>
        </View>

        {/* Métadonnées */}
        <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 7, color: '#78909c' }}>
            Créé le {formatDateTime(data.created_at)}
            {data.created_by_email && ` par ${data.created_by_email}`}
          </Text>
          {data.validated_at && (
            <Text style={{ fontSize: 7, color: '#78909c' }}>
              Validé le {formatDateTime(data.validated_at)}
              {data.validated_by_email && ` par ${data.validated_by_email}`}
            </Text>
          )}
          {data.source_type && (
            <Text style={{ fontSize: 7, color: '#78909c' }}>
              Source: {data.source_type} #{data.source_id}
            </Text>
          )}
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            SEYDI GROUP - Conakry, République de Guinée
          </Text>
          <Text style={styles.footerText}>
            Tél: (+224) 600 00 00 00 - Email: contact@seydigroup.gn
          </Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  )
}

export default EcriturePdf