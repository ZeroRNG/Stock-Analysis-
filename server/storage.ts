import type { User, InsertUser } from "@shared/schema";
import { randomUUID, createHash } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): boolean;
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: hashPassword(insertUser.password),
    };
    this.users.set(id, user);
    return user;
  }

  verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    return hashPassword(plainPassword) === hashedPassword;
  }
}

export const storage = new MemStorage();
