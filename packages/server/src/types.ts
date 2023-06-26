import { Request, Response } from "express";
import type { createClient } from "redis";
import { DataSource } from "typeorm";

export interface MyContext {
  req?: Request;
  res?: Response;
  redisClient?: ReturnType<typeof createClient>;
  AppDataSource?: DataSource;
}
