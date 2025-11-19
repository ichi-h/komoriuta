/**
 * Wake-on-LAN サービス
 */

import { createSocket } from 'node:dgram';

const WOL_PORT = 9; // Wake-on-LANの標準ポート

/**
 * MACアドレスからMagic Packetを生成
 */
function createMagicPacket(macAddress: string): Buffer {
  // MACアドレスをバイト配列に変換
  const mac = macAddress.replace(/[:-]/g, '');
  if (mac.length !== 12) {
    throw new Error('Invalid MAC address format');
  }

  const macBytes = Buffer.from(mac, 'hex');
  if (macBytes.length !== 6) {
    throw new Error('Invalid MAC address');
  }

  // Magic Packet: 6バイトの0xFF + MACアドレス16回繰り返し
  const packet = Buffer.alloc(102);

  // 最初の6バイトを0xFFで埋める
  for (let i = 0; i < 6; i++) {
    packet[i] = 0xff;
  }

  // MACアドレスを16回繰り返す
  for (let i = 0; i < 16; i++) {
    macBytes.copy(packet, 6 + i * 6);
  }

  return packet;
}

/**
 * Wake-on-LANでサーバーを起動
 */
export async function sendWakeOnLan(macAddress: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createSocket('udp4');
    const magicPacket = createMagicPacket(macAddress);

    socket.on('error', (error) => {
      socket.close();
      reject(error);
    });

    // ブロードキャストを有効化
    socket.bind(() => {
      socket.setBroadcast(true);

      // ブロードキャストアドレスに送信
      socket.send(
        magicPacket,
        0,
        magicPacket.length,
        WOL_PORT,
        '255.255.255.255',
        (error) => {
          socket.close();
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  });
}
