// hooks/useLocation.js
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1. Check if we already stored coords
        const stored = await AsyncStorage.getItem("userLocation");
        if (stored) {
          setCoords(JSON.parse(stored));
          setLoading(false);
          return;
        }

        // 2. Ask permission if no coords stored
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        // 3. Get current location
        let loc = await Location.getCurrentPositionAsync({});
        const newCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        // 4. Save in AsyncStorage
        await AsyncStorage.setItem("userLocation", JSON.stringify(newCoords));

        setCoords(newCoords);
      } catch (err) {
        console.error("Location error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { coords, loading };
}
