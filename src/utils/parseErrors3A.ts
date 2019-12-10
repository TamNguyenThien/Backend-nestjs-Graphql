import { GraphqlError as GraphqlError3A } from '@digihcs/3a'

export const parseErrors3A = errors => {
  if (errors['code'] === 'ECONNREFUSED' || errors['code'] === 'EINVAL') {
    return 'Không thể kết nối service3A!'
  }
  if (errors.constructor.name === 'Error') {
    return 'Có lỗi xảy ra!'
  }
  return (errors as GraphqlError3A[]).map(err => err.message).join(', ')
}
