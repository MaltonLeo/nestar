import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';


@Resolver()//Resolverimiz resolver decoratori yordamida joriy qilingan
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}//service modullarimizni membermodule dagi providerlar bilan chaqirib ishlatamiz
        // MemberService modeldan instance olib memberService objectga tenglaymiz
    @Mutation(() => Member)// Mutation post methodiga to'g'ri keladi
    public async signup(@Args("input") input: MemberInput): Promise<Member> {
           console.log("Mutation: signup");
           return this.memberService.signup(input);
       
    
    }
    @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member> {
          console.log("Mutation: login");
          return this.memberService.login(input);     
    }
    @Roles(MemberType.USER,MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
        console.log("Query: checkAuthRoles");
        
        return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberID:${authMember._id} )`;   
    }

    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(@AuthMember("memberNick") memberNick: string): Promise<string> {
        console.log("Query: checkAuth");
        console.log("memberNick:", memberNick)
        return `Hi ${memberNick}`;   
    }

    //Authenticated
    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args("input") input: MemberUpdate,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Member> {
        console.log("Mutation: updateMember");
        delete input._id;
        return this.memberService.updateMember(memberId, input);
    }

    @Query(() => String)// Query get methodiga to'g'ri keladi
    public async getMember(): Promise<string> {
        console.log("Query: getMember");
        return this.memberService.getMember();
    }

    //**ADMIN */
    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(()=> String)
    public async getAllMemberByAdmmin(): Promise<string>{
        return this.memberService.getAllMemberByAdmin();
    }

    //Authorizarion ADMIN
    @Mutation(()=> String)
    public async updateMemberByAdmmin(): Promise<string>{
    console.log('Mutation : updateMemberByAdmin') 
    return this.memberService.updateMemberByAdmin();
    }
    
}
