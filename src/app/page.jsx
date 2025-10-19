"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);

  useEffect(() => {
    fetch("/api/list")
      .then((r) => r.json())
      .then((d) => {
        if (d.files) setUploaded(d.files);
      })
      .catch((e) => console.error("List fetch failed", e))
      .finally(() => setFetchingList(false));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first!");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      setFile(null);
      setPreview(null);
      setUploaded((p) => [data.path, ...p]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (path) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      setUploaded((prev) => prev.filter((x) => x !== path)); // optimistic UI
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: path }),
      });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Delete failed");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        File Upload Playground
      </motion.h1>

      <div className="flex flex-col items-center gap-4 bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700">
        <input
          type="file"
          onChange={handleFileChange}
          className="block text-sm file:mr-4 file:py-2 file:px-4 
                     file:rounded-full file:border-1
                     file:border-blue-700
                     file:text-sm file:font-semibold
                      file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
        />

        {preview && (
          <motion.div
            className="p-4 text-center bg-gray-900 rounded-xl shadow-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="mb-2 text-gray-300">Preview:</p>
            <img
              src={preview}
              alt="preview"
              className="max-h-48 rounded-lg border border-gray-700 shadow-lg mx-auto"
            />
          </motion.div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Uploaded Files Section */}
      <div className="w-full max-w-5xl mt-12">
        <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>

        {fetchingList ? (
          <div className="flex justify-center py-10 text-gray-400">
            <span className="animate-spin border-4 border-t-transparent rounded-full w-8 h-8 border-gray-400"></span>
          </div>
        ) : uploaded.length === 0 ? (
          <p className="text-gray-500 text-center">No files uploaded yet.</p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {uploaded.map((path, i) => {
                const filename = decodeURIComponent(path.split("/").pop());
                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-700 hover:border-blue-600 hover:shadow-blue-500/20 transition-all"
                  >
                    <a
                      href={path}
                      target="_blank"
                      rel="noreferrer"
                      className="block mb-2"
                    >
                      <img
                        src={path}
                        alt={filename}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </a>
                    <div className="flex justify-between items-center">
                      <div className="text-xs break-all text-gray-300">
                        {filename}
                      </div>
                      <button
                        onClick={() => handleDelete(path)}
                        className="text-red-500 hover:text-red-400 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
