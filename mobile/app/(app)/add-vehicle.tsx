import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { vehiclesApi } from '@/services/api';
import { Colors } from '@/constants/colors';

const CAR_COLORS = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Bege', 'Outra'];

export default function AddVehicleScreen() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!make.trim() || !model.trim() || !year.trim()) {
      Alert.alert('Atenção', 'Preencha marca, modelo e ano.');
      return;
    }
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Atenção', 'Ano inválido.');
      return;
    }
    setLoading(true);
    try {
      await vehiclesApi.create({
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        license_plate: plate.trim().toUpperCase() || undefined,
        color: color || undefined,
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
          <Text style={styles.headerTitle}>Novo Veículo</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Marca *" value={make} onChangeText={setMake} placeholder="Ex: Toyota" />
          <Input label="Modelo *" value={model} onChangeText={setModel} placeholder="Ex: Corolla" />
          <Input
            label="Ano *" value={year} onChangeText={setYear}
            keyboardType="numeric" placeholder={String(new Date().getFullYear())} maxLength={4}
          />
          <Input
            label="Placa" value={plate} onChangeText={setPlate}
            placeholder="ABC-1234" autoCapitalize="characters" maxLength={8}
          />

          <Text style={styles.colorLabel}>Cor</Text>
          <View style={styles.colorGrid}>
            {CAR_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorChip, color === c && styles.colorChipActive]}
                onPress={() => setColor(c === color ? '' : c)}
                activeOpacity={0.7}
              >
                <Text style={[styles.colorChipText, color === c && styles.colorChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Salvar Veículo" onPress={handleSave} loading={loading} style={styles.btn} />
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
  colorLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  colorChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  colorChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  colorChipText: { fontSize: 13, color: Colors.textSecondary },
  colorChipTextActive: { color: Colors.primary, fontWeight: '600' },
  btn: { marginTop: 8 },
});
