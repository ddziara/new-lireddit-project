import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import path from "node:path";
import { __prod__ } from "./constants";
import dotenv from "dotenv-safe";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: "all",
  synchronize:
    !__prod__ /* schema should be created on every app. launch; only useful during debugging and development */,
  // migrations: [path.join(__dirname, "./migrations/*")],
  // entities: [Post, User, Updoot],
  entities: ["./dist/src/entities/*.js"],
  migrations: ["./dist/src/migrations/*.js"]
});

export default AppDataSource
