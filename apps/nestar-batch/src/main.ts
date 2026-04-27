import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';

async function bootstrap() {
  const app = await NestFactory.create(BatchModule);//NestFactoriy ni create methodiga AppModule ni argument sifatida path qilamiz
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
