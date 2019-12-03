import { Injectable, Logger } from '@nestjs/common'
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql'
import { MemcachedCache } from 'apollo-server-cache-memcached'
import { GraphQLExtension, AuthenticationError } from 'apollo-server-core'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import { getMongoRepository } from 'typeorm'
import chalk from 'chalk'
import schemaDirectives from './schemaDirectives'
import { verifyToken } from '../../auth'
import { END_POINT, ACCESS_TOKEN, NODE_ENV, FE_URL } from '../../environments'

@Injectable()
export class GraphqlService implements GqlOptionsFactory {
	async createGqlOptions(): Promise<GqlModuleOptions> {
		return {
			typePaths: ['./**/*.graphql'],
			resolvers: {
				JSON: GraphQLJSON,
				JSONObject: GraphQLJSONObject
			},
			resolverValidationOptions: {
				requireResolversForResolveType: false
			},
			path: `/${END_POINT!}`,
			cors:
				NODE_ENV === 'production'
					? {
							origin: FE_URL!,
							credentials: true // <-- REQUIRED backend setting
					  }
					: true,
			bodyParserConfig: { limit: '50mb' },
			onHealthCheck: () => {
				return new Promise((resolve, reject) => {
					if (true) {
						resolve()
					} else {
						reject()
					}
				})
			},
			schemaDirectives,
			introspection: true,
			playground: NODE_ENV !== 'production' && {
				settings: {
					'editor.cursorShape': 'underline', // possible values: 'line', 'block', 'underline'
					'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
					'editor.fontSize': 14,
					'editor.reuseHeaders': true, // new tab reuses headers from last tab
					'editor.theme': 'dark', // possible values: 'dark', 'light'
					'general.betaUpdates': true,
					'queryPlan.hideQueryPlanResponse': false,
					'request.credentials': 'include', // possible values: 'omit', 'include', 'same-origin'
					'tracing.hideTracingResponse': false
				}
			},
			// tracing: NODE_ENV !== 'production',
			// cacheControl: NODE_ENV === 'production' && {
			// 	defaultMaxAge: 5,
			// 	stripFormattedExtensions: false,
			// 	calculateHttpHeaders: false
			// },
			context: async ({ req, res, connection }) => {
				let currentUser
				const token = req.headers[ACCESS_TOKEN!] || ''
				// console.log('token', token)
				if (token) {
					currentUser = await verifyToken(token, 'accessToken')
				}

				return {
					req,
					res,
					currentUser,
				}
			},
			formatError: error => {
				return {
					message: error.message,
					code: error.extensions && error.extensions.code,
					locations: error.locations,
					path: error.path
				}
			},
			formatResponse: response => {
				return response
			},
			persistedQueries: {
				cache: new MemcachedCache(
					['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
					{ retries: 10, retry: 10000 } // Options
				)
			},
			installSubscriptionHandlers: true
		}
	}
}
