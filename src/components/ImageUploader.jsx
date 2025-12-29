import React, { useRef } from "react";
import { Image } from "lucide-react";

function ImageUploader({ onImageUpload, setUploading }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "posts_unsigned");
    formData.append("folder", "posts");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dh5jb4vae/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      onImageUpload(data.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => fileInputRef.current.click()}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer transition text-[#1D9BF0]"
      >
        <Image size={20} />
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}

export default ImageUploader;
