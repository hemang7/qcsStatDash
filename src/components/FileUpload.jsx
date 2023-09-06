import React, { useState } from "react";
import { useTable } from "react-table";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        console.log("File content:", text); // Check if the file content is displayed in the console.
        const rows = text.split("\n").map((row) => row.split(","));
        console.log("Parsed data:", rows); // Check if the parsed data is displayed in the console.
        setData(rows);
        onUpload(rows);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default FileUpload;
