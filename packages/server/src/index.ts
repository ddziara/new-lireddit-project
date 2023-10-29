import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { json } from "body-parser";
import RedisStore from "connect-redis";
import cors from "cors";
import express, { NextFunction } from "express";
import session from "express-session";
import http from "http";
import { createClient } from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import AppDataSource from "./app-data-source";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";
import dotenv from "dotenv-safe";

dotenv.config();

const main = async () => {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const app = express();
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  // Initialize client.
  const redisClient = createClient({url: process.env.REDIS_URL});
  redisClient.connect().catch(console.error);

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
    disableTouch: true,
  });

  // app.set("proxy", 1);

  var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  };

  app.use(cors<cors.CorsRequest>(corsOptions));

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
        domain: __prod__ ? ".digitalocean.com" : undefined
      },
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET!,
    })
  );

  // TEST
  const myLogger = function (req: Request, res: Response, next: NextFunction) {
    // console.log("LOGGED: body: ", req.body, ", req.session.userId: ", (req as any).session.userId)
    next();
  };

  // TEST END

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
    myLogger as any,
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => {
        // TEST
        // if(!util.types.isProxy(req)) {
        //   console.log("=========================================================>")
        //   req.session = new Proxy(req, { set(obj, prop, value) {
        //     console.log(`### setting "${prop as string}" to "${value}"`)
        //     return Reflect.set(obj, prop, value);

        //   }})
        // }
        // console.log("In context function: req.session: ", req.session);
        // END TEST

        return {
          req,
          res,
          redisClient,
          AppDataSource,
          userLoader: createUserLoader(),
          updootLoader: createUpdootLoader(),
        };
      },
    })
  );

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`server started on localhost:${process.env.PORT}`);
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
