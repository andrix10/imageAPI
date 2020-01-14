import { Module } from "@nestjs/common";
import { UserController } from "@/user/user.controller";
import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/entity/user";
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
  ],
  controllers: [UserController, AuthController],
  providers: [AuthService],
})
export class AppModule {}
