import { MyContext } from "../types";
import { Post } from "../entities/Post";
import {
  Arg,
  Query,
  Resolver,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
  Info,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[] = [];
  @Field()
  hasMore: boolean = false;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, {nullable: true})
  async voteStatus(@Root() post: Post, @Ctx() { updootLoader, req }: MyContext) {
    if(!req?.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({postId: post.id, userId: req?.session.userId});

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req, AppDataSource }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req!.session;

    await AppDataSource!.transaction(async (transactionalEntityManager) => {
      const updoot = await Updoot.findOneBy({ postId, userId });

      // the user has voted on the post before
      // and he's changing his vote
      if (updoot && updoot.value !== realValue) {
        transactionalEntityManager.query(
          `update updoot
  set value = $1
  WHERE "postId" = $2 AND "userId" = $3`,
          [realValue, postId, userId]
        );

        await transactionalEntityManager.query(
          `UPDATE post p
  SET points = points + $1
  WHERE p.id = $2
  `,
          [2 * realValue, postId]
        );
      } else {
        await transactionalEntityManager.insert(Updoot, {
          userId,
          postId,
          value: realValue,
        });

        await transactionalEntityManager.query(
          `UPDATE post p
SET points = points + $1
WHERE p.id = $2
`,
          [realValue, postId]
        );
      }
    });

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req, AppDataSource }: MyContext,
    @Info() info: any
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(cursor));
    }

    const posts = (await AppDataSource!.query(
      `
    SELECT p.* 
    FROM post p
    ${cursor ? `WHERE p."createdAt" < $2` : ""}
    ORDER BY p."createdAt" DESC
    LIMIT $1
    `,
      replacements
    )) as unknown as [];

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req?.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req, AppDataSource }: MyContext
  ): Promise<Post | null> {
    const result = await AppDataSource!
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id AND "creatorId" = :creatorId', {
        id,
        creatorId: req!.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req, AppDataSource }: MyContext
  ): Promise<boolean> {
    // not cascade way
    // await AppDataSource!.transaction(async (em) => {
    //   const post = await Post.findOneBy({ id });

    //   if(!post) {
    //     return false;
    //   }

    //   if(post.creatorId !== req!.session.userId) {
    //     throw new Error("not authorized");
    //   }

    //   await Updoot.delete({ postId: id });
    //   await Post.delete({ id });
    // });

    // cascade way
    // in Updoot entity add:
    //   @Field(() => Post)
    //   @ManyToOne(() => Post, (post: Post) => post.updoots, {
    //     onDelete: "CASCADE",
    //   })

    await Post.delete({ id, creatorId: req!.session.userId });

    return true;
  }
}
