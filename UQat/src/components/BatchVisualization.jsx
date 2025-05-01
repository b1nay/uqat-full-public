import React, { useState, useEffect, useRef } from "react";
import {
  HiDocumentDownload,
  HiChartBar,
  HiEye,
  HiEyeOff,
  HiInformationCircle,
  HiCheckCircle,
  HiXCircle,
  HiUpload,
} from "react-icons/hi";
import {
  FiFileText,
  FiFilter,
  FiSearch,
  FiBarChart2,
  FiAlertTriangle,
  FiPlus,
} from "react-icons/fi";
import { TbBrandOpenai } from "react-icons/tb";
import Papa, { ParseError } from "papaparse";
// import { error } from "console";
// interface CsvRow {
//   id: string;
//   question: string;
//   ai_response: string;
//   confidence: number;
//   [key: string]: string | number | null;
// }
// interface ParseResult<T> {
//   data: T[];
//   errors: { message: string }[];
//   meta: { delimiter: string; linebreak: string };
// }
const BatchVisualization = () => {
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIResponses, setShowAIResponses] = useState(true);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [summaryStats, setSummaryStats] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [directUploadModalOpen, setDirectUploadModalOpen] = useState(false);
  const [localCsvFile, setLocalCsvFile] = useState(null);
  // const fileInputRef = useRef(null);
  const [localFileName, setLocalFileName] = useState("");
  const [localFileError, setLocalFileError] = useState("");
  // const [fileData, setFileData] = useState<CsvRow[]>([]);
  const fileInputRef = (useRef < HTMLInputElement) | (null > null);
  // Fetch the list of processed files
  useEffect(() => {
    fetchProcessedFiles();
  }, []);

  const fetchProcessedFiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/processed-files");
      if (response.ok) {
        const data = await response.json();
        setProcessedFiles(data.files);
      } else {
        console.error("Failed to fetch processed files");
      }
    } catch (error) {
      console.error("Error fetching processed files:", error);
    }
  };

  // Load CSV data when a file is selected
  const loadFileData = async (filename) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/download/${filename}`
      );
      if (response.ok) {
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data.filter(
              (row) => Object.keys(row).length > 1
            );
            setFileData(data);
            calculateSummaryStats(data);
            setLoading(false);
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            setLoading(false);
          },
        });
      } else {
        console.error("Failed to download file");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      setLoading(false);
    }
  };

  // const loadFileData = async (filename: string): Promise<void> => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8000/api/download/${filename}`
  //     );
  //     if (response.ok) {
  //       const csvText = await response.text();
  //       Papa.parse<CsvRow>(csvText, {
  //         header: true,
  //         complete: (results: ParseResult<CsvRow>) => {
  //           const data = results.data.filter(
  //             (row) => Object.keys(row).length > 1
  //           );
  //           setFileData(data); // Ensure setFileData expects CsvRow[]
  //           calculateSummaryStats(data); // Ensure this function expects CsvRow[]
  //           setLoading(false);
  //         },
  //         error: (error) => {
  //           console.error("CSV parsing error:", error);
  //           setLoading(false);
  //         },
  //       });
  //     } else {
  //       console.error("Failed to download file");
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Error downloading file:", error);
  //     setLoading(false);
  //   }
  // // };
  // const loadFileData = async (filename: string): Promise<void> => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8000/api/download/${filename}`
  //     );
  //     if (response.ok) {
  //       const csvText = await response.text();
  //       Papa.parse<CsvRow>(csvText, {
  //         header: true,
  //         complete: (results: ParseResult<CsvRow>) => {
  //           // Explicitly type results.data as CsvRow[]
  //           const data: CsvRow[] = results.data.filter(
  //             (row: CsvRow) => Object.keys(row).length > 1
  //           );

  //           // Ensure setFileData expects CsvRow[]
  //           setFileData(data);

  //           // Ensure calculateSummaryStats expects CsvRow[]
  //           calculateSummaryStats(data);

  //           setLoading(false);
  //         },
  //         // error: (error) => {
  //         //   console.error("CSV parsing error:", error);
  //         //   setLoading(false);
  //         },
  //       // });
  //         else {
  //       console.error("Failed to download file");
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Error downloading file:", error);
  //     setLoading(false);
  //   }
  // };
  // Direct CSV visualization functions
  // const openLocalFileSelector = () => {
  //   fileInputRef.current.click();
  // };

  const openLocalFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Only call click() if fileInputRef.current is non-null
    }
  };

  const handleLocalFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalCsvFile(file);
      setLocalFileName(file.name);
      setLocalFileError("");
    }
  };

  const processLocalCsvFile = () => {
    if (!localCsvFile) {
      setLocalFileError("Please select a CSV file");
      return;
    }

    setLoading(true);

    // Read the file using FileReader
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target?.result;

      // Parse the CSV
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          // Validate the CSV has the expected columns
          const requiredColumns = [
            "Question",
            "Answer",
            "Confidence",
            "Source",
            "Justification",
            "Top_Chunk",
            "Response_LLM",
          ];

          const missingColumns = requiredColumns.filter(
            (col) => !results.meta.fields?.includes(col)
          );

          if (missingColumns.length > 0) {
            setLocalFileError(
              `CSV is missing required columns: ${missingColumns.join(", ")}`
            );
            setLoading(false);
            return;
          }

          // Filter out empty rows
          const data = results.data.filter(
            (row) => row.Question && Object.keys(row).length > 1
          );

          if (data.length === 0) {
            setLocalFileError("CSV file does not contain any valid data");
            setLoading(false);
            return;
          }

          // Success - set the data and stats
          setFileData(data);
          calculateSummaryStats(data);
          setSelectedFile(localFileName);
          setDirectUploadModalOpen(false);
          setLoading(false);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          setLocalFileError(`Error parsing CSV: ${error.message}`);
          setLoading(false);
        },
      });
    };

    reader.onerror = (error) => {
      setLocalFileError(`Error reading file: ${error}`);
      setLoading(false);
    };

    reader.readAsText(localCsvFile);
  };

  // Calculate summary statistics from the data
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return;

    const totalQuestions = data.length;
    let highConfidence = 0;
    let mediumConfidence = 0;
    let lowConfidence = 0;
    let sumConfidence = 0;

    data.forEach((row) => {
      const confidence = parseFloat(row.Confidence);
      sumConfidence += confidence;

      if (confidence >= 0.75) highConfidence++;
      else if (confidence >= 0.5) mediumConfidence++;
      else lowConfidence++;
    });

    const avgConfidence = sumConfidence / totalQuestions;

    // Count sources
    const sources = {};
    data.forEach((row) => {
      const source = row.Source || "Unknown";
      sources[source] = (sources[source] || 0) + 1;
    });

    setSummaryStats({
      totalQuestions,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      avgConfidence,
      sources,
    });
  };

  // Handle file selection
  const handleFileSelect = (filename) => {
    setSelectedFile(filename);
    loadFileData(filename);
    setExpandedRows({});
  };

  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter data based on search query and confidence filter
  const filteredData = fileData.filter((row) => {
    const matchesSearch =
      row.Question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.Answer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConfidence =
      parseFloat(row.Confidence || 0) >= confidenceFilter;
    return matchesSearch && matchesConfidence;
  });

  // Get pretty file name for display
  const getPrettyFileName = (filename) => {
    return filename
      .replace("filled_", "")
      .replace("llm_", "")
      .replace(/\.csv$/, "");
  };

  // Render confidence indicator
  const ConfidenceIndicator = ({ value }) => {
    const confidence = parseFloat(value);
    let color, icon;

    if (confidence >= 0.75) {
      color = "text-green-500";
      icon = <HiCheckCircle className="text-lg" />;
    } else if (confidence >= 0.5) {
      color = "text-yellow-500";
      icon = <FiAlertTriangle className="text-lg" />;
    } else {
      color = "text-red-500";
      icon = <HiXCircle className="text-lg" />;
    }

    return (
      <div className="flex items-center gap-1">
        {icon}
        <span className={`font-medium ${color}`}>
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 mb-8">
      {/* File selection section with Direct Visualization button */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FiBarChart2 className="text-main" />
            Batch Results Visualization
          </h2>

          {/* Direct Visualization button */}
          <button
            onClick={() => setDirectUploadModalOpen(true)}
            className="bg-main text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FiFileText className="text-lg" />
            Visualize Local CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {processedFiles.length === 0 && !selectedFile ? (
            <div className="col-span-3 p-6 border border-dashed border-gray-300 rounded-lg text-center">
              <FiFileText className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">
                No processed files found on server
              </p>
              <button
                onClick={() => setDirectUploadModalOpen(true)}
                className="text-main hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
              >
                <FiPlus /> Visualize a local CSV file
              </button>
            </div>
          ) : (
            <>
              {/* Add a card for local file if one is loaded */}
              {selectedFile && !processedFiles.includes(selectedFile) && (
                <div className="p-3 border rounded-lg cursor-pointer flex items-center gap-2 bg-blue-50 border-main">
                  <FiFileText className="text-main" />
                  <div className="flex-1 truncate">
                    {getPrettyFileName(selectedFile)} (Local)
                  </div>
                  <HiChartBar className="text-main" />
                </div>
              )}

              {/* Show server files */}
              {processedFiles.map((filename, index) => (
                <div
                  key={index}
                  onClick={() => handleFileSelect(filename)}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    selectedFile === filename
                      ? "border-main bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <FiFileText
                    className={
                      selectedFile === filename ? "text-main" : "text-gray-400"
                    }
                  />
                  <div className="flex-1 truncate">
                    {getPrettyFileName(filename)}
                  </div>
                  <HiChartBar
                    className={`${
                      selectedFile === filename ? "text-main" : "text-gray-400"
                    } hover:text-main`}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Direct CSV Upload Modal */}
      {directUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiFileText className="text-main" />
              Visualize Local CSV File
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              {localCsvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FiFileText className="text-blue-500 text-2xl" />
                  <span className="font-medium text-gray-800">
                    {localCsvFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLocalCsvFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <HiXCircle />
                  </button>
                </div>
              ) : (
                <>
                  <FiFileText className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Select a CSV file with the required columns:
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    Question, Answer, Confidence, Source, Justification,
                    Top_Chunk, Response_LLM
                  </p>
                  <button
                    onClick={openLocalFileSelector}
                    className="mt-2 text-blue-500 hover:text-blue-600 cursor-pointer"
                  >
                    Browse files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleLocalFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {localFileError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2">
                <FiAlertTriangle />
                {localFileError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDirectUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processLocalCsvFile}
                disabled={!localCsvFile || loading}
                className="px-4 py-2 bg-main text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <HiChartBar />
                    Visualize
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualization area */}
      {selectedFile ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Controls */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">
                  {getPrettyFileName(selectedFile)}
                  {!processedFiles.includes(selectedFile) && (
                    <span className="text-blue-500 ml-2">(Local File)</span>
                  )}
                </h3>
                <div className="flex gap-3">
                  {processedFiles.includes(selectedFile) && (
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:8000/api/download/${selectedFile}`,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <HiDocumentDownload />
                      Download CSV
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search questions or answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-main focus:border-main"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Min Confidence:
                  </span>
                  <select
                    value={confidenceFilter}
                    onChange={(e) =>
                      setConfidenceFilter(parseFloat(e.target.value))
                    }
                    className="border border-gray-300 rounded-md p-2 focus:ring-main focus:border-main"
                  >
                    <option value={0}>All</option>
                    <option value={0.25}>25%+</option>
                    <option value={0.5}>50%+</option>
                    <option value={0.75}>75%+</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAIResponses(!showAIResponses)}
                  className={`flex items-center gap-1 py-2 px-3 border rounded-md ${
                    showAIResponses
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {showAIResponses ? (
                    <HiEye className="text-main" />
                  ) : (
                    <HiEyeOff className="text-gray-500" />
                  )}
                  <span className="text-sm">AI Responses</span>
                </button>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          {summaryStats && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm mb-1">
                    Total Questions
                  </div>
                  <div className="text-2xl font-bold">
                    {summaryStats.totalQuestions}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm mb-1">
                    Avg Confidence
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(summaryStats.avgConfidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm mb-1">
                    High Confidence
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {summaryStats.highConfidence}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">
                      (
                      {Math.round(
                        (summaryStats.highConfidence /
                          summaryStats.totalQuestions) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm mb-1">
                    Medium Confidence
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-yellow-500">
                      {summaryStats.mediumConfidence}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">
                      (
                      {Math.round(
                        (summaryStats.mediumConfidence /
                          summaryStats.totalQuestions) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm mb-1">
                    Low Confidence
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-red-500">
                      {summaryStats.lowConfidence}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">
                      (
                      {Math.round(
                        (summaryStats.lowConfidence /
                          summaryStats.totalQuestions) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results table */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-main border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Loading batch results...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Question
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                    >
                      Confidence
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <FiSearch className="mx-auto text-gray-300 text-3xl mb-2" />
                        No results found for your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={
                            expandedRows[index]
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {row.Question}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {row.Answer?.length > 150
                                ? `${row.Answer.substring(0, 150)}...`
                                : row.Answer}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {row.Source?.split(":")[0]}
                            </div>
                            <div className="text-sm text-gray-500">
                              {row.Source?.split(":")[1]}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <ConfidenceIndicator value={row.Confidence} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleRowExpansion(index)}
                              className={`p-1.5 rounded-full transition-colors ${
                                expandedRows[index]
                                  ? "bg-blue-100 text-blue-600"
                                  : "hover:bg-gray-100 text-gray-500"
                              }`}
                            >
                              {expandedRows[index] ? (
                                <HiEyeOff className="text-lg" />
                              ) : (
                                <HiEye className="text-lg" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows[index] && (
                          <tr className="bg-blue-50">
                            <td colSpan="4" className="px-6 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg border border-blue-200 p-4">
                                  <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                                    <HiInformationCircle className="text-blue-500" />
                                    Source Context
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line p-3 bg-gray-50 rounded border border-gray-200">
                                    {row.Top_Chunk || "No context available"}
                                  </div>
                                  <div className="mt-3 text-sm text-gray-500">
                                    {row.Justification}
                                  </div>
                                </div>

                                {showAIResponses && row.Response_LLM && (
                                  <div className="bg-white rounded-lg border border-green-200 p-4">
                                    <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                                      <TbBrandOpenai className="text-green-600" />
                                      AI Enhanced Response
                                    </div>
                                    <div className="text-sm text-gray-700 whitespace-pre-line p-3 bg-gray-50 rounded border border-gray-200">
                                      {row.Response_LLM}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination or "Showing X of Y results" indicator */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredData.length} of {fileData.length} results
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FiBarChart2 className="mx-auto text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Select a batch file to visualize
          </h3>
          <p className="text-gray-600 mb-6">
            Choose one of the processed questionnaires above or visualize a
            local CSV
          </p>
          <button
            onClick={() => setDirectUploadModalOpen(true)}
            className="inline-flex items-center gap-2 bg-main text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiFileText />
            Visualize Local CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchVisualization;
