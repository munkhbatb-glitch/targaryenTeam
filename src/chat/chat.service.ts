import { Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { ChatMessage } from './chat.types';

@Injectable()
export class ChatService implements OnModuleInit {
  private db!: Database.Database;
  private readonly maxHistory = 100;

  onModuleInit() {
    const dataDir = path.join(process.cwd(), 'data');
    fs.mkdirSync(dataDir, { recursive: true });

    this.db = new Database(path.join(dataDir, 'chat.db'));
    this.db.pragma('journal_mode = WAL');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_chat_room_created
      ON chat_messages(room_id, created_at);
    `);
  }

  saveMessage(roomId: string, sender: string, text: string): ChatMessage {
    const createdAt = Date.now();
    const trimmedText = text.trim().slice(0, 500);

    this.db
      .prepare(
        `INSERT INTO chat_messages (room_id, sender, text, created_at)
         VALUES (?, ?, ?, ?)`,
      )
      .run(roomId, sender, trimmedText, createdAt);

    this.trimRoomHistory(roomId);

    return {
      text: trimmedText,
      sender,
      at: createdAt,
    };
  }

  getHistory(roomId: string, limit = this.maxHistory): ChatMessage[] {
    const rows = this.db
      .prepare(
        `SELECT sender, text, created_at AS at
         FROM chat_messages
         WHERE room_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .all(roomId, limit) as ChatMessage[];

    return rows.reverse();
  }

  private trimRoomHistory(roomId: string) {
    this.db
      .prepare(
        `DELETE FROM chat_messages
         WHERE room_id = ?
         AND id NOT IN (
           SELECT id FROM chat_messages
           WHERE room_id = ?
           ORDER BY created_at DESC
           LIMIT ?
         )`,
      )
      .run(roomId, roomId, this.maxHistory);
  }
}
