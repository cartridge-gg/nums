use nums::elements::tasks::interface::TaskTrait;

pub impl Claimer of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'CLAIMER'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Claim more tokens"
    }
}
