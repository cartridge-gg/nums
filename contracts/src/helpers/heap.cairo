//! Heap implementation.

// Core imports

use core::dict::{Felt252Dict, Felt252DictTrait};

// Constants

const KEY_OFFSET: felt252 = 252;

/// Traits.
pub trait HeapTrait<T> {
    /// Create a new heap.
    /// # Returns
    /// * The heap
    fn new() -> Heap<T>;
    /// Check if the heap is empty.
    /// # Arguments
    /// * `self` - The heap
    /// # Returns
    /// * `true` if the heap is empty, `false` otherwise
    fn is_empty(self: @Heap<T>) -> bool;
    /// Get an item from the heap if it exists.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * The item if it exists, `None` otherwise
    fn get(ref self: Heap<T>, key: u8) -> Option<T>;
    /// Get an item from the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * The item
    /// # Panics
    /// * If the item does not exist
    fn at(ref self: Heap<T>, key: u8) -> T;
    /// Check if the heap contains an item.
    /// # Arguments
    /// * `self` - The heap
    /// * `key` - The key of the item
    /// # Returns
    /// * `true` if the item exists, `false` otherwise
    fn contains(ref self: Heap<T>, key: u8) -> bool;
    /// Add an item to the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item` - The item to add
    /// # Effects
    /// * The item is added at the end of the heap and the heap is sorted up
    fn add(ref self: Heap<T>, item: T);
    /// Update an item in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item` - The item to update
    /// # Effects
    /// * The item is updated and the heap is sorted up since it cannot be updated with a lower
    /// score in case of A* algorithm
    fn update(ref self: Heap<T>, item: T);
    /// Pop the first item from the heap.
    /// # Arguments
    /// * `self` - The heap
    /// # Returns
    /// * The first item if the heap is not empty, `None` otherwise
    fn pop_front(ref self: Heap<T>) -> Option<T>;
    /// Sort an item up in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item_key` - The key of the item to sort up
    /// # Effects
    /// * The items are swapped until the item is in the right place
    fn sort_up(ref self: Heap<T>, item_key: u8);
    /// Sort an item down in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `item_key` - The key of the item to sort down
    /// # Effects
    /// * The items are swapped until the item is in the right place
    fn sort_down(ref self: Heap<T>, item_key: u8);
    /// Swap two items in the heap.
    /// # Arguments
    /// * `self` - The heap
    /// * `lhs` - The key of the first item
    /// * `rhs` - The key of the second item
    /// # Effects
    /// * The items are swapped
    fn swap(ref self: Heap<T>, lhs: u8, rhs: u8);
    /// Print the heap.
    /// # Arguments
    /// * `self` - The heap to print
    /// # Effects
    /// * The heap is printed
    /// # Note
    /// * This function is only for debugging purposes
    fn print(ref self: Heap<T>);
}

pub trait ItemTrait<T> {
    /// Get the key of the item.
    /// # Arguments
    /// * `self` - The item
    /// # Returns
    /// * The key of the item
    fn key(self: T) -> u8;
}

// Items.

#[derive(Copy, Drop)]
pub struct Item {
    pub key: u8,
    pub cost_a: u8,
    pub cost_b: u8,
}

pub impl ItemImpl of ItemTrait<Item> {
    #[inline]
    fn key(self: Item) -> u8 {
        self.key
    }
}

pub impl ItemPartialEq of PartialEq<Item> {
    #[inline]
    fn eq(lhs: @Item, rhs: @Item) -> bool {
        lhs.key == rhs.key
    }

    #[inline]
    fn ne(lhs: @Item, rhs: @Item) -> bool {
        lhs.key != rhs.key
    }
}

pub impl ItemPartialOrd of PartialOrd<Item> {
    #[inline]
    fn lt(lhs: Item, rhs: Item) -> bool {
        if lhs.cost_a == rhs.cost_a {
            return lhs.cost_b < rhs.cost_b;
        }
        lhs.cost_a < rhs.cost_a
    }

    #[inline]
    fn le(lhs: Item, rhs: Item) -> bool {
        if lhs.cost_a == rhs.cost_a {
            return lhs.cost_b <= rhs.cost_b;
        }
        lhs.cost_a <= rhs.cost_a
    }

    #[inline]
    fn gt(lhs: Item, rhs: Item) -> bool {
        if lhs.cost_a == rhs.cost_a {
            return lhs.cost_b > rhs.cost_b;
        }
        lhs.cost_a > rhs.cost_a
    }

    #[inline]
    fn ge(lhs: Item, rhs: Item) -> bool {
        if lhs.cost_a == rhs.cost_a {
            return lhs.cost_b >= rhs.cost_b;
        }
        lhs.cost_a >= rhs.cost_a
    }
}

/// Heap.
pub struct Heap<T> {
    /// The length of the heap.
    pub len: u8,
    /// The keys of the items in the heap and also the indexes of the items in the data.
    /// Both information is stored in the same map to save gas.
    pub keys: Felt252Dict<u8>,
    /// The items.
    pub data: Felt252Dict<Nullable<T>>,
}

pub impl HeapImpl<T, +ItemTrait<T>, +PartialOrd<T>, +Copy<T>, +Drop<T>> of HeapTrait<T> {
    #[inline]
    fn new() -> Heap<T> {
        Heap { len: 0, keys: Default::default(), data: Default::default() }
    }

    #[inline]
    fn is_empty(self: @Heap<T>) -> bool {
        *self.len == 0
    }

    #[inline]
    fn get(ref self: Heap<T>, key: u8) -> Option<T> {
        let nullable: Nullable<T> = self.data.get(key.into());
        if nullable.is_null() {
            return Option::None;
        }
        Option::Some(nullable.deref())
    }

    #[inline]
    fn at(ref self: Heap<T>, key: u8) -> T {
        self.data.get(key.into()).deref()
    }

    #[inline]
    fn contains(ref self: Heap<T>, key: u8) -> bool {
        let index = self.keys.get(key.into() + KEY_OFFSET);
        let item_key = self.keys.get(index.into());
        index < self.len && item_key == key
    }

    #[inline]
    fn add(ref self: Heap<T>, item: T) {
        // [Effect] Update heap length
        let key = item.key();
        let index = self.len;
        self.len += 1;
        // [Effect] Insert item at the end
        self.data.insert(key.into(), NullableTrait::new(item));
        self.keys.insert(index.into(), key);
        self.keys.insert(key.into() + KEY_OFFSET, index);
        // [Effect] Sort up
        self.sort_up(key);
    }

    #[inline]
    fn update(ref self: Heap<T>, item: T) {
        // [Effect] Update item
        let key = item.key();
        self.data.insert(key.into(), NullableTrait::new(item));
        // [Effect] Sort up
        self.sort_up(key);
    }

    #[inline]
    fn pop_front(ref self: Heap<T>) -> Option<T> {
        if self.is_empty() {
            return Option::None;
        }
        self.len -= 1;
        let first_key: u8 = self.keys.get(0);
        let mut first: T = self.data.get(first_key.into()).deref();
        if self.len != 0 {
            let last_key: u8 = self.keys.get(self.len.into());
            self.swap(first_key, last_key);
            self.sort_down(last_key);
        }
        Option::Some(first)
    }

    #[inline]
    fn sort_up(ref self: Heap<T>, item_key: u8) {
        // [Compute] Item
        let item: T = self.data.get(item_key.into()).deref();
        let mut index = self.keys.get(item_key.into() + KEY_OFFSET);
        // [Compute] Peform swaps until the item is in the right place
        while index != 0 {
            index = (index - 1) / 2;
            let parent_key = self.keys.get(index.into());
            let mut parent: T = self.data.get(parent_key.into()).deref();
            if parent >= item {
                break;
            }
            self.swap(parent_key, item_key);
        }
    }

    #[inline]
    fn sort_down(ref self: Heap<T>, item_key: u8) {
        // [Compute] Item
        let item: T = self.data.get(item_key.into()).deref();
        let mut index: u8 = self.keys.get(item_key.into() + KEY_OFFSET);
        // [Compute] Peform swaps until the item is in the right place
        let mut lhs_index = index * 2 + 1;
        while lhs_index < self.len {
            // [Compute] Child to swap
            index = lhs_index;
            let mut child_key: u8 = self.keys.get(index.into());
            let mut child: T = self.data.get(child_key.into()).deref();
            // [Compute] Assess right child side
            let rhs_index = lhs_index + 1;
            if rhs_index < self.len {
                let rhs_key: u8 = self.keys.get(rhs_index.into());
                let rhs: T = self.data.get(rhs_key.into()).deref();
                if rhs > child {
                    index = rhs_index;
                    child_key = rhs_key;
                    child = rhs;
                };
            }
            // [Effect] Swap if necessary
            if item >= child {
                break;
            }
            self.swap(item_key, child_key);
            // [Check] Stop criteria, assess left child side
            lhs_index = index * 2 + 1;
        }
    }

    #[inline]
    fn swap(ref self: Heap<T>, lhs: u8, rhs: u8) {
        // [Effect] Swap keys
        let lhs_index = self.keys.get(lhs.into() + KEY_OFFSET);
        let rhs_index = self.keys.get(rhs.into() + KEY_OFFSET);
        self.keys.insert(lhs.into() + KEY_OFFSET, rhs_index);
        self.keys.insert(rhs.into() + KEY_OFFSET, lhs_index);
        self.keys.insert(lhs_index.into(), rhs);
        self.keys.insert(rhs_index.into(), lhs);
    }

    #[inline]
    fn print(ref self: Heap<T>) {
        println!("");
        let mut index = 0;
        while index < self.len {
            let key = self.keys.get(index.into());
            println!("{} : {}", index, key);
            index += 1;
        }
        println!("");
    }
}

pub impl DestructHeap<T, +Drop<T>> of Destruct<Heap<T>> {
    fn destruct(self: Heap<T>) nopanic {
        self.keys.squash();
        self.data.squash();
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Heap, HeapTrait, Item, ItemTrait};

    #[test]
    fn test_heap_new() {
        let heap: Heap<Item> = HeapTrait::new();
        assert!(heap.is_empty());
    }

    #[test]
    fn test_heap_add() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let item: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        heap.add(item);
        assert!(!heap.is_empty());
    }

    #[test]
    fn test_heap_contains() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let item: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        heap.add(item);
        assert!(heap.contains(item.key));
    }

    #[test]
    fn test_heap_not_contains() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let item: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        assert!(!heap.contains(item.key));
    }

    #[test]
    fn test_heap_pop_front_sorted() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        let third: Item = Item { key: 3, cost_a: 3, cost_b: 3 };
        heap.add(first);
        heap.add(second);
        heap.add(third);
        let popped: Item = heap.pop_front().unwrap();
        assert_eq!(popped.cost_a, 3);
    }

    #[test]
    fn test_heap_pop_front_reversed() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        let third: Item = Item { key: 3, cost_a: 3, cost_b: 3 };
        heap.add(third);
        heap.add(second);
        heap.add(first);
        let popped: Item = heap.pop_front().unwrap();
        assert_eq!(popped.cost_a, 3);
    }

    #[test]
    fn test_heap_swap() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        heap.add(first);
        heap.add(second);
        heap.swap(first.key(), second.key());
        assert_eq!(second.cost_a, 2);
        let popped: Item = heap.pop_front().unwrap();
        assert_eq!(popped.cost_a, 1);
    }

    #[test]
    fn test_heap_get() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        heap.add(first);
        heap.add(second);
        assert_eq!(heap.get(first.key).unwrap().key, 1);
        assert_eq!(heap.get(second.key).unwrap().key, 2);
        heap.swap(first.key(), second.key());
        assert_eq!(heap.get(first.key).unwrap().key, 1);
        assert_eq!(heap.get(second.key).unwrap().key, 2);
    }

    #[test]
    fn test_heap_at() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        heap.add(first);
        heap.add(second);
        assert_eq!(heap.at(first.key).key, 1);
        assert_eq!(heap.at(second.key).key, 2);
        heap.swap(first.key(), second.key());
        assert_eq!(heap.at(first.key).key, 1);
        assert_eq!(heap.at(second.key).key, 2);
    }

    #[test]
    fn test_heap_add_pop_add() {
        let mut heap: Heap<Item> = HeapTrait::new();
        let first: Item = Item { key: 1, cost_a: 1, cost_b: 1 };
        let second: Item = Item { key: 2, cost_a: 2, cost_b: 2 };
        heap.add(first);
        heap.add(second);
        heap.pop_front().unwrap();
        assert_eq!(heap.at(1).key, 1);
        assert_eq!(heap.at(2).key, 2);
    }
}
