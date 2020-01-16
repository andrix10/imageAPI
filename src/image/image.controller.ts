import { AuthService, Roles } from "@/auth/auth.service";
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
} from "@nestjs/common";
import * as multer from "multer";
import * as AWS from "aws-sdk";
import * as multerS3 from "multer-s3";
import { MINIO_CONNECTION, NestMinioService } from "nestjs-minio";
import { FileInterceptor } from "@nestjs/platform-express";
import {} from "stream-to-array";

// const s3 = new AWS.S3({
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
    // this.logger.log(JSON.stringify(image));
    if (image === undefined || image === null) {
      this.logger.log("Image file is null or undefined");
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    await this.minioClient.putObject(
      "imageapi",
      image.originalname,
      image.buffer,
      (err, etag) => {
        if (err) {
          return res.status(HttpStatus.CONFLICT).send();
        }
        this.logger.log("Uploaded");
        return res.status(HttpStatus.CREATED).send();
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

  @Get("bucket")
  @Roles("Admin", "Regular")
  @UseGuards(AuthService)
  async showBuckets(@Req() req, @Res() res) {
    // this.logger.log(JSON.stringify(image));
    await this.minioClient.listBuckets((err, buckets) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
      if (buckets === undefined || buckets === null) {
        this.logger.log("There are no buckets.");
        return res.status(HttpStatus.BAD_REQUEST).send();
      }
      this.logger.log("buckets :", JSON.stringify(buckets));
      return res.send(buckets);
    });
  }
}
