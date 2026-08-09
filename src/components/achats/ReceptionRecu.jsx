// src/components/achats/ReceptionRecu.jsx

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
  colProduct: { width: '35%' },
  colQty: { width: '12%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  colText: {
    fontSize: 9,
    color: '#424242',
  },
  colTextBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a237e',
  },
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
  totalBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
});

// ⭐ Formatage FCFA (identique à ReceptionsListePDF)
const formatXOF = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 FCFA';
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num) || num === 0) return '0 FCFA';
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
};

// ⭐ Fonction pour extraire le prix unitaire (CORRIGÉE - comme dans ReceptionsListePDF)
const getUnitPrice = (item) => {
  if (!item) return 0;
  
  // ⭐ Les données sont directement dans l'item, pas dans order_item
  let price = item.unit_price || 
              item.price || 
              item.order_item?.unit_price || 
              item.order_item?.price || 
              0;
  
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/,/g, ''));
  }
  
  return isNaN(price) ? 0 : price;
};

// ⭐ Fonction pour extraire la quantité (CORRIGÉE)
const getQuantity = (item) => {
  if (!item) return 0;
  
  // ⭐ Les données sont directement dans l'item
  let qty = item.quantity || 
            item.qty || 
            item.order_item?.quantity || 
            0;
  
  if (typeof qty === 'string') {
    qty = parseFloat(qty.replace(/,/g, ''));
  }
  
  return isNaN(qty) ? 0 : qty;
};

// ⭐ Fonction pour extraire le nom du produit (CORRIGÉE)
const getProductName = (item) => {
  if (!item) return 'N/A';
  
  // ⭐ Les données sont directement dans l'item
  return item.product_name || 
         item.name ||
         item.order_item?.product?.name || 
         item.product?.name || 
         'N/A';
};

// ⭐ Fonction pour extraire la référence (CORRIGÉE)
const getProductReference = (item) => {
  if (!item) return '-';
  
  return item.product_reference || 
         item.reference ||
         item.order_item?.product?.reference || 
         item.product?.reference || 
         '-';
};

// ⭐ Fonction pour calculer le total d'une ligne
const getLineTotal = (item) => {
  const qty = getQuantity(item);
  const price = getUnitPrice(item);
  return qty * price;
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
const ReceptionRecu = ({ reception }) => {
  const data = reception || {};
  const items = data.items || [];

  // ⭐ Calcul des totaux
  let totalValue = 0;
  const itemsWithDetails = items.map(item => {
    const qty = getQuantity(item);
    const price = getUnitPrice(item);
    const total = qty * price;
    totalValue += total;
    
    return {
      ...item,
      quantity: qty,
      unit_price: price,
      total: total,
      product_name: getProductName(item),
      product_reference: getProductReference(item)
    };
  });

  // ⭐ Utiliser les valeurs du réception (comme dans ReceptionsListePDF)
  const totalCosts = parseFloat(data.total_costs) || 0;
  const grandTotal = totalValue + totalCosts;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>REÇU DE RÉCEPTION</Text>

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
            <Text style={styles.documentTitle}>REÇU DE RÉCEPTION</Text>
            <Text style={styles.documentRef}>
              N° {data.receipt_number || `REC-${String(data.id || '').padStart(4, '0')}`}
            </Text>
            <Text style={styles.documentRef}>
              Émis le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>N° Réception</Text>
            <Text style={styles.infoValue}>{data.receipt_number || '-'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Commande</Text>
            <Text style={styles.infoValue}>{data.order_number || data.purchase_order?.order_number || '-'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Fournisseur</Text>
            <Text style={styles.infoValue}>{data.supplier_name || data.purchase_order?.supplier?.company_name || '-'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(data.receipt_date)}</Text>
          </View>
        </View>

        {/* Articles */}
        <Text style={styles.sectionTitle}>ARTICLES REÇUS</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNum]}>N°</Text>
          <Text style={[styles.tableHeaderText, styles.colProduct]}>Produit</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Prix unitaire</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        {itemsWithDetails.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#78909c' }}>Aucun article dans cette réception</Text>
          </View>
        ) : (
          itemsWithDetails.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.colText, styles.colNum]}>{index + 1}</Text>
              <Text style={[styles.colText, styles.colProduct]}>
                {item.product_name}
                {item.product_reference && item.product_reference !== '-' && (
                  <Text style={{ fontSize: 7, color: '#78909c' }}> ({item.product_reference})</Text>
                )}
              </Text>
              <Text style={[styles.colText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.colText, styles.colPrice]}>{formatXOF(item.unit_price)}</Text>
              <Text style={[styles.colTextBold, styles.colTotal]}>{formatXOF(item.total)}</Text>
            </View>
          ))
        )}

        {/* Totaux */}
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 9, color: '#546e7a' }}>Valeur des marchandises</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1a237e' }}>{formatXOF(totalValue)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 9, color: '#546e7a' }}>Frais annexes</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#ff9800' }}>{formatXOF(totalCosts)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 4, marginTop: 4 }]}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1a237e' }}>TOTAL RÉCEPTION</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a237e' }}>{formatXOF(grandTotal)}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature du réceptionnaire</Text>
            <Text style={{ fontSize: 7, color: '#78909c', marginTop: 2 }}>
              Date: {formatDate(data.receipt_date)}
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

export default ReceptionRecu;