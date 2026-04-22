import { forwardRef, Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member_model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';
import { FollowModule } from '../follow/follow.module';
import FollowSchema from '../../schemas/Follow.model';


@Module({
  imports:[
    MongooseModule.forFeature([{name: "Member", schema: MemberSchema}]), //Member Schema model
    MongooseModule.forFeature([{name:'Follow', schema:FollowSchema},]),
    AuthModule, //bular tashqaridan keladigan va member Resolverda 
    ViewModule,// ishlatiladigan modullar
    LikeModule,
    
  ],
  providers: [MemberResolver, MemberService],//bular member module uchun xizmat qiladi
  exports:[MemberService],//boshqa module da foydalanish uchun export qilamiz
})
export class MemberModule {}

