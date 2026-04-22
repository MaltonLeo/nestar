import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId, Schema } from 'mongoose';

@InputType()
class FollowSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	followingId?: Schema.Types.ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	followerId?: Schema.Types.ObjectId;
}

@InputType()
export class FollowInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

	@IsNotEmpty()
	@Field(() => FollowSearch)
	search!: FollowSearch;
}
