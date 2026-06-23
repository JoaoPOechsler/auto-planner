import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { maintenancesApi } from '@/services/api';
import { MAINTENANCE_TYPES } from '@/constants/maintenanceTypes';
import { Colors } from '@/constants/colors';

export default function AddMaintenanceScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!type) { Alert.alert('Atenção', 'Selecione o tipo de manutenção.'); return; }
    if (!date) { Alert.alert('Atenção', 'Informe a data.'); return; }
    setLoading(true);
    try {
      await maintenancesApi.create({
        vehicle_id: Number(vehicleId),
        type,
        date,
        description: description.trim() || undefined,
        mileage: mileage ? Number(mileage) : undefined,
        cost: cost ? Number(cost.replace(',', '.')) : undefined,
        status,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Manutenção</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>Tipo *</Text>
          <View style={styles.typeGrid}>
            {MAINTENANCE_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                onPress={() => setType(t.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Data *" value={date} onChangeText={setDate}
            placeholder="AAAA-MM-DD" keyboardType="numeric"
          />
          <Input label="Descrição" value={description} onChangeText={setDescription} placeholder="Detalhes da manutenção" />
          <Input
            label="Quilometragem" value={mileage} onChangeText={setMileage}
            keyboardType="numeric" placeholder="Ex: 45000"
          />
          <Input
            label="Custo (R$)" value={cost} onChangeText={setCost}
            keyboardType="decimal-pad" placeholder="Ex: 180,00"
          />

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.statusRow}>
            {(['completed', 'pending'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, status === s && styles.statusChipActive]}
                onPress={() => setStatus(s)}
                activeOpacity={0.7}
              >
                <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>
                  {s === 'completed' ? 'Realizada' : 'Pendente'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Observações" value={notes} onChangeText={setNotes}
            placeholder="Notas adicionais..." multiline numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          <Button title="Salvar Manutenção" onPress={handleSave} loading={loading} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeChipText: { fontSize: 12, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.primary, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
    alignItems: 'center',
  },
  statusChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  statusChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  statusChipTextActive: { color: Colors.primary },
  btn: { marginTop: 8 },
});
