import { Resolver, Query, Args } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError } from 'apollo-server-core'
import { DiseaseGroup } from '../models'

@Resolver('DiseaseGroup')
export class DiseaseGroupResolver {
	@Query()
	async diseaseGroups(): Promise<DiseaseGroup[]> {
		try {
			const diseaseGroups = await getMongoRepository(DiseaseGroup).find({})
			return diseaseGroups
		} catch (err) {
			console.log(err)
		}
	}

	@Query()
	async diseaseGroup(@Args('_id') _id: string): Promise<DiseaseGroup> {
		try {
			const diseaseGroup = await getMongoRepository(DiseaseGroup).findOne({
				_id
			})

			if (!diseaseGroup) {
				throw new ForbiddenError('DiseaseGroup not found.')
			}

			return diseaseGroup
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
