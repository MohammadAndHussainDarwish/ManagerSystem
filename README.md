# Metal Oil Store Management System

A lightweight, Arabic-language web application for managing a metal oil store. Track inventory, record customer sales and payments, review customer balances, and export a daily report from one dashboard.

## Features

- **Oil inventory:** Add products sold by kilogram or sealed box, including stock, purchase price, and selling price.
- **Dual-currency accounting:** Set each product's prices in Syrian pounds or US dollars, and record customer payments in either currency. Dollar and Syrian-pound balances are tracked separately without automatic conversion.
- **Stock monitoring:** View available quantities and identify low-stock products.
- **Sales and invoices:** Record a sale by customer, calculate totals and profit, and account for partial payments.
- **Customer accounts:** Record additional payments and review each customer's purchases, payments, and outstanding balance.
- **Daily dashboard:** See today's sales and profit, total recorded payments, and outstanding receivables.
- **Excel reports:** Export today's sales, payments, currency, and per-currency summary to an `.xlsx` workbook. Press **Ctrl+E** (or **Cmd+E** on macOS) to export.
- **Local persistence:** Keep the store data in the browser using `localStorage`.

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- [SheetJS](https://sheetjs.com/) for Excel export (loaded from jsDelivr)
- [Cairo](https://fonts.google.com/specimen/Cairo) font (loaded from Google Fonts)

## Getting Started

The application is a static website and does not require a build step or package installation.

1. Make sure `index.html`, `styles.css`, and `script.js` are in the same folder.
2. Start a local web server from that folder:

   ```bash
   python -m http.server 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.

The application interface is in Arabic. An internet connection is needed to load the hosted font and the Excel export library.

## Data and Privacy

All inventory, sales, and payment records are stored in the current browser's local storage. They are not synchronized to a server and are not automatically shared with other browsers or devices. Clearing browser data may remove the records. Use the **Export Excel** action to save a copy of the current day's report.

Existing records without a currency setting are treated as Syrian pounds. Currency balances are kept separate; the application does not convert between dollars and Syrian pounds.

The **Reset Data** action permanently clears the application's stored inventory, sales, and payments for the current browser.

## Authors

- Hussain Darwish
- Mohammad Darwish
