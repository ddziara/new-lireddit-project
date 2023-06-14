import { RequiredEntityData } from "@mikro-orm/core";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

@InputType()
class UsernamePasswordInput {
  @Field()
  user: string = "";
  @Field()
  password: string = "";
}

@ObjectType()
class FieldError {
  @Field()
  field: string = "";

  @Field()
  message: string = "";
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // you are not logged in
    if (!req!.session.userId) {
      return null;
    }

    const user = await em!.findOne(User, { id: req!.session.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.user.length <= 2) {
      return {
        errors: [
          {
            field: "user",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    const user = em!.create(User, {
      user: options.user,
      password: hashedPassword,
    } as RequiredEntityData<User>);

    try {
      await em!.persistAndFlush(user);
    } catch (err: any) {
      // duplicate user error
      //err.code === "23505"|| ) {
      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "user",
              message: "user name already taken",
            },
          ],
        };
      }
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req!.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em!.findOne(User, { user: options.user });

    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "that username doesn't exists",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req!.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req?.session.destroy(err => {
        res?.clearCookie(COOKIE_NAME);
    
        if(err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    })
  }
}
