#[derive(Drop, Serde)]
#[dojo::model]
pub struct Identifier {
    #[key]
    pub typ: felt252,
    pub id: u32,
}
