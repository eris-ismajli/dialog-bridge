import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDB() {
  return open({
    filename: "./database.db", // SQLite file will appear in your project root
    driver: sqlite3.Database,
  });
}
