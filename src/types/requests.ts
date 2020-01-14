import {
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  NotContains,
} from "class-validator";

export class PatchUserRequest {
  @IsOptional()
  @IsIn(["Regular", "Admin"])
  accessLevel: string = null;

  @IsOptional()
  @MinLength(8)
  password: string = null;
}

export class CreateUserRequest {
  @IsIn(["Regular", "Admin"])
  accessLevel: string;

  @MinLength(8)
  password: string;

  @MinLength(5)
  @NotContains(" ")
  username: string;
}

export class DeleteUserRequest {
  @MinLength(5)
  @NotContains(" ")
  username: string;
}

export class CreateTokenRequest {
  @MinLength(8)
  @NotContains(" ")
  password: string;

  @MinLength(5)
  @NotContains(" ")
  username: string;
}
