// Small browser helpers shared by the PDF generators in this folder.

// Loads an image (e.g. the company logo) as a PNG data URL with a faint
// "B.A.D.E" watermark along the bottom, ready for doc.addImage().
export const loadImageAsDataURL = (src, watermarkText = "B.A.D.E") =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);
      ctx.font = "italic bold 16px 'Courier New'";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.globalAlpha = 0.5;
      ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Image loading failed"));
    img.src = src;
  });

// Opens the PDF in a new tab and starts printing once it has loaded. If the
// browser blocks the new tab, the PDF is downloaded as `fileName` instead.
// `onOpen` runs once the tab has loaded (or right after the download).
export const openPdfForPrint = (doc, fileName, onOpen) => {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");

  if (win) {
    win.onload = () => {
      onOpen?.();

      setTimeout(() => {
        win.print();
      }, 300);
    };
  } else {
    doc.save(fileName);

    onOpen?.();
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
};
