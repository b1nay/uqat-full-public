"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HiUpload,
  HiDocumentDownload,
  HiCheck,
  HiX,
  HiChartBar,
} from "react-icons/hi";
import {
  FiFileText,
  FiAlertCircle,
  FiHelpCircle,
  FiBarChart2,
} from "react-icons/fi";
import BatchVisualization from "../../components/BatchVisualization"; // Import the new component

type ProcessedFile = {
  filename: string;
  date: string; // Not from API, but we'll extract from filename if possible
};

const BatchPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [useLLM, setUseLLM] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    filename?: string;
    questionCount?: number;
  } | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState("");
  const [showVisualization, setShowVisualization] = useState(false);
  const router = useRouter();

  // Fetch processed files on mount
  useEffect(() => {
    fetchProcessedFiles();
  }, []);

  const fetchProcessedFiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/processed-files");
      if (!response.ok) {
        throw new Error("Failed to fetch processed files");
      }
      const data = await response.json();

      // Parse filenames to extract dates if possible (from format like filled_xyz_YYYY-MM-DD.csv)
      const files: ProcessedFile[] = data.files.map((filename: string) => {
        let date = "Unknown date";
        const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          date = dateMatch[1];
        } else {
          // Use file creation date from filename pattern if available
          const parts = filename.split("_");
          if (parts.length >= 3) {
            date = parts[parts.length - 1].replace(".csv", "");
          }
        }

        return {
          filename,
          date,
        };
      });

      setProcessedFiles(files);
    } catch (err) {
      console.error("Error fetching processed files:", err);
      setError("Failed to load previously processed questionnaires");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");
    setUploadResult(null);

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("use_llm", useLLM.toString());

    try {
      // Simulate progress - actual progress can't be tracked with fetch API easily
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // Stop at 90% - the last 10% will be set when the response comes in
          return prev < 90 ? prev + 10 : prev;
        });
      }, 500);

      const response = await fetch(
        "http://localhost:8000/api/upload-questionnaire",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      setUploadResult({
        success: true,
        message: result.message,
        filename: result.filename,
        questionCount: result.question_count,
      });

      // Refresh the list of processed files
      fetchProcessedFiles();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadResult({
        success: false,
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`http://localhost:8000/api/download/${filename}`, "_blank");
  };

  // Toggle between upload form and visualization
  const toggleVisualization = () => {
    setShowVisualization(!showVisualization);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mb-16">
      <span className="w-full flex gap-4 items-center justify-center mb-6">
        <Image
          src="/askyeti.svg"
          alt="logo"
          width={150}
          height={150}
          className=""
        />
      </span>

      {/* Toggle buttons for switching between upload and visualization */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setShowVisualization(false)}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              !showVisualization
                ? "bg-main text-white border-main"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <HiUpload />
              Process Files
            </div>
          </button>
          <button
            type="button"
            onClick={() => setShowVisualization(true)}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              showVisualization
                ? "bg-main text-white border-main"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <FiBarChart2 />
              Visualize Results
            </div>
          </button>
        </div>
      </div>

      {!showVisualization ? (
        // Upload form section
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Upload Questionnaire</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiFileText className="text-blue-500 text-2xl" />
                    <span className="font-medium text-gray-800">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HiX />
                    </button>
                  </div>
                ) : (
                  <>
                    <HiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Drag & drop a CSV/Excel file or
                    </p>
                    <label className="mt-2 inline-block cursor-pointer text-blue-500 hover:text-blue-600">
                      Browse files
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="use-llm"
                  checked={useLLM}
                  onChange={(e) => setUseLLM(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="use-llm"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Use AI to enhance answers (recommended)
                </label>
                <div className="ml-1 text-gray-400 cursor-pointer group relative">
                  <FiHelpCircle />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48 hidden group-hover:block">
                    When enabled, an AI model will generate more comprehensive
                    responses based on the retrieved information.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full cursor-pointer py-2 px-4 bg-main text-white rounded-md hover:bg-main/80 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <HiUpload />
                    Process Questionnaire
                  </>
                )}
              </button>
            </form>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Processing questionnaire... {uploadProgress}%
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2">
                <FiAlertCircle />
                {error}
              </div>
            )}

            {uploadResult && (
              <div
                className={`mt-4 ${
                  uploadResult.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                } p-4 rounded-md`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {uploadResult.success ? (
                    <HiCheck className="text-xl" />
                  ) : (
                    <FiAlertCircle className="text-xl" />
                  )}
                  <span className="font-medium">
                    {uploadResult.success ? "Success!" : "Error!"}
                  </span>
                </div>
                <p>{uploadResult.message}</p>
                {uploadResult.success && uploadResult.filename && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    {/* <button
                      onClick={() => handleDownload(uploadResult.filename)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    > */}
                    <button
                      onClick={() =>
                        uploadResult.filename &&
                        handleDownload(uploadResult.filename)
                      }
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <HiDocumentDownload className="text-lg" />
                      Download Results
                    </button>
                    <button
                      onClick={() => {
                        setShowVisualization(true);
                      }}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800"
                    >
                      <HiChartBar className="text-lg" />
                      Visualize Results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Previous Processing Results */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              Previously Processed Questionnaires
            </h2>

            {processedFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiFileText className="text-5xl mx-auto mb-3 opacity-30" />
                <p>No processed questionnaires found</p>
                <p className="text-sm mt-2">
                  Upload a CSV or Excel file to see results here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {processedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {file.filename
                          .replace("filled_", "")
                          .replace(/\.csv$/, "")}
                      </p>
                      <p className="text-sm text-gray-500">{file.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(file.filename)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <HiDocumentDownload className="text-lg" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowVisualization(true);
                        }}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      >
                        <HiChartBar className="text-lg" />
                        <span className="hidden sm:inline">Visualize</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push("/chat")}
                className="w-full py-2 px-4 bg-transparent text-main border cursor-pointer rounded-md hover:bg-main hover:text-white transition-all"
              >
                Switch to Chat Mode
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Visualization section - when showVisualization is true
        <BatchVisualization />
      )}
    </div>
  );
};

export default BatchPage;
