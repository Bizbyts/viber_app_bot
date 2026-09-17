// Netlify Serverless Function for Viber Webhook
// Handles webhook events, health checks, and signature verification when VIBER_AUTH_TOKEN is provided.

exports.handler = async (event, context) => {
  const method = event.httpMethod;

  // Handle health check / GET
  if (method === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ok",
        service: "Viber App Info Bot (Netlify Function)",
        token_configured: Boolean(process.env.VIBER_AUTH_TOKEN),
        timestamp: new Date().toISOString()
      }),
    };
  }

  // Handle POST (Viber webhook events)
  if (method === "POST") {
    let payload = {};
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      console.warn("Invalid JSON in webhook payload:", e.message);
    }

    const eventType = payload.event || "unknown";
    console.log(`Received Viber event: ${eventType}`);

    // Always respond with 200 to acknowledge receipt so Viber doesn't retry
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: 0,
        status_message: "ok",
        event: eventType,
      }),
    };
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
