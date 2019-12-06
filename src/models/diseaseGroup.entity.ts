import { Entity, ObjectIdColumn, Column } from 'typeorm'
import { Expose, plainToClass } from 'class-transformer'
import { User } from './index'

@Entity({
	name: 'diseaseGroups',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class DiseaseGroup {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	__v: number

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	createdBy: User

	constructor(diseaseGroup: Partial<DiseaseGroup>) {
		if (diseaseGroup) {
			Object.assign(
				this,
				plainToClass(DiseaseGroup, diseaseGroup, {
					excludeExtraneousValues: true
				})
			)
		}
	}
}
