// src/components/comptabilite/BalancePdf.jsx
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
    fontSize: 7,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    fontSize: 8,
    color: '#424242',
  },
  tableCellRight: {
    fontSize: 8,
    color: '#424242',
    textAlign: 'right',
  },
  colCompte: { width: '18%' },
  colNom: { width: '22%' },
  colType: { width: '12%' },
  colSoldeInitDebit: { width: '10%', textAlign: 'right', paddingRight: 2 },
  colSoldeInitCredit: { width: '10%', textAlign: 'right', paddingRight: 2 },
  colMouvDebit: { width: '10%', textAlign: 'right', paddingRight: 2 },
  colMouvCredit: { width: '10%', textAlign: 'right', paddingRight: 2 },
  colSoldeFinalDebit: { width: '10%', textAlign: 'right', paddingRight: 2 },
  colSoldeFinalCredit: { width: '10%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#e8eaf6',
    borderTopWidth: 2,
    borderTopColor: '#1a237e',
    borderTopStyle: 'solid',
  },
  totalText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  totalTextRight: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  statusBrouillon: {
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
  statusArchive: {
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
  statusTextBrouillon: { color: '#ff9800' },
  statusTextValide: { color: '#4caf50' },
  statusTextArchive: { color: '#9e9e9e' },
  equilibreBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equilibreSuccess: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  equilibreError: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  equilibreText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  equilibreTextSuccess: { color: '#2e7d32' },
  equilibreTextError: { color: '#c62828' },
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
    brouillon: { label: 'Brouillon', style: 'statusBrouillon', textStyle: 'statusTextBrouillon' },
    valide: { label: 'Validée', style: 'statusValide', textStyle: 'statusTextValide' },
    archive: { label: 'Archivée', style: 'statusArchive', textStyle: 'statusTextArchive' }
  }
  return configs[status] || configs.brouillon
}

const getTypeLabel = (type) => {
  const labels = {
    actif: 'Actif',
    passif: 'Passif',
    capitaux: 'Capitaux propres',
    charges: 'Charges',
    produits: 'Produits'
  }
  return labels[type] || type
}

const BalancePdf = ({ balance }) => {
  const data = balance || {}
  const lignes = data.lignes || []
  const statusConfig = getStatusConfig(data.status)

  // Calculer les totaux
  const totals = {
    totalDebitInitial: lignes.reduce((sum, l) => sum + (parseFloat(l.solde_initial_debit) || 0), 0),
    totalCreditInitial: lignes.reduce((sum, l) => sum + (parseFloat(l.solde_initial_credit) || 0), 0),
    totalDebitMouvement: lignes.reduce((sum, l) => sum + (parseFloat(l.mouvement_debit) || 0), 0),
    totalCreditMouvement: lignes.reduce((sum, l) => sum + (parseFloat(l.mouvement_credit) || 0), 0),
    totalDebitFinal: lignes.reduce((sum, l) => sum + (parseFloat(l.solde_final_debit) || 0), 0),
    totalCreditFinal: lignes.reduce((sum, l) => sum + (parseFloat(l.solde_final_credit) || 0), 0)
  }

  const estEquilibree = totals.totalDebitFinal === totals.totalCreditFinal

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Filigrane */}
        <Text style={styles.watermark}>BALANCE COMPTABLE</Text>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>SEYDI GROUP</Text>
            <Text style={styles.companySub}>S.A.R.L au capital de 50 000 000 GNF</Text>
            <Text style={styles.companySub}>RC: 2025/G/001 - NIF: 123456789</Text>
            <Text style={styles.companySub}>Conakry, République de Guinée</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>BALANCE COMPTABLE</Text>
            <Text style={styles.documentRef}>N° {data.reference || 'N/A'}</Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Type de balance</Text>
            <Text style={styles.infoValue}>
              {data.type_balance_display || data.type_balance || 'Générale'}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Période</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.date_debut)} → {formatDate(data.date_fin)}
            </Text>
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

        {/* Tableau de la balance */}
        <Text style={styles.sectionTitle}>DETAIL DE LA BALANCE</Text>
        
        <View style={styles.table}>
          {/* En-tête */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colCompte]}>CODE</Text>
            <Text style={[styles.tableHeaderText, styles.colNom]}>COMPTE</Text>
            <Text style={[styles.tableHeaderText, styles.colType]}>TYPE</Text>
            <Text style={[styles.tableHeaderText, styles.colSoldeInitDebit]}>DEBIT</Text>
            <Text style={[styles.tableHeaderText, styles.colSoldeInitCredit]}>CREDIT</Text>
            <Text style={[styles.tableHeaderText, styles.colMouvDebit]}>DEBIT</Text>
            <Text style={[styles.tableHeaderText, styles.colMouvCredit]}>CREDIT</Text>
            <Text style={[styles.tableHeaderText, styles.colSoldeFinalDebit]}>DEBIT</Text>
            <Text style={[styles.tableHeaderText, styles.colSoldeFinalCredit]}>CREDIT</Text>
          </View>

          {/* Lignes */}
          {lignes.length > 0 ? (
            lignes.map((ligne, index) => {
              const isEven = index % 2 === 0
              const rowStyle = isEven ? styles.tableRow : styles.tableRowAlt
              return (
                <View style={rowStyle} key={index}>
                  <Text style={[styles.tableCell, styles.colCompte]}>
                    {ligne.compte_code || '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNom]}>
                    {ligne.compte_nom || '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colType]}>
                    {getTypeLabel(ligne.type_compte)}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSoldeInitDebit]}>
                    {parseFloat(ligne.solde_initial_debit) > 0 ? formatCurrency(ligne.solde_initial_debit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSoldeInitCredit]}>
                    {parseFloat(ligne.solde_initial_credit) > 0 ? formatCurrency(ligne.solde_initial_credit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colMouvDebit]}>
                    {parseFloat(ligne.mouvement_debit) > 0 ? formatCurrency(ligne.mouvement_debit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colMouvCredit]}>
                    {parseFloat(ligne.mouvement_credit) > 0 ? formatCurrency(ligne.mouvement_credit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSoldeFinalDebit]}>
                    {parseFloat(ligne.solde_final_debit) > 0 ? formatCurrency(ligne.solde_final_debit) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.colSoldeFinalCredit]}>
                    {parseFloat(ligne.solde_final_credit) > 0 ? formatCurrency(ligne.solde_final_credit) : '-'}
                  </Text>
                </View>
              )
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colCompte]}>-</Text>
              <Text style={[styles.tableCell, styles.colNom]}>Aucune ligne</Text>
              <Text style={[styles.tableCell, styles.colType]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colSoldeInitDebit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colSoldeInitCredit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colMouvDebit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colMouvCredit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colSoldeFinalDebit]}>-</Text>
              <Text style={[styles.tableCellRight, styles.colSoldeFinalCredit]}>-</Text>
            </View>
          )}

          {/* Totaux */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalText, styles.colCompte]}>TOTAUX</Text>
            <Text style={[styles.totalText, styles.colNom]}></Text>
            <Text style={[styles.totalText, styles.colType]}></Text>
            <Text style={[styles.totalTextRight, styles.colSoldeInitDebit]}>
              {formatCurrency(totals.totalDebitInitial)}
            </Text>
            <Text style={[styles.totalTextRight, styles.colSoldeInitCredit]}>
              {formatCurrency(totals.totalCreditInitial)}
            </Text>
            <Text style={[styles.totalTextRight, styles.colMouvDebit]}>
              {formatCurrency(totals.totalDebitMouvement)}
            </Text>
            <Text style={[styles.totalTextRight, styles.colMouvCredit]}>
              {formatCurrency(totals.totalCreditMouvement)}
            </Text>
            <Text style={[styles.totalTextRight, styles.colSoldeFinalDebit]}>
              {formatCurrency(totals.totalDebitFinal)}
            </Text>
            <Text style={[styles.totalTextRight, styles.colSoldeFinalCredit]}>
              {formatCurrency(totals.totalCreditFinal)}
            </Text>
          </View>
        </View>

        {/* Équilibre - SANS EMOJIS */}
        <View style={[
          styles.equilibreBox,
          estEquilibree ? styles.equilibreSuccess : styles.equilibreError
        ]}>
          <Text style={[
            styles.equilibreText,
            estEquilibree ? styles.equilibreTextSuccess : styles.equilibreTextError
          ]}>
            {estEquilibree ? 'BALANCE EQUILIBREE' : 'BALANCE NON EQUILIBREE'}
          </Text>
          <Text style={[
            styles.equilibreText,
            { fontSize: 8, marginLeft: 10 },
            estEquilibree ? styles.equilibreTextSuccess : styles.equilibreTextError
          ]}>
            {estEquilibree 
              ? `${formatCurrency(totals.totalDebitFinal)} = ${formatCurrency(totals.totalCreditFinal)}`
              : `${formatCurrency(totals.totalDebitFinal)} ≠ ${formatCurrency(totals.totalCreditFinal)}`
            }
          </Text>
        </View>

        {/* Métadonnées */}
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 7, color: '#78909c' }}>
            Cree le {formatDateTime(data.created_at)}
            {data.created_by_email && ` par ${data.created_by_email}`}
          </Text>
          {data.validated_at && (
            <Text style={{ fontSize: 7, color: '#78909c' }}>
              Valide le {formatDateTime(data.validated_at)}
            </Text>
          )}
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            SEYDI GROUP - Conakry, Republique de Guinee
          </Text>
          <Text style={styles.footerText}>
            Tel: (+224) 600 00 00 00 - Email: contact@seydigroup.gn
          </Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  )
}

export default BalancePdf