use crate::elements::tasks::interface::TaskTrait;

pub impl ChainerOne of TaskTrait {
    fn identifier() -> felt252 {
        'CHAINER_ONE'
    }

    fn description(count: u32) -> ByteArray {
        format!("Trigger 3 traps within a single turn")
    }
}

pub impl ChainerTwo of TaskTrait {
    fn identifier() -> felt252 {
        'CHAINER_TWO'
    }

    fn description(count: u32) -> ByteArray {
        format!("Trigger 4 traps within a single turn")
    }
}

pub impl ChainerThree of TaskTrait {
    fn identifier() -> felt252 {
        'CHAINER_THREE'
    }

    fn description(count: u32) -> ByteArray {
        format!("Trigger 5 traps within a single turn")
    }
}
