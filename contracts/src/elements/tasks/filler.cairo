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
