import { render } from "@react-email/render";

/**
 * Send a transactional email via Brevo.
 * Requires BREVO_API_KEY and a verified BREVO_SENDER_EMAIL in .env
 */
export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Finance App";

  if (!apiKey) {
    console.error("Missing BREVO_API_KEY");
    return { success: false, error: "Missing BREVO_API_KEY" };
  }

  if (!senderEmail) {
    console.error("Missing BREVO_SENDER_EMAIL");
    return { success: false, error: "Missing BREVO_SENDER_EMAIL" };
  }

  try {
    const htmlContent = await render(react);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: Array.isArray(to) ? to[0] : to }],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Brevo send failed:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
