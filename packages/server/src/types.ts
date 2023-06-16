import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { SqlEntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Request, Response } from "express";
import type { createClient } from "redis";

export interface MyContext {
  em?: SqlEntityManager<PostgreSqlDriver> &
    EntityManager<IDatabaseDriver<Connection>>;
  req?: Request;
  res?: Response;
  redisClient?: ReturnType<typeof createClient> 
}