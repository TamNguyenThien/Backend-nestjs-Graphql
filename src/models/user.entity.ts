import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Exclude, Expose, plainToClass } from 'class-transformer'

@Entity({
	name: 'users',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class User {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	firstname: string

	@Expose()
	@Column()
	lastname: string

	@Expose()
	@Column()
	resetPasswordToken: string

	@Expose()
	@Column()
	resetPasswordExpires: number

	@Expose()
	@Column()
	username: string

	@Expose()
	@Column()
	email: string

	@Expose()
	@Column()
	password: string

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	isLocked: boolean

	@Expose()
	@Column()
	isVerified: boolean

	@Expose()
	@Column()
	createdAt: number
	@Expose()
	@Column()
	updatedAt: number

	constructor(user: Partial<User>) {
		if (user) {
			Object.assign(
				this,
				plainToClass(User, user, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.isVerified = this.isVerified !== undefined ? this.isVerified : true
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
			this.isActive = this.isActive !== undefined ? this.isActive : true
		}
	}
}
