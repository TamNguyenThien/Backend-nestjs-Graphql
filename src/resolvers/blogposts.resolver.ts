import { Resolver, Args, Query } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError } from 'apollo-server-core'
import { BlogPost } from '../models'

@Resolver('Blogpost')
export class BlogpostResolver {
	@Query()
	async blogPosts(): Promise<BlogPost[]> {
		try {
			const blogPosts = await getMongoRepository(BlogPost).find({
				order: {
					createdAt: 'ASC',
					_id: 'ASC'
				}
			})
			return blogPosts
		} catch (err) {
			console.log(err)
		}
	}
	@Query()
	async blogPost(@Args('_id') _id: string): Promise<BlogPost> {
		try {
			const blogPost = await getMongoRepository(BlogPost).findOne({
				_id
			})

			if (!blogPost) {
				throw new ForbiddenError('Blogpost not found.')
			}

			return blogPost
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query()
	async getNextAndPrevPost(@Args('_id') _id: string): Promise<Object> {
		try {
			const currentPost = await getMongoRepository(BlogPost).findOne({
				_id
			})

			const prevPost = await getMongoRepository(BlogPost).find({
				where: {
					createdAt: {
						$lt: currentPost.createdAt
					}
				},
				order: {
					createdAt: 'DESC'
				},
				take: 1
			})

			const nextPost = await getMongoRepository(BlogPost).find({
				where: {
					createdAt: {
						$gt: currentPost.createdAt
					}
				},
				order: {
					createdAt: 'ASC'
				},
				take: 1
			})

			return {
				prevPost: prevPost.length === 1 ? prevPost[0] : null,
				nextPost: nextPost.length === 1 ? nextPost[0] : null
			}
		} catch (err) {
			throw new ApolloError(err)
		}
	}
}
