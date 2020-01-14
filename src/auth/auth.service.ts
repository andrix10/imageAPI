import { AccessLevel, JWT } from "@/types/types";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ReflectMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { validate } from "class-validator";

// Move this to separate file
export const Roles = (...roles: string[]) => ReflectMetadata("roles", roles);

@Injectable()
export class AuthService implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  private readonly logger = new Logger(AuthService.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log("Entering canActivate");
    const req = context.switchToHttp().getRequest();
    const roles = this.reflector.get<AccessLevel[]>(
      "roles",
      context.getHandler(),
    );
    const token = req.headers.authorization;

    if (req.headers.test === "true") {
      this.logger.warn(
        "Skipping authentication because test header set to true",
      );
      return true;
    }

    if (token === undefined) {
      this.logger.warn("Auth token needed but not provided");
      return false;
    }

    let obj: JWT;

    try {
      obj = await JWT.verify(token, "24dc1870-4e73-4e05-bfb5-726cc22f10b3");
    } catch (e) {
      this.logger.log("Failed to verify token");
      return false;
    }

    const errors = await validate(obj);

    if (errors.length > 0) {
      this.logger.log("Failed to validate token");
      return false;
    }

    this.logger.log("Validated JWT successfully");

    const expire = new Date().setTime(parseInt(obj.expiresAt, 10));
    const now = new Date().getTime();

    if (expire < now) {
      this.logger.log("Token has expired");
      return false;
    }

    if (roles.length < 1) {
      this.logger.warn("Roles aren't set");
      req.user = obj;
      return true;
    }

    // if (!Object.values(["Regular", "Admin"]).includes(obj.accessLevel)) {
    //   this.logger.log("Access Level provided is invalid");
    //   return false;
    // }

    if (roles.includes(obj.accessLevel as AccessLevel)) {
      this.logger.log("User does have access");
      req.user = obj;
      return true;
    } else {
      this.logger.log("User does not have access");
      return false;
    }
  }
}
