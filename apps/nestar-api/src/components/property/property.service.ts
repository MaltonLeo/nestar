import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
    constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>,
    @Inject(forwardRef(() => MemberService))
    private memberService: MemberService,
){}
    public async createProperty( input: PropertyInput): Promise<Property>{
         try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEdidor({
                _id: result.memberId,
                targetKey:'memberProperties',
                modifier:1,
            })
            // increase memberPr         
            return result
        } catch (err)  {
            if (err instanceof Error)
            console.log("Error, Service.model:", err.message)
            throw new BadRequestException(Message.CREATE_FAILED);
        }
                
    }
}
