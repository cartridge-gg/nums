use collection::svg::index::Svg;
use collection::svg::interface::SvgTrait;

pub impl GameOver of SvgTrait {
    fn gen(slots: Span<u16>, num: u16, test: bool) -> ByteArray {
        Svg::header()
            + Svg::style(test)
            + Private::body(slots, num)
            + Svg::defs(slots, "GAME OVER", true)
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
        Svg::background("#979797")
    }

    fn title() -> ByteArray {
        "<g transform='translate(0,0)'><path d='M0 0H444V104C444 126.091 426.091 144 404 144H0V0Z' fill='#8F8F8F' /><text x='40' y='78' font-size='72' text-anchor='start' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >GAME OVER</text></g>"
    }

    fn number(number: u16) -> ByteArray {
        format!(
            "<g transform='translate(587,0)'><path d='M0 0 H213 V144 H40 C17.909 144 0 126.091 0 104 V0 Z' fill='#8F8F8F' /><text id='{number}' x='110' y='82' font-size='82' text-anchor='middle' dominant-baseline='middle' fill='#F77272' filter='url(#dropShadow)'>{number}</text></g>",
        )
    }
}

#[cfg(test)]
mod tests {
    use super::GameOver;

    #[test]
    fn test_svg_game_over() {
        let slots: Array<u16> = array![
            0, 0, 0, 149, 168, 187, 0, 0, 0, 0, 590, 0, 676, 0, 0, 0, 0, 0, 0, 0,
        ];
        let svg = GameOver::gen(slots.span(), 417, true);
        assert_eq!(
            svg,
            "<svg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><style> @font-face { font-family: 'ekamai'; src: url('data:font/ttf;base64,ABC==') format('woff2'); } text { font-family: 'ekamai', sans-serif; } </style><rect width='800' height='800' fill='#979797' /><g transform='translate(0,0)'><path d='M0 0H444V104C444 126.091 426.091 144 404 144H0V0Z' fill='#8F8F8F' /><text x='40' y='78' font-size='72' text-anchor='start' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >GAME OVER</text></g><g transform='translate(587,0)'><path d='M0 0 H213 V144 H40 C17.909 144 0 126.091 0 104 V0 Z' fill='#8F8F8F' /><text id='417' x='110' y='82' font-size='82' text-anchor='middle' dominant-baseline='middle' fill='#F77272' filter='url(#dropShadow)'>417</text></g><g id='slot-1' transform='translate(68,204)'><use href='#empty' /></g><g id='slot-2' transform='translate(68,316)'><use href='#empty' /></g><g id='slot-3' transform='translate(68,428)'><use href='#empty' /></g><g id='slot-4' transform='translate(68,540)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='149' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>149</text></g><g id='slot-5' transform='translate(68,652)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='168' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>168</text></g><g id='slot-6' transform='translate(244,204)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='187' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>187</text></g><g id='slot-7' transform='translate(244,316)'><use href='#empty' /></g><g id='slot-8' transform='translate(244,428)'><use href='#empty' /></g><g id='slot-9' transform='translate(244,540)'><use href='#empty' /></g><g id='slot-10' transform='translate(244,652)'><use href='#empty' /></g><g id='slot-11' transform='translate(420,204)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='590' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>590</text></g><g id='slot-12' transform='translate(420,316)'><use href='#empty' /></g><g id='slot-13' transform='translate(420,428)'><use href='#frame' fill='white' fill-opacity='0.04' /><text id='676' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)'>676</text></g><g id='slot-14' transform='translate(420,540)'><use href='#empty' /></g><g id='slot-15' transform='translate(420,652)'><use href='#empty' /></g><g id='slot-16' transform='translate(596,204)'><use href='#empty' /></g><g id='slot-17' transform='translate(596,316)'><use href='#empty' /></g><g id='slot-18' transform='translate(596,428)'><use href='#empty' /></g><g id='slot-19' transform='translate(596,540)'><use href='#empty' /></g><g id='slot-20' transform='translate(596,652)'><use href='#empty' /></g><defs><filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.2' /></filter><rect id='frame' width='136' height='88' rx='16' ry='18' /><g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#dropShadow)' /></g><text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>~</text></defs></svg>",
        )
    }
}

