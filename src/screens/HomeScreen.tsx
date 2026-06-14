import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { useBLE } from '../ble/useBLE';

const STATUS_COLOR: Record<string, string> = {
  idle:       '#888',
  scanning:   '#f0a500',
  connecting: '#f0a500',
  connected:  '#2ecc71',
  error:      '#e74c3c',
};

const STATUS_LABEL: Record<string, string> = {
  idle:       'Sin conexión',
  scanning:   'Buscando BarTracker...',
  connecting: 'Conectando...',
  connected:  'Conectado',
  error:      'Error de conexión',
};

export default function HomeScreen() {
  const { status, lastSample, samples, connect, disconnect } = useBLE();
  const connected = status === 'connected';

  const fmt = (n: number, decimals = 3) => n.toFixed(decimals);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BarTracker</Text>
        <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
        <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      {/* Botón principal */}
      <TouchableOpacity
        style={[styles.btn, connected ? styles.btnDisconnect : styles.btnConnect]}
        onPress={connected ? disconnect : connect}
        disabled={status === 'scanning' || status === 'connecting'}
      >
        <Text style={styles.btnText}>
          {connected ? 'Desconectar' : 'Conectar'}
        </Text>
      </TouchableOpacity>

      {/* Datos en tiempo real */}
      {lastSample && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Última muestra</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Acelerómetro (g)</Text>
          </View>
          <View style={styles.row}>
            <MetricBox label="X" value={fmt(lastSample.ax)} />
            <MetricBox label="Y" value={fmt(lastSample.ay)} />
            <MetricBox label="Z" value={fmt(lastSample.az)} />
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.label}>Giroscopio (°/s)</Text>
          </View>
          <View style={styles.row}>
            <MetricBox label="X" value={fmt(lastSample.gx, 1)} />
            <MetricBox label="Y" value={fmt(lastSample.gy, 1)} />
            <MetricBox label="Z" value={fmt(lastSample.gz, 1)} />
          </View>

          <Text style={styles.timestamp}>
            t = {(lastSample.timestampUs / 1_000_000).toFixed(3)} s
          </Text>
        </View>
      )}

      {/* Contador */}
      {connected && (
        <Text style={styles.counter}>{samples.length} muestras recibidas</Text>
      )}
    </SafeAreaView>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0f0f0f', padding: 20 },
  header:         { alignItems: 'center', marginBottom: 24 },
  title:          { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 6 },
  dot:            { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  statusText:     { fontSize: 13 },
  btn:            { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnConnect:     { backgroundColor: '#2ecc71' },
  btnDisconnect:  { backgroundColor: '#e74c3c' },
  btnText:        { color: '#fff', fontSize: 17, fontWeight: '600' },
  card:           { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle:      { color: '#aaa', fontSize: 12, marginBottom: 10, textTransform: 'uppercase' },
  row:            { flexDirection: 'row', justifyContent: 'space-between' },
  label:          { color: '#666', fontSize: 11, marginBottom: 6 },
  metricBox:      { flex: 1, alignItems: 'center', backgroundColor: '#252525', borderRadius: 8, padding: 10, marginHorizontal: 4 },
  metricLabel:    { color: '#888', fontSize: 11, marginBottom: 2 },
  metricValue:    { color: '#fff', fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  timestamp:      { color: '#444', fontSize: 11, marginTop: 12, textAlign: 'right' },
  counter:        { color: '#444', fontSize: 12, textAlign: 'center' },
});
