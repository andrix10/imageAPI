import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  username!: string;

  @Column({ select: false, nullable: false })
  password!: string;

  @Column({ name: "access_level", nullable: false, default: "Regular" })
  accessLevel!: string;
}
