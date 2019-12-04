import { Entity, ObjectIdColumn, Column } from 'typeorm'
import { Expose, plainToClass } from 'class-transformer'

enum Type {
	TYPENEWS,
	LAST,
	SPECIALTY
}

@Entity({
	name: 'newsGroup',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class NewsGroup {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	parent: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	type: Type

	@Expose()
	@Column()
	count: string

	@Expose()
	@Column()
	countChildFolder: number

	constructor(newsGroup: Partial<NewsGroup>) {
		if (newsGroup) {
			Object.assign(
				this,
				plainToClass(NewsGroup, newsGroup, {
					excludeExtraneousValues: true
				})
			)
		}
	}
}
