import { apiClient, unwrapApiData } from "./client";

type UploadResponse = {
  url: string;
};

export async function uploadMedia(uri: string, _fieldName = "file") {
  const fileName = uri.split("/").pop() ?? "upload.jpg";

  // Fetch local image file/blob (works on iOS, Android, and Web out of the box)
  const res = await fetch(uri);
  const blob = await res.blob();

  // Convert Blob to Base64 Data URL
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Post Base64 JSON payload to the backend
  const response = await apiClient.post("/upload", {
    file: base64,
    name: fileName
  });

  return unwrapApiData<UploadResponse>(response.data).url;
}
