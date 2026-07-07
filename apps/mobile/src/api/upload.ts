import { Platform } from "react-native";
import { apiClient, unwrapApiData } from "./client";

type UploadResponse = {
  url: string;
};

export async function uploadMedia(uri: string, fieldName = "file") {
  const formData = new FormData();
  const fileName = uri.split("/").pop() ?? "upload.jpg";
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";

  if (Platform.OS === "web") {
    // For Web: Fetch the actual binary blob from the blob/data URI
    const res = await fetch(uri);
    const blob = await res.blob();
    formData.append(fieldName, blob, fileName);
  } else {
    // For Mobile Native: Use standard React Native layout
    formData.append(fieldName, {
      uri,
      name: fileName,
      type: `image/${extension === "jpg" ? "jpeg" : extension}`
    } as unknown as Blob);
  }

  const response = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return unwrapApiData<UploadResponse>(response.data).url;
}
