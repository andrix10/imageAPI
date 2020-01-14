import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ReflectMetadata,
} from "@nestjs/common";

@Injectable()
export class AuthService implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
