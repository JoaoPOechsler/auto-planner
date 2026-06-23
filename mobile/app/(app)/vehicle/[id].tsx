import { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vehiclesApi, maintenancesApi, Vehicle, Maintenance } from '@/services/api';
import { getMaintenanceLabel } from '@/constants/maintenanceTypes';
import { Colors } from '@/constants/colors';

const STATUS_CONFIG = {
  completed: { label: 'Realizada', color: Colors.success, bg: Colors.successLight },
  pending:   { label: 'Pendente',  color: Colors.warning, bg: Colors.warningLight },
};

function MaintenanceCard({ item, onDelete }: { item: Maintenance; onDelete: () => void }) {
  const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.completed;
  const date = new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <View style={styles.mCard}>
      <View style={styles.mCardHeader}>
        <Text style={styles.mType}>{getMaintenanceLabel(item.type)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.mCardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{date}</Text>
        </View>
        {item.mileage ? (
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.mileage.toLocaleString('pt-BR')} km</Text>
          </View>
        ) : null}
        {item.cost ? (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>R$ {Number(item.cost).toFixed(2)}</Text>
          </View>
        ) : null}
      </View>

      {item.description ? <Text style={styles.mDescription}>{item.description}</Text> : null}
      {item.notes ? <Text style={styles.mNotes}>{item.notes}</Text> : null}

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={15} color={Colors.danger} />
        <Text style={styles.deleteBtnText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const [vRes, mRes] = await Promise.all([
        vehiclesApi.get(Number(id)),
        maintenancesApi.listByVehicle(Number(id)),
      ]);
      setVehicle(vRes.data);
      setMaintenances(mRes.data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, [id]));

  function confirmDeleteMaintenance(item: Maintenance) {
    Alert.alert('Remover manutenção', 'Confirma a remoção?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          try {
            await maintenancesApi.remove(item.id);
            setMaintenances((prev) => prev.filter((m) => m.id !== item.id));
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) return null;

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={maintenances}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <>
            {/* Vehicle info card */}
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIconWrapper}>
                <Ionicons name="car-sport" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                <Text style={styles.vehicleYear}>{vehicle.year}</Text>
                <View style={styles.vehicleMeta}>
                  {vehicle.license_plate ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{vehicle.license_plate}</Text>
                    </View>
                  ) : null}
                  {vehicle.color ? (
                    <View style={[styles.chip, { backgroundColor: Colors.background }]}>
                      <Text style={[styles.chipText, { color: Colors.textSecondary }]}>{vehicle.color}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{maintenances.length}</Text>
                <Text style={styles.statLabel}>Manutenções</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {maintenances.filter((m) => m.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Realizadas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>R$ {totalCost.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Gasto total</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Histórico de Manutenções</Text>
          </>
        }
        renderItem={({ item }) => (
          <MaintenanceCard item={item} onDelete={() => confirmDeleteMaintenance(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="build-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Nenhuma manutenção registrada</Text>
            <Text style={styles.emptySubText}>Toque no + para adicionar</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(app)/vehicle/add-maintenance', params: { vehicleId: id } })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  back: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, flex: 1, textAlign: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  vehicleCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  vehicleIconWrapper: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  vehicleName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  vehicleYear: { fontSize: 14, color: Colors.textSecondary, marginTop: 2, marginBottom: 8 },
  vehicleMeta: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  chipText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  statsRow: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  mCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  mCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mType: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  mCardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  mDescription: { fontSize: 13, color: Colors.text, marginTop: 4 },
  mNotes: { fontSize: 12, color: Colors.muted, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-end' },
  deleteBtnText: { fontSize: 12, color: Colors.danger },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubText: { fontSize: 13, color: Colors.muted },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
