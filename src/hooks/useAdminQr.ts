import { useState } from "react";
import { buildPersonalLink, getQrImageUrl } from "../utils/helpers";

export function useAdminQr(currentShareLink: string, isEn: boolean) {
  const [tableCount, setTableCount] = useState<number>(15);

  const printTableCards = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let html = `
      <html>
        <head>
          <title>${isEn ? 'Table QR Cards' : 'Masa QR Kartları'}</title>
          <style>
            body { font-family: "Playfair Display", serif; text-align: center; background: #fff; margin: 0; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
            .card { 
              border: 3px solid #9f4f68; 
              padding: 30px; 
              border-radius: 20px; 
              page-break-inside: avoid;
              background: #fffafb;
            }
            img { width: 220px; height: 220px; margin-bottom: 10px; border-radius: 12px; }
            h2 { color: #9f4f68; margin: 0 0 10px 0; font-size: 32px; }
            p { color: #55303b; font-size: 18px; margin: 0; font-family: sans-serif; }
            @media print {
              body { padding: 0; }
              .grid { gap: 20px; }
              .card { border: 2px solid #9f4f68; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
    `;

    for (let i = 1; i <= tableCount; i++) {
      const tableLink = buildPersonalLink(currentShareLink, "", i.toString());
      const tableQr = getQrImageUrl(tableLink);
      html += `
        <div class="card">
          <h2>${isEn ? 'Table' : 'Masa'} ${i}</h2>
          <img src="${tableQr}" alt="QR Code" crossorigin="anonymous" />
          <p>${isEn ? 'Scan to send photos to the Live Projector!' : 'Canlı ekrana fotoğraf göndermek için okutun!'}</p>
        </div>
      `;
    }

    html += `
          </div>
          <script>
            setTimeout(() => { window.print(); }, 1500);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return { tableCount, setTableCount, printTableCards };
}