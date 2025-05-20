const INTELLIGENCE_API_URL = 'https://intelligence.biolabsltd.com';

export const inference = async (inputData) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  token = localStorage.getItem("token");
  if (token) {
    inputData.append("token", token);
  }

  try {
    const response = await fetch(`${INTELLIGENCE_API_URL}/inference`, {
      method: "POST",
      body: JSON.stringify({ data: inputData }),
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.response || null;
  } catch (error) {
    console.error("Error fetching food nutrients:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};