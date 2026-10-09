// Local validation only: choosing a PDF starts the existing sample workspace.
export async function validateSamplePdf(file) {
  if (!/\.pdf$/i.test(file.name)) throw new Error("Choose a PDF file.");
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Choose a PDF smaller than 10 MB.");
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== "%PDF-") throw new Error("This file is not a valid PDF. Choose another file.");
}
