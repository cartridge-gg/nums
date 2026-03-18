use crate::elements::tasks::interface::TaskTrait;

pub impl Trigger of TaskTrait {
    fn identifier() -> felt252 {
        'TRIGGER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Trigger {} traps", count)
    }
}
