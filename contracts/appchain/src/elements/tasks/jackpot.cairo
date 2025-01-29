use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl Jackpot of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'JACKPOT'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 777."
    }
}
