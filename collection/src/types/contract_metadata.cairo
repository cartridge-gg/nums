use graffiti::json::JsonImpl;
use collection::assets::banner::Banner;
use collection::assets::icon::Icon;

#[derive(Drop, Serde)]
pub struct ContractMetadata {
    // OpenSea standard metadata
    pub name: ByteArray,
    pub symbol: Option<ByteArray>,
    pub description: Option<ByteArray>,
    pub image: Option<ByteArray>,
    pub banner_image: Option<ByteArray>,
    pub featured_image: Option<ByteArray>,
    pub external_link: Option<ByteArray>,
}

#[generate_trait]
pub impl ContractMetadataImpl of ContractMetadataTrait {
    fn new(name: ByteArray, symbol: ByteArray) -> ContractMetadata {
        ContractMetadata {
            name: name,
            symbol: Option::Some(symbol),
            description: Option::Some(
                "Number Challenge is a fully onchain game built using Dojo Engine on Starknet that blends strategy and chance. The goal is to place 20 randomly generated numbers into slots in ascending order to win significant prizes.",
            ),
            image: Option::Some(Icon::get()),
            banner_image: Option::Some(Banner::get()),
            featured_image: Option::None,
            external_link: Option::Some("https://www.nums.gg/"),
        }
    }

    fn jsonify(self: ContractMetadata) -> ByteArray {
        JsonImpl::new()
            .add("name", self.name)
            .add_if_some("symbol", self.symbol)
            .add_if_some("description", self.description)
            .add_if_some("image", self.image)
            .add_if_some("banner_image", self.banner_image)
            .add_if_some("featured_image", self.featured_image)
            .add_if_some("external_link", self.external_link)
            .build()
    }
}

#[cfg(test)]
mod tests {
    use super::{ContractMetadata, ContractMetadataTrait};

    #[test]
    fn test_jsonify_full() {
        let metadata = ContractMetadata {
            name: "Name",
            symbol: Option::Some("Symbol"),
            description: Option::Some("Description"),
            image: Option::Some("Image"),
            banner_image: Option::Some("Banner Image"),
            featured_image: Option::Some("Featured Image"),
            external_link: Option::Some("External Link"),
        };
        let json = metadata.jsonify();
        assert_eq!(
            json,
            "{\"name\":\"Name\",\"symbol\":\"Symbol\",\"description\":\"Description\",\"image\":\"Image\",\"banner_image\":\"Banner Image\",\"featured_image\":\"Featured Image\",\"external_link\":\"External Link\"}",
        );
    }

    #[test]
    fn test_jsonify_empty() {
        let metadata = ContractMetadata {
            name: "Name",
            symbol: Option::None,
            description: Option::None,
            image: Option::None,
            banner_image: Option::None,
            featured_image: Option::None,
            external_link: Option::None,
        };
        let json = metadata.jsonify();
        assert_eq!(json, "{\"name\":\"Name\"}");
    }
}
