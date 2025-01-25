import axios from "axios";

const MAX_RETRIES = 2;

async function callOpenAI(prompt, retryCount = 0) {
  console.log(
    `[OpenAI API] Calling API with prompt length: ${prompt.length} characters`
  );
  try {
    console.log(`[OpenAI API] Attempt ${retryCount + 1} started`);
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(
      `[OpenAI API] Success - Response received with ${response.data.choices[0].message.content.length} characters`
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      `[OpenAI API] Attempt ${retryCount + 1} failed:`,
      error.message
    );
    if (retryCount < MAX_RETRIES) {
      console.log(
        `[OpenAI API] Initiating retry ${retryCount + 2}/${MAX_RETRIES + 1}`
      );
      return callOpenAI(prompt, retryCount + 1);
    }
    console.error("[OpenAI API] All retry attempts exhausted");
    return "error";
  }
}

export async function processCSV(data, prompt, onProgress) {
  console.log(`[CSV Processor] Starting processing of ${data.length} rows`);
  const processedData = [];
  const totalRows = data.length;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    console.log(`[CSV Processor] Processing row ${i + 1}/${totalRows}`);
    console.log(`[CSV Processor] Row data:`, JSON.stringify(row));

    const processedPrompt = Object.keys(row).reduce((acc, key) => {
      return acc.replace(new RegExp(`{{${key.toLowerCase()}}}`, "g"), row[key]);
    }, prompt);
    console.log(
      `[CSV Processor] Processed prompt for row ${i + 1}:`,
      processedPrompt
    );

    const result = await callOpenAI(processedPrompt);
    console.log(
      `[CSV Processor] Result received for row ${i + 1}:`,
      result.substring(0, 100) + "..."
    );
    processedData.push({ ...row, result });

    if (onProgress) {
      const progressPercent = ((i + 1) / totalRows) * 100;
      console.log(`[CSV Processor] Progress: ${progressPercent.toFixed(2)}%`);
      onProgress(progressPercent);
    }
  }

  console.log(
    `[CSV Processor] Processing complete. Total rows processed: ${processedData.length}`
  );
  return processedData;
}
