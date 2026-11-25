import * as THREE from 'three';

export type SceneMode = 'ocean' | 'geometry' | 'ribbons' | 'custom';

export type CustomFuncType = 'wave' | 'sphere' | 'galaxy' | 'ripple' | 'helix';
export type CustomNoiseType = 'none' | 'fbm' | 'gyroid' | 'value3d' | 'curl';

export interface CustomParams {
  funcType: CustomFuncType;
  noiseType: CustomNoiseType;
  speed: number;
  shape: number;
  noiseAmp: number;
  noiseFreq: number;
  pointSize: number;
}

/** 波 (Ocean) と同じ初期値で始まるカスタム設定 */
export const DEFAULT_CUSTOM_PARAMS: CustomParams = {
  funcType: 'wave',
  noiseType: 'fbm',
  speed: 0.3,
  shape: 2.2,
  noiseAmp: 1.4,
  noiseFreq: 0.45,
  pointSize: 120,
};

export const CUSTOM_FUNC_INDEX: Record<CustomFuncType, number> = {
  wave: 0,
  sphere: 1,
  galaxy: 2,
  ripple: 3,
  helix: 4,
};

export const CUSTOM_NOISE_INDEX: Record<CustomNoiseType, number> = {
  none: 0,
  fbm: 1,
  gyroid: 2,
  value3d: 3,
  curl: 4,
};

export const CAMERA_PRESETS = {
  ocean: {
    position: new THREE.Vector3(0, 5.5, 11),
    target: new THREE.Vector3(0, 0, 0),
  },
  geometry: {
    position: new THREE.Vector3(15.074609834172277, 14.139600787107357, 20.29346401642569),
    target: new THREE.Vector3(-0.5339722732368793, -1.7475685364860711, -0.23337648588573798),
  },
  ribbons: {
    position: new THREE.Vector3(-9.22392366377476, 5.680536148497803, 18.460952778386748),
    target: new THREE.Vector3(0, 0, 0),
  },
  custom: {
    position: new THREE.Vector3(0, 5.5, 11),
    target: new THREE.Vector3(0, 0, 0),
  },
} as const;
