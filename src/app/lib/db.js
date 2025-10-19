import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export async function openDB() {
  return open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });
}
