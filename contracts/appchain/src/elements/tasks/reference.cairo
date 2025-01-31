use nums_appchain::elements::tasks::interface::TaskTrait;

pub impl ReferenceOne of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_I'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 21."
    }
}

pub impl ReferenceTwo of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_II'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 42."
    }
}

pub impl ReferenceThree of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_III'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 404."
    }
}

pub impl ReferenceFour of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_IV'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 777."
    }
}

pub impl ReferenceFive of TaskTrait {
    #[inline]
    fn identifier() -> felt252 {
        'REFERENCE_V'
    }

    #[inline]
    fn description(count: u32) -> ByteArray {
        "Place the number 911."
    }
}
