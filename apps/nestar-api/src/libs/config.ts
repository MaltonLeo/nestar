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

export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target): target;
}