use crate::elements::tasks::interface::TaskTrait;

pub impl StreakerOne of TaskTrait {
    fn identifier() -> felt252 {
        'STREAKER_I'
    }

    fn description(count: u32) -> ByteArray {
        "Place 2 consecutive numbers"
    }
}

pub impl StreakerTwo of TaskTrait {
    fn identifier() -> felt252 {
        'STREAKER_II'
    }

    fn description(count: u32) -> ByteArray {
        "Place 3 consecutive numbers"
    }
}

pub impl StreakerThree of TaskTrait {
    fn identifier() -> felt252 {
        'STREAKER_III'
    }

    fn description(count: u32) -> ByteArray {
        "Place 4 consecutive numbers"
    }
}
