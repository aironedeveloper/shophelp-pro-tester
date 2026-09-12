export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, mimeType, prompt } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: "Image is missing"
      });
    }

    const type = mimeType || "image/jpeg";

    if (!type.startsWith("image/")) {
      return res.status(400).json({
        error: "Invalid image type"
      });
    }

    const imageData = `data:${type};base64,${image}`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    prompt ||
                    "Explain this image in simple Hinglish. Identify important details clearly."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          temperature: 0.5,
          max_completion_tokens: 1000
        })
      }
    );

    const data = await groqResponse.json();

    console.log("GROQ VISION RESPONSE:", data);

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error:
          data?.error?.message ||
          "Groq vision request failed"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "Groq returned no answer"
      });
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("VISION ERROR:", error);

    return res.status(500).json({
      error: error.message || "Vision server error"
    });
  }
}
