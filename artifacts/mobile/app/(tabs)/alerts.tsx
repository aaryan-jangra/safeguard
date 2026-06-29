import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetAlerts, type Alert } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const ALERT_TYPE_CONFIG: Record<string, { label: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  sos: { label: "SOS", icon: "alert-triangle", color: "#e52020" },
  fall: { label: "Fall", icon: "arrow-down-circle", color: "#d97706" },
  tamper: { label: "Tamper", icon: "shield-off", color: "#7c3aed" },
  manual: { label: "Manual", icon: "bell", color: "#0891b2" },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString();
}

function AlertRow({ item, colors }: { item: Alert; colors: ReturnType<typeof useColors> }) {
  const cfg = ALERT_TYPE_CONFIG[item.type] ?? ALERT_TYPE_CONFIG.manual;
  const isActive = item.status === "active";
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: cfg.color + "1a" }]}>
        <Feather name={cfg.icon} size={18} color={cfg.color} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowType, { color: colors.foreground }]}>{cfg.label} Alert</Text>
          <View style={[styles.statusPill, { backgroundColor: isActive ? "#e5202014" : colors.muted }]}>
            <Text style={[styles.statusPillText, { color: isActive ? "#e52020" : colors.mutedForeground }]}>
              {isActive ? "Active" : "Resolved"}
            </Text>
          </View>
        </View>
        {item.message ? (
          <Text style={[styles.rowMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.message}
          </Text>
        ) : null}
        <View style={styles.rowFooter}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.rowCoords, { color: colors.mutedForeground }]}>
            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
          <Text style={[styles.rowTime, { color: colors.mutedForeground }]}>· {formatTime(item.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const { data: alerts, isLoading, isError, refetch, isFetching } = useGetAlerts();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Alerts</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {alerts ? `${alerts.length} total` : "Loading..."}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Failed to load</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryLabel, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlertRow item={item} colors={colors} />}
          contentContainerStyle={[styles.list, { paddingBottom: isWeb ? 34 : insets.bottom + 16 }]}
          scrollEnabled={!!(alerts && alerts.length > 0)}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="bell-off" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No alerts yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Triggered emergencies will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, marginTop: 2 },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 4 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowType: { fontSize: 15, fontWeight: "600" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: "600" },
  rowMsg: { fontSize: 13 },
  rowFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowCoords: { fontSize: 11 },
  rowTime: { fontSize: 11 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12, minHeight: 300 },
  emptyTitle: { fontSize: 17, fontWeight: "600", marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  retryLabel: { fontWeight: "600" },
});
