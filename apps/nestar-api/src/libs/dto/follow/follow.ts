import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId, Schema } from 'mongoose';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class MeFollowed {
	@Field(() => String)
	followingId!: Schema.Types.ObjectId;

	@Field(() => String)
	followerId!: Schema.Types.ObjectId;

	@Field(() => Boolean)
	myFollowing!: boolean;
}

@ObjectType()
export class Follower {
	@Field(() => String)
	_id!: Schema.Types.ObjectId;

	@Field(() => String)
	followingId!: Schema.Types.ObjectId;

	@Field(() => String)
	followerId!: Schema.Types.ObjectId;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	/** from aggregation **/

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

	@Field(() => Member, { nullable: true })
	followerData?: Member;
}

@ObjectType()
export class Following {
	@Field(() => String)
	_id!: Schema.Types.ObjectId;

	@Field(() => String)
	followingId!: Schema.Types.ObjectId;

	@Field(() => String)
	followerId!: Schema.Types.ObjectId;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	/** from aggregation **/

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

	@Field(() => Member, { nullable: true })
	followingData?: Member;
}

@ObjectType()
export class Followings {
	@Field(() => [Following])
	list!: Following[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
}

@ObjectType()
export class Followers {
	@Field(() => [Follower])
	list!: Follower[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
}
