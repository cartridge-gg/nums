use nums::elements::tasks::interface::TaskTrait;

pub impl Grinder of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'GRINDER'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        match count {
            0 => "",
            1 => "Start and play 1 game",
            _ => format!("Start and play {} games", count),
        }
    }
}
