import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

// many to many relationship
// user <-> post
// user -> join table <- post
// user -> updoot <- post

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: "int"})
  value!: number;

  @Field()
  @PrimaryColumn()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user: User) => user.updoots)
  user!: User;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post: Post) => post.updoots, {
    onDelete: "CASCADE",
  })
  post!: Post;
}
