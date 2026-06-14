import { ACCEL_SCALE, GYRO_SCALE, SAMPLES_PER_PACKET, SAMPLE_BYTES } from './constants';

export interface IMUSample {
  timestampUs: number;
  ax: number; ay: number; az: number;  // g
  gx: number; gy: number; gz: number;  // °/s
}

// Parsea el buffer binario recibido por BLE (big-endian, 16 bytes por muestra)
export function parsePacket(base64: string): IMUSample[] {
  const bytes = Buffer.from(base64, 'base64');
  const samples: IMUSample[] = [];

  for (let i = 0; i < SAMPLES_PER_PACKET; i++) {
    const off = i * SAMPLE_BYTES;
    if (off + SAMPLE_BYTES > bytes.length) break;

    const ts  = bytes.readUInt32BE(off);
    const ax  = bytes.readInt16BE(off + 4)  * ACCEL_SCALE;
    const ay  = bytes.readInt16BE(off + 6)  * ACCEL_SCALE;
    const az  = bytes.readInt16BE(off + 8)  * ACCEL_SCALE;
    const gx  = bytes.readInt16BE(off + 10) * GYRO_SCALE;
    const gy  = bytes.readInt16BE(off + 12) * GYRO_SCALE;
    const gz  = bytes.readInt16BE(off + 14) * GYRO_SCALE;

    samples.push({ timestampUs: ts, ax, ay, az, gx, gy, gz });
  }

  return samples;
}
