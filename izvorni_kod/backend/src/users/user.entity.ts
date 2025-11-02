import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from './enums/userRole.enum';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,  // prebacit u true
    })
    //@Exclude() i ?
    password: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    @Exclude()
    googleId?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        nullable: false,
        default: UserRole.user,
    })
    userRole: UserRole;
}