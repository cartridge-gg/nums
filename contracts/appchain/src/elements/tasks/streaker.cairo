use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl StreakerOne of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAKER_I'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place 2 consecutive numbers"
    }
}

pub impl StreakerTwo of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAKER_II'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place 3 consecutive numbers"
    }
}

pub impl StreakerThree of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'STREAKER_III'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place 4 consecutive numbers"
    }
}
