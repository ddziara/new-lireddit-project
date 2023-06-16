import {
  Field,
  InputType
} from "type-graphql";


@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string = "";
  @Field()
  user: string = "";
  @Field()
  password: string = "";
}
