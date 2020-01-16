import { Module } from "@nestjs/common";
import { UserController } from "@/user/user.controller";
import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/entity/user";
import { ImageController } from "@/image/image.controller";
import { ImageService } from "@/image/image.service";
import { NestMinioModule } from "nestjs-minio";

// import { Seed1553360039675 } from "@/migration/1553360039675-Seed";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mongodb",
      database: "imageapi",
      synchronize: true,
      keepConnectionAlive: true,
      // logging: process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production",
      logging: false,
      entities: [User],
      migrationsRun: true,
    }),
    TypeOrmModule.forFeature([User]),
    NestMinioModule.register({
      endPoint: "127.0.0.1",
      port: 9000,
      useSSL: false,
      accessKey: "andrix10",
      secretKey: "nbalife2",
    }),
  ],
  controllers: [UserController, AuthController, ImageController],
  providers: [AuthService],
})
export class AppModule {}
