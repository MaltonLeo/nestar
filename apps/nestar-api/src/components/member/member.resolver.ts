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


@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService){}
    
    @Mutation(() => Member)
    public async signup(@Args("input") input: MemberInput): Promise<Member> {
           console.log("Mutation: signup");
           return this.memberService.signup(input);
       
    
    }
    @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member> {
          console.log("Mutation: login");
          return this.memberService.login(input);     
    }

    //Authenticated
    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async updateMember(@AuthMember("_id") memberId: ObjectId): Promise<string> {
        console.log("Mutation: updateMember");
        return this.memberService.updateMember();
    }

    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(@AuthMember("memberNick") memberNick: string): Promise<string> {
        console.log("Query: checkAuth");
        console.log("memberNick:", memberNick)
        return `Hi ${memberNick}`;   
    }

    @Roles(MemberType.USER,MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
        console.log("Query: checkAuthRoles");
        
        return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberID:${authMember._id} )`;   
    }

    @Query(() => String)
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
