import React, { useState } from "react";

const FolderUpload = () => {
  const [files, setFiles] = useState<any>([]);
  const [error, setError] = useState("");

  const handleFolderChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) {
      setError("No files found in the selected folder.");
      return;
    }

    setFiles(selectedFiles);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Please select a folder with files.");
      return;
    }

    console.log("Uploading files:", files);

    files.forEach((file) => console.log(file.webkitRelativePath, file.size));

    setFiles([]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFolderChange}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        {files.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <h3>Files in Selected Folder:</h3>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  {file.webkitRelativePath} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          style={{ marginTop: "15px", padding: "10px 15px", cursor: "pointer" }}
          disabled={files.length === 0}
        >
          Upload Folder
        </button>
      </form>
    </div>
  );
};

export default FolderUpload;
