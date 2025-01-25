import { processCSV } from "../../utils/csvProcessor";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("[API Route] Received CSV processing request");
  try {
    const { data, prompt } = await request.json();
    console.log(
      `[API Route] Parsed request data: ${data.length} rows, prompt length: ${prompt.length}`
    );

    const processedData = await processCSV(data, prompt, (progress) => {
      console.log(`[API Route] Processing progress: ${progress.toFixed(2)}%`);
    });

    console.log("[API Route] Processing completed successfully");
    return NextResponse.json(processedData);
  } catch (error) {
    console.error("[API Route] Error processing CSV:", error);
    console.error("[API Route] Stack trace:", error.stack);
    return NextResponse.json(
      { error: "Error processing CSV: " + error.message },
      { status: 500 }
    );
  }
}
