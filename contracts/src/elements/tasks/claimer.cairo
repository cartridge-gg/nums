use nums::elements::tasks::interface::TaskTrait;

pub impl Claimer of TaskTrait {
    
    fn identifier() -> felt252 {
        'CLAIMER'
    }

    
    fn description(count: u32) -> ByteArray {
        "Claim more tokens"
    }
}
