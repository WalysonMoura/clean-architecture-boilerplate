/**
 * Error
 */
export class Left<L, R> {
  readonly value: L

  constructor(value: L) {
    this.value = value
  }

  isRight(): this is Right<L, R> {
    return false
  }

  isLeft(): this is Left<L, R> {
    return true
  }
}

/**
 * Success
 */
export class Right<L, R> {
  readonly value: R

  constructor(value: R) {
    this.value = value
  }

  isRight(): this is Right<L, R> {
    return true
  }

  isLeft(): this is Left<L, R> {
    return false
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>

/**
 * @template L - O tipo do valor de erro.
 * @template R - O tipo do valor de sucesso.
 *
 * @param {L} value - O valor de erro que está sendo encapsulado.
 * @returns {Either<L, R>} Uma instância de `Either` contendo o valor de erro encapsulado em `Left`.
 */
export function left<L, R>(value: L): Either<L, R> {
  return new Left(value)
}
/**
 * @template L - O tipo do valor de erro.
 * @template R - O tipo do valor de sucesso.
 *
 * @param {R} value - O valor de sucesso que está sendo encapsulado.
 * @returns {Either<L, R>} Uma instância de `Either` contendo o valor de sucesso encapsulado em `Right`.
 */
export function right<L, R>(value: R): Either<L, R> {
  return new Right(value)
}
