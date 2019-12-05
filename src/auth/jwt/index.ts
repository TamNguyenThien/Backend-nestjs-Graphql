import { sign, verify } from 'jsonwebtoken'
import { getMongoRepository } from 'typeorm'
import {
	AuthenticationError,
	ForbiddenError,
	ApolloError
} from 'apollo-server-core'

import { User } from '../../models'
import { LoginResponse } from '../../generator/graphql.schema'

import {
	ISSUER,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
	EMAIL_TOKEN_SECRET,
	RESETPASS_TOKEN_SECRET,
	AUDIENCE
} from '../../environments'
import { Service3A } from '@digihcs/3a'
import { parseErrors3A } from 'src/utils'

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
	return await sign(
		{
			_id: user._id
		},
		common[type].privateKey,
		{
			issuer: ISSUER!,
			subject: user.email,
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
): Promise<User> => {
	let currentUser

	const { errors, data } = await Service3A.userByToken(token)
	if (errors) {
		throw new ApolloError(parseErrors3A(errors))
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
export const tradeToken = async (user: User): Promise<LoginResponse> => {
	if (!user.isVerified) {
		throw new ForbiddenError('Please verify your email.')
	}

	if (!user.isActive) {
		throw new ForbiddenError("User already doesn't exist.")
	}

	if (user.isLocked) {
		throw new ForbiddenError('Your email has been locked.')
	}

	const accessToken = await generateToken(user, 'accessToken')
	const refreshToken = await generateToken(user, 'refreshToken')

	return { accessToken, refreshToken }
}
