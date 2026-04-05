import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor{
    private readonly logger: Logger = new Logger();

    public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const recordTime = Date.now();   
        const requestType = context.getType<GqlContextType>();  
       
    
        if(requestType === "http") {
        return next.handle();
         //**Develop if needed */
         } else if(requestType === "graphql"){
            //**(1) Develop if needed */
            const gqlContext = GqlExecutionContext.create(context)
            this.logger.log(` ${this.stringify(gqlContext.getContext().req.body)}`, "REQUEST")
           
            //**Errors handling via GraphQL */

            //**No Errors giving Response below */
         return next
        .handle()
        .pipe(
            tap((context) =>{
                const responseTime = Date.now() - recordTime;
                this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, "RESPONSE") 
        })
        )
        }
    
       return next.handle();  
    }
      private stringify(context : ExecutionContext):string{
        return JSON.stringify(context).slice(0,75)
      }
}