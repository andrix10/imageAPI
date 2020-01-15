import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  ObjectIdColumn,
  ObjectID,
} from "typeorm";

@Entity()
export class User {
  @ObjectIdColumn()
  id!: ObjectID;

  @Column()
  username!: string;

  @Column({ select: false, nullable: false })
  password!: string;

  @Column({ nullable: false, default: "Regular" })
  accessLevel!: string;
}
