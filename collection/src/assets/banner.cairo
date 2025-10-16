#[generate_trait]
pub impl Banner of BannerTrait {
    #[inline]
    fn get() -> ByteArray {
        "https://static.cartridge.gg/presets/nums/cover.png"
    }
}
