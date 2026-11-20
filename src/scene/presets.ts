import * as THREE from 'three';

export type SceneMode = 'ocean' | 'geometry' | 'ribbons';

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
} as const;
