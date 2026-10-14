// OCR is loaded only when an image is attached; the worker is always released.
export const extractTextFromImage = async (imageFile) => {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    return (await worker.recognize(imageFile)).data.text;
  } finally {
    await worker.terminate();
  }
};
