import contentMd from '../../content.md?raw';
import type { SceneMode } from '../scene/presets';
import { parseContentMarkdown } from './parseContent';

export type FrameId =
  | 'hero'
  | 'profile'
  | 'work-01'
  | 'work-02'
  | 'work-03'
  | 'playground'
  | 'contact';

export interface FrameMeta {
  id: FrameId;
  index: string;
  label: string;
  mode: SceneMode;
  /** このフレームの収まり位置に近づいたときの背景暗転の最大不透明度 */
  dimMax: number;
}

export const FRAMES: FrameMeta[] = [
  { id: 'hero', index: '01', label: 'TOP', mode: 'geometry', dimMax: 0 },
  { id: 'profile', index: '02', label: 'PROFILE', mode: 'geometry', dimMax: 0.46 },
  { id: 'work-01', index: '03', label: 'WORK 01', mode: 'ribbons', dimMax: 0.44 },
  { id: 'work-02', index: '04', label: 'WORK 02', mode: 'ribbons', dimMax: 0.44 },
  { id: 'work-03', index: '05', label: 'WORK 03', mode: 'ribbons', dimMax: 0.44 },
  { id: 'contact', index: '06', label: 'CONTACT', mode: 'ocean', dimMax: 0.42 },
  { id: 'playground', index: '07', label: 'PLAYGROUND', mode: 'ocean', dimMax: 0 },
];

/**
 * プロジェクト直下の content.md を読み込んで反映します。
 */
export const PORTFOLIO_DATA = parseContentMarkdown(contentMd);
