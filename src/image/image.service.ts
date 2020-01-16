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

const imageapi = "imageapi";
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: "andrix10",
  secretAccessKey: "nbalife2",
});

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  //   async fileupload(@Req() req, @Res() res) {
  //     try {
  //       this.upload(req, res, () => error ) {
  //         if (error) {
  //           console.log(error);
  //           return res.status(404).json(`Failed to upload image file: ${error}`);
  //         }
  //         return res.status(201).json(req.files[0].location);
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       return res.status(500).json(`Failed to upload image file: ${error}`);
  //     }
  //   }

  @UseInterceptors(FileInterceptor("image"))
  uploadFile(@UploadedFile() image, @Res() res) {
    let upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: imageapi,
        acl: "public-read",
        key: function(request, file, cb) {
          cb(null, `${Date.now().toString()} - ${file.originalname}`);
        },
      }),
    }).array("upload", 1);

    if (image === undefined || image === null) {
      this.logger.log("File is null or undefined");
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    this.logger.log("uploading");

    try {
      upload(image, res, error => {
        if (error) {
          this.logger.log("Failed to create.");
          return res.status(HttpStatus.BAD_REQUEST).send();
        }
        this.logger.log("Upload Success.");
        return res.status(HttpStatus.CREATED).send();
      });
    } catch (error) {
      this.logger.log("Failed");
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      return;
    }
  }
}
