// Internal imports

use crate::helpers::power::TwoPower;

pub trait BitmapTrait<T> {
    fn popcount(x: T) -> u8;
    fn get(x: T, index: u8) -> u8;
    fn set(x: T, index: u8) -> T;
    fn unset(x: T, index: u8) -> T;
}

pub impl Bitmap<
    T, +Into<u8, T>, +Into<T, u256>, +TryInto<T, u8>, +TryInto<u256, T>,
> of BitmapTrait<T> {
    /// Count the number of bits set to 1 in the number
    /// # Arguments
    /// * `x` - The value for which to count the number of bits set to 1
    /// # Returns
    /// * The number of bits set to 1
    #[inline]
    fn popcount(x: T) -> u8 {
        let mut x: u256 = x.into();
        let mut count: u8 = 0;
        while (x > 0) {
            count += PrivateTrait::_popcount((x % 0x100000000).try_into().unwrap());
            x /= 0x100000000;
        }
        count
    }

    /// Get the bit at the specified index
    /// # Arguments
    /// * `x` - The bitmap
    /// * `index` - The index of the bit to get
    /// # Returns
    /// * The value of the bit at the specified index
    #[inline]
    fn get(x: T, index: u8) -> u8 {
        let x: u256 = x.into();
        let offset: u256 = TwoPower::pow(index);
        (x / offset % 2).try_into().unwrap()
    }

    /// Set the bit at the specified index
    /// # Arguments
    /// * `x` - The bitmap
    /// * `index` - The index of the bit to set
    /// # Returns
    /// * The bitmap with the bit at the specified index set to 1
    #[inline]
    fn set(x: T, index: u8) -> T {
        let x: u256 = x.into();
        let offset: u256 = TwoPower::pow(index);
        let bit = x / offset % 2;
        let offset: u256 = offset * (1 - bit);
        (x + offset).try_into().unwrap()
    }

    /// Unset the bit at the specified index
    /// # Arguments
    /// * `x` - The bitmap
    /// * `index` - The index of the bit to unset
    /// # Returns
    /// * The bitmap with the bit at the specified index set to 0
    #[inline]
    fn unset(x: T, index: u8) -> T {
        let x: u256 = x.into();
        let offset: u256 = TwoPower::pow(index);
        let bit = x / offset % 2;
        let offset: u256 = offset * bit;
        (x - offset).try_into().unwrap()
    }
}

#[generate_trait]
impl Private of PrivateTrait {
    /// Count the number of bits set to 1 in the number for a u32
    /// # Arguments
    /// * `x` - The value for which to count the number of bits set to 1
    /// # Returns
    /// * The number of bits set to 1
    #[inline]
    fn _popcount(mut x: u32) -> u8 {
        x -= ((x / 2) & 0x55555555);
        x = (x & 0x33333333) + ((x / 4) & 0x33333333);
        x = (x + (x / 16)) & 0x0f0f0f0f;
        x += (x / 256);
        x += (x / 65536);
        return (x % 64).try_into().unwrap();
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::Bitmap;

    #[test]
    fn test_bitmap_popcount_large() {
        let count: u8 = Bitmap::popcount(
            0x4003FBB391C53CCB8E99752EB665586B695BB2D026BEC9071FF30002,
        );
        assert_eq!(count, 109);
    }

    #[test]
    fn test_bitmap_popcount_small() {
        let count = Bitmap::popcount(0b101);
        assert_eq!(count, 2);
    }

    #[test]
    fn test_bitmap_get() {
        let bit = Bitmap::get(0b1001011, 0);
        assert_eq!(bit, 1);
    }

    #[test]
    fn test_bitmap_set() {
        let bit = Bitmap::set(0b1001010, 0);
        assert_eq!(bit, 0b1001011);
    }

    #[test]
    fn test_bitmap_set_unchanged() {
        let bit = Bitmap::set(0b1001011, 0);
        assert_eq!(bit, 0b1001011);
    }

    #[test]
    fn test_bitmap_unset() {
        let bit = Bitmap::unset(0b1001011, 0);
        assert_eq!(bit, 0b1001010);
    }

    #[test]
    fn test_bitmap_unset_unchanged() {
        let bit = Bitmap::unset(0b1001010, 0);
        assert_eq!(bit, 0b1001010);
    }
}
