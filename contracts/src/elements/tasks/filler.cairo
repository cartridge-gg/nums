use crate::elements::tasks::interface::TaskTrait;

pub impl FillerOne of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_I'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill 10 slots {} times", count)
    }
}

pub impl FillerTwo of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_II'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill 15 slots {} times", count)
    }
}

pub impl FillerThree of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_III'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill 17 slots {} times", count)
    }
}

pub impl FillerFour of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_IV'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill 19 slots {} times", count)
    }
}

pub impl FillerFive of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_V'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill 20 slots {} times", count)
    }
}

pub impl FillerTen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_X'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 10 slots within a single game"
    }
}

pub impl FillerThirteen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XIII'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 13 slots within a single game"
    }
}

pub impl FillerSixteen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XVI'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 16 slots within a single game"
    }
}

pub impl FillerSeventeen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XVII'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 17 slots within a single game"
    }
}

pub impl FillerEighteen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XVIII'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 18 slots within a single game"
    }
}

pub impl FillerNineteen of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XIX'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 19 slots within a single game"
    }
}

pub impl FillerTwenty of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER_XX'
    }

    fn description(count: u32) -> ByteArray {
        "Fill 20 slots within a single game"
    }
}
