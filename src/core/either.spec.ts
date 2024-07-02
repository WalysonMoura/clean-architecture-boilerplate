import { expect, test } from 'vitest'

import { Either, left, right } from './either'

function doSomeThing(
  shouldsuccess: boolean
): Either<Error, { success: 'success' }> {
  if (shouldsuccess) {
    return right({ success: 'success' })
  }
  return left(new Error('error'))
}
test('success result', async () => {
  const result = doSomeThing(true)

  expect(result.isRight()).toBe(true)
  expect(result.isLeft()).toBe(false)
  if (result.isRight()) {
    expect(result.value.success).toBe('success')
  }
})

test('fail result', async () => {
  const result = doSomeThing(false)

  if (result.isLeft()) {
    expect(result.value.message).toBe('error')
  } else {
    throw new Error('Expected Left but got Right')
  }
})
