/**
 * データベーススキーマ定義
 */

export interface Server {
  id: number;
  uuid: string;
  name: string;
  mac_address: string;
  power_status: PowerStatus;
  heartbeat_status: HeartbeatStatus;
  previous_heartbeat_status: HeartbeatStatus;
  heartbeat_interval: number;
  last_heartbeat_at: string | null;
  last_power_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessToken {
  id: number;
  server_id: number;
  token_hash: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

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
