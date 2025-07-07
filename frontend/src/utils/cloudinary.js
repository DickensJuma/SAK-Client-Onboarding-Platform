/**
 * Utility functions for Cloudinary image uploads
 */

export const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append("file", imageUri); // Directly append the imageUri (base64 string)
  data.append("upload_preset", "chat-images");
  data.append("cloud_name", "kennedy1");
  data.append("api_key", "485357172999359");
  data.append("timestamp", String(Date.now() / 1000));

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/kennedy1/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Upload failed");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error("Please select a valid image file (JPEG, PNG, GIF)");
  }

  if (file.size > maxSize) {
    throw new Error("Image size must be less than 5MB");
  }

  return true;
};
