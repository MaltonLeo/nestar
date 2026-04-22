import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
    constructor(@InjectModel('Like') private readonly liekModel:Model<Like>){}

    public async toggleLike(input: LikeInput): Promise<number>{
       const search: T = {memberId: input.memberId, likeRefId: input.likeRefId},
       exist = await this.liekModel.findOne(search).exec();
    let modifier = 1;

    if(exist) {
        await this.liekModel.findOneAndDelete(search).exec();
        modifier = -1;
    } else {
        try{
        await this.liekModel.create(input)
        } catch(err:any){
         console.log("ERROR, Service.model:", err.message);
         throw new BadRequestException(Message.CREATE_FAILED)
        }
    }
    console.log(`-Like modifier ${modifier} -`)
    return modifier;
    }
}
