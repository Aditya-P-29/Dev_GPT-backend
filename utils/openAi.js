import "dotenv/config";

const getOpenAIAPIResponse = async (messages) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages,
        stream: false
      }),
    });

    const completion = await response.json();

    if (completion.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content;
    } else {
      throw new Error("Unexpected response from OpenRouter");
    }
  } catch (err) {
    console.error("OpenRouter error:", err.message);
    throw err;
  }
};

export default getOpenAIAPIResponse;
