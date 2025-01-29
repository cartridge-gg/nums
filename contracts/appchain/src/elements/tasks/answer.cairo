use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl Answer of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'ANSWER'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 42."
    }
}
