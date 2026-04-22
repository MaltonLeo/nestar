import { Field, ObjectType } from '@nestjs/graphql';
import { LikeGroup } from '../../enums/like.enum';
import { ObjectId, Schema } from 'mongoose';

@ObjectType()
export class MeLiked {
	@Field(() => String)
	memberId!: Schema.Types.ObjectId;

	@Field(() => String)
	likeRefId!:Schema.Types.ObjectId;

	@Field(() => Boolean)
	myFavorite!: boolean;
}

@ObjectType()
export class Like {
	@Field(() => String)
	_id!: Schema.Types.ObjectId;

	@Field(() => LikeGroup)
	likeGroup!: LikeGroup;

	@Field(() => String)
	likeRefId!: Schema.Types.ObjectId;

	@Field(() => String)
	memberId!: Schema.Types.ObjectId;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;
}


