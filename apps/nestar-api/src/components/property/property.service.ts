import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AgentPropertiesInquiry, AllPropertiesInquiry, OrdinaryInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import moment from "moment";
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';



@Injectable()
export class PropertyService {
    constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>,
    @Inject(forwardRef(() => MemberService))
    private memberService: MemberService,
    private viewService: ViewService,
    private likeService: LikeService,
){}
    public async createProperty( input: PropertyInput): Promise<Property>{
         try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
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

    public async getProperty(memberId: ObjectId, propertyId:ObjectId): Promise<Property> {
        const search :T = {// search maxsus objecti xosil qilinyapti
            _id: propertyId,// biz ko'rmoqchi bo'lgsn propertyId
            propertyStatus: PropertyStatus.ACTIVE,//biz ko'rmoqchi bo'lgan propertyni statusi 
        };
                                                               //yuqorida hosil qilingan search ni argument sifatida path qilamiz
      const targetProperty: Property = await this.propertyModel.findOne(search).lean<Property>().exec() as Property;//lean ni ishlatishdan maqsad hosil qilinayotgan
      if(!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);                            //targetProperty objectimizni o'zgartirish

      if(memberId) {// agar memberimiz Auth bo'lgan bo'sa bu qism ishga tushadi
        const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY};//property imizni ko'rilganini amalga oshiruvchi log
        const newView = await this.viewService.recordView(viewInput);//agar yangi record yuzaga kelsa pastdagi hosil qilingan mantiq 
        if (newView) {// yordamida 
            await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier:1 })
            targetProperty.propertyViews++;
        }

       //meLiked
        const likeInput = {memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY};
        targetProperty.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }                     //getmember ga null qo'yishimizni sababi bizga faqat ko'rishni o'zi muhim kim ko'rgani emas
    targetProperty.memberData = await this.memberService.getMember(null , targetProperty.memberId);
    return targetProperty;
}



public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
  let { propertyStatus, soldAt, deletedAt } = input;// distraction qilib olyapmiz
  const search: T = { // bu yerda search objectini hosil qilyapmiz
    _id: input._id,//aynan qaysi property ni yangilanishini ko'rsatyapmiz
    memberId: memberId,// AGENT faqat o'ziga tegishli property larni update qila oladi
    propertyStatus: PropertyStatus.ACTIVE,//faqat ACTIVE holatdagi propertylarimizni update qila oladi AGENT
  };

  if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();// sotilgan vaqtini belgilab ketyapmiz
  else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();// o'chirilgan vaqtini belgilab ketyapmiz

  const result = await this.propertyModel
    .findOneAndUpdate(search, input, {
      new: true,
    })
    .exec();
  if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

  if (soldAt || deletedAt) {// agar statusi o'rgarsa AGENT ni
    await this.memberService.memberStatsEditor({// property lar sonini
      _id: memberId,                           // bittaga kamaytiryapmiz
      targetKey: 'memberProperties',
      modifier: -1,
    });
  }

  return result;
}

public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
  const match: T = { propertyStatus: PropertyStatus.ACTIVE };//foydalanuvchilar ACTIVE propertylarni ko'rish kerak
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

  this.shapeMatchQuery(match, input);
  console.log('match:', match);

  const result = await this.propertyModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupAuthMemberLiked(memberId, "$_id"),
            lookupMember,
            { $unwind: '$memberData' },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();
  if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

  return result[0];
}

private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
  const {
    memberId,//iput ni ichida shu qiymatlarni qabul qilyapmiz
    locationList,
    roomsList,
    bedsList,
    typeList,
    periodsRange,
    pricesRange,
    squaresRange,
    options,
    text,
  } = input.search;
//agar memberId mavjud bo'lsa match ga memberId ni yuklaydi
  if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
  if (locationList) match.propertyLocation = { $in: locationList };//ma'lumotlarni array ko'rinishida olib beradi
  if (roomsList) match.propertyRooms = { $in: roomsList };
  if (bedsList) match.propertyBeds = { $in: bedsList };
  if (typeList) match.propertyType = { $in: typeList };

  if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
  if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
  if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };
// text imizni Regex orqali search qilyapmiz
  if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
  if (options) {
    match['$or'] = options.map((ele) => {
      return { [ele]: true };
    });
  }
}


public async getFavorites(memberId: Schema.Types.ObjectId, input: OrdinaryInquiry) : Promise<Properties>{
  return await this.likeService.getFavoriteProperties(memberId, input);
}

public async getVisited(memberId: Schema.Types.ObjectId, input: OrdinaryInquiry) : Promise<Properties>{
  return await this.viewService.getVisitedProperties(memberId, input);
}

public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
  const { propertyStatus } = input.search; //propertyStatus ni tekshiryapmiz
  if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

  const match: T = {
    memberId: memberId,
    propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },//statusi DELETE ga teng bo'lmasligi kerak
  };
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

  const result = await this.propertyModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupMember,
            { $unwind: '$memberData' },// unwind arrayni tashlab yuborib memberData ni o'zini beradi
          ],                           // ya'ni [memberData] => memberData
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();
  if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

  return result[0]; //aggregation array qaytargani uchun nolinchi indeks ni return qilyapmiz
}

 public async likeTargetProperty(memberId: Schema.Types.ObjectId, likeRefId: any): Promise<Property>{
      const target : Property|null = await this.propertyModel.findOne({ _id: likeRefId, propertyStatus: PropertyStatus.ACTIVE}).exec();
      if(!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

      const input: LikeInput = {
        memberId: memberId,
        likeRefId: likeRefId,
        likeGroup:LikeGroup.PROPERTY
      };

      const modifier: number = await this.likeService.toggleLike(input)
      const result = await this.propertyStatsEditor({_id: likeRefId, targetKey:"propertyLikes", modifier:modifier});
    
    if(!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
    return result   
    }

public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
  const { propertyStatus, propertyLocationList } = input.search;
  const match: T = {};
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

  if (propertyStatus) match.propertyStatus = propertyStatus;
  if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList };

  const result = await this.propertyModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit }, //property1 property2
            lookupMember, //memberDataValue: [memberDataValue]
            { $unwind: '$memberData' },//memberDataValue: memberDataValue
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();
  if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

  return result[0];
}

public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
  let { propertyStatus, soldAt, deletedAt } = input;
  const search: T = {
    _id: input._id,
    propertyStatus: PropertyStatus.ACTIVE,
  };

  if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
  else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

  const result = await this.propertyModel
    .findOneAndUpdate(search, input, {
      new: true,
    })
    .exec();
  if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

  if (soldAt || deletedAt) {
    await this.memberService.memberStatsEditor({
      _id: result.memberId,
      targetKey: 'memberProperties',
      modifier: -1,
    });
  }

  return result
}

public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
  const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
  const result = await this.propertyModel.findOneAndDelete(search).exec();
  if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

  return result;
}

public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
    const {_id, targetKey, modifier} = input;
    return await this.propertyModel
    .findByIdAndUpdate(
        _id,
        {$inc: {[targetKey]: modifier}},
        {
            new:true
        },
    )
    .lean<Property>()
    .exec() as Property;
} 

}
