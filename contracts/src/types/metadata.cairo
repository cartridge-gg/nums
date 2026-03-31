use alexandria_encoding::base64::Base64ByteArrayEncoder;
use bundle::types::item::ItemTrait as BundleItemTrait;
use bundle::types::metadata::MetadataTrait as BundleMetadataTrait;
use collection::types::attribute::{Attribute, AttributeTrait};
use graffiti::json::JsonImpl;
pub use crate::constants::IMAGE;
use crate::types::svg::SvgTrait;

#[generate_trait]
pub impl Metadata of MetadataTrait {
    #[inline]
    fn gen(
        name: ByteArray,
        description: ByteArray,
        game_slots: Span<u16>,
        game_id: u64,
        game_number: u16,
        game_level: u8,
        game_completed: bool,
        game_over: bool,
    ) -> ByteArray {
        let svg = SvgTrait::eval(game_number, game_completed, game_over);
        let attributes = array![
            Attribute { trait_type: "Game ID", value: format!("{}", game_id) }.jsonify(),
            Attribute { trait_type: "Game Score", value: format!("{}", game_level) }.jsonify(),
            Attribute { trait_type: "Game Over", value: format!("{}", game_over) }.jsonify(),
        ]
            .span();
        let metadata = JsonImpl::new()
            .add("name", format!("{} #{}", name, game_id))
            .add("description", description)
            .add("image", svg.gen(game_slots, game_number))
            .add_array("attributes", attributes)
            .build();
        "data:application/json;base64," + Base64ByteArrayEncoder::encode(metadata)
    }
    #[inline]
    fn bundle(
        payment_tokens: Span<starknet::ContractAddress>, conditions: Span<ByteArray>,
    ) -> ByteArray {
        let item = BundleItemTrait::new(name: "Nums Game", description: "Nums", image_uri: IMAGE());
        let metadata = BundleMetadataTrait::new(
            name: "Nums Games",
            description: "Nums games can be played on nums.gg",
            image_uri: IMAGE(),
            items: array![item].span(),
            tokens: payment_tokens,
            conditions: conditions,
        );
        metadata.jsonify()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metadata_gen() {
        let slots = array![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            .span();
        let id = 1;
        let number = 1;
        let level = 1;
        let completed = true;
        let over = false;
        let metadata = Metadata::gen(
            "Test Game", "This is a test game", slots, id, number, level, completed, over,
        );
        assert_eq!(metadata.len() > 0, true);
    }
}
