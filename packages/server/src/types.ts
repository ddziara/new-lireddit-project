import { Request, Response } from "express";
import type { createClient } from "redis";
import { DataSource } from "typeorm";
import { createUserLoader } from "./utils/createUserLoader";

export interface MyContext {
  req?: Request;
  res?: Response;
  redisClient?: ReturnType<typeof createClient>;
  AppDataSource?: DataSource;
  userLoader: ReturnType<typeof createUserLoader>;
}
