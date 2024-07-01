import { describe, expect, it } from 'vitest'

import { WatchedList } from './watched-list'

class NumberWatcherList extends WatchedList<string> {
  compareItems(a: string, b: string): boolean {
    return a === b
  }
}

describe('Watched List', () => {
  it('should be able to create a watched list initial items', () => {
    const list = new NumberWatcherList(['apple', 'orange', 'watermelon'])

    expect(list.getItems()).toEqual(['apple', 'orange', 'watermelon'])
    expect(list.currentItems).toHaveLength(3)
  })

  it('should be able to remove items from the list', async () => {
    const list = new NumberWatcherList(['apple', 'orange', 'watermelon'])

    list.remove('apple')

    expect(list.getItems()).toEqual(['orange', 'watermelon'])
    expect(list.currentItems).toHaveLength(2)
    expect(list.getRemovedItems()).toEqual(['apple'])
  })

  it('should be able to add an item evem if it was removed before', async () => {
    const list = new NumberWatcherList(['apple', 'orange', 'watermelon'])

    list.remove('apple')
    list.add('apple')

    expect(list.getItems()).toEqual(
      expect.arrayContaining(['apple', 'orange', 'watermelon'])
    )

    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('should be able to remove an item even if it was added before', async () => {
    const list = new NumberWatcherList(['apple', 'orange', 'watermelon'])

    list.add('strawberry')
    list.remove('strawberry')

    expect(list.getItems()).toEqual(
      expect.arrayContaining(['apple', 'orange', 'watermelon'])
    )
    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('should be able to update the list', async () => {
    const list = new NumberWatcherList(['apple', 'orange', 'watermelon'])

    list.update(['apple', 'orange', 'strawberry'])

    expect(list.getItems()).toEqual(
      expect.arrayContaining(['apple', 'orange', 'strawberry'])
    )
    expect(list.currentItems).toHaveLength(3)
    expect(list.getRemovedItems()).toEqual(['watermelon'])
    expect(list.getNewItems()).toEqual(['strawberry'])
  })
})
