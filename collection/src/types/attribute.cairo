use graffiti::json::JsonImpl;

#[derive(Drop, Serde)]
pub struct Attribute {
    pub trait_type: ByteArray,
    pub value: ByteArray,
}

#[generate_trait]
pub impl AttributeImpl of AttributeTrait {
    fn jsonify(self: @Attribute) -> ByteArray {
        JsonImpl::new()
            .add("trait_type", self.trait_type.clone())
            .add("value", self.value.clone())
            .build()
    }
}

#[cfg(test)]
mod tests {
    use super::{Attribute, AttributeTrait};

    #[test]
    fn test_attribute_jsonify() {
        let attribute = Attribute { trait_type: "Type", value: "Value" };
        let json = attribute.jsonify();
        assert_eq!(json, "{\"trait_type\":\"Type\",\"value\":\"Value\"}");
    }
}
