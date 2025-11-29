import Database from 'better-sqlite3';

export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  to: number;
};

export type CandlesDb = Database;

/**
 * Открыть (или создать) файл БД.
 * НИЧЕГО не знает про платформу/символ — только про путь.
 */
export function openCandlesDb(dbPath: string): CandlesDb {
  const db = new Database(dbPath);

  // чуть адекватных pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  return db;
}

/**
 * Создаёт таблицу Candle, если её нет.
 */
export function ensureSchema(db: CandlesDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Candle (
        t  INTEGER PRIMARY KEY,
        o  REAL    NOT NULL,
        h  REAL    NOT NULL,
        l  REAL    NOT NULL,
        c  REAL    NOT NULL,
        v  REAL    NOT NULL,
        'to' REAL    NOT NULL
    );
  `);

  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_candle_t ON Candle(t);
  `);
}

/**
 * Батчевый INSERT OR IGNORE с транзакцией.
 */
export function insertCandles(db: CandlesDb, rows: Candle | Candle[]): void {
  !Array.isArray(rows) && (rows = [rows]);
  if (!rows.length) return;

  const stmt = db.prepare(
    `INSERT
    OR IGNORE INTO Candle (t, o, h, l, c, v, 'to')
         VALUES (@t, @o, @h, @l, @c, @v, @to)`
  );

  const insertMany = db.transaction((batch: Candle[]) => {
    for (const row of batch) {
      stmt.run(row);
    }
  });

  insertMany(rows);
}

/**
 * Самая поздняя свеча (по t).
 */
export function getLastCandle(db: CandlesDb): Candle | null {
  const row = db
    .prepare(`SELECT t, o, h, l, c, v, 'to'
              FROM Candle
              ORDER BY t DESC LIMIT 1`)
    .get() as Candle | undefined;
  return row ?? null;
}

/**
 * Самая ранняя свеча (по t).
 */
export function getFirstCandle(db: CandlesDb): Candle | null {
  const row = db
    .prepare(`SELECT t, o, h, l, c, v, 'to'
              FROM Candle
              ORDER BY t ASC LIMIT 1`)
    .get() as Candle | undefined;
  return row ?? null;
}

/**
 * Последние N свечей (по t), возвращаем в DESC, ты дальше можешь разворачивать.
 */
export function getLastNCandles(db: CandlesDb, n: number): Candle[] {
  if (n <= 0) return [];
  return db
    .prepare(`SELECT t, o, h, l, c, v, 'to'
              FROM Candle
              ORDER BY t DESC LIMIT ?`)
    .all(n) as Candle[];
}

/**
 * Все свечи (осторожно, если их там миллионы).
 */
export function getAllCandles(db: CandlesDb): Candle[] {
  return db
    .prepare(`SELECT t, o, h, l, c, v, 'to'
              FROM Candle
              ORDER BY t ASC`)
    .all() as Candle[];
}

export function truncateCandles(db: CandlesDb) {
  db.prepare('DELETE FROM Candle').run();
  db.prepare('VACUUM').run(); // ужимает файл
}
