import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTriggerAlert,
  useUpdateLocation,
  useGetDashboardSummary,
  useGetAlerts,
  getGetDashboardSummaryQueryKey,
  getAlertsQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

let ExpoLocation: typeof import("expo-location") | null = null;
if (Platform.OS !== "web") {
  ExpoLocation = require("expo-location");
}

type SosState = "idle" | "holding" | "sent" | "loading";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [isTracking, setIsTracking] = useState(false);
  const [sosState, setSosState] = useState<SosState>("idle");
  const [lastLocation, setLastLocation] = useState<{ lat: number; lon: number } | null>(null);

  const pressProgress = useRef(new Animated.Value(0)).current;
  const locationWatchRef = useRef<{ remove: () => void } | null>(null);
  const webIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerAlert = useTriggerAlert();
  const updateLocation = useUpdateLocation();
  const updateLocationRef = useRef(updateLocation);
  useEffect(() => { updateLocationRef.current = updateLocation; }, [updateLocation]);

  const { data: summary, refetch } = useGetDashboardSummary();
  const { refetch: refetchAlerts } = useGetAlerts();

  useEffect(() => {
    return () => {
      locationWatchRef.current?.remove();
      if (webIntervalRef.current) clearInterval(webIntervalRef.current);
    };
  }, []);

  const sendLocation = useCallback(async (lat: number, lon: number, accuracy?: number) => {
    try {
      await updateLocationRef.current.mutateAsync({ latitude: lat, longitude: lon, accuracy });
      setLastLocation({ lat, lon });
    } catch {}
  }, []);

  const startTracking = useCallback(async () => {
    if (Platform.OS !== "web" && ExpoLocation) {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required for GPS tracking.");
        return;
      }
      const sub = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 10,
        },
        (loc) => sendLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy ?? undefined)
      );
      locationWatchRef.current = sub;
    } else if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      const doSend = () =>
        navigator.geolocation.getCurrentPosition((pos) =>
          sendLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
        );
      doSend();
      webIntervalRef.current = setInterval(doSend, 30000);
    }
    setIsTracking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [sendLocation]);

  const stopTracking = useCallback(() => {
    locationWatchRef.current?.remove();
    locationWatchRef.current = null;
    if (webIntervalRef.current) {
      clearInterval(webIntervalRef.current);
      webIntervalRef.current = null;
    }
    setIsTracking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const onPressIn = useCallback(() => {
    if (sosState !== "idle") return;
    setSosState("holding");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    pressProgress.setValue(0);
    Animated.timing(pressProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [sosState, pressProgress]);

  const onPressOut = useCallback(() => {
    if (sosState !== "holding") return;
    setSosState("idle");
    pressProgress.stopAnimation();
    Animated.timing(pressProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [sosState, pressProgress]);

  const onLongPress = useCallback(async () => {
    if (sosState !== "holding") return;
    setSosState("loading");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    let lat = lastLocation?.lat ?? 0;
    let lon = lastLocation?.lon ?? 0;

    if (lat === 0 && Platform.OS !== "web" && ExpoLocation) {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await ExpoLocation.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }
      } catch {}
    }

    try {
      await triggerAlert.mutateAsync({
        type: "sos",
        latitude: lat,
        longitude: lon,
        message: "SOS triggered from SafeGuard mobile app",
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
        qc.invalidateQueries({ queryKey: getAlertsQueryKey() }),
      ]);
      await refetchAlerts();
      setSosState("sent");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSosState("idle");
      pressProgress.setValue(0);
      Alert.alert("Failed", "Could not send SOS. Check your connection.");
    }
  }, [sosState, lastLocation, triggerAlert, qc, pressProgress]);

  const resetSOS = useCallback(() => {
    setSosState("idle");
    pressProgress.setValue(0);
  }, [pressProgress]);

  const sosScale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });
  const ringSize = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [160, 192] });
  const ringOpacity = pressProgress.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.4, 0.8] });

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.appName, { color: colors.foreground }]}>SafeGuard</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: isTracking ? colors.success : colors.mutedForeground }]} />
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
              {isTracking ? "Tracking active" : "Standby"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          style={[styles.headerBtn, { backgroundColor: colors.muted }]}
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SOS Zone */}
        <View style={styles.sosZone}>
          {sosState === "sent" ? (
            <View style={styles.sosSentBox}>
              <View style={[styles.sosBtn, { backgroundColor: colors.success }]}>
                <Feather name="check" size={44} color="#fff" />
              </View>
              <Text style={[styles.sosSentLabel, { color: colors.success }]}>SOS Sent</Text>
              <Text style={[styles.sosHint, { color: colors.mutedForeground }]}>
                Emergency services have been notified
              </Text>
              <TouchableOpacity
                onPress={resetSOS}
                style={[styles.resetBtn, { backgroundColor: colors.muted }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.resetLabel, { color: colors.foreground }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sosBtnWrap}>
              {/* Pulsing ring while holding */}
              <Animated.View
                style={[
                  styles.sosRing,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: 999,
                    opacity: ringOpacity,
                    backgroundColor: colors.destructive,
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: sosScale }] }}>
                <TouchableOpacity
                  style={[styles.sosBtn, { backgroundColor: sosState === "holding" ? "#c01010" : colors.destructive }]}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onLongPress={onLongPress}
                  delayLongPress={2000}
                  activeOpacity={1}
                >
                  {sosState === "loading" ? (
                    <ActivityIndicator color="#fff" size="large" />
                  ) : (
                    <>
                      <Feather name="alert-triangle" size={38} color="#fff" />
                      <Text style={styles.sosBtnLabel}>SOS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.sosHint, { color: colors.mutedForeground }]}>
                {sosState === "holding" ? "Keep holding to send..." : "Hold 2 seconds to trigger SOS"}
              </Text>
            </View>
          )}
        </View>

        {/* GPS Tracking Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isTracking ? colors.accent : colors.muted }]}>
                <Feather name="map-pin" size={16} color={isTracking ? colors.primary : colors.mutedForeground} />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>GPS Tracking</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                  {lastLocation
                    ? `${lastLocation.lat.toFixed(4)}, ${lastLocation.lon.toFixed(4)}`
                    : isTracking
                    ? "Acquiring location..."
                    : "Location unknown"}
                </Text>
              </View>
            </View>
            <Switch
              value={isTracking}
              onValueChange={(v) => (v ? startTracking() : stopTracking())}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "Active", value: summary?.activeAlerts ?? 0, color: colors.destructive },
            { label: "Resolved", value: summary?.resolvedAlerts ?? 0, color: colors.success },
            { label: "Recordings", value: summary?.totalRecordings ?? 0, color: colors.primary },
          ].map(({ label, value, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 32 },
  sosZone: { alignItems: "center", paddingTop: 36, paddingBottom: 28, paddingHorizontal: 24 },
  sosBtnWrap: { alignItems: "center", gap: 16 },
  sosRing: { position: "absolute" },
  sosBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#e52020",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  sosBtnLabel: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 2 },
  sosHint: { fontSize: 13, textAlign: "center", marginTop: 4 },
  sosSentBox: { alignItems: "center", gap: 12 },
  sosSentLabel: { fontSize: 24, fontWeight: "700" },
  resetBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  resetLabel: { fontSize: 14, fontWeight: "600" },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardSub: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: "center",
  },
  statNum: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
});
