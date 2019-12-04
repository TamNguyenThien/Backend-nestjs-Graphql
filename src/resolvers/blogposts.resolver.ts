import { Resolver, Args, Query } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError } from 'apollo-server-core'
import { BlogPosts } from '../models'

@Resolver('Blogposts')
export class BlogpostsResolver {
	// constructor(
	// 	private readonly medicalSpecialitiesResolver: MedicalSpecialitiesResolver
	// ) {}
	@Query()
	async medicalSpecialities(): Promise<BlogPosts[]> {
		try {
			const blogPosts = await getMongoRepository(BlogPosts).find({})
			return blogPosts
		} catch (err) {
			console.log(err)
		}
	}
	@Query()
	async medicalSpecialitie(@Args('_id') _id: string): Promise<BlogPosts> {
		try {
			const blogPost = await getMongoRepository(BlogPosts).findOne({
				_id
			})

			if (!blogPost) {
				throw new ForbiddenError('Medical Specialities not found.')
			}

			return blogPost
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
