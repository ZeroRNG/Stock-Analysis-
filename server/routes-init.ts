// This file initializes the storage and makes it available to routes
// It's imported by index.ts after middleware setup
import { storage } from "./storage";
import type { Express } from "express";

export function initializeApp(app: Express) {
  app.locals.storage = storage;
}
