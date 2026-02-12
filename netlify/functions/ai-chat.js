const SYSTEM_PROMPT = [
  "You are a bilingual (Indonesian + English) assistant for Joestar Peptide.",
  "Provide general, non-medical, research-oriented information only.",
  "Do NOT provide medical advice, dosing, usage instructions, diagnosis, or treatment.",
  "If asked for medical guidance, refuse briefly and suggest consulting a qualified professional.",
  "Keep answers concise, helpful, and polite.",
  "Format: Indonesian first, then a short English summary.",
].join(" ");

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  const cleaned = messages
    .filter((item) => item && typeof item.content === "string")
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));
  return [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned];
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      console.error("Cloudflare env is missing");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing Cloudflare credentials" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const messages = normalizeMessages(body.messages);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 400,
          temperature: 0.4,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok || data?.success === false) {
      console.error("Cloudflare error", response.status, data);
      return {
        statusCode: response.status || 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data?.errors?.[0]?.message || "Cloudflare request failed",
          detail: data,
        }),
      };
    }

    const reply =
      data?.result?.response ||
      data?.result?.message ||
      "Maaf, terjadi kendala. Coba lagi.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("AI chat server error", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
