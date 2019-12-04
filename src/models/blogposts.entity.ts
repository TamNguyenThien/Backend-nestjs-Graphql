import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'

@Entity({
	name: 'blogposts',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class BlogPosts {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	title: string

	@Expose()
	@Column()
	sourceUrl: string

	@Expose()
	@Column()
	medicalSpeciality: object

	@Expose()
	@Column()
	specializeds: string

	@Expose()
	@Column()
	newsType: string

	@Expose()
	@Column()
	diseaseGroup: object

	@Expose()
	@Column()
	content: string

	@Expose()
	@Column()
	state: number

	@Expose()
	@Column()
	newsGroup: any[]

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	history: any[]

	constructor(blogposts: Partial<BlogPosts>) {
		if (blogposts) {
			Object.assign(
				this,
				plainToClass(BlogPosts, blogposts, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.createdAt = this.createdAt || +new Date()
			// this.updatedAt = +new Date()
			// this.isActive = this.isActive !== undefined ? this.isActive : true
		}
	}
}
