import { useState, useRef } from 'react';
import { compressImage } from '../utils/imageCompressor';

export default function PhotoUpload({ files, setFiles, maxFiles = 5 }) {
  const inputRef = useRef();
  const [previews, setPreviews] = useState([]);

  async function handleFiles(e) {
    const newFiles = Array.from(e.target.files);
    const remaining = maxFiles - files.length;
    const toAdd = newFiles.slice(0, remaining);

    const compressed = await Promise.all(toAdd.map((f) => compressImage(f)));
    const newPreviews = compressed.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...compressed]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  }

  function removeFile(index) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20">
            <img src={src} alt="" className="w-full h-full object-cover rounded" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
            >
              X
            </button>
          </div>
        ))}
      </div>
      {files.length < maxFiles && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center text-gray-500 hover:border-brand-400 hover:text-brand-500"
        >
          Foto hinzufugen ({files.length}/{maxFiles})
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
