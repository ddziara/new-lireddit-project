import { Options, ReflectMetadataProvider } from '@mikro-orm/core';
import { __prod__ } from './constants';
import path from 'path';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';

const config: Options<PostgreSqlDriver> = {
    metadataProvider: ReflectMetadataProvider,
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        pathTs: './src/migrations', // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
        glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)    
    },
    entities: [path.join(__dirname, "./entities")],
    entitiesTs: ["./src/entities"],
    dbName: "lireddit",
    type: "postgresql",
    host: "192.168.0.8",
    port: 5432,
    user: "statler",
    password: "12345aBc",
    debug: !__prod__,
};

export default config; 

