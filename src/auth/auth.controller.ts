import { AuthService, Roles } from "@/auth/auth.service";
import { User } from "@/entity/user";
import { Bcrypt } from "@/helpers/bcrypt";
import { ValidationPipe } from "@/pipes/validation.pipe";
import { CreateTokenRequest } from "@/types/requests";
import { JWT, AccessLevel } from "@/types/types";
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
import { Repository, MongoRepository, getMongoManager } from "typeorm";

// This will all be optimzed by the compiler's constant propagation
const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 14;

@Injectable()
@Controller("token")
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}
  private readonly logger = new Logger(AuthController.name);

  @Post()
  @UsePipes(new ValidationPipe())
  async createToken(@Body() req: CreateTokenRequest, @Res() res) {
    let userManager = getMongoManager();
    this.logger.log("Attempting to create token for user " + req.username);
    let user = null;

    try {
      user = await this.userRepository.findOne({ username: req.username });
      this.logger.log(" accesslevel: " + JSON.stringify(user));
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    if (user === undefined) {
      this.logger.log("undefined");
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    if (!(await Bcrypt.compare(req.password, user.password))) {
      this.logger.log("Failed to validate user " + req.username);
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    const obj = new JWT(
      user.username,
      user.accessLevel,
      this.getTokenExpiration(),
    );

    const token = sign(
      JSON.stringify(obj),
      "24dc1870-4e73-4e05-bfb5-726cc22f10b3",
    );

    this.logger.log("Created token for " + req.username);
    this.logger.log(token);
    return res.status(HttpStatus.OK).send(token);
  }

  @Post("refresh")
  @Roles()
  @UseGuards(AuthService)
  async refresToken(@Req() req, @Res() res) {
    const obj = new JWT(
      req.user.username,
      req.user.accessLevel,
      this.getTokenExpiration(),
    );

    const token = sign(
      JSON.stringify(obj),
      "24dc1870-4e73-4e05-bfb5-726cc22f10b3",
    );

    return res.status(HttpStatus.OK).send(token);
  }

  getTokenExpiration(): string {
    return process.env.NODE_ENV === "production"
      ? new Date().setTime(new Date().getTime() + minute * 20).toString()
      : new Date().setTime(new Date().getTime() + week * 2).toString();
  }
}
