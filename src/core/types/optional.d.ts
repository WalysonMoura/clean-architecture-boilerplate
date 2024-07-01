/**
 * Make some property optional on type
 *
 * @example
 * ```typescript
 * type Post {
 *  id: string
 *  title: string
 *  email: string
 * }
 *
 * Optional<Post, 'id | 'email'>
 * ```
 * @param
 */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
