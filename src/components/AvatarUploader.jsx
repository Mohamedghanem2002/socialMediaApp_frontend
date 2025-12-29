import { useRef, useState, useEffect } from "react";

export default function AvatarUploader({
  src,
  size = 96,
  disabled = false,
  onUploaded,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(src);

  useEffect(() => {
    setPreview(src);
  }, [src]);

  const pick = () => {
    if (!disabled && !uploading) {
      fileRef.current?.click();
    }
  };

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setPreview(tempUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "posts_unsigned");
    formData.append("folder", "avatars");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dxe3zrtqf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!data.secure_url) throw new Error();

      onUploaded(data.secure_url);
      setPreview(data.secure_url);
    } catch (err) {
      console.error(err);
      setPreview(src);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative inline-block group">
      <div
        onClick={pick}
        style={{ width: size, height: size }}
        className={`
          relative rounded-full overflow-hidden
          bg-neutral-200 dark:bg-neutral-800
          ring-2 ring-white dark:ring-black
          ${!disabled ? "cursor-pointer" : ""}
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className={`w-full h-full object-cover ${
              uploading ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl">
            👤
          </div>
        )}

        {/* Overlay Edit */}
        {!disabled && !uploading && (
          <div
            className="
              absolute inset-0
              bg-black/40
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            <span className="text-white font-semibold text-sm tracking-wide">
              Edit
            </span>
          </div>
        )}

        {/* Loading */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
