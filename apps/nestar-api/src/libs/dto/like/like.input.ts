import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId, Schema } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId!: Schema.Types.ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	likeRefId!: Schema.Types.ObjectId;

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup!: LikeGroup;
}
