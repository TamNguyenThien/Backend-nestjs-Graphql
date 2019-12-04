import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError, AuthenticationError } from 'apollo-server-core'
import { generateToken, verifyToken, tradeToken } from '../auth'
import {
	CreateUserInput,
	UpdateUserInput,
	LoginUserInput,
	LoginResponse,
	RefreshTokenResponse,
	Type
} from '../generator/graphql.schema'
import { Service3A, GraphqlError as GraphqlError3A } from '@digihcs/3a'
import { comparePassword, hashPassword } from '../utils'
import { EmailResolver } from './email.resolver'
import { USER_SUBSCRIPTION } from '../environments'
import { sendMail } from '../shared'
import { User } from '../models'

@Resolver('User')
export class UserResolver {
	constructor(
		private readonly emailResolver: EmailResolver,
	) { }
	@Query()
	async hello() {
		return 'world'
	}
	@Query()
	async today(): Promise<Date> {
		return new Date()
	}
	@Query()
	async users(
	): Promise<User[]> {
		const users = await getMongoRepository(User).find({
			isActive: true, // 1000: 60000 / 1 minute
		})
		return users
	}
	@Query()
	async user(@Args('_id') _id: string): Promise<User> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })

			if (!user) {
				throw new ForbiddenError('User not found.')
			}

			return user
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async createUser(
		@Args('input') input: CreateUserInput,
		@Context('pubsub') pubsub: any,
		@Context('req') req: any
	): Promise<User> {
		try {
			const { firstName, lastName, username, email, password } = input

			let existedUser

			existedUser = await getMongoRepository(User).findOne({
				where: {
					'email': email
				}
			})
			if (existedUser) {
				throw new ForbiddenError('User already exists.')
			}

			// Is there a Google account with the same email?
			if (existedUser) {
				const updateUser = await getMongoRepository(User).save(
					new User({
						...input,
						username,
						firstName,
						lastName,
						email,
						password: await hashPassword(password)
					})
				)

				return updateUser
			}

			const createdUser = await getMongoRepository(User).save(
				new User({
					...input,
					firstName,
					lastName,
					username,
					isVerified: false,
					email,
					password: await hashPassword(password)
				})
			)
			const emailToken = await generateToken(createdUser, 'emailToken')
			const existedEmail = await this.emailResolver.createEmail({
				userId: createdUser._id,
				type: Type.VERIFY_EMAIL
			})
			// console.log(emailToken, existedEmail)
			await sendMail(
				'verifyEmail',
				createdUser,
				req,
				emailToken,
				existedEmail._id
			)
			return createdUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async verifyEmail(@Args('emailToken') emailToken: string): Promise<boolean> {
		// const user = await verifyEmailToken(emailToken)
		const user = await verifyToken(emailToken, 'emailToken')

		console.log(user)

		if (!user.isVerified) {
			const updateUser = await getMongoRepository(User).save(
				new User({
					...user,
					isVerified: true
				})
			)
			return updateUser ? true : false
		} else {
			throw new ForbiddenError('Your email has been verified.')
		}
	}
	@Mutation()
	async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
		const { username, password } = input
		try {
			const { errors, data } = await Service3A.login({
				username,
				password
			})
			if (errors) {
				if (errors['code'] === 'ECONNREFUSED' || errors['code'] === 'EINVAL') {
					throw new ApolloError('Không thể kết nối service3A!')
				}

				if (errors.constructor.name === 'Error') {
					throw new ApolloError('Có lỗi xảy ra!')
				}

				throw new ApolloError(
					(errors as GraphqlError3A[]).map(err => err.message).join(', ')
				)
			}
			return { accessToken: data.token, refreshToken: '' }

		} catch (err) {
			return err
		}
	}
	@Mutation()
	async forgotPassword(
		@Args('email') email: string,
		@Context('req') req: any
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({
			where: {
				'email': email,
				isVerified: true
			}
		})

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		const resetPassToken = await generateToken(user, 'resetPassToken')

		const existedEmail = await this.emailResolver.createEmail({
			userId: user._id,
			type: Type.FORGOT_PASSWORD
		})

		// console.log(existedEmail)

		await sendMail(
			'forgotPassword',
			user,
			req,
			resetPassToken,
			existedEmail._id
		)

		const date = new Date()

		const updateUser = await getMongoRepository(User).save(
			new User({
				...user,
				resetPasswordToken: resetPassToken,
				resetPasswordExpires: date.setHours(date.getHours() + 1) // 1 hour
			})
		)

		return updateUser ? true : false
	}
	@Mutation()
	async updateUser(
		@Args('_id') _id: string,
		@Args('input') input: UpdateUserInput
	): Promise<boolean> {
		try {
			const { password } = input
			const user = await getMongoRepository(User).findOne({ _id })
			if (!user) {
				throw new ForbiddenError('User not found.')
			}
			const updateUser = await await getMongoRepository(User).save(
				new User({
					...user,
					...input,
					password: await hashPassword(password)
				})
			)

			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async deleteUser(
		@Args('_id') _id: string
	): Promise<boolean> {
		try {
			const user = await getMongoRepository(User).findOne({ _id })
			if (!user) {
				throw new ForbiddenError('User not found')
			}
			const updateUser = await getMongoRepository(User).save(
				new User({
					...user,
					isActive: false
				})
			)
			return updateUser ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async changePassword(
		@Args('_id') _id: string,
		@Args('currentPassword') currentPassword: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({ _id })

		console.log(currentPassword, password)

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		if (!(await comparePassword(currentPassword, user.password))) {
			throw new ForbiddenError('Your current password is missing or incorrect.')
		}

		if (await comparePassword(password, user.password)) {
			throw new ForbiddenError(
				'Your new password must be different from your previous password.'
			)
		}

		const updateUser = await getMongoRepository(User).save(
			new User({
				...user,
				password: await hashPassword(password)
			})
		)

		return updateUser ? true : false
	}

	@Mutation()
	async resetPassword(
		@Args('resetPasswordToken') resetPasswordToken: string,
		@Args('password') password: string
	): Promise<boolean> {
		const user = await getMongoRepository(User).findOne({
			resetPasswordToken
		})

		if (!user) {
			throw new ForbiddenError('User not found.')
		}

		if (user.resetPasswordExpires < Date.now()) {
			throw new AuthenticationError(
				'Reset password token is invalid, please try again.'
			)
		}

		const updateUser = await getMongoRepository(User).save(
			new User({
				...user,
				email: user.email,
				password: await hashPassword(password),
				resetPasswordToken: null,
				resetPasswordExpires: null
			})
		)

		return updateUser ? true : false
	}

}
