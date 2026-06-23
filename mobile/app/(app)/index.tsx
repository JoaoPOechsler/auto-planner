import { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { vehiclesApi, Vehicle } from '@/services/api';
import { Colors } from '@/constants/colors';

function VehicleCard({ vehicle, onPress, onDelete }: {
  vehicle: Vehicle;
  onPress: () => void;
  onDelete: () => void;
}) {
  const lastDate = vehicle.last_maintenance_date
    ? new Date(vehicle.last_maintenance_date + 'T00:00:00').toLocaleDateString('pt-BR')
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="car-sport" size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.cardYear}>{vehicle.year}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardMeta}>
        {vehicle.license_plate ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{vehicle.license_plate}</Text>
          </View>
        ) : null}
        {vehicle.color ? (
          <View style={[styles.badge, styles.badgeGray]}>
            <Text style={styles.badgeText}>{vehicle.color}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Ionicons name="build-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>
            {vehicle.maintenance_count} {vehicle.maintenance_count === 1 ? 'manutenção' : 'manutenções'}
          </Text>
        </View>
        {lastDate && (
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}>Última: {lastDate}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const { data } = await vehiclesApi.list();
      setVehicles(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function confirmDelete(vehicle: Vehicle) {
    Alert.alert(
      'Remover veículo',
      `Deseja remover ${vehicle.make} ${vehicle.model}? Todas as manutenções serão perdidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive',
          onPress: async () => {
            try {
              await vehiclesApi.remove(vehicle.id);
              setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            }
          },
        },
      ],
    );
  }

  function confirmLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.greetingSub}>Seus veículos</Text>
        </View>
        <TouchableOpacity onPress={confirmLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/(app)/vehicle/${item.id}`)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
            <Text style={styles.emptyText}>Toque no botão + para adicionar seu primeiro veículo</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/add-vehicle')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text },
  greetingSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: 8 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardYear: { fontSize: 13, color: Colors.textSecondary },
  cardMeta: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeGray: { backgroundColor: Colors.background },
  badgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  statText: { fontSize: 12, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textSecondary },
  emptyText: { fontSize: 13, color: Colors.muted, textAlign: 'center', maxWidth: 240 },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
