import AsyncStorage from "@react-native-async-storage/async-storage";

export const authFetch = async (url, options = {}) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch (err) {
    console.error("authFetch error:", err);
    throw err;
  }
};
