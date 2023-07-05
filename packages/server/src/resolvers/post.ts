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
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { AppDataSource }: MyContext,
    @Info() info: any
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if(cursor) {
      replacements.push(new Date(cursor));
    }

    const posts = await AppDataSource!.query(`
    SELECT p.*, 
    json_build_object(
      'id', u.id,
      'user', u.user,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
    FROM post p
    INNER JOIN public.user u ON u.id = p."creatorId"
    ${cursor ? `WHERE p."createdAt" < $2` : ""}
    ORDER BY p."createdAt" DESC
    LIMIT $1
    `, replacements) as unknown as [];

    // const qb = AppDataSource!
    //   .getRepository(Post)
    //   .createQueryBuilder("p") // "p" is an alias of table "posts"
    //   .innerJoin(
    //     "p.creator", // table (see: entity Post, ManyToOne())
    //     "u", // alias
    //     'u.id = p."creatorId"' // condition
    //   )
    //   .select(['p.id', 'p.createdAt', 'p.updatedAt', 'p.title', 'p.points', 'p.creatorId', 'p.text'])
    //   .addSelect(`json_build_object('u.user', u.user)`, 'creator')
    //   .orderBy('p.createdAt', "DESC") // this is for PostgreSQL to have upper case letters in column names
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p.createdAt < :cursor', {
    //     cursor: new Date(cursor),
    //   });
    // }

    // console.log("qb: ", qb.getQuery())
    // const posts = await qb.getMany();
    // console.log("posts: ", posts)

    posts.forEach((val: any) => {
      val["creator"]["createdAt"] = new Date(val["creator"]["createdAt"]);
      val["creator"]["updatedAt"] = new Date(val["creator"]["updatedAt"]);
    })
 
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ id });
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
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });

    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete({ id });
    return true;
  }
}
