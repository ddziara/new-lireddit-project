import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
import { DataSource } from "typeorm";
import path from "node:path";
// import dotenv from "dotenv";

// dotenv.config();
console.log("################################### ", process.env.DB_DATABASE);

export const AppDataSource = new DataSource({
  type: "postgres",
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: "all",
  synchronize:
    true /* schema should be created on every app. launch; only useful during debugging and development */,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Updoot],
});
