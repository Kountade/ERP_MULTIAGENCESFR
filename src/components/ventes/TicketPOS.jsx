// src/components/pos/TicketPOS.jsx
import jsPDF from 'jspdf';

const TicketPOS = async (vente) => {
  if (!vente || typeof vente !== 'object') {
    throw new Error('Données de la vente invalides');
  }

  try {
    // ============================================================
    // FORMAT TICKET 80 MM
    // ============================================================
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 210]
    });

    const pageWidth = 80;

    const margins = {
      left: 4,
      right: 4,
      top: 4,
      bottom: 4
    };

    let y = margins.top;

    const lineHeight = 4;

    // ============================================================
    // FORMATAGE DES NOMBRES
    // ============================================================

    // Pas de toLocaleString() pour éviter les "/" dans jsPDF
    const formatNumber = (value) => {
      const number = parseFloat(value) || 0;

      return Math.round(number).toString();
    };

    const formatCurrency = (value) => {
      const number = parseFloat(value) || 0;

      return Math.round(number).toString() + ' FCFA';
    };

    // ============================================================
    // DATE
    // ============================================================

    const formatDate = (dateString) => {
      if (!dateString) {
        return '-';
      }

      try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
          return '-';
        }

        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return '-';
      }
    };

    // ============================================================
    // TEXTE CENTRÉ
    // ============================================================

    const centerText = (
      text,
      size = 10,
      style = 'normal'
    ) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(0, 0, 0);

      doc.text(
        String(text),
        pageWidth / 2,
        y,
        {
          align: 'center'
        }
      );

      y += lineHeight;

      return y;
    };

    // ============================================================
    // SÉPARATEUR
    // ============================================================

    const separator = () => {
      doc.setFontSize(5);
      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        '---------------------------',
        pageWidth / 2,
        y,
        {
          align: 'center'
        }
      );

      y += 2.5;

      return y;
    };

    // ============================================================
    // DOUBLE SÉPARATEUR
    // ============================================================

    const doubleSeparator = () => {
      doc.setFontSize(5);
      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        '===========================',
        pageWidth / 2,
        y,
        {
          align: 'center'
        }
      );

      y += 2.5;

      return y;
    };

    // ============================================================
    // ESPACE
    // ============================================================

    const sectionSpacer = (height = 2) => {
      y += height;
      return y;
    };

    // ============================================================
    // DONNÉES
    // ============================================================

    const client = vente.client || {};

    const clientNom =
      client.raison_sociale ||
      client.nom ||
      '';

    const clientPrenom =
      client.prenom ||
      '';

    const clientFull = clientPrenom
      ? `${clientNom} ${clientPrenom}`
      : clientNom;

    // ============================================================
    // AGENCE
    // ============================================================

    const agenceNom =
      vente.agence?.nom ||
      'Agence principale';

    const agenceAdresse =
      vente.agence?.adresse ||
      'Dakar, Sénégal';

    // ============================================================
    // VENDEUR
    // ============================================================

    const vendeurNom =
      vente.vendeur?.email ||
      vente.vendeur_nom ||
      'Commercial';

    // ============================================================
    // ARTICLES
    // ============================================================

    const items = Array.isArray(vente.items)
      ? vente.items
      : [];

    // ============================================================
    // TOTAUX
    // ============================================================

    const sousTotal =
      parseFloat(vente.sous_total) || 0;

    const tva =
      parseFloat(vente.tva) || 0;

    const total =
      parseFloat(vente.total) || 0;

    const montantPaye =
      parseFloat(vente.montant_paye) || 0;

    const resteAPayer =
      parseFloat(vente.reste_a_payer) || 0;

    // ============================================================
    // 1. EN-TÊTE
    // ============================================================

    centerText(
      'SEYDI GROUP',
      14,
      'bold'
    );

    sectionSpacer(1);

    // NOM DE L'AGENCE
    // Centré, sans %, sans tirets
    centerText(
      agenceNom,
      10,
      'bold'
    );

    centerText(
      agenceAdresse,
      7,
      'normal'
    );

    centerText(
      'Tél: +221 33 123 45 67',
      7,
      'normal'
    );

    centerText(
      'Email: contact@seydigroup.com',
      7,
      'normal'
    );

    sectionSpacer(1);

    separator();

    sectionSpacer(1);

    // ============================================================
    // TICKET
    // ============================================================

    centerText(
      'TICKET N° ' +
        (vente.reference || '---'),
      10,
      'bold'
    );

    centerText(
      formatDate(
        vente.date_vente || new Date()
      ),
      7,
      'normal'
    );

    // ============================================================
    // CLIENT
    // ============================================================

    if (clientNom) {
      centerText(
        'Client: ' + clientFull,
        7,
        'normal'
      );
    }

    // ============================================================
    // VENDEUR
    // ============================================================

    centerText(
      'Vendeur: ' + vendeurNom,
      6,
      'normal'
    );

    sectionSpacer(1);

    separator();

    sectionSpacer(1);

    // ============================================================
    // 2. TABLEAU DES PRODUITS
    // ============================================================

    /*
      Tableau compact pour ticket 80 mm :

      Qte  Designation      Prix    Total
      ------------------------------------
      1    HUILE 1L         7000    7000
    */

    const colQte = 4;
    const colDesignation = 12;
    const colPrix = 53;
    const colTotal = 70;

    // ============================================================
    // EN-TÊTE TABLEAU
    // ============================================================

    doc.setFontSize(7);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      'Qte',
      colQte,
      y
    );

    doc.text(
      'Designation',
      colDesignation,
      y
    );

    doc.text(
      'Prix',
      colPrix,
      y,
      {
        align: 'right'
      }
    );

    doc.text(
      'Total',
      colTotal,
      y,
      {
        align: 'right'
      }
    );

    y += 2.5;

    separator();

    // ============================================================
    // PRODUITS
    // ============================================================

    if (items.length > 0) {

      items.forEach((item) => {

        const qty =
          parseFloat(
            item.quantity
          ) || 0;

        const price =
          parseFloat(
            item.prix_unitaire
          ) || 0;

        const totalItem =
          parseFloat(
            item.total
          ) ||
          qty * price;

        const productName =
          item.product_name ||
          item.product?.name ||
          'Produit';

        // Limite du nom pour ne pas toucher Prix
        const name =
          String(productName)
            .substring(0, 18);

        // --------------------------------------------------------
        // STYLE
        // --------------------------------------------------------

        doc.setFontSize(7);

        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setTextColor(
          0,
          0,
          0
        );

        // --------------------------------------------------------
        // QUANTITÉ
        // --------------------------------------------------------

        doc.text(
          String(qty),
          colQte,
          y
        );

        // --------------------------------------------------------
        // DESIGNATION
        // --------------------------------------------------------

        doc.text(
          name,
          colDesignation,
          y
        );

        // --------------------------------------------------------
        // PRIX
        // --------------------------------------------------------

        doc.text(
          formatNumber(price),
          colPrix,
          y,
          {
            align: 'right'
          }
        );

        // --------------------------------------------------------
        // TOTAL PRODUIT
        // --------------------------------------------------------

        doc.setFont(
          'helvetica',
          'bold'
        );

        doc.text(
          formatNumber(totalItem),
          colTotal,
          y,
          {
            align: 'right'
          }
        );

        y += 4;

        // ========================================================
        // NOUVELLE PAGE
        // ========================================================

        if (y > 170) {

          doc.addPage();

          y =
            margins.top + 8;

          centerText(
            'SEYDI GROUP',
            12,
            'bold'
          );

          separator();

          sectionSpacer(1);

          // ------------------------------------------------------
          // EN-TÊTE TABLEAU PAGE SUIVANTE
          // ------------------------------------------------------

          doc.setFontSize(7);

          doc.setFont(
            'helvetica',
            'bold'
          );

          doc.setTextColor(
            0,
            0,
            0
          );

          doc.text(
            'Qte',
            colQte,
            y
          );

          doc.text(
            'Designation',
            colDesignation,
            y
          );

          doc.text(
            'Prix',
            colPrix,
            y,
            {
              align: 'right'
            }
          );

          doc.text(
            'Total',
            colTotal,
            y,
            {
              align: 'right'
            }
          );

          y += 2.5;

          separator();
        }
      });

      // ==========================================================
      // TOTAL ARTICLES
      // ==========================================================

      y += 1;

      doc.setFontSize(6);

      doc.setFont(
        'helvetica',
        'italic'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'Total articles: ' +
          items.length,
        margins.left,
        y
      );

      y += 3;

    } else {

      centerText(
        'Aucun article',
        7,
        'bold'
      );

      y += 2;
    }

    // ============================================================
    // ESPACE AVANT TOTAUX
    // ============================================================

    sectionSpacer(1);

    separator();

    sectionSpacer(1);

    // ============================================================
    // 3. TOTAUX
    // ============================================================

    /*
      Affichage :

      Sous-total       7000 FCFA

      ===========================

      TOTAL            7000 FCFA

      Payé             7000 FCFA

      Reste à payer    7000 FCFA
    */

    const totalLabelX = 4;
    const totalValueX = 66;

    // ============================================================
    // SOUS-TOTAL
    // ============================================================

    doc.setFontSize(8);

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      'Sous-total',
      totalLabelX,
      y
    );

    doc.text(
      formatCurrency(sousTotal),
      totalValueX,
      y,
      {
        align: 'right'
      }
    );

    y += lineHeight;

    // ============================================================
    // TVA
    // ============================================================

    if (tva > 0) {

      doc.setFontSize(8);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'TVA',
        totalLabelX,
        y
      );

      doc.text(
        formatCurrency(tva),
        totalValueX,
        y,
        {
          align: 'right'
        }
      );

      y += lineHeight;
    }

    // ============================================================
    // SÉPARATEUR
    // ============================================================

    sectionSpacer(0.5);

    doubleSeparator();

    sectionSpacer(0.5);

    // ============================================================
    // TOTAL
    // ============================================================

    doc.setFontSize(10);

    doc.setFont(
      'helvetica',
      'bold'
    );

    // NOIR
    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      'TOTAL',
      totalLabelX,
      y
    );

    doc.text(
      formatCurrency(total),
      totalValueX,
      y,
      {
        align: 'right'
      }
    );

    y += 5;

    // ============================================================
    // PAYÉ
    // ============================================================

    if (montantPaye > 0) {

      doc.setFontSize(8);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'Payé',
        totalLabelX,
        y
      );

      doc.text(
        formatCurrency(
          montantPaye
        ),
        totalValueX,
        y,
        {
          align: 'right'
        }
      );

      y += lineHeight;
    }

    // ============================================================
    // RESTE À PAYER
    // ============================================================

    if (resteAPayer > 0) {

      doc.setFontSize(8);

      doc.setFont(
        'helvetica',
        'bold'
      );

      // NOIR
      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'Reste à payer',
        totalLabelX,
        y
      );

      doc.text(
        formatCurrency(
          resteAPayer
        ),
        totalValueX,
        y,
        {
          align: 'right'
        }
      );

      y += lineHeight;
    }

    // ============================================================
    // 4. PAIEMENT
    // ============================================================

    sectionSpacer(1);

    separator();

    sectionSpacer(1);

    const modePaiement =
      vente.mode_paiement ||
      'Espèces';

    doc.setFontSize(8);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      'Paiement: ' +
        modePaiement,
      margins.left,
      y
    );

    y += lineHeight;

    sectionSpacer(1);

    separator();

    sectionSpacer(1);

    // ============================================================
    // 5. NOTES
    // ============================================================

    if (vente.notes) {

      const notes =
        doc.splitTextToSize(
          String(vente.notes),
          pageWidth -
            margins.left -
            margins.right -
            4
        );

      doc.setFontSize(7);

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'Notes:',
        margins.left,
        y
      );

      y += lineHeight;

      notes.forEach((line) => {

        doc.setFontSize(7);

        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setTextColor(
          0,
          0,
          0
        );

        doc.text(
          '  ' + line,
          margins.left,
          y
        );

        y += lineHeight;
      });

      sectionSpacer(1);
    }

    // ============================================================
    // PIED DE PAGE
    // ============================================================

    separator();

    sectionSpacer(2);

    centerText(
      'MERCI DE VOTRE CONFIANCE',
      11,
      'bold'
    );

    centerText(
      'À très bientôt !',
      8,
      'normal'
    );

    centerText(
      'Votre satisfaction est notre priorité',
      7,
      'normal'
    );

    sectionSpacer(1);

    // ============================================================
    // RÉFÉRENCE
    // ============================================================

    const barCode =
      vente.reference ||
      'TICKET';

    centerText(
      '*' + barCode + '*',
      5,
      'normal'
    );

    sectionSpacer(1);

    doc.setFontSize(4.5);

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      '---------------------------',
      pageWidth / 2,
      y,
      {
        align: 'center'
      }
    );

    y += 2.5;

    // ============================================================
    // DATE IMPRESSION
    // ============================================================

    const now = new Date();

    const dateStr =
      now.toLocaleDateString(
        'fr-FR'
      ) +
      ' ' +
      now.toLocaleTimeString(
        'fr-FR'
      );

    centerText(
      'Imprimé le ' + dateStr,
      4.5,
      'normal'
    );

    // ============================================================
    // NUMÉRO DE PAGE
    // ============================================================

    const pageCount =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= pageCount;
      i++
    ) {

      doc.setPage(i);

      doc.setFontSize(4);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.text(
        'Page ' +
          i +
          '/' +
          pageCount,
        pageWidth -
          margins.right,
        205,
        {
          align: 'right'
        }
      );
    }

    // ============================================================
    // SAUVEGARDE
    // ============================================================

    const fileName =
      'Ticket_' +
      (vente.reference || 'ticket') +
      '.pdf';

    doc.save(fileName);

    return doc;

  } catch (error) {

    console.error(
      'Erreur TicketPOS:',
      error
    );

    throw error;
  }
};

export default TicketPOS;
