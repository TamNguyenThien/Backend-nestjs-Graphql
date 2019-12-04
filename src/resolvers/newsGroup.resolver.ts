import { Resolver, Args, Query } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError } from 'apollo-server-core'
import { NewsGroup } from '../models'

@Resolver('NewsGroup')
export class NewsGroupResolver {
	@Query()
	async newsGroups(): Promise<NewsGroup[]> {
		try {
			const newsGroups = await getMongoRepository(NewsGroup).find({})
			return newsGroups
		} catch (err) {
			console.log(err)
		}
	}
	@Query()
	async newsGroup(@Args('_id') _id: string): Promise<NewsGroup> {
		try {
			const newsGroup = await getMongoRepository(NewsGroup).findOne({
				_id
			})

			if (!newsGroup) {
				throw new ForbiddenError('NewsGroup not found.')
			}

			return newsGroup
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
