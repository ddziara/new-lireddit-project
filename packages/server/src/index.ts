import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { json } from "body-parser";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import cors from "cors";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
  const AppDataSource = new DataSource({
    type: "postgres",
    database: "lireddit2",
    host: "192.168.0.8",
    username: "statler",
    password: "12345aBc",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  await AppDataSource.initialize();

  const app = express();
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  // Initialize client.
  const redisClient = createClient();
  redisClient.connect().catch(console.error);

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
    disableTouch: true,
  });

  var corsOptions = {
    origin: "http://192.168.0.8:3000",
    // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  };

  app.use(cors<cors.CorsRequest>(corsOptions)),
    // Initialize sesssion storage.
    app.use(
      session({
        name: COOKIE_NAME,
        store: redisStore,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years (note: browser will change it to 400 days)
          httpOnly: true, // JavaScript won't see it in document.cookie
          sameSite: "lax", // csrf
          secure: __prod__, // only https
        },
        resave: false, // required: force lightweight session keep alive (touch)
        saveUninitialized: false, // recommended: only save session when data exists
        secret: "dgGdfg$#65Agf6fdertygFDHgfdsy5ywfhgSHgfsh657",
      })
    );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Note you must call `start()` on the `ApolloServer`
  // instance before passing the instance to `expressMiddleware`
  await apolloServer.start();

  // Specify the path where we'd like to mount our server
  app.use(
    "/graphql",
    json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => ({
        req,
        res,
        redisClient,
        AppDataSource,
      }),
    })
  );

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});

// ===============
// removed code #1
// ===============

// const post = fork.create(Post, {
//   title: "my first post",
// } as RequiredEntityData<Post>);

// await fork.persistAndFlush(post);

// const posts = await fork.find(Post, {});

// ===============
// removed code #2
// ===============

// app.get("/", (_, res) => {
//   res.send("hello");
// });
