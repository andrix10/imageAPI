import { AuthService, Roles } from "@/auth/auth.service";
import { User } from "@/entity/user";
import { Bcrypt } from "@/helpers/bcrypt";
import { ValidationPipe } from "@/pipes/validation.pipe";
import { CreateUserRequest, PatchUserRequest } from "@/types/requests";
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
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";

@Injectable()
@Controller("user")
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Post()
  @UseGuards(AuthService)
  @Roles("Admin")
  @UsePipes(new ValidationPipe())
  async createUser(@Body() req: CreateUserRequest, @Res() res) {
    this.logger.log("Attempting to create user");

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

  @Delete(":username")
  @Roles("Admin")
  @UseGuards(AuthService)
  async deleteUser(@Param("username") username, @Req() req, @Res() res) {
    this.logger.log("Attempting to delete user");
    this.logger.log(username);

    const user = new User();
    user.username = username;

    try {
      await this.userRepository.delete({ username: user.username });
    } catch {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    if (username === req.user.username) {
      this.logger.error("User can't delete their own info");
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    this.logger.log("Successfully deleted user ", username);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get()
  @Roles()
  @UseGuards(AuthService)
  async getAllUsers() {
    this.logger.log("Getting all users");
    return await this.userRepository.find();
  }

  // Not needed anymore, but would need to update all the tests that
  // use this route.
  @Get("me")
  @Roles()
  @UseGuards(AuthService)
  async getUserMe(@Req() req, @Res() res) {
    // req.user should contain the authorizsed user JWT

    this.logger.log("Attempting to get currently logged in user");

    if (req.user.username.startsWith("guest")) {
      return res.status(HttpStatus.FORBIDDEN).send();
    }

    const user = new User();
    user.username = req.user.username;
    user.accessLevel = req.user.accessLevel;

    let me;

    try {
      me = await this.userRepository.findOne(user);
    } catch {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    this.logger.log("Successfully got current user " + me.username);

    return res.send(me);
  }

  @Get(":username")
  @Roles("Admin")
  @UseGuards(AuthService)
  async getUser(@Param("username") username, @Res() res) {
    this.logger.log("Attempting to get user from params");

    const userRequest = new User();
    userRequest.username = username;

    let user;
    try {
      user = await this.userRepository.findOne({
        username: userRequest.username,
      });
    } catch {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    this.logger.log("Successfully got current user " + user);
    res.send(user);
  }

  @Patch(":username")
  @Roles("Admin")
  @UseGuards(AuthService)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param("username") username,
    @Req() req,
    @Body() body: PatchUserRequest,
    @Res() res,
  ) {
    this.logger.log(
      "Attempting to update user" + username + " by " + req.user.username,
    );

    if (body.password === null && req.accessLevel === null) {
      this.logger.log("Nothing to do");
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    if (username === req.user.username) {
      this.logger.error("User can't update their own info");
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    const user = await this.userRepository.findOne({
      username: req.user.username,
    });

    if (body.password !== null) {
      user.password = await Bcrypt.hash(body.password, Bcrypt.SALT_ROUNDS);
    }

    if (body.accessLevel !== null) {
      user.accessLevel = body.accessLevel;
    }

    await this.userRepository.save(user);

    this.logger.log("Successfully updated user ", username);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
