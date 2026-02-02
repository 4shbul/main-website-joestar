const sendWhatsAppOtp = async (phone, code) => {
  if (!process.env.WHATSAPP_WEBHOOK_URL) {
    console.log(`[OTP] WhatsApp to ${phone}: ${code}`);
    return;
  }

  const response = await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message: `Kode OTP Joestar: ${code}` }),
  });

  if (!response.ok) {
    throw new Error("Gagal mengirim OTP WhatsApp.");
  }
};

module.exports = { sendWhatsAppOtp };
