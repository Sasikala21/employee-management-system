// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// function generateDataToPDF(data, columns, res, fileName) {
//     try {
//         // const doc = new PDFDocument();

//         // // Set up response headers
//         // res.setHeader("Content-Type", "application/pdf");
//         // res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);

//         // // Pipe the PDF to the response
//         // doc.pipe(res);

//         // // Add content to the PDF (table format)
//         // doc.text('PDF Content:', { align: 'center', fontSize: 16 });
//         // doc.moveDown();

//         // // Adding table headers
//         // doc.text([columns.map(column => column.header)], { align: 'center' });

//         // // Adding table rows
//         // data.forEach(row => {
//         //     doc.moveDown();
//         //     doc.text([columns.map(column => row[column.key])], { align: 'center' });
//         // });
//         const doc = new PDFDocument();
//         const filePath = path.join(__dirname,`${fileName}.pdf`);

//         // Pipe the PDF to a writable file stream
//         const fileStream = fs.createWriteStream(filePath);
//         doc.pipe(fileStream);

//         // Add content to the PDF (table format)
//         doc.text('PDF Content:', { align: 'center', fontSize: 16 });
//         doc.moveDown();
        
//        res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);

//         // Pipe the PDF to the response
//         doc.pipe(res);

//         // Add content to the PDF (table format)
//         doc.text('PDF Content:', { align: 'center', fontSize: 16 });
//         doc.moveDown();

//         // Adding table headers
//         doc.text([columns.map(column => column.header)], { align: 'center' });

//         // Adding table rows
//         data.forEach(row => {
//             doc.moveDown();
//             doc.text([columns.map(column => row[column.key])], { align: 'center' });
//         });
//         doc.end();
//         fileStream.on('finish', () => {
//             console.log(`PDF saved to: ${filePath}`);
//             res.sendFile(filePath);
//         });
//         // End the document
//         doc.end();
//     } catch (err) {
//         console.error("Error generating PDF:", err);
//         res.writeHead(500, { "Content-Type": "text/plain" });
//         res.end("Internal Server Error");
//     }
// }

// module.exports = generateDataToPDF;const PDFDocument = require('pdfkit');
//works but text content
// const fs = require('fs');
// const path = require('path');
// const PDFDocument = require('pdfkit');

// function generateDataToPDF(data, columns, res, fileName) {
//     try {
//         const doc = new PDFDocument();
//         const filePath = path.join(__dirname, `${fileName}.pdf`);

//         // Pipe the PDF to a writable file stream
//         const fileStream = fs.createWriteStream(filePath);
//         doc.pipe(fileStream);

//         // Add content to the PDF (table format)
//         doc.text('PDF Content:', { align: 'center', fontSize: 16 });
//         doc.moveDown();

//         // Adding table headers
//         const headerRow = columns.map(column => column.header);
//         doc.text(headerRow.join('\t'), { align: 'center' });

//         // Adding table rows
//         data.forEach(row => {
//             const rowData = columns.map(column => String(row[column.key]));
//             doc.text(rowData.join('\t'), { align: 'center' });
//             doc.moveDown();
//         });

//         // End the document
//         doc.end();

//         fileStream.on('finish', () => {
//             console.log(`PDF saved to: ${filePath}`);
//             res.setHeader("Content-Type", "application/pdf");
//             res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);
//             res.sendFile(filePath);
//         });
//     } catch (err) {
//         console.error("Error generating PDF:", err);
//         res.status(500).send("Internal Server Error");
//     }
// }

// module.exports = generateDataToPDF;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Table = require('pdfkit-table');

function generateDataToPDF(data, columns, res, fileName) {
    try {
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `${fileName}.pdf`);

        // Pipe the PDF to a writable file stream
        const fileStream = fs.createWriteStream(filePath);
        doc.pipe(fileStream);

        // Add content to the PDF (table format)
        doc.text('PDF Content:', { align: 'center', fontSize: 16 });
        doc.moveDown();

        // Adding table headers
        const headerRow = columns.map(column => column.header);

        // Adding table rows
        const rows = data.map(row => columns.map(column => String(row[column.key])));

        // Create a table instance
        const table = new Table();

        // Set table data
        table.setHeaders(headerRow).addRows(rows);

        // Draw the table on the PDF
        table.draw(doc, 50, doc.y);

        // End the document
        doc.end();

        fileStream.on('finish', () => {
            console.log(`PDF saved to: ${filePath}`);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);
            res.end();
        });
    } catch (err) {
        console.error("Error generating PDF:", err);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = generateDataToPDF;
