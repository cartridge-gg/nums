use crate::elements::tasks::interface::TaskTrait;

pub impl Power of TaskTrait {
    fn identifier() -> felt252 {
        'POWER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Use {} power ups", count)
    }
}
