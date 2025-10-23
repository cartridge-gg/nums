#[generate_trait]
pub impl Icon of IconTrait {
    #[inline]
    fn get() -> ByteArray {
        "https://static.cartridge.gg/presets/nums/icon.png"
    }
}
