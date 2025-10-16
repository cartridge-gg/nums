pub trait SvgTrait {
    fn gen(slots: Span<u16>, num: u16, test: bool) -> ByteArray;
}
