import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver} from "@nestjs/apollo"
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { error } from 'console';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot(), //environmental variableni ishga tushiradi
    GraphQLModule.forRoot({//GraphQl API integration
      driver: ApolloDriver,//configurationlarni biriktirdik
      playground: true,
      isGlobal: true,
      upload: false,
      autoSchemaFile:true,
      formatError:(error: T) => {//hamda graphQL ga mantig'imizda xosil bo'layotgan jamiki
        const graphQLFormatError = {// errorlarni praphQL module orqali error handling qilib
          code: error?.extensions.code,//o'zimizning customized xatoliklarni yaratdik
          message:               // va uni clientlarimizga response sifatida yubordik
          error?.extensions?.exception?.response?.message || // va bu global tarzda amalga oshirildi
          error?.extensions?.response?.message || 
          error?.message,
        }
        console.log("GRAPHQL GLOBAL ERR:" , graphQLFormatError);
        return graphQLFormatError;
      }
    }), 
    ComponentsModule,//bu yerga back end ni asosiy mantig'i joylashgan va har bir module ni o'zining import va providerlari mavjud 
    DatabaseModule,//
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
