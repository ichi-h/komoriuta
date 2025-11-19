/**
 * 共通型定義
 */

export enum PowerStatus {
  OFF = 0,
  ON = 1,
}

export enum HeartbeatStatus {
  None = 0,
  Launched = 1,
  ON = 2,
  Stopping = 3,
}

export enum CurrentStatus {
  Applying = 'Applying',
  ON = 'ON',
  OFF = 'OFF',
  Starting = 'Starting',
  Stopping = 'Stopping',
  SyncedON = 'SyncedON',
  SyncedOFF = 'SyncedOFF',
  Lost = 'Lost',
  Warning = 'Warning',
  Error = 'Error',
}

export interface Server {
  id: number;
  uuid: string;
  name: string;
  macAddress: string;
  powerStatus: PowerStatus;
  heartbeatStatus: HeartbeatStatus;
  previousHeartbeatStatus: HeartbeatStatus;
  heartbeatInterval: number;
  lastHeartbeatAt: string | null;
  lastPowerChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
