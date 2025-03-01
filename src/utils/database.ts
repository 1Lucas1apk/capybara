import fs from "fs";
import path from "path";
type Data = Record<string, any>;

export class Database {
  private data: Data = {};
  
  constructor() {
    this.loadData();
  }

  set<T>(key: string, value: T): void {
    if (!key) throw new Error("Key cannot be empty");
    this.modifyData(key, value);
    this.saveData();
  }

  get<T>(key: string): T | undefined {
    if (!key) throw new Error("Key cannot be empty");
    return key.split(".").reduce((acc, curr) => acc?.[curr], this.data) ?? undefined;
  }

  push<T>(key: string, value: T): void {
    const arr = this.get<T[]>(key) || [];
    if (!Array.isArray(arr)) throw new Error("Key does not point to an array");
    arr.push(value);
    this.set(key, arr);
  }

  delete(key: string): boolean {
    if (!key) throw new Error("Key cannot be empty");
    const keys = key.split(".");
    const lastKey = keys.pop();
    let current = this.data;

    for (const k of keys) {
      if (typeof current[k] !== "object") return false;
      current = current[k];
    }

    if (lastKey && lastKey in current) {
      delete current[lastKey];
      this.saveData();
      return true;
    }

    return false;
  }

  private modifyData(key: string, value: any): void {
    const keys = key.split(".");
    let current = this.data;

    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }

  private loadData(): void {
    const filePath = this.getFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        this.data = JSON.parse(fileContent);
      } catch (err) {
        this.data = {};
      }
    } else {
        this.data = {};
    }
  }

  private saveData(): void {
    try {
      const filePath = this.getFilePath();
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (err) {
        console.error(err);
    }
  }

  private getFilePath(): string {
    return path.resolve(__dirname, "../datastore", `data.json`);
  }
}