import { AuthService } from "../auth/auth.service";
import { User } from "@/entity/user";
import { Bcrypt } from "@/helpers/bcrypt";
import { CreateTokenRequest } from "@/types/requests";
import { ValidationPipe } from "@/pipes/validation.pipe";
import { JWT } from "@/types/types";
import {
  Body,
  Controller,
  HttpStatus,
  Injectable,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { sign } from "jsonwebtoken";
import { Repository } from "typeorm";

@Controller()
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(AuthController.name);

  @Post()
  @UsePipes(new ValidationPipe())
  getHello(): string {
    return;
  }
}
