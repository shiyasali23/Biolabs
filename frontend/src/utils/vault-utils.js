// src/utils/vault-utils.js

export const extractTextFromImage = async (imageFile) => {
  // OCR is loaded only when an image is attached.
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(imageFile);
    await worker.terminate();
    return text;
  } catch (error) {
    await worker.terminate();
    console.error("OCR Error:", error);
    throw error;
  }
};
