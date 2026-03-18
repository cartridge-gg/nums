use crate::elements::tasks::interface::TaskTrait;

pub impl Filler of TaskTrait {
    fn identifier() -> felt252 {
        'FILLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots", count)
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
