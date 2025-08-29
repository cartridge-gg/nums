use nums::elements::tasks::interface::TaskTrait;

pub impl King of TaskTrait {
    
    fn identifier() -> felt252 {
        'KING'
    }

    
    fn description(count: u32) -> ByteArray {
        match count {
            0 => "",
            1 => "Take the crown 1 time",
            _ => format!("Take the crown {} times", count),
        }
    }
}
