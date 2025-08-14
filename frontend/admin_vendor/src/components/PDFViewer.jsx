// PDFViewer.jsx
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";

// ✅ Tell react-pdf to use the worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl }) => {
  return (
    <div className="w-full h-full">
      <Document file={fileUrl}>
        <Page pageNumber={1} width={800} />
      </Document>
    </div>
  );
};

export default PDFViewer;
