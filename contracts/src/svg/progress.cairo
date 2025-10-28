use crate::svg::index::Svg;
use crate::svg::interface::SvgTrait;

pub impl Progress of SvgTrait {
    fn gen(slots: Span<u16>, num: u16, test: bool) -> ByteArray {
        Svg::header()
            + Svg::style(test)
            + Private::body(slots, num)
            + Svg::defs(slots, false)
            + Svg::footer()
    }
}

#[generate_trait]
pub impl Private of PrivateTrait {
    fn body(slots: Span<u16>, num: u16) -> ByteArray {
        let mut body = Self::background() + Self::title() + Self::number(num);
        let mut index = 0;
        for slot in slots {
            body += Svg::slot(index, *slot);
            index += 1;
        }
        body
    }

    fn background() -> ByteArray {
        Svg::background("#4719C7")
    }

    fn title() -> ByteArray {
        "<g><path d='M0 0H344V104C344 126 326 144 304 144H0V0Z' fill='#4F1CDF' /><use href='#icon' fill='white' filter='url(#dropShadow)' transform='translate(42,42)' /><text x='110' y='78' font-size='106' text-anchor='start' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >NUMS</text></g>"
    }

    fn number(number: u16) -> ByteArray {
        format!(
            "<g transform='translate(547,0)'><path d='M0 0 H253 V144 H40 C17.909 144 0 126 0 104 V0 Z' fill='#4F1CDF' /><text id='{number}' x='130' y='82' font-size='106' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>{number}</text></g>",
        )
    }
}

#[cfg(test)]
mod tests {
    use super::Progress;

    #[test]
    fn test_svg_progress() {
        let slots: Array<u16> = array![
            0, 0, 0, 149, 168, 187, 0, 0, 0, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0, 0,
        ];
        let svg = Progress::gen(slots.span(), 224, true);
        assert_eq!(
            svg,
            "<svg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><style> @font-face { font-family: 'pixel'; src: url('data:font/ttf;base64,ABC==') format('opentype'); } text { font-family: 'pixel', sans-serif; } </style><rect width='800' height='800' fill='#4719C7' /><g><path d='M0 0H344V104C344 126 326 144 304 144H0V0Z' fill='#4F1CDF' /><use href='#icon' fill='white' filter='url(#dropShadow)' transform='translate(42,42)' /><text x='110' y='78' font-size='106' text-anchor='start' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >NUMS</text></g><g transform='translate(547,0)'><path d='M0 0 H253 V144 H40 C17.909 144 0 126 0 104 V0 Z' fill='#4F1CDF' /><text id='224' x='130' y='82' font-size='106' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>224</text></g><g id='slot-1' transform='translate(68,204)'><use href='#empty' /></g><g id='slot-2' transform='translate(68,316)'><use href='#empty' /></g><g id='slot-3' transform='translate(68,428)'><use href='#empty' /></g><g id='slot-4' transform='translate(68,540)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='149' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>149</text></g><g id='slot-5' transform='translate(68,652)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='168' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>168</text></g><g id='slot-6' transform='translate(244,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='187' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>187</text></g><g id='slot-7' transform='translate(244,316)'><use href='#empty' /></g><g id='slot-8' transform='translate(244,428)'><use href='#empty' /></g><g id='slot-9' transform='translate(244,540)'><use href='#empty' /></g><g id='slot-10' transform='translate(244,652)'><use href='#empty' /></g><g id='slot-11' transform='translate(420,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='590' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>590</text></g><g id='slot-12' transform='translate(420,316)'><use href='#empty' /></g><g id='slot-13' transform='translate(420,428)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='676' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>676</text></g><g id='slot-14' transform='translate(420,540)'><use href='#empty' /></g><g id='slot-15' transform='translate(420,652)'><use href='#empty' /></g><g id='slot-16' transform='translate(596,204)'><use href='#empty' /></g><g id='slot-17' transform='translate(596,316)'><use href='#empty' /></g><g id='slot-18' transform='translate(596,428)'><use href='#empty' /></g><g id='slot-19' transform='translate(596,540)'><use href='#empty' /></g><g id='slot-20' transform='translate(596,652)'><use href='#empty' /></g><defs><filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.24' /></filter><filter id='boxShadow'><feDropShadow dx='2' dy='2' stdDeviation='0' flood-color='black' flood-opacity='0.5' /></filter><rect id='frame' width='136' height='88' rx='16' ry='18' /><g id='empty'><use href='#frame' fill='black' fill-opacity='0.08' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#boxShadow)' /></g><text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>-</text><g id='icon'><path d='m25.3 9.59v9.61h-1.7v-3.3h-0.9-0.9v-2.4l-0.1-2.4h-0.8-0.8l-0.1-1.39c-0.03-0.76-0.05-1.82-0.1-2.36v-0.99h-0.6c-0.3 0-0.7-0.03-0.9-0.06l-0.4-0.06v-3.35h-7.4v8.31h1.9v1.3c0 0.7 0.1 1.8 0.1 2.4v1.2h1 0.9v1.5 1.4h0.8 0.9v0.3c0.1 0.2 0.1 0.6 0.1 0.9l-0.1 0.6h-0.9l-0.9 0.1v-0.9l0.1-0.8h-7.28v1.7h-0.94-0.94l-0.02 2.7-0.03 2.7h0.87l0.87 0.1 0.02 1.8 0.03 1.9h-0.86c-1.04 0-0.95 0.2-1-1.9l-0.05-1.8h-3.54v2.2h-0.795l-0.7955 0.1-0.03224 0.6c-0.01776 0.4-0.00183 1.9 0.03534 3.5l0.0674 2.7 0.749-0.1h0.751l0.03 0.7c0.05 1 0.12 1.1 1.19 1.1h0.78l-0.04 0.8-0.03 0.7h3.68v0.9c0 0.8 0.02 0.9 0.15 0.8h2.73 2.5v-2.5-2.4h-0.9-0.9v-1.8h-0.86-0.84l-0.03-0.9-0.03-0.8h-0.88l-0.89-0.1-0.06-1.8h1.84v1.8h1.95v1.6h1.8l-0.1 1v0.9l1.7-0.1h1.8v-2.6-2.6l0.8-0.1h0.9c0.1 0.1 0.1 1.3 0.1 2.7v2.7h-0.9-0.9l0.1 0.9v0.9h-0.9-0.9v3.3l-0.9 0.1h-0.9v0.9c0 0.7 0 0.9-0.1 0.8s-0.8-0.1-2.75-0.1h-2.63v-1.6h-1.04c-1.57-0.1-2.32-0.1-2.48 0-0.12 0.1-0.14 0.3-0.12 1.7l0.03 1.6h0.86l0.87 0.1 0.03 2.5 0.02 2.5h1.83v1.8h3.58v0.8l0.1 0.7h14.6l-0.1-0.8c0-0.7 0-0.8 0.2-0.8 0.1 0.1 0.5 0.1 1 0.1h0.9v1.6l-0.54 0.1h-0.96-0.4v1.7h-14.7v-1.7h-0.98-0.96v7.4h1.94v0.7 0.9l0.1 0.2h5.4v0.8 0.8h5.5 5.6v-1.6h5.4v-0.4-0.9l0.1-0.5h1.9v-4.5-4.6h0.9 0.8v-3.3h1.7l0.1-0.6c0-0.3 0.1-0.8 0.1-1v-0.4h0.9 0.9v-0.6c0-0.3 0-1.1 0.1-1.7v-1.1h1.8v-13.9h-2v-7.4h-1.8v-1.6h-2.7c-1.5-0.1-2.7-0.1-2.7 0-0.1 0 0 6.1 0 6.7l0.1 0.6h0.8 0.8v2.7 2.7l-0.9 0.1h-0.8v-0.3-2.5c0-2.7 0-2.7-0.7-2.7-0.2 0-0.6 0-0.8-0.1h-0.4v-3.2c0-1.7 0.1-3.3 0.1-3.6l0.1-0.5h1.6v-1.8h1.9v-7.3l-0.1-7.16-0.9-0.02-0.9-0.03v-0.75c0-0.4-0.1-1.03-0.1-1.389l-0.1-0.651h-7.5l0.1 9.59zm-12.7 15.11c0.1 0 0.1 0.3 0.1 0.8v0.8h1.9l-0.2 1.8h1.8l-0.1 0.9c0 1.1 0 1.1-0.9 1.1h-0.8v-1.9l-0.9 0.1h-0.9v-0.9-0.9h-0.9-1v-0.9l0.1-0.9h0.7c0.4-0.1 0.8-0.1 0.9-0.1 0.1 0.1 0.2 0.1 0.2 0.1zm23.9 10.7v3.4h-0.8-0.9v-3.4-3.4h1.7v3.4z' /></g></defs></svg>",
        )
    }
}

