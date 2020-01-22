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
import { isAlphanumeric } from "validator";
const regx = /^(?!.*\\..*\\..*)[A-Za-z]([A-Za-z0-9.]*[A-Za-z0-9])?$/;

// const s3 = new AWS.S3({
//     accessKeyId: "andrix10",
//     secretAccessKey: "nbalife2",
//   });

@Controller("image")
export class ImageController {
  constructor(@Inject(MINIO_CONNECTION) private readonly minioClient) {}
  private readonly logger = new Logger(ImageController.name);

  @Post("upload")
  @Roles("Admin", "Regular")
  @UseGuards(AuthService)
  @UseInterceptors(FileInterceptor("image"))
  async imageUpload(@Req() req, @UploadedFile() image, @Res() res) {
    if (!regx.test(image.originalname)) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    if (image === undefined || image === null) {
      this.logger.log("Image file is null or undefined");
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }

    const filename = `${req.user.username}/${image.originalname}`;
    try {
      await this.minioClient.putObject("imageapi", filename, image.buffer);
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).send();
    }

    this.logger.log("Uploaded");
    return res.status(HttpStatus.CREATED).send();
  }

  @Get("bucket")
  @Roles("Admin", "Regular")
  @UseGuards(AuthService)
  async showBuckets(@Req() req, @Res() res) {
    const buckets = await this.minioClient.listBuckets();

    if (buckets === undefined || buckets === null) {
      this.logger.log("There are no buckets.");
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    return res.send(buckets);
  }

  @Get()
  @Roles("Admin", "Regular")
  @UseGuards(AuthService)
  async listImages(@Req() req, @Res() res) {
    const prefix = `${req.user.username}/`;
    const stream = await this.minioClient.listObjects("imageapi", prefix, true);

    const buf = await new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", chunk => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(chunks));
    });

    if (buf === null) {
      this.logger.log("Error.");
      return res.status(HttpStatus.BAD_REQUEST).send(buf);
    }

    return res.status(HttpStatus.CREATED).send(buf);
  }

  @Get(":name")
  @Roles("Admin")
  @UseGuards(AuthService)
  async getImage(@Param("name") name, @Res() res) {
    if (!regx.test(name)) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    this.logger.log("Getting " + name);
    let stream;

    try {
      stream = await this.minioClient.getObject("imageapi", name);
    } catch (error) {
      this.logger.log("No image " + name);
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    const image = await new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", imageChunk => chunks.push(imageChunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    if (image === null) {
      this.logger.log("Error.");
      return res.status(HttpStatus.BAD_REQUEST).send(image);
    }

    return res.status(HttpStatus.OK).send(image);
  }

  @Delete(":name")
  @Roles("Admin")
  @UseGuards(AuthService)
  async deleteImage(@Req() req, @Param("name") name, @Res() res) {
    if (!regx.test(name)) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    const filename = `${req.user.username}/${name}`;
    this.logger.log("Deleting " + name);
    const list = [];
    list.push(filename);

    try {
      await this.minioClient.removeObjects("imageapi", list);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(name);
    }

    return res.status(HttpStatus.OK).send();
  }
}
