use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl Blackjack of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'BLACKJACK'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 21."
    }
}
