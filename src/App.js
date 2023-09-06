import React, { useState } from "react";
import * as ss from "simple-statistics"; // Import the simple-statistics library
import * as jStat from "jstat"; // Import the jStat library
import * as XLSX from "xlsx";

function App() {
  const [file, setFile] = useState();
  const [array, setArray] = useState([]);
  const [error, setError] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [secondSelectedColumn, setSecondSelectedColumn] = useState("");
  const [mean, setMean] = useState(null);
  const [stdDev, setStdDev] = useState(null);
  const [stdError, setStdError] = useState(null);
  const [cv, setCV] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [pValue, setPValue] = useState(null);
  const [fValue, setFValue] = useState(null);

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      // Convert the CSV string to an array
      csvFileToArray(csv);
    };
    reader.readAsBinaryString(file);
  };

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const newArray = csvRows.map((i, index) => {
      const values = i.split(",");
      const obj = csvHeader.reduce(
        (object, header, index) => {
          object[header] = values[index];
          return object;
        },
        { id: index + 1 }
      );
      return obj;
    });

    setArray(newArray);
  };

  const calculateMean = (column) => {
    const values = array
      .map((item) => parseFloat(item[column]))
      .filter((value) => !isNaN(value));
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };

  const calculateStdDev = (column) => {
    const values = array
      .map((item) => parseFloat(item[column]))
      .filter((value) => !isNaN(value));
    return ss.standardDeviation(values);
  };

  const calculateStdError = (column) => {
    const values = array
      .map((item) => parseFloat(item[column]))
      .filter((value) => !isNaN(value));
    const stdDeviation = ss.standardDeviation(values);
    const sampleSize = values.length;

    if (sampleSize > 1) {
      const standardError = stdDeviation / Math.sqrt(sampleSize);
      return standardError;
    } else {
      return null;
    }
  };

  const calculateCV = (column) => {

    const meanValue = calculateMean(column);
    const stdDeviation = calculateStdDev(column);

    if (meanValue !== 0) {
      const cvValue = (stdDeviation / meanValue) * 100;
      return cvValue;
    } else {
      return null;
    }
  };

  const calculateCorrelation = (column1, column2) => {
    const values1 = array
      .map((item) => parseFloat(item[column1]))
      .filter((value) => !isNaN(value));

    const values2 = array
      .map((item) => parseFloat(item[column2]))
      .filter((value) => !isNaN(value));

    if (values1.length !== values2.length || values1.length < 2) {
      return null;
    }

    return ss.sampleCorrelation(values1, values2);
  };

  const calculatePValue = (correlation, sampleSize) => {
    if (sampleSize < 3) {
      return null;
    }

    const tStat =
      (correlation * Math.sqrt(sampleSize - 2)) /
      Math.sqrt(1 - correlation ** 2);
    const degreesOfFreedom = sampleSize - 2;
    const pValue =
      2 * (1 - jStat.studentt.cdf(Math.abs(tStat), degreesOfFreedom));
    return pValue;
  };

  const calculateFValue = (column1, column2) => {
    const values1 = array
      .map((item) => parseFloat(item[column1]))
      .filter((value) => !isNaN(value));

    const values2 = array
      .map((item) => parseFloat(item[column2]))
      .filter((value) => !isNaN(value));

    if (values1.length < 2 || values2.length < 2) {
      return null;
    }

    const variance1 = ss.variance(values1);
    const variance2 = ss.variance(values2);

    const fValue = variance1 / variance2;

    return fValue;
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      // Check the file type and handle accordingly
      setSelectedColumn("");
      setSecondSelectedColumn("");
      setMean(null);
      setStdDev(null);
      setStdError(null);
      setCV(null);
      setCorrelation(null);
      setPValue(null);
      setFValue(null);

      if (file.name.endsWith(".csv")) {
        const fileReader = new FileReader();
        fileReader.onload = function (event) {
          const text = event.target.result;
          csvFileToArray(text);
        };
        fileReader.readAsText(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        readFile(file);
      } else {
        setError(
          "Unsupported file format. Please select a .csv, .xlsx, or .xls file."
        );
      }
    } else {
      setError("Please select a file.");
    }
  };

  const headerKeys = Object.keys(array.length > 0 ? array[0] : {});

  const datePattern = /^(\d{1,2}[-/]\d{1,2}[-/]\d{4})$/; // Updated pattern

  const selectableColumns = headerKeys.filter((key) =>
    array.some((item) => {
      const value = item[key];
      return (
        !isNaN(parseFloat(value)) && value !== "" && !datePattern.test(value)
      );
    })
  );

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center text-3xl font-bold mb-14 ">
        QCS STATISTICS DASHBOARD
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div>
          <form className="mt-9">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv,.xlsx,.xls"
              onChange={handleOnChange}
              className="border p-2"
            />
            <button
              className="bg-blue-500 text-white py-2 px-3 ml-2 mt-2 rounded hover:bg-blue-700"
              onClick={(e) => {
                handleOnSubmit(e);
              }}
            >
              IMPORT FILE
            </button>
          </form>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="mt-5">
          <label
            htmlFor="columnSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select a Column for Analysis:
          </label>
          <select
            id="columnSelect"
            name="columnSelect"
            className="mt-1 p-2 border rounded-md w-full"
            onChange={(e) => {
              setSelectedColumn(e.target.value);
              if (e.target.value) {
                const columnMean = calculateMean(e.target.value);
                const columnStdDev = calculateStdDev(e.target.value);
                const columnStdError = calculateStdError(e.target.value);
                const columnCV = calculateCV(e.target.value);

                setMean(columnMean);
                setStdDev(columnStdDev);
                setStdError(columnStdError);
                setCV(columnCV);
              } else {
                setMean(null);
                setStdDev(null);
                setStdError(null);
                setCV(null);
              }
            }}
          >
            <option value="">Select a Column</option>
            {selectableColumns.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          {selectedColumn && (
            <div className="mt-4 mb-10">
              {mean !== null && (
                <p>
                  Mean (Average) for '{selectedColumn}':{" "}
                  <span className="text-bold">{mean.toFixed(2)}</span>
                </p>
              )}
              {stdDev !== null && (
                <p>
                  Standard Deviation for '{selectedColumn}':{" "}
                  <span className="text-bold">{stdDev.toFixed(2)}</span>
                </p>
              )}
              {stdError !== null && (
                <p>
                  Standard Error for '{selectedColumn}':{" "}
                  <span className="text-bold">{stdError.toFixed(2)}</span>
                </p>
              )}
              {cv !== null && (
                <p>
                  Coefficient of Variation (CV) for '{selectedColumn}':{" "}
                  <span className="text-bold">{cv.toFixed(2)}%</span>
                </p>
              )}
            </div>
          )}
          {selectedColumn && (
            <div className="mt-5">
              <label
                htmlFor="secondColumnSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Select a Second Column for Correlation:
              </label>
              <select
                id="secondColumnSelect"
                name="secondColumnSelect"
                className="mt-1 p-2 border rounded-md w-full"
                onChange={(e) => {
                  setSecondSelectedColumn(e.target.value);
                  if (e.target.value) {
                    const columnCorrelation = calculateCorrelation(
                      selectedColumn,
                      e.target.value
                    );
                    const sampleSize = array.length;

                    setCorrelation(columnCorrelation);
                    const pValue = calculatePValue(
                      columnCorrelation,
                      sampleSize
                    );
                    setPValue(pValue);

                    // Calculate and set the F value
                    const fVal = calculateFValue(
                      selectedColumn,
                      e.target.value
                    );
                    setFValue(fVal);
                  } else {
                    setCorrelation(null);
                    setPValue(null);
                    setFValue(null);
                  }
                }}
              >
                <option value="">Select a Column</option>
                {selectableColumns.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              {correlation !== null && (
                <p className="mt-5">
                  Pearson Correlation between '{selectedColumn}' and '
                  {secondSelectedColumn}':{" "}
                  <span className="text-bold">{correlation.toFixed(2)}</span>
                </p>
              )}
              {pValue !== null && (
                <p>
                  P-Value for the correlation:{" "}
                  <span className="text-bold">{pValue.toFixed(4)}</span>
                </p>
              )}
              {fValue !== null && (
                <p>
                  F Value between '{selectedColumn}' and '{secondSelectedColumn}
                  ': <span className="text-bold">{fValue.toFixed(4)}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {array.length > 0 && (
        <div className="max-h-80 overflow-y-auto mt-10 text-center">
          <table className="table-auto w-full">
            <thead>
              <tr key="header">
                {headerKeys.map((key) => (
                  <th key={key} className="px-4 py-2 sticky top-0 bg-white">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {array.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((val, subIndex) => (
                    <td key={subIndex} className="border px-4 py-2">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
