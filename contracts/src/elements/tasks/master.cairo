use crate::elements::tasks::interface::TaskTrait;

pub impl DailyMaster of TaskTrait {
    fn identifier() -> felt252 {
        'DAILY_MASTER'
    }

    fn description(count: u32) -> ByteArray {
        "Complete all daily quests"
    }
}

