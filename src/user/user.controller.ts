import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Injectable,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CreateUserRequest } from "../types/requests";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entity/user";
import { Bcrypt } from "bcrypt";

@Injectable()
@Controller()
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Post()
  @UseGuards(AuthService)
  async createUser(@Body() req: CreateUserRequest, @Res() res) {
    if (req.username.startsWith("guest")) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    const password = await Bcrypt.hash(req.password, Bcrypt.SALT_ROUNDS);

    const user = new User();
    user.username = req.username;

    if ((await this.userRepository.findOne(user)) !== undefined) {
      this.logger.error("User already exists");
      return res.status(HttpStatus.CONFLICT).send();
    }

    user.password = password;
    user.accessLevel = req.accessLevel;

    try {
      await this.userRepository.save(user);
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }

    this.logger.log("Created user " + req.username + " successfully");
    return res.status(HttpStatus.CREATED).send();
  }
}
