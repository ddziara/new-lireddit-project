import { RequiredEntityData } from "@mikro-orm/core";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { validatePassword } from "../utils/validatePassword";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
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
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redisClient, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validatePassword(newPassword, "newPassword");

    if (errors) {
      return { errors };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redisClient?.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const user = await em?.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    await em?.persistAndFlush(user);

    await redisClient?.del(key);

    // log in user after change password

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req!.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redisClient }: MyContext
  ) {
    const user = await em?.findOne(User, { email });

    if (!user) {
      // the email is not in db
      return true;
    }

    const token = v4();

    await redisClient?.set(FORGET_PASSWORD_PREFIX + token, user.id, {
      EX: 1000 * 60 * 60 * 24 * 3,
    }); // expire in 3 days

    await sendEmail(
      email,
      `<a href=http://192.168.0.8:3000/change-password/${token}>reset password</a>`
    );

    return true;
  }

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
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);

    const user = em!.create(User, {
      user: options.user,
      email: options.email,
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em!.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { user: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username or email doesn't exists",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

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
      req?.session.destroy((err) => {
        res?.clearCookie(COOKIE_NAME);

        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }
}
