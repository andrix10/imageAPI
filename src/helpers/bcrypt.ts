import { compare, hash } from "bcrypt";
import { promisify } from "util";

export class Bcrypt {
  public static readonly compare = promisify(compare).bind(compare);

  public static readonly hash = promisify(hash).bind(hash);
  public static readonly SALT_ROUNDS: number = 10;
}
