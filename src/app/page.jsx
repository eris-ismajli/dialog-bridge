"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState([]); // Store uploaded files

  // Fetch existing uploads (from /uploads folder)
  useEffect(() => {
    fetch("/api/list")
      .then((res) => res.json())
      .then((data) => setUploaded(data.files))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first!");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      // Reset file + preview
      setFile(null);
      setPreview(null);
      // Add new file to the grid
      setUploaded((prev) => [...prev, data.path]);
    }

    alert(data.message);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">File Upload Playground</h1>

      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border rounded p-2"
        />
        {preview && (
          <div className="p-4 text-center">
            <p className="mb-2">Preview:</p>
            <img
              src={preview}
              alt="preview"
              className="max-h-64 border rounded mx-auto"
            />
          </div>
        )}
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </div>

      {uploaded.length > 0 && (
        <div className="mt-8 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Uploaded Files
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploaded.map((path, idx) => {
              const filename = path.split("/").pop();
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center border rounded p-2 group hover:shadow-md transition-shadow"
                >
                  <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <img
                      src={path}
                      alt={`upload-${idx}`}
                      className="w-full h-40 object-cover rounded transition-transform group-hover:scale-105"
                    />
                  </a>
                  <p className="text-center text-sm text-gray-600 mt-1 break-all">
                    {filename}
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete ${filename}?`)) return;
                      const res = await fetch("/api/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filename }),
                      });
                      if (res.ok) {
                        setUploaded((prev) => prev.filter((p) => p !== path));
                      } else {
                        alert("Failed to delete file");
                      }
                    }}
                    className="text-red-500 text-sm mt-1 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
