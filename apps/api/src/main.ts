import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 게이트웨이가 "/api" prefix 를 그대로 전달한다.
  app.setGlobalPrefix("api");
  await app.listen(4000, "0.0.0.0");
}
bootstrap();
