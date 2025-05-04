// src/utils/vault-utils.js

import { createWorker } from "tesseract.js";

export const extractTextFromImage = async (imageFile) => {
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
