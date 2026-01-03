import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { VerificationStatus } from "../enums/verification-status.enum";

@Entity()
export class VerificationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Restaurant, restaurant => restaurant.verificationRequests, { 
    onDelete: 'CASCADE' 
  })
  restaurant: Restaurant;

  @ManyToOne(() => User, { 
    nullable: true,
    onDelete: 'SET NULL',
  })
  admin?: User;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
    nullable: false,
  })
  status: VerificationStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  rejectionReason?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt?: Date;
}