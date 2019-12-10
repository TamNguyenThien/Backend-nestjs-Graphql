import { sign, verify } from 'jsonwebtoken'
import { getMongoRepository } from 'typeorm'
import {
	AuthenticationError,
	ForbiddenError,
	ApolloError
} from 'apollo-server-core'

import { Service3A, GraphqlError as GraphqlError3A } from '@digihcs/3a'
// import { User } from '../../models'
import { User } from "/home/thientam/js/mdnews-backend/node_modules/@digihcs/3a/dist/types"
import { LoginResponse } from '../../generator/graphql.schema'

import {
	ISSUER,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
	EMAIL_TOKEN_SECRET,
	RESETPASS_TOKEN_SECRET,
	AUDIENCE
} from '../../environments'
<<<<<<< HEAD
import { userInfo } from 'os'
=======
import { Service3A } from '@digihcs/3a'
import { parseErrors3A } from 'src/utils'
>>>>>>> 7d460194363a5970139309ff611bde9d61416e87

type TokenType =
	| 'accessToken'
	| 'refreshToken'
	| 'emailToken'
	| 'resetPassToken'

const common = {
	accessToken: {
		privateKey: ACCESS_TOKEN_SECRET!,
		signOptions: {
			expiresIn: '30d' // 15m
		}
	},
	refreshToken: {
		privateKey: REFRESH_TOKEN_SECRET!,
		signOptions: {
			expiresIn: '7d' // 7d
		}
	},
	emailToken: {
		privateKey: EMAIL_TOKEN_SECRET!,
		signOptions: {
			expiresIn: '1d' // 1d
		}
	},
	resetPassToken: {
		privateKey: RESETPASS_TOKEN_SECRET!,
		signOptions: {
			expiresIn: '1d' // 1d
		}
	}
}
/**
 * Returns token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param user - 1st input
 * @param type - 2nd input
 *
 * @returns The access token mean of `user`
 *
 * @beta
 */
export const generateToken = async (
	user: User,
	type: TokenType
): Promise<string> => {
	// const value = JSON.parse(user.value)
	// const email = value.email
	return await sign(
		{
			_id: user._id
		},
		common[type].privateKey,
		{
			issuer: ISSUER!,
			subject: user.value,
			audience: AUDIENCE!,
			algorithm: 'HS256',
			expiresIn: common[type].signOptions.expiresIn // 15m
		}
	)
}
/**
 * Returns user by verify token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param token - 1st input
 * @param type - 2nd input
 *
 * @returns The user mean of `token`
 *
 * @beta
 */
export const verifyToken = async (
	token: string,
	type: TokenType
): Promise<Boolean> => {
	let currentUser

<<<<<<< HEAD
	const { data, errors } = await Service3A.verifyToken(
		token
	)
	// await verify(token, common[type].privateKey, async (err, data) => {
	// 	if (err) {
	// 		throw new AuthenticationError(
	// 			'Authentication token is invalid, please try again.'
	// 		)
	// 	}
	// 	currentUser = await getMongoRepository(User).findOne({
	// 		_id: data._id
	// 	})
	// })

	// if (type === 'emailToken') {
	// 	return currentUser
	// }
	if (data) {
		return true
	}
	if (errors) {
		return false
=======
	const { errors, data } = await Service3A.userByToken(token)
	if (errors) {
		throw new ApolloError(parseErrors3A(errors))
>>>>>>> 7d460194363a5970139309ff611bde9d61416e87
	}

	const value = data.typeValue === 'object' ? JSON.parse(data.value) : {}
	if (data.typeValue === 'object') {
		currentUser = {
			_id: data._id,
			username: data.username,
			email: value.email,
			firstname: value.firstname,
			lastname: value.lastname,
			isLocked: value.isLocked,
			isVerified: value.isVerified
		}
	} else {
		currentUser = {
			_id: data._id,
			username: data.username
		}
	}

	// await verify(token, common[type].privateKey, async (err, data) => {
	// 	if (err) {
	// 		throw new AuthenticationError(
	// 			'Authentication token is invalid, please try again.'
	// 		)
	// 	}
	// 	currentUser = await getMongoRepository(User).findOne({
	// 		_id: data._id
	// 	})
	// })

	// if (type === 'emailToken') {
	// 	return currentUser
	// }
	// if (currentUser && !currentUser.isVerified) {
	// 	throw new ForbiddenError('Please verify your email.')
	// }

	return currentUser
}

/**
 * Returns login response by trade token.
 *
 * @remarks
 * This method is part of the {@link auth/jwt}.
 *
 * @param user - 1st input
 *
 * @returns The login response mean of `user`
 *
 * @beta
 */
// export const tradeToken = async (user: User): Promise<LoginResponse> => {
// 	if (!user.isVerified) {
// 		throw new ForbiddenError('Please verify your email.')
// 	}

<<<<<<< HEAD
// 	if (!user.isActive) {
// 		throw new ForbiddenError('User already doesn\'t exist.')
// 	}
=======
	if (!user.isActive) {
		throw new ForbiddenError("User already doesn't exist.")
	}
>>>>>>> 7d460194363a5970139309ff611bde9d61416e87

// 	if (user.isLocked) {
// 		throw new ForbiddenError('Your email has been locked.')
// 	}

// 	const accessToken = await generateToken(user, 'accessToken')
// 	const refreshToken = await generateToken(user, 'refreshToken')

// 	return { accessToken, refreshToken }
// }
