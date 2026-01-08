use crate::elements::tasks::interface::TaskTrait;

pub impl KingOne of TaskTrait {
    fn identifier() -> felt252 {
        'KING_ONE'
    }

    fn description(count: u32) -> ByteArray {
        "Take the honors finishing in the top 5"
    }
}


pub impl KingTwo of TaskTrait {
    fn identifier() -> felt252 {
        'KING_TWO'
    }

    fn description(count: u32) -> ByteArray {
        "Take the laurels finishing in the top 3"
    }
}


pub impl KingThree of TaskTrait {
    fn identifier() -> felt252 {
        'KING_THREE'
    }

    fn description(count: u32) -> ByteArray {
        "Take the crown finishing in the top 1"
    }
}
