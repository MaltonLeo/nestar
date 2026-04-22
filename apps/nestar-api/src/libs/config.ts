import {ObjectId} from "bson"

export const availableAgentSorts = [
    "createAt",
    "updateAt",
    "memberLikes",
    "memberViews",
    "memberRank"
]

export const availableMemberSorts = [
    "createAt",
    "updateAt",
    "memberLikes",
    "memberViews",
]
export const availableOptions = [
    'propertyBarter',
    'propertyRent'
]

export const availablePropertySorts = [
  'createdAt',
  'updatedAt',
  'propertyLikes',
  'propertyViews',
  'propertyRank',
  'propertyPrice',
];
  
export const availableBoardArticleSorts = [
  'createdAt',
  'updatedAt',
  'articleLikes',
  'articleViews',
];
  
export const availableCommentSorts = [
  'createdAt',
  'updatedAt',
];

 //** IMAGE CONFIGURATION*/ 
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target): target;
}

export const lookupMember = {
    $lookup: { //bizni property imizni ichida
        from: 'members',//topib berilgan ma'lumotlarni ichidan 
        localField: 'memberId',//memberId ni olib
        foreignField: '_id',// members collection ni ichidan _id nomi bilan izlab ber
        as:'memberData', //va topilgan ma'lumotni memberData sifatida ber deyapmiz va u array ichida bitta ma'lumot bo'ladi
        },
}

export const lookupFollowingData = {
  $lookup: {
    from: 'members',
    localField: 'followingId',
    foreignField: '_id',
    as: 'followingData',
  },
};

export const lookupFollowerData = {
  $lookup: {
    from: 'members',
    localField: 'followerId',
    foreignField: '_id',
    as: 'followerData',
  },
};