use alexandria_encoding::base64::Base64ByteArrayEncoder;
use crate::svg::font::Font;

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
        "<style> @font-face { font-family: 'pixel'; src: url('"
            + font
            + "') format('opentype'); } text { font-family: 'pixel', sans-serif; } </style>"
    }

    fn footer() -> ByteArray {
        "</svg>"
    }

    fn background(color: ByteArray) -> ByteArray {
        format!("<rect width='800' height='800' fill='{color}' />")
    }

    fn filter() -> ByteArray {
        "<filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.24' /></filter><filter id='boxShadow'><feDropShadow dx='2' dy='2' stdDeviation='0' flood-color='black' flood-opacity='0.5' /></filter>"
    }

    fn frame() -> ByteArray {
        "<rect id='frame' width='136' height='88' rx='16' ry='18' />"
    }

    fn tilde() -> ByteArray {
        "<text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>-</text>"
    }

    fn icon(over: bool) -> ByteArray {
        if (over) {
            return "";
        }
        "<g id='icon'><path d='m25.3 9.59v9.61h-1.7v-3.3h-0.9-0.9v-2.4l-0.1-2.4h-0.8-0.8l-0.1-1.39c-0.03-0.76-0.05-1.82-0.1-2.36v-0.99h-0.6c-0.3 0-0.7-0.03-0.9-0.06l-0.4-0.06v-3.35h-7.4v8.31h1.9v1.3c0 0.7 0.1 1.8 0.1 2.4v1.2h1 0.9v1.5 1.4h0.8 0.9v0.3c0.1 0.2 0.1 0.6 0.1 0.9l-0.1 0.6h-0.9l-0.9 0.1v-0.9l0.1-0.8h-7.28v1.7h-0.94-0.94l-0.02 2.7-0.03 2.7h0.87l0.87 0.1 0.02 1.8 0.03 1.9h-0.86c-1.04 0-0.95 0.2-1-1.9l-0.05-1.8h-3.54v2.2h-0.795l-0.7955 0.1-0.03224 0.6c-0.01776 0.4-0.00183 1.9 0.03534 3.5l0.0674 2.7 0.749-0.1h0.751l0.03 0.7c0.05 1 0.12 1.1 1.19 1.1h0.78l-0.04 0.8-0.03 0.7h3.68v0.9c0 0.8 0.02 0.9 0.15 0.8h2.73 2.5v-2.5-2.4h-0.9-0.9v-1.8h-0.86-0.84l-0.03-0.9-0.03-0.8h-0.88l-0.89-0.1-0.06-1.8h1.84v1.8h1.95v1.6h1.8l-0.1 1v0.9l1.7-0.1h1.8v-2.6-2.6l0.8-0.1h0.9c0.1 0.1 0.1 1.3 0.1 2.7v2.7h-0.9-0.9l0.1 0.9v0.9h-0.9-0.9v3.3l-0.9 0.1h-0.9v0.9c0 0.7 0 0.9-0.1 0.8s-0.8-0.1-2.75-0.1h-2.63v-1.6h-1.04c-1.57-0.1-2.32-0.1-2.48 0-0.12 0.1-0.14 0.3-0.12 1.7l0.03 1.6h0.86l0.87 0.1 0.03 2.5 0.02 2.5h1.83v1.8h3.58v0.8l0.1 0.7h14.6l-0.1-0.8c0-0.7 0-0.8 0.2-0.8 0.1 0.1 0.5 0.1 1 0.1h0.9v1.6l-0.54 0.1h-0.96-0.4v1.7h-14.7v-1.7h-0.98-0.96v7.4h1.94v0.7 0.9l0.1 0.2h5.4v0.8 0.8h5.5 5.6v-1.6h5.4v-0.4-0.9l0.1-0.5h1.9v-4.5-4.6h0.9 0.8v-3.3h1.7l0.1-0.6c0-0.3 0.1-0.8 0.1-1v-0.4h0.9 0.9v-0.6c0-0.3 0-1.1 0.1-1.7v-1.1h1.8v-13.9h-2v-7.4h-1.8v-1.6h-2.7c-1.5-0.1-2.7-0.1-2.7 0-0.1 0 0 6.1 0 6.7l0.1 0.6h0.8 0.8v2.7 2.7l-0.9 0.1h-0.8v-0.3-2.5c0-2.7 0-2.7-0.7-2.7-0.2 0-0.6 0-0.8-0.1h-0.4v-3.2c0-1.7 0.1-3.3 0.1-3.6l0.1-0.5h1.6v-1.8h1.9v-7.3l-0.1-7.16-0.9-0.02-0.9-0.03v-0.75c0-0.4-0.1-1.03-0.1-1.389l-0.1-0.651h-7.5l0.1 9.59zm-12.7 15.11c0.1 0 0.1 0.3 0.1 0.8v0.8h1.9l-0.2 1.8h1.8l-0.1 0.9c0 1.1 0 1.1-0.9 1.1h-0.8v-1.9l-0.9 0.1h-0.9v-0.9-0.9h-0.9-1v-0.9l0.1-0.9h0.7c0.4-0.1 0.8-0.1 0.9-0.1 0.1 0.1 0.2 0.1 0.2 0.1zm23.9 10.7v3.4h-0.8-0.9v-3.4-3.4h1.7v3.4z' /></g>"
    }

    fn empty(over: bool) -> ByteArray {
        if (over) {
            return "<g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#boxShadow)' /></g>";
        }
        "<g id='empty'><use href='#frame' fill='black' fill-opacity='0.08' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#boxShadow)' /></g>"
    }

    fn defs(slots: Span<u16>, over: bool) -> ByteArray {
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
            "<g id='slot-{slot}' transform='translate({x},{y})'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='{number}' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>{number}</text></g>",
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
        let defs = Svg::defs(slots.span(), true);
        assert_eq!(
            defs,
            "<defs><filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.24' /></filter><filter id='boxShadow'><feDropShadow dx='2' dy='2' stdDeviation='0' flood-color='black' flood-opacity='0.5' /></filter><rect id='frame' width='136' height='88' rx='16' ry='18' /><g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#boxShadow)' /></g><text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>-</text></defs>",
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
            "<g id='slot-1' transform='translate(68,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='149' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>149</text></g>",
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
        let defs = Svg::defs(slots.span(), true);
        let encoded = Svg::encode(defs);
        assert_eq!(
            encoded,
            "PGRlZnM+PGZpbHRlciBpZD0nZHJvcFNoYWRvdyc+PGZlRHJvcFNoYWRvdyBkeD0nMicgZHk9JzQnIHN0ZERldmlhdGlvbj0nMCcgZmxvb2QtY29sb3I9J2JsYWNrJyBmbG9vZC1vcGFjaXR5PScwLjI0JyAvPjwvZmlsdGVyPjxmaWx0ZXIgaWQ9J2JveFNoYWRvdyc+PGZlRHJvcFNoYWRvdyBkeD0nMicgZHk9JzInIHN0ZERldmlhdGlvbj0nMCcgZmxvb2QtY29sb3I9J2JsYWNrJyBmbG9vZC1vcGFjaXR5PScwLjUnIC8+PC9maWx0ZXI+PHJlY3QgaWQ9J2ZyYW1lJyB3aWR0aD0nMTM2JyBoZWlnaHQ9Jzg4JyByeD0nMTYnIHJ5PScxOCcgLz48ZyBpZD0nZW1wdHknPjx1c2UgaHJlZj0nI2ZyYW1lJyBmaWxsPSdibGFjaycgZmlsbC1vcGFjaXR5PScwLjA0JyAvPjx1c2UgaHJlZj0nI3RpbGRlJyBmaWxsPSd3aGl0ZScgZmlsbC1vcGFjaXR5PScwLjQ4JyBmaWx0ZXI9J3VybCgjYm94U2hhZG93KScgLz48L2c+PHRleHQgaWQ9J3RpbGRlJyB4PSc2OCcgeT0nNDgnIGZvbnQtc2l6ZT0nNDgnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGRvbWluYW50LWJhc2VsaW5lPSdtaWRkbGUnPi08L3RleHQ+PC9kZWZzPg==",
        );
    }
}
