"use client";

import { useState } from "react";
import Papa from "papaparse";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

export default function CSVUploader({ onProcessed, onError }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError("");
    if (file) {
      if (file.type !== "text/csv") {
        setError("Please upload a CSV file.");
        return;
      }
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          if (results.data.length < 2) {
            setError(
              "The CSV file must contain at least two rows (header and one data row)."
            );
            return;
          }
          setParsedData(results.data);
          setIsProcessingComplete(false);
          setProcessedCount(0);
        },
        header: true,
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      setError("Please select a file to upload.");
    }
  };

  const processCSV = async (dataToProcess) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt before processing.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/process-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataToProcess, prompt })
      });

      if (!response.ok) {
        throw new Error("Failed to process CSV");
      }

      const processedData = await response.json();
      onProcessed(processedData);
      setProcessedCount((prevCount) => prevCount + processedData.length);

      if (dataToProcess.length > 1) {
        setIsProcessingComplete(true);
      }
    } catch (error) {
      setError(error.message);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessFirstRow = () => {
    if (!parsedData || parsedData.length < 2) {
      setError("No data to process. Please upload a valid CSV file.");
      return;
    }
    processCSV([parsedData[1]]);
  };

  const handleProcessEntireList = () => {
    if (!parsedData || parsedData.length < 2) {
      setError("No data to process. Please upload a valid CSV file.");
      return;
    }
    processCSV(parsedData.slice(1));
  };

  return (
    <div className="space-y-4">
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">CSV file up to 10MB</p>
        </div>
      </div>
      {fileName && (
        <p className="text-sm text-gray-600">Selected file: {fileName}</p>
      )}
      <textarea
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
        rows="3"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt (e.g., 'Combine {{firstname}} and {{lastname}}')"
        disabled={isLoading}
      />
      {error && (
        <div className="text-red-600 font-semibold">Error: {error}</div>
      )}
      {!isProcessingComplete && (
        <div className="flex space-x-4">
          <button
            onClick={handleProcessFirstRow}
            disabled={isLoading || !parsedData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Process First Row (for testing)
          </button>
          <button
            onClick={handleProcessEntireList}
            disabled={isLoading || !parsedData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Process Entire List
          </button>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-indigo-500">Processing...</span>
        </div>
      )}
      {isProcessingComplete && (
        <div className="text-green-600 font-semibold">
          Processing complete for {processedCount} contacts.
        </div>
      )}
    </div>
  );
}
