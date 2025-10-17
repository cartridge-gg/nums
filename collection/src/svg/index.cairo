use alexandria_encoding::base64::Base64ByteArrayEncoder;
use collection::svg::font::Font;

const TITLE_OFFSET_COMPLETED: u16 = 40;
const TITLE_OFFSET_PROGRESS: u16 = 118;
const SLOT_OFFSET_X: u16 = 68;
const SLOT_OFFSET_X_GAP: u16 = 176;
const SLOT_OFFSET_Y: u16 = 204;
const SLOT_OFFSET_Y_GAP: u16 = 112;
const ROW_COUNT: u8 = 5;

#[generate_trait]
pub impl Svg of SvgTrait {
    fn encode(svg: ByteArray) -> ByteArray {
        Base64ByteArrayEncoder::encode(svg)
    }

    fn header() -> ByteArray {
        "<svg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>"
    }

    fn style(test: bool) -> ByteArray {
        let font = if (test) {
            "data:font/ttf;base64,ABC=="
        } else {
            Font::base64()
        };
        "<style> @font-face { font-family: 'ekamai'; src: url('"
            + font
            + "') format('woff2'); } text { font-family: 'ekamai', sans-serif; } </style>"
    }

    fn footer() -> ByteArray {
        "</svg>"
    }

    fn background(color: ByteArray) -> ByteArray {
        format!("<rect width='800' height='800' fill='{color}' />")
    }

    fn filter() -> ByteArray {
        "<filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.2' /></filter>"
    }

    fn frame() -> ByteArray {
        "<rect id='frame' width='136' height='88' rx='16' ry='18' />"
    }

    fn tilde() -> ByteArray {
        "<text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>~</text>"
    }

    fn icon(over: bool) -> ByteArray {
        if (over) {
            return "";
        }
        "<g id='icon'><path d='M87.0 95.6C87.2 94.3 87.5 93.1 88.0 92.3C88.4 91.7 88.8 91.2 89.3 90.6C91.8 87.4 95.0 83.3 93.6 74.9C92.5 69.0 91.8 65.0 90.6 62.7C89.8 61.2 88.8 60.3 87.4 60.2C87.4 60.2 87.4 60.2 87.4 60.1C86.8 60.1 85.8 60.2 84.8 60.4C83.9 60.6 83.0 61.0 82.4 61.7C81.7 62.4 81.4 63.5 81.9 65.0C82.3 66.3 82.7 67.4 83.1 68.6C83.2 68.9 83.3 69.1 83.4 69.4C84.0 70.9 84.6 72.4 85.1 74.0C85.6 76.0 85.9 78.1 85.8 80.4C85.8 80.6 85.7 80.7 85.5 80.7C85.4 80.7 85.3 80.6 85.3 80.4C85.3 78.1 84.9 76.1 84.3 74.3C83.8 72.9 83.2 71.6 82.7 70.3C82.5 69.9 82.3 69.4 82.1 69.0C81.6 67.8 81.1 66.6 80.7 65.4C80.1 63.3 80.6 61.9 81.5 60.9C82.3 60.0 83.4 59.5 84.5 59.3C85.5 59.0 86.5 58.9 87.2 59.0C86.8 56.4 86.0 51.2 85.0 47.0C84.3 44.4 83.6 42.2 83.0 41.2C81.7 39.2 79.4 38.7 77.4 39.2C76.1 39.5 74.9 40.2 74.5 41.2C74.0 42.2 73.8 44.3 73.9 47.0C74.0 49.9 74.4 53.5 74.7 56.8C74.8 57.6 74.9 58.3 74.9 59.0C74.1 56.2 73.0 52.8 71.9 49.9C70.8 47.1 69.7 44.7 68.6 43.6C66.8 41.7 64.4 41.9 62.6 43.0C61.4 43.7 60.5 44.9 60.3 46.1C60.0 47.2 60.4 49.2 61.1 51.5C62.0 54.9 63.6 59.2 64.8 62.2C64.8 62.4 64.9 62.6 65.0 62.7C64.4 62.1 63.6 61.5 62.9 61.0C61.1 59.8 59.1 59.3 57.1 60.7C53.5 63.2 53.8 66.2 54.1 67.5C54.3 68.6 58.6 74.6 59.1 75.1C60.0 76.1 60.9 76.9 61.9 77.4C62.6 77.8 63.2 78.0 63.9 77.8C65.4 77.3 66.3 76.6 66.6 75.8C67.2 74.7 66.9 73.4 66.4 72.4C66.2 71.8 65.4 71.0 64.4 70.1C62.8 68.6 60.7 67.1 60.7 67.1C60.6 67.0 60.6 66.9 60.7 66.7C60.8 66.6 60.9 66.6 61.0 66.7C61.0 66.7 63.7 68.5 65.5 70.1C66.3 70.8 66.9 71.5 67.2 72.1C67.8 73.2 68.2 74.8 67.6 76.2C67.1 77.2 66.1 78.2 64.2 78.8C64.0 78.9 63.8 79.0 63.5 79.0C63.9 79.4 64.5 80.3 64.4 81.5C64.4 82.3 63.9 83.8 62.9 84.8C61.9 85.8 60.7 86.0 59.3 85.6C58.1 85.3 56.8 84.6 55.6 83.8C54.9 83.2 54.3 82.7 53.8 82.2C54.0 83.5 54.3 85.3 54.9 87.0C55.7 89.3 56.9 91.4 58.5 92.4C58.7 92.5 58.9 92.6 59.1 92.8C60.3 93.4 62.0 94.0 64.0 94.4C65.2 94.6 66.5 94.8 67.8 94.9C69.6 95.1 71.6 95.1 73.4 95.0C74.7 94.8 76.0 94.6 77.1 94.2C77.3 94.2 77.4 94.3 77.5 94.4C77.5 94.5 77.4 94.7 77.3 94.7C75.3 95.5 73.0 95.9 70.6 96.0C69.6 96.1 68.6 96.1 67.7 96.0C66.3 96.0 65.0 95.8 63.8 95.5C62.6 95.3 61.6 95.0 60.7 94.7C61.4 96.5 61.2 98.8 60.6 101.8C60.6 102.1 60.7 102.3 60.9 102.4C61.8 103.0 62.8 103.5 64.0 103.8V103.8C65.4 104.3 67.1 104.6 68.8 104.8C75.1 105.3 78.4 105.2 87.6 102.2L87.6 102.2C88.2 102.0 88.2 101.6 87.9 101.3C87.8 101.1 87.7 101.0 87.6 100.9C87.4 100.8 87.2 100.4 87.1 100.0C86.6 98.6 86.9 97.0 87.0 95.6Z' /><path d='M53.0 68.0C52.4 68.3 51.6 68.7 51.0 69.3C49.9 70.3 49.0 71.6 49.1 73.4C49.2 77.1 52.6 79.8 53.5 80.4C53.5 80.4 53.5 80.5 53.5 80.5C53.5 80.5 53.5 80.5 53.5 80.5C53.6 80.6 53.7 80.7 53.9 80.8C54.5 81.3 55.4 82.1 56.4 82.8C57.1 83.3 57.9 83.8 58.6 84.2C59.3 84.5 59.9 84.7 60.6 84.7C61.2 84.7 61.7 84.6 62.2 84.1C63.1 83.3 63.6 82.1 63.7 81.4C63.8 80.1 63.2 79.3 63.0 79.1C62.9 79.0 62.9 78.9 62.9 78.9C62.6 78.9 62.3 78.9 62.0 78.8C61.1 78.5 60.2 77.9 59.4 77.1C57.5 75.4 55.7 72.9 54.5 70.8C53.7 69.6 53.2 68.5 53.0 68.0Z' /></g>"
    }

    fn empty(over: bool) -> ByteArray {
        if (over) {
            return "<g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#dropShadow)' /></g>";
        }
        "<g id='empty'><use href='#frame' fill='white' fill-opacity='0.08' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#dropShadow)' /></g>"
    }

    fn defs(slots: Span<u16>, title: ByteArray, over: bool) -> ByteArray {
        let mut defs: ByteArray = "<defs>";
        defs += Self::filter();
        defs += Self::frame();
        defs += Self::empty(over);
        defs += Self::tilde();
        defs += Self::icon(over);
        defs += "</defs>";
        defs
    }

    fn translate(index: u8) -> (u16, u16) {
        let x = SLOT_OFFSET_X + index.into() / ROW_COUNT.into() * SLOT_OFFSET_X_GAP;
        let y = SLOT_OFFSET_Y + index.into() % ROW_COUNT.into() * SLOT_OFFSET_Y_GAP;
        (x, y)
    }

    fn slot(index: u8, number: u16) -> ByteArray {
        let (x, y) = Self::translate(index);
        let slot = index + 1;
        if (number == 0) {
            return format!(
                "<g id='slot-{slot}' transform='translate({x},{y})'><use href='#empty' /></g>",
            );
        }
        format!(
            "<g id='slot-{slot}' transform='translate({x},{y})'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='{number}' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>{number}</text></g>",
        )
    }
}

#[cfg(test)]
mod tests {
    use super::Svg;

    #[test]
    fn test_svg_defs() {
        let slots: Array<u16> = array![
            0, 0, 0, 149, 168, 187, 0, 0, 0, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0, 0,
        ];
        let defs = Svg::defs(slots.span(), "GAME OVER", true);
        assert_eq!(
            defs,
            "<defs><filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.2' /></filter><rect id='frame' width='136' height='88' rx='16' ry='18' /><g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#dropShadow)' /></g><text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>~</text></defs>",
        )
    }

    #[test]
    fn test_svg_translate() {
        let (x, y) = Svg::translate(0);
        assert_eq!(x, 68);
        assert_eq!(y, 204);
        let (x, y) = Svg::translate(19);
        assert_eq!(x, 596);
        assert_eq!(y, 652);
    }

    #[test]
    fn test_svg_slot() {
        let slot = Svg::slot(0, 149);
        assert_eq!(
            slot,
            "<g id='slot-1' transform='translate(68,204)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='149' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>149</text></g>",
        );
    }

    #[test]
    fn test_svg_slot_empty() {
        let slot = Svg::slot(0, 0);
        assert_eq!(slot, "<g id='slot-1' transform='translate(68,204)'><use href='#empty' /></g>");
    }

    #[test]
    fn test_svg_encode() {
        let slots: Array<u16> = array![
            0, 0, 0, 149, 168, 187, 0, 0, 0, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0, 0,
        ];
        let defs = Svg::defs(slots.span(), "GAME OVER", true);
        let encoded = Svg::encode(defs);
        assert_eq!(
            encoded,
            "PGRlZnM+PGZpbHRlciBpZD0nZHJvcFNoYWRvdyc+PGZlRHJvcFNoYWRvdyBkeD0nMicgZHk9JzQnIHN0ZERldmlhdGlvbj0nMCcgZmxvb2QtY29sb3I9J2JsYWNrJyBmbG9vZC1vcGFjaXR5PScwLjInIC8+PC9maWx0ZXI+PHJlY3QgaWQ9J2ZyYW1lJyB3aWR0aD0nMTM2JyBoZWlnaHQ9Jzg4JyByeD0nMTYnIHJ5PScxOCcgLz48ZyBpZD0nZW1wdHknPjx1c2UgaHJlZj0nI2ZyYW1lJyBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScwLjA0JyAvPjx1c2UgaHJlZj0nI3RpbGRlJyBmaWxsPSd3aGl0ZScgZmlsbC1vcGFjaXR5PScwLjQ4JyBmaWx0ZXI9J3VybCgjZHJvcFNoYWRvdyknIC8+PC9nPjx0ZXh0IGlkPSd0aWxkZScgeD0nNjgnIHk9JzQ4JyBmb250LXNpemU9JzQ4JyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkb21pbmFudC1iYXNlbGluZT0nbWlkZGxlJz5+PC90ZXh0PjwvZGVmcz4=",
        );
    }
}
