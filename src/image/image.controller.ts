import { AuthService, Roles } from "@/auth/auth.service";
import { User } from "@/entity/user";
import { Bcrypt } from "@/helpers/bcrypt";
import { ValidationPipe } from "@/pipes/validation.pipe";
import { CreateUserRequest, PatchUserRequest } from "@/types/requests";
import {
  Inject,
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
  UseInterceptors,
  UploadedFile,
  FileInterceptor,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import * as multer from "multer";
import * as AWS from "aws-sdk";
import * as multerS3 from "multer-s3";
import { Client } from "minio";
import { MINIO_CONNECTION, NestMinioService } from "nestjs-minio";

// const s3 = new AWS.S3({
//     endpoint = "http://192.168.1.102:9000/";
//     accessKeyId: "andrix10",
//     secretAccessKey: "nbalife2",
//   });

// var minioClient = new Client({
//   endPoint: "127.0.0.1",
//   port: 9000,
//   useSSL: true,
//   accessKey: "andrix10",
//   secretKey: "nbalife2",
// });

@Controller("image")
export class ImageController {
  constructor(@Inject(MINIO_CONNECTION) private readonly minioClient) {}
  private readonly logger = new Logger(ImageController.name);

  @Post("upload")
  @Roles("Admin", "Regular")
  @UseGuards(AuthService)
  @UseInterceptors(FileInterceptor("image"))
  async imageUpload(@UploadedFile() image, @Res() res) {
    var metaData = {
      "Content-Type": "application/octet-stream",
      "X-Amz-Meta-Testing": 1234,
      example: 5678,
    };
    this.minioClient.fPutObject(
      "imageapi",
      "photos-europe.tar",
      image,
      metaData,
      (err, etag) => {
        if (err) {
          this.logger.log("Uploaded");
          return res.status(HttpStatus.CREATED).send();
        }
      },
    );
    //     let upload = multer({
    //       storage: multerS3({
    //         s3: s3,
    //         bucket: "imageapi",
    //         acl: "public-read",
    //         key: function(req, file, cb) {
    //           cb(null, `${Date.now().toString()} - ${file.originalname}`);
    //         },
    //       }),
    //     }).array("upload", 1);
    //     if (image === undefined || image === null) {
    //       this.logger.log("File is null or undefined");
    //       return res.status(HttpStatus.BAD_REQUEST).send();
    //     }
    //     this.logger.log("uploading");
    //     try {
    //       upload(image, res, error => {
    //         if (error) {
    //           this.logger.log("Failed to create.");
    //           return res.status(HttpStatus.BAD_REQUEST).send();
    //         }
    //         this.logger.log("Upload Success.");
    //         return res.status(HttpStatus.CREATED).send();
    //       });
    //     } catch (error) {
    //       this.logger.log("Failed");
    //       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    //       return;
    //     }
  }
}
