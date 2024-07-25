import axios from "axios";

export async function processCSV(data, prompt) {
  const processedData = [];

  for (const row of data) {
    const processedPrompt = Object.keys(row).reduce((acc, key) => {
      return acc.replace(new RegExp(`{{${key.toLowerCase()}}}`, "g"), row[key]);
    }, prompt);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: processedPrompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = response.data.choices[0].message.content;
      processedData.push({ ...row, result });
    } catch (error) {
      console.error(
        "Error calling OpenAI API:",
        error.response?.data || error.message
      );
      throw new Error(
        "Failed to process row: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  }

  return processedData;
}
