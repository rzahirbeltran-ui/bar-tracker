import { useState, useCallback, useRef } from 'react';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { DEVICE_NAME, NUS_SERVICE_UUID, NUS_TX_CHAR_UUID } from './constants';
import { parsePacket, IMUSample } from './parser';

const manager = new BleManager();

export type BLEStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

export function useBLE() {
  const [status, setStatus]       = useState<BLEStatus>('idle');
  const [samples, setSamples]     = useState<IMUSample[]>([]);
  const [lastSample, setLastSample] = useState<IMUSample | null>(null);
  const deviceRef  = useRef<Device | null>(null);
  const subRef     = useRef<Subscription | null>(null);

  const connect = useCallback(async () => {
    setStatus('scanning');
    setSamples([]);

    manager.startDeviceScan([NUS_SERVICE_UUID], null, async (error, device) => {
      if (error) { setStatus('error'); return; }
      if (!device || device.name !== DEVICE_NAME) return;

      manager.stopDeviceScan();
      setStatus('connecting');

      try {
        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();
        deviceRef.current = connected;
        setStatus('connected');

        // Suscribirse a notificaciones del NUS TX
        subRef.current = connected.monitorCharacteristicForService(
          NUS_SERVICE_UUID,
          NUS_TX_CHAR_UUID,
          (err, char) => {
            if (err || !char?.value) return;
            const newSamples = parsePacket(char.value);
            setLastSample(newSamples[newSamples.length - 1]);
            setSamples(prev => [...prev.slice(-500), ...newSamples]); // máx 500 muestras en memoria
          }
        );
      } catch {
        setStatus('error');
      }
    });
  }, []);

  const disconnect = useCallback(async () => {
    subRef.current?.remove();
    await deviceRef.current?.cancelConnection();
    deviceRef.current = null;
    setStatus('idle');
    setSamples([]);
    setLastSample(null);
  }, []);

  return { status, samples, lastSample, connect, disconnect };
}
