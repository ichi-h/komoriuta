/**
 * ハートビート監視サービス
 */

import { getDatabase } from '../db';
import type { Server } from '../db/schema';
import { CurrentStatus, HeartbeatStatus, PowerStatus } from '../db/schema';
import { logger } from '../utils/logger';

const HEARTBEAT_CHECK_INTERVAL = 10000; // 10秒
const SYNCED_OFF_TIMEOUT = 300000; // 5分
const STARTING_TIMEOUT = 300000; // 5分

/**
 * ハートビートステータス更新
 */
export function updateHeartbeatStatus(
  serverId: number,
  heartbeatStatus: HeartbeatStatus,
): void {
  const db = getDatabase();

  // 前回のハートビートステータスを保存
  db.run(
    `UPDATE servers 
     SET previous_heartbeat_status = heartbeat_status,
         heartbeat_status = ?,
         last_heartbeat_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [heartbeatStatus, serverId],
  );
}

/**
 * カレントステータスを計算
 */
export function calculateCurrentStatus(server: Server): CurrentStatus {
  const {
    power_status,
    heartbeat_status,
    previous_heartbeat_status,
    last_heartbeat_at,
  } = server;

  // Applying: 電源ステータス変更後、最初のハートビート受信前
  if (!last_heartbeat_at) {
    return CurrentStatus.Applying;
  }

  // ハートビートタイムアウトチェック
  const lastHeartbeat = new Date(last_heartbeat_at).getTime();
  const now = Date.now();
  const timeout = server.heartbeat_interval * 3 * 1000;
  const isTimeout = now - lastHeartbeat > timeout;

  // タイムアウトした場合、HeartbeatStatusをNoneとして扱う
  const currentHeartbeat = isTimeout ? HeartbeatStatus.None : heartbeat_status;

  // 状態遷移表に基づく判定
  if (power_status === PowerStatus.ON) {
    if (previous_heartbeat_status === HeartbeatStatus.Launched) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.Warning;
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.ON;
      if (currentHeartbeat === HeartbeatStatus.None) {
        return checkSyncedOff(lastHeartbeat, now)
          ? CurrentStatus.SyncedOFF
          : CurrentStatus.Lost;
      }
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.ON) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.ON;
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.ON;
      if (currentHeartbeat === HeartbeatStatus.None) {
        return checkSyncedOff(lastHeartbeat, now)
          ? CurrentStatus.SyncedOFF
          : CurrentStatus.Lost;
      }
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.Stopping) {
      if (currentHeartbeat === HeartbeatStatus.None) {
        return checkStartingTimeout(server.last_power_changed_at, now)
          ? CurrentStatus.SyncedOFF
          : CurrentStatus.Starting;
      }
      return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.None) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.ON;
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.ON;
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Error;
      if (currentHeartbeat === HeartbeatStatus.None) return CurrentStatus.Error;
    }
  }

  if (power_status === PowerStatus.OFF) {
    if (previous_heartbeat_status === HeartbeatStatus.Launched) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.Warning;
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Stopping;
      if (currentHeartbeat === HeartbeatStatus.None) {
        return checkSyncedOff(lastHeartbeat, now)
          ? CurrentStatus.SyncedOFF
          : CurrentStatus.Lost;
      }
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.ON) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.Warning;
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Stopping;
      if (currentHeartbeat === HeartbeatStatus.None) {
        return checkSyncedOff(lastHeartbeat, now)
          ? CurrentStatus.SyncedOFF
          : CurrentStatus.Lost;
      }
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.Stopping) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.Warning;
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Stopping;
      if (currentHeartbeat === HeartbeatStatus.None) return CurrentStatus.OFF;
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.Error;
    }

    if (previous_heartbeat_status === HeartbeatStatus.None) {
      if (currentHeartbeat === HeartbeatStatus.Launched)
        return CurrentStatus.SyncedON;
      if (currentHeartbeat === HeartbeatStatus.Stopping)
        return CurrentStatus.Stopping;
      if (currentHeartbeat === HeartbeatStatus.ON) return CurrentStatus.Error;
      if (currentHeartbeat === HeartbeatStatus.None) return CurrentStatus.Error;
    }
  }

  return CurrentStatus.Error;
}

function checkSyncedOff(lastHeartbeat: number, now: number): boolean {
  return now - lastHeartbeat > SYNCED_OFF_TIMEOUT;
}

function checkStartingTimeout(
  lastPowerChanged: string | null,
  now: number,
): boolean {
  if (!lastPowerChanged) return false;
  return now - new Date(lastPowerChanged).getTime() > STARTING_TIMEOUT;
}

/**
 * ハートビート監視を開始
 */
export function startHeartbeatMonitoring() {
  setInterval(() => {
    monitorHeartbeats();
  }, HEARTBEAT_CHECK_INTERVAL);

  logger.info({
    type: 'startup',
    message: 'Heartbeat monitoring started',
  });
}

/**
 * 全サーバーのハートビートをチェック
 */
function monitorHeartbeats() {
  const db = getDatabase();
  const servers = db.query('SELECT * FROM servers').all() as Server[];

  for (const server of servers) {
    const currentStatus = calculateCurrentStatus(server);

    logger.info({
      type: 'heartbeat_watch',
      serverID: server.id,
      serverUUID: server.uuid,
      serverName: server.name,
      powerStatus: server.power_status === PowerStatus.ON ? 'ON' : 'OFF',
      previousHeartbeatStatus: getHeartbeatStatusName(
        server.previous_heartbeat_status,
      ),
      heartbeatStatus: getHeartbeatStatusName(server.heartbeat_status),
      currentStatus,
    });

    // SyncedONの場合、電源ステータスをONに自動変更
    if (currentStatus === CurrentStatus.SyncedON) {
      db.run(
        `UPDATE servers 
         SET power_status = ?,
             last_power_changed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [PowerStatus.ON, server.id],
      );
    }

    // SyncedOFFの場合、電源ステータスをOFFに自動変更
    if (currentStatus === CurrentStatus.SyncedOFF) {
      db.run(
        `UPDATE servers 
         SET power_status = ?,
             last_power_changed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [PowerStatus.OFF, server.id],
      );
    }
  }
}

function getHeartbeatStatusName(
  status: HeartbeatStatus,
): 'None' | 'Launched' | 'ON' | 'Stopping' {
  switch (status) {
    case HeartbeatStatus.None:
      return 'None';
    case HeartbeatStatus.Launched:
      return 'Launched';
    case HeartbeatStatus.ON:
      return 'ON';
    case HeartbeatStatus.Stopping:
      return 'Stopping';
    default:
      return 'None';
  }
}
