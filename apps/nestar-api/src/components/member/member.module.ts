import { forwardRef, Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member_model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';


@Module({
  imports:[
    MongooseModule.forFeature([
      {name: "Member", 
        schema: MemberSchema//Schema validation object
      }
    ]), //Member Schema model
    AuthModule, //bular tashqaridan keladigan va member Resolverda 
    ViewModule,// ishlatiladigan modullar

  ],
  providers: [MemberResolver, MemberService],//bular member module uchun xizmat qiladi
  exports:[MemberService],//boshqa module da foydalanish uchun export qilamiz
})
export class MemberModule {}

