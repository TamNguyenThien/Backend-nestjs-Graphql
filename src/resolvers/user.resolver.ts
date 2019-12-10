import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ApolloError, ForbiddenError, AuthenticationError } from 'apollo-server-core'
import { generateToken, verifyToken } from '../auth'
import {
	CreateUserInput,
	UpdateUserInput,
	LoginUserInput,
	LoginResponse,
	Type
} from '../generator/graphql.schema'
import { Service3A, GraphqlError as GraphqlError3A } from '@digihcs/3a'
import { comparePassword, hashPassword } from '../utils'
import { EmailResolver } from './email.resolver'
import { sendMail } from '../shared'
import { User } from '../models'
import { parseErrors3A } from '../utils/parseErrors3A'

@Resolver('User')
export class UserResolver {
	[x: string]: any
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
	// @Query()
	// async users(
	// ): Promise<User[]> {
	// 	// const users = await getMongoRepository(User).find({
	// 	// 	isActive: true, // 1000: 60000 / 1 minute

	// 	// })
	// 	const {data, errors} = await Service3A.users([])
	// 	console.log(data)
	// 	return []
	// }
	@Query('users')
  async users(
	): Promise<User[]> {
    try {
      const { data, errors } = await Service3A.users([
			])
      if (errors) {
        throw errors
        // throw this.err.Apollo(parseErrors3A(errors))
      }
      const res = data.map(user => {
    const value = user.typeValue === 'object' ? JSON.parse(user.value) : {}
    if (user.typeValue === 'object') {
          return {
            _id: user._id,
            username: user.username,
            email: value.email,
            firstname: value.firstname,
            lastname: value.lastname,
            isLocked: value.isLocked,
            isVerified: value.isVerified,
            password: value.password  || null,
            isActive: value.isActive || null,
            createdAt: value.createdAt  || null,
            updatedAt: value.updatedAt  || null,
            resetPasswordToken: value.resetPasswordToken  || null,
            resetPasswordExpires: value.resetPasswordExpires  || null
          }
        }
    return {
          _id: user._id,
					username: user.username,
					email: value.email,
					firstname: value.firstname,
					lastname: value.lastname,
					isLocked: value.isLocked,
					isVerified: value.isVerified,
					password: value.password  || null,
					isActive: value.isActive  || null,
          createdAt: value.createdAt  || null,
          updatedAt: value.updatedAt  || null,
          resetPasswordToken: value.resetPasswordToken  || null,
          resetPasswordExpires: value.resetPasswordExpires  || null
        }
      })
			console.log(res)
			return res
    } catch (error) {
      // return this.err.Apollo(error)
      return error
    }
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
	@Mutation('createUser')
  async createUser(
		@Args('input') input: CreateUserInput,
		@Context('req') req: any
  ): Promise<boolean> {
    try {
      const { username, password, firstname, lastname, email } = input
      if (
        !/^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/g.test(
          email
        )
      ) {
        throw this.err.UserInput('Địa chỉ email không hợp lệ!')
      }
      const { data, errors } = await Service3A.createUser({
        username,
        password,
        typeValue: 'object',
        value: JSON.stringify({
          firstname,
					lastname,
          email,
          isLocked: false,
					isVerified: false,
					isActive: true,
					resetPasswordToken: null,
					resetPasswordExpires: null
        }),
        role: null
			})
			   const user = await Service3A.users([
				data
				])
				console.log(user.data[0])
				const emailToken = await generateToken(user.data[0], 'emailToken')
			   const existedEmail = await this.emailResolver.createEmail({
				userId: data,
				type: Type.VERIFY_EMAIL
			})
			   await sendMail(
				'verifyEmail',
				user.data[0],
				req,
				emailToken,
				existedEmail._id
			)
      if (errors) {
				return this.err.Apollo(parseErrors3A(errors))
				// return false
      }

      if (data) {
        return true
      }
    } catch (err) {
			// return this.err.Apollo(err)
			return err
    }
  }
	@Mutation()
	async updateUser(
		@Args('_id') _id: string,
		@Args('input') input: UpdateUserInput
	): Promise<boolean> {
		try {
			const {data, errors} = await Service3A.updateUser(
				_id,
				'updateInfo',
				input
			)
			console.log(data)
			// const user = await getMongoRepository(User).findOne({ _id })
			// if (!user) {
			// 	throw new ForbiddenError('User not found.')
			// }
			// const updateUser = await await getMongoRepository(User).save(
			// 	new User({
			// 		...user,
			// 		...input,
			// 		password: await hashPassword(password)
			// 	})
			// )
			// return updateUser ? true : false
			// console.log(data)
			if (data) {
				return true
			}
			if (errors) {
				return false
			}
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async deleteUser(
		@Args('_id') _id: string
	): Promise<boolean> {
		try {
			const {errors, data} = await Service3A.deleteUsers([
				_id
			])
			if (errors) {
				// return this.err.Apollo(parseErrors3A(errors))
				return false
      }
   if (data) {
        return true
      }
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	// @Mutation()
	// async verifyEmail(@Args('emailToken') emailToken: string): Promise<boolean> {
	// 	// const user = await verifyEmailToken(emailToken)
	// 	const user = await verifyToken(emailToken, 'emailToken')

	// 	console.log(user)

	// 	if (!user.isVerified) {
	// 		const updateUser = await getMongoRepository(User).save(
	// 			new User({
	// 				...user,
	// 				isVerified: true
	// 			})
	// 		)
	// 		return updateUser ? true : false
	// 	} else {
	// 		throw new ForbiddenError('Your email has been verified.')
	// 	}
	// }
	@Mutation()
	async forgotPassword(
		@Args('email') email: string,
		@Context('req') req: any
	): Promise<boolean> {
		// const user = await getMongoRepository(User).findOne({
		// 	where: {
		// 		'email': email,
		// 		isVerified: true
		// 	}
		// })
		const { data, errors } = await Service3A.users([
		])
		const users = data.map(user => {
			const value = user.typeValue === 'object' ? JSON.parse(user.value) : {}
			if (user.typeValue === 'object') {
						return {
							_id: user._id,
							username: user.username,
							email: value.email,
							firstname: value.firstname,
							lastname: value.lastname,
							isLocked: value.isLocked,
							isVerified: value.isVerified,
							password: value.password  || null,
							isActive: value.isActive || null,
							createdAt: value.createdAt  || null,
							updatedAt: value.updatedAt  || null,
							resetPasswordToken: value.resetPasswordToken  || null,
							resetPasswordExpires: value.resetPasswordExpires  || null
						}
					}
			return {
						_id: user._id,
						username: user.username,
						email: value.email,
						firstname: value.firstname,
						lastname: value.lastname,
						isLocked: value.isLocked,
						isVerified: value.isVerified,
						password: value.password  || null,
						isActive: value.isActive  || null,
						createdAt: value.createdAt  || null,
						updatedAt: value.updatedAt  || null,
						resetPasswordToken: value.resetPasswordToken  || null,
						resetPasswordExpires: value.resetPasswordExpires  || null
					}
				})
		if (!users) {
			throw new ForbiddenError('User not found.')
		}
		const user = users.filter(a => a.email === email)
		console.log(user[0])
		// const resetPassToken = await generateToken(user[0], 'resetPassToken')
		// console.log(resetPassToken)

		const existedEmail = await this.emailResolver.createEmail({
			userId: user[0]._id,
			type: Type.FORGOT_PASSWORD
		})

		console.log(existedEmail)

		// await sendMail(
		// 	'forgotPassword',
		// 	user[0],
		// 	req,
		// 	resetPassToken,
		// 	existedEmail._id
		// )
		// const date = new Date()
		// const updateUser = await getMongoRepository(User).save(
		// 	new User({
		// 		...user,
		// 		resetPasswordToken: resetPassToken,
		// 		resetPasswordExpires: date.setHours(date.getHours() + 1) // 1 hour
		// 	})
		// )
		// return updateUser ? true : false
		return true
	}
	@Mutation()
	async changePassword(
		@Args('username') username: string,
		@Args('password') password: string
	): Promise<boolean> {
		try {
			const {data, errors} = await Service3A.resetPassword(
				username,
				password
			)
			if (data) {
				return true
			}
			if (errors) {
				return false
			}
		} catch (err) {
			return err
		}
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
