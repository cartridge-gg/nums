use core::integer::NumericLiteral;
use core::num::traits::zero::Zero;

pub mod errors {
    pub const PACKER_ELEMENT_IS_MISSING: felt252 = 'Packer: element is missing';
    pub const PACKER_VALUE_CONVERSION_FAILED: felt252 = 'Packer: value conversion failed';
}

pub trait PackerTrait<T, U, V> {
    fn get(packed: T, index: u8, size: V, len: U) -> U;
    fn contains(packed: T, value: U, size: V, len: U) -> bool;
    fn unpack(packed: T, size: V, len: U) -> Array<U>;
    fn remove(packed: T, item: U, size: V, len: U) -> T;
    fn replace(packed: T, index: u8, size: V, value: U, len: U) -> T;
    fn pack(unpacked: Array<U>, size: V) -> T;
}

pub impl Packer<
    T,
    +Into<u8, T>,
    +NumericLiteral<T>,
    +PartialEq<T>,
    +Zero<T>,
    +Rem<T>,
    +Add<T>,
    +Mul<T>,
    +Div<T>,
    +Drop<T>,
    +Copy<T>,
    U,
    +PartialEq<U>,
    +PartialOrd<U>,
    +Into<u8, U>,
    +Into<U, T>,
    +TryInto<T, U>,
    +Drop<U>,
    +Copy<U>,
    V,
    +Into<V, T>,
    +Drop<V>,
    +Copy<V>,
> of PackerTrait<T, U, V> {
    #[inline]
    fn get(packed: T, index: u8, size: V, len: U) -> U {
        let unpacked: Array<U> = Self::unpack(packed, size, len);
        *unpacked.at(index.into())
    }

    fn contains(mut packed: T, value: U, size: V, len: U) -> bool {
        let modulo: T = size.into();
        let mut index: u8 = 0;
        loop {
            if index.into() == len {
                break false;
            }
            let raw: U = (packed % modulo).try_into().unwrap();
            if value == raw {
                break true;
            }
            packed = packed / modulo;
            index += 1;
        }
    }

    fn unpack(mut packed: T, size: V, len: U) -> Array<U> {
        let mut result: Array<U> = array![];
        let modulo: T = size.into();
        let mut index: u8 = 0;
        while index.into() < len {
            let value: U = (packed % modulo)
                .try_into()
                .expect(errors::PACKER_VALUE_CONVERSION_FAILED);
            result.append(value);
            packed = packed / modulo;
            index += 1;
        }
        result
    }

    fn remove(mut packed: T, item: U, size: V, len: U) -> T {
        // [Compute] Loop over the packed value and remove the value at the given index
        let mut removed = false;
        let mut result: Array<U> = array![];
        let mut idx: u8 = 0;
        let modulo: T = size.into();
        while idx.into() < len {
            let current: U = (packed % modulo).try_into().unwrap();
            if current != item {
                result.append(current);
            } else {
                removed = true;
            }
            idx += 1;
            packed = packed / modulo;
        }
        // [Check] Index not out of bounds
        assert(removed, errors::PACKER_ELEMENT_IS_MISSING);
        // [Return] The new packed value and the removed value
        Self::pack(result, size)
    }

    fn replace(mut packed: T, index: u8, size: V, value: U, len: U) -> T {
        // [Compute] Loop over the packed value and remove the value at the given index
        let mut removed = false;
        let mut result: Array<U> = array![];
        let mut idx: u8 = 0;
        let modulo: T = size.into();
        while idx.into() < len {
            let item: U = (packed % modulo).try_into().unwrap();
            if idx != index {
                result.append(item);
            } else {
                result.append(value);
                removed = true;
            }
            idx += 1;
            packed = packed / modulo;
        }
        // [Check] Index not out of bounds
        assert(removed, errors::PACKER_ELEMENT_IS_MISSING);
        // [Return] The new packed value and the removed value
        Self::pack(result, size)
    }

    fn pack(mut unpacked: Array<U>, size: V) -> T {
        let mut result: T = Zero::zero();
        let mut modulo: T = size.into();
        let mut offset: T = 1_u8.into();
        while let Option::Some(value) = unpacked.pop_front() {
            result = result + offset * value.into();
            if unpacked.is_empty() {
                break;
            }
            offset = offset * modulo;
        }
        result
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::Packer;

    #[test]
    fn test_packer_replace() {
        let packed: u64 = 0xab0598c6fe1234d7;
        let index: u8 = 8;
        let size: u8 = 16;
        let len: u8 = 16;
        let value: u8 = 0xa;
        let new_packed = Packer::replace(packed, index, size, value, len);
        assert_eq!(new_packed, 0xab0598cafe1234d7);
    }

    #[test]
    fn test_packer_remove() {
        let packed: u64 = 0xab0598c6fe1234d7;
        let item: u8 = 0x6;
        let size: u8 = 16;
        let len: u8 = 16;
        let new_packed = Packer::remove(packed, item, size, len);
        assert_eq!(new_packed, 0xab0598cfe1234d7);
    }

    #[test]
    fn test_packer_get() {
        let packed: u64 = 0xab0598c6fe1234d7;
        let index: u8 = 8;
        let size: u8 = 16;
        let len: u8 = 16;
        let item: u8 = Packer::get(packed, index, size, len);
        assert_eq!(item, 0x6);
    }
}
