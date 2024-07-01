import { UseCaseError } from '@/core/types/use-case-error'

export class NotAllowedError extends Error implements UseCaseError {
  constructor() {
    super('Not Allowed')
  }
}
