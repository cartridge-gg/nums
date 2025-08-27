use nums::elements::tasks::interface::TaskTrait;

pub impl FillerOne of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_I'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots {} times", count, count)
    }
}

pub impl FillerTwo of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_II'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots {} times", count, count)
    }
}

pub impl FillerThree of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_III'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots {} times", count, count)
    }
}

pub impl FillerFour of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_IV'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots {} times", count, count)
    }
}

pub impl FillerFive of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'FILLER_V'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        format!("Fill {} slots {} times", count, count)
    }
}
