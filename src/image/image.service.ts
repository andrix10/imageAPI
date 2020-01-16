import {
  Req,
  Res,
  Injectable,
  Logger,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import * as AWS from "aws-sdk";
import * as multerS3 from "multer-s3";

// const s3 = new AWS.S3();
// AWS.config.update({
//   accessKeyId: "andrix10",
//   secretAccessKey: "nbalife2",
// });

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
}
