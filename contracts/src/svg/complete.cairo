use crate::svg::index::Svg;
use crate::svg::interface::SvgTrait;

pub impl Completed of SvgTrait {
    fn gen(slots: Span<u16>, num: u16, test: bool) -> ByteArray {
        Svg::header()
            + Svg::style(test)
            + Private::body(slots, num)
            + Svg::defs(slots, true)
            + Svg::footer()
    }
}

#[generate_trait]
pub impl Private of PrivateTrait {
    fn body(slots: Span<u16>, num: u16) -> ByteArray {
        let mut body = Self::background() + Self::title();
        let mut index = 0;
        for slot in slots {
            body += Svg::slot(index, *slot);
            index += 1;
        }
        body
    }

    fn background() -> ByteArray {
        Svg::background("#3A3A3A")
    }

    fn title() -> ByteArray {
        "<g transform='translate(169,0)'><path d='M0 0H462V104C462 126 444 144 422 144H40C17 144 0 126.091 0 104V0Z' fill='#414141' /><text x='231' y='78' font-size='106' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >COMPLETE</text></g>"
    }
}

#[cfg(test)]
mod tests {
    use super::Completed;

    #[test]
    fn test_svg_complete() {
        let slots: Array<u16> = array![
            1, 34, 129, 149, 168, 187, 203, 272, 453, 466, 590, 612, 676, 708, 721, 800, 803, 861,
            915, 1000,
        ];
        let svg = Completed::gen(slots.span(), 417, true);
        assert_eq!(
            svg,
            "<svg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><style> @font-face { font-family: 'pixel'; src: url('data:font/ttf;base64,ABC==') format('opentype'); } text { font-family: 'pixel', sans-serif; } </style><rect width='800' height='800' fill='#3A3A3A' /><g transform='translate(169,0)'><path d='M0 0H462V104C462 126 444 144 422 144H40C17 144 0 126.091 0 104V0Z' fill='#414141' /><text x='231' y='78' font-size='106' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#dropShadow)' >COMPLETE</text></g><g id='slot-1' transform='translate(68,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='1' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>1</text></g><g id='slot-2' transform='translate(68,316)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='34' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>34</text></g><g id='slot-3' transform='translate(68,428)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='129' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>129</text></g><g id='slot-4' transform='translate(68,540)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='149' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>149</text></g><g id='slot-5' transform='translate(68,652)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='168' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>168</text></g><g id='slot-6' transform='translate(244,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='187' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>187</text></g><g id='slot-7' transform='translate(244,316)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='203' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>203</text></g><g id='slot-8' transform='translate(244,428)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='272' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>272</text></g><g id='slot-9' transform='translate(244,540)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='453' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>453</text></g><g id='slot-10' transform='translate(244,652)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='466' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>466</text></g><g id='slot-11' transform='translate(420,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='590' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>590</text></g><g id='slot-12' transform='translate(420,316)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='612' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>612</text></g><g id='slot-13' transform='translate(420,428)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='676' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>676</text></g><g id='slot-14' transform='translate(420,540)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='708' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>708</text></g><g id='slot-15' transform='translate(420,652)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='721' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>721</text></g><g id='slot-16' transform='translate(596,204)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='800' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>800</text></g><g id='slot-17' transform='translate(596,316)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='803' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>803</text></g><g id='slot-18' transform='translate(596,428)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='861' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>861</text></g><g id='slot-19' transform='translate(596,540)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='915' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>915</text></g><g id='slot-20' transform='translate(596,652)'><use href='#frame' fill='black' fill-opacity='0.04' /><text id='1000' x='68' y='48' font-size='64' text-anchor='middle' dominant-baseline='middle' fill='white' filter='url(#boxShadow)'>1000</text></g><defs><filter id='dropShadow'><feDropShadow dx='2' dy='4' stdDeviation='0' flood-color='black' flood-opacity='0.24' /></filter><filter id='boxShadow'><feDropShadow dx='2' dy='2' stdDeviation='0' flood-color='black' flood-opacity='0.5' /></filter><rect id='frame' width='136' height='88' rx='16' ry='18' /><g id='empty'><use href='#frame' fill='black' fill-opacity='0.04' /><use href='#tilde' fill='white' fill-opacity='0.48' filter='url(#boxShadow)' /></g><text id='tilde' x='68' y='48' font-size='48' text-anchor='middle' dominant-baseline='middle'>-</text></defs></svg>",
        )
    }
}

