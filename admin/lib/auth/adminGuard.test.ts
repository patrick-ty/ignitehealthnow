import { describe, it, expect } from 'vitest'
import { resolveAccess } from './adminGuard'

describe('resolveAccess', () => {
  it('ok only when admin', () => {
    expect(resolveAccess({ admin: true, email: 'a@x.com' })).toBe('ok')
    expect(resolveAccess({ admin: false, email: 'a@x.com' })).toBe('denied')
    expect(resolveAccess(null)).toBe('denied')
  })
})
