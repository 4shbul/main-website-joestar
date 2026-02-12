const buildPrompt = () =>
  [
    "You are a bilingual (Indonesian + English) assistant for Joestar Peptide.",
    "Provide general, non-medical, research-oriented information only.",
    "Do NOT provide medical advice, dosing, usage instructions, diagnosis, or treatment.",
    "If asked for medical guidance, refuse briefly and suggest consulting a qualified professional.",
    "Keep answers concise, helpful, and polite.",
    "Format: Indonesian first, then a short English summary.",
  ].join(" ");

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((item) => item && typeof item.content === "string")
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: [{ type: "text", text: item.content }],
    }));
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
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const messages = normalizeMessages(body.messages);

    const inputMessages = messages.length
      ? messages
      : [{ role: "user", content: [{ type: "text", text: "Hi" }] }];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: buildPrompt(),
        input: inputMessages,
        temperature: 0.4,
        max_output_tokens: 400,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error", response.status, data);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data?.error?.message || "OpenAI request failed",
          detail: data?.error || data,
        }),
      };
    }

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.map((item) => item.text).join("") ||
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
