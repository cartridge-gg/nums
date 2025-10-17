use graffiti::json::JsonImpl;
use collection::types::attribute::{Attribute, AttributeTrait};

#[derive(Drop, Serde)]
pub struct TokenMetadata {
    // OpenSea standard metadata
    pub image: Option<ByteArray>,
    pub image_data: Option<ByteArray>,
    pub external_url: Option<ByteArray>,
    pub description: Option<ByteArray>,
    pub name: Option<ByteArray>,
    pub attributes: Option<Span<Attribute>>,
    pub background_color: Option<ByteArray>,
    pub animation_url: Option<ByteArray>,
    pub youtube_url: Option<ByteArray>,
}

#[generate_trait]
pub impl TokenMetadataImpl of TokenMetadataTrait {
    fn new(
        game_id: u32,
        image: ByteArray,
        reward: u32,
        start_time: u64,
        end_time: u64,
        game_over: bool,
        game_completed: bool,
        jackpot_id: u32,
        level: u8,
    ) -> TokenMetadata {
        // [Compute] Attributes
        let reward = Attribute { trait_type: "Reward", value: format!("{reward}") };
        let start_time = Attribute { trait_type: "Start Time", value: format!("{start_time}") };
        let end_time = Attribute { trait_type: "End Time", value: format!("{end_time}") };
        let game_over = Attribute { trait_type: "Game Over", value: game_over.into() };
        let game_completed = Attribute {
            trait_type: "Game Completed", value: game_completed.into(),
        };
        let jackpot_id = Attribute { trait_type: "Jackpot ID", value: format!("{jackpot_id}") };
        let level = Attribute { trait_type: "Level", value: format!("{level}") };
        let attributes = array![
            reward, start_time, end_time, game_over, game_completed, jackpot_id, level,
        ];

        // [Return] TokenMetadata
        let game_name = format!("Game #{}", game_id);
        let description =
            "Number Challenge is a fully onchain game built using Dojo Engine on Starknet that blends strategy and chance. The goal is to place 20 randomly generated numbers into slots in ascending order to win significant prizes.";
        TokenMetadata {
            image: Option::Some(image),
            image_data: Option::None,
            external_url: Option::None,
            description: Option::Some(description),
            name: Option::Some(game_name),
            attributes: Option::Some(attributes.span()),
            background_color: Option::None,
            animation_url: Option::None,
            youtube_url: Option::None,
        }
    }

    fn jsonify(self: TokenMetadata) -> ByteArray {
        let attributes: Option<Span<ByteArray>> = match self.attributes {
            Option::Some(attributes) => {
                let mut attributes = attributes;
                let mut items: Array<ByteArray> = array![];
                while let Option::Some(item) = attributes.pop_front() {
                    items.append(item.jsonify());
                }
                Option::Some(items.span())
            },
            Option::None => Option::None,
        };

        JsonImpl::new()
            .add_if_some("name", self.name)
            .add_if_some("description", self.description)
            .add_if_some("image", self.image)
            .add_if_some("image_data", self.image_data)
            .add_if_some("external_url", self.external_url)
            .add_array_if_some("attributes", attributes)
            .add_if_some("background_color", self.background_color)
            .add_if_some("animation_url", self.animation_url)
            .add_if_some("youtube_url", self.youtube_url)
            .build()
    }
}

pub impl BoolIntoByteArrayImpl of core::traits::Into<bool, ByteArray> {
    fn into(self: bool) -> ByteArray {
        if self {
            "True"
        } else {
            "False"
        }
    }
}

#[cfg(test)]
mod tests {
    use collection::types::attribute::Attribute;
    use collection::types::svg::SvgTrait;
    use super::{TokenMetadata, TokenMetadataTrait};

    #[test]
    fn test_token_metadata_jsonify_full() {
        let metadata = TokenMetadata {
            name: Option::Some("Name"),
            description: Option::Some("Description"),
            image: Option::Some("Image"),
            image_data: Option::Some("Image Data"),
            external_url: Option::Some("External URL"),
            attributes: Option::Some(
                array![Attribute { trait_type: "Trait Type", value: "Value" }].span(),
            ),
            background_color: Option::Some("Background Color"),
            animation_url: Option::Some("Animation URL"),
            youtube_url: Option::Some("Youtube URL"),
        };
        let json = metadata.jsonify();
        assert_eq!(
            json,
            "{\"name\":\"Name\",\"description\":\"Description\",\"image\":\"Image\",\"image_data\":\"Image Data\",\"external_url\":\"External URL\",\"attributes\":[{\"trait_type\":\"Trait Type\",\"value\":\"Value\"}],\"background_color\":\"Background Color\",\"animation_url\":\"Animation URL\",\"youtube_url\":\"Youtube URL\"}",
        );
    }

    #[test]
    fn test_token_metadata_jsonify_empty() {
        let metadata = TokenMetadata {
            name: Option::None,
            description: Option::None,
            image: Option::None,
            image_data: Option::None,
            external_url: Option::None,
            attributes: Option::None,
            background_color: Option::None,
            animation_url: Option::None,
            youtube_url: Option::None,
        };
        let json = metadata.jsonify();
        assert_eq!(json, "{}");
    }

    #[test]
    fn test_token_metadata_with_image() {
        let svg = SvgTrait::eval(0, false, false);
        let metadata = TokenMetadataTrait::new(
            game_id: 1,
            image: svg.gen([].span(), 0),
            reward: 0,
            start_time: 0,
            end_time: 0,
            game_over: false,
            game_completed: false,
            jackpot_id: 1,
            level: 0,
        )
            .jsonify();
        assert_eq!(metadata, "{}");
    }
}
