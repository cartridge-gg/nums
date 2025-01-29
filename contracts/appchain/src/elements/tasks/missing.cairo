use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl Missing of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'MISSING'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 404."
    }
}
