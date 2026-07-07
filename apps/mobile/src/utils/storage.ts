import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function getStorageItem(key: string) {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStorageItem(key: string, value: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteStorageItem(key: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
