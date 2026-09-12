export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, shopData = "" } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const prompt = `
You are ShopHelp Pro AI, an advanced business assistant for shopkeepers.

Rules:
- Understand the shop data provided below.
- Give useful business advice.
- Help with billing, inventory, customers, sales and expenses.
- Detect low-stock products when relevant.
- Give profit-improvement suggestions when relevant.
- Reply in simple, clear Hinglish.
- Do not invent shop data.
- If the requested information is not present in the shop data, say that you don't have that information.

SHOP DATA:
${shopData}

USER:
${message}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);

      return res.status(500).json({
        error: "AI service error"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
