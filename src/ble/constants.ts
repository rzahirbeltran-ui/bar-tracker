// Nordic UART Service — mismo UUID que en el firmware
export const NUS_SERVICE_UUID  = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
export const NUS_TX_CHAR_UUID  = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

export const DEVICE_NAME       = 'BarTracker';

// Escala para convertir raw → unidades físicas (igual que config.hpp)
export const ACCEL_SCALE = 1 / 16384.0;  // g por LSB
export const GYRO_SCALE  = 1 / 131.0;    // °/s por LSB

// Paquete: 5 muestras × 16 bytes = 80 bytes
export const SAMPLES_PER_PACKET = 5;
export const SAMPLE_BYTES       = 16;
