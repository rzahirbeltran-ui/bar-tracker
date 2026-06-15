import {useState, useEffect, useRef, useCallback} from 'react';
import {BleManager, Device, Characteristic} from 'react-native-ble-plx';
import {NUS_SERVICE_UUID, NUS_TX_CHAR_UUID, DEVICE_NAME} from './constants';
import {parsePacket, IMUSample} from './parser';

export type BLEStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

const manager = new BleManager();
const MAX_SAMPLES = 500;

export function useBLE() {
  const [status, setStatus] = useState<BLEStatus>('idle');
  const [samples, setSamples] = useState<IMUSample[]>([]);
  const [lastSample, setLastSample] = useState<IMUSample | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const subRef = useRef<{remove: () => void} | null>(null);

  const disconnect = useCallback(async () => {
    subRef.current?.remove();
    subRef.current = null;
    if (deviceRef.current) {
      try {
        await deviceRef.current.cancelConnection();
      } catch {}
      deviceRef.current = null;
    }
    setStatus('idle');
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatus('scanning');
      setSamples([]);
      setLastSample(null);

      manager.startDeviceScan(
        [NUS_SERVICE_UUID],
        {allowDuplicates: false},
        async (error, device) => {
          if (error) {
            setStatus('error');
            return;
          }
          if (!device || device.name !== DEVICE_NAME) {
            return;
          }

          manager.stopDeviceScan();
          setStatus('connecting');

          try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();
            deviceRef.current = connected;
            setStatus('connected');

            subRef.current = connected.monitorCharacteristicForService(
              NUS_SERVICE_UUID,
              NUS_TX_CHAR_UUID,
              (err: Error | null, char: Characteristic | null) => {
                if (err || !char?.value) {
                  return;
                }
                const newSamples = parsePacket(char.value);
                setLastSample(newSamples[newSamples.length - 1]);
                setSamples(prev => {
                  const next = [...prev, ...newSamples];
                  return next.length > MAX_SAMPLES
                    ? next.slice(next.length - MAX_SAMPLES)
                    : next;
                });
              },
            );
          } catch {
            setStatus('error');
          }
        },
      );
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
      manager.destroy();
    };
  }, [disconnect]);

  return {status, samples, lastSample, connect, disconnect};
}
