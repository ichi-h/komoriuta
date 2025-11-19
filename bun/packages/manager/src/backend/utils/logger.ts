/**
 * ログ出力ユーティリティ
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

interface BaseLog {
  level: 'INFO' | 'WARN' | 'ERROR';
  timestamp: string;
}

interface APILog extends BaseLog {
  type: 'api';
  procedure: string;
  requestHeader?: Record<string, string>;
  requestBody?: unknown;
  responseHeader?: Record<string, string>;
  responseBody?: unknown;
  ipAddress: string;
  durationMs: number;
}

interface HeartbeatWatchLog extends BaseLog {
  type: 'heartbeat_watch';
  serverID: number;
  serverUUID: string;
  serverName: string;
  powerStatus: 'ON' | 'OFF';
  previousHeartbeatStatus: 'None' | 'Launched' | 'ON' | 'Stopping';
  heartbeatStatus: 'None' | 'Launched' | 'ON' | 'Stopping';
  currentStatus: string;
}

interface ErrorLog extends BaseLog {
  type: 'error';
  message: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

interface GenericLog extends BaseLog {
  type: string;
  message?: string;
  [key: string]: unknown;
}

interface StartupLog extends BaseLog {
  type: 'startup' | 'database';
  message: string;
}

type LogEntry = APILog | HeartbeatWatchLog | ErrorLog | GenericLog | StartupLog;

// ログエントリ作成用の型（level と timestamp を除外）
type LogData =
  | Omit<APILog, 'level' | 'timestamp'>
  | Omit<HeartbeatWatchLog, 'level' | 'timestamp'>
  | Omit<ErrorLog, 'level' | 'timestamp'>
  | Omit<StartupLog, 'level' | 'timestamp'>
  | Omit<GenericLog, 'level' | 'timestamp'>;

const LOG_FILE_PATH =
  process.env.LOG_FILE_PATH || '/var/log/komoriuta/komo-manager.log.jsonl';
const DISABLE_FILE_LOG = process.env.DISABLE_FILE_LOG === 'true';

class Logger {
  private ensureLogDirectory() {
    if (DISABLE_FILE_LOG) return;

    const dir = dirname(LOG_FILE_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  }

  private log(level: 'INFO' | 'WARN' | 'ERROR', data: LogData) {
    const entry: LogEntry = {
      ...data,
      level,
      timestamp: new Date().toISOString(),
    } as LogEntry;

    // 標準出力
    console.log(JSON.stringify(entry));

    // ファイル出力
    if (!DISABLE_FILE_LOG) {
      try {
        this.ensureLogDirectory();
        writeFileSync(LOG_FILE_PATH, `${JSON.stringify(entry)}\n`, {
          flag: 'a',
          mode: 0o600,
        });
      } catch (error) {
        console.error('Failed to write log file:', error);
      }
    }
  }

  info(data: LogData) {
    this.log('INFO', data);
  }

  warn(data: LogData) {
    this.log('WARN', data);
  }

  error(data: LogData) {
    this.log('ERROR', data);
  }
}

export const logger = new Logger();
