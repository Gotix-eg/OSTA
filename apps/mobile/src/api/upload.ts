import { apiClient, unwrapApiData } from "./client";

type UploadResponse = {
  url: string;
};

export async function uploadMedia(uri: string, fieldName = "file") {
  const fileName = uri.split("/").pop() ?? "upload.jpg";

  // Fetch local image file/blob
  const res = await fetch(uri);
  const blob = await res.blob();

  // Create FormData for multipart/form-data upload compatible with production Next.js API
  const formData = new FormData();
  formData.append(fieldName, blob, fileName);
  formData.append("purpose", "registration-document");

  // Post FormData to the backend
  const response = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  const data = response.data;
  if (data && typeof data.url === "string") {
    return data.url;
  }
  if (data && data.success && data.data && typeof data.data.url === "string") {
    return data.data.url;
  }

  throw new Error(data?.message ?? "API request failed");
}
