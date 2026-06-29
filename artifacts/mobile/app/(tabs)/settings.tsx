import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetContacts, useCreateContact, useDeleteContact, type Contact } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

function ContactRow({
  item,
  colors,
  onDelete,
}: {
  item: Contact;
  colors: ReturnType<typeof useColors>;
  onDelete: (id: string) => void;
}) {
  const initials = item.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>
      <View style={styles.contactBody}>
        <Text style={[styles.contactName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.contactDetail, { color: colors.mutedForeground }]}>
          {item.relationship} · {item.phone}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        style={[styles.deleteBtn, { backgroundColor: colors.muted }]}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const { data: contacts, isLoading, refetch } = useGetContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    try {
      await createContact.mutateAsync({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim() });
      await refetch();
      setName("");
      setPhone("");
      setRelationship("");
      setShowAddForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Could not add contact. Try again.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove Contact", "Remove this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteContact.mutateAsync(id);
            await refetch();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            Alert.alert("Error", "Could not remove contact.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 34 : insets.bottom + 16 }]}>
        {/* Device info */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.deviceRow]}>
            <View style={[styles.deviceIcon, { backgroundColor: colors.primary }]}>
              <Feather name="shield" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.deviceName, { color: colors.foreground }]}>SafeGuard Device</Text>
              <Text style={[styles.deviceId, { color: colors.mutedForeground }]}>device-001 · Active</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>EMERGENCY CONTACTS</Text>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (contacts ?? []).length === 0 && !showAddForm ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No emergency contacts yet</Text>
          </View>
        ) : (
          <View style={styles.contactList}>
            {(contacts ?? []).map((item) => (
              <ContactRow key={item.id} item={item} colors={colors} onDelete={handleDelete} />
            ))}
          </View>
        )}

        {/* Add form */}
        {showAddForm && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Contact</Text>
            {[
              { placeholder: "Full name", value: name, setter: setName },
              { placeholder: "Phone number", value: phone, setter: setPhone },
              { placeholder: "Relationship (e.g. Spouse)", value: relationship, setter: setRelationship },
            ].map(({ placeholder, value, setter }) => (
              <TextInput
                key={placeholder}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={value}
                onChangeText={setter}
                style={[
                  styles.input,
                  { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
                ]}
              />
            ))}
            <View style={styles.formBtns}>
              <TouchableOpacity
                onPress={() => { setShowAddForm(false); setName(""); setPhone(""); setRelationship(""); }}
                style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={createContact.isPending}
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: createContact.isPending ? 0.6 : 1 }]}
                activeOpacity={0.7}
              >
                {createContact.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!showAddForm && (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={[styles.addBtn, { borderColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Emergency Contact</Text>
          </TouchableOpacity>
        )}

        {/* App info */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Device ID", value: "device-001" },
            { label: "API Status", value: "Connected" },
          ].map(({ label, value }) => (
            <View key={label} style={[styles.aboutRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>{value}</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 4 },
  deviceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  deviceIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  deviceName: { fontSize: 16, fontWeight: "600" },
  deviceId: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginTop: 4, marginBottom: 4 },
  contactList: { gap: 8 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "700" },
  contactBody: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: "600" },
  contactDetail: { fontSize: 12, marginTop: 2 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  loadingBox: { alignItems: "center", padding: 24 },
  emptyBox: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", padding: 28, gap: 8 },
  emptyText: { fontSize: 14 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  addBtnText: { fontWeight: "600" },
  addForm: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  formTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  formBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  cancelBtnText: { fontWeight: "600" },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  aboutCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: "500" },
});
