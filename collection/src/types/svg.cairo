use core::num::traits::Zero;
use collection::svg;

#[derive(Drop, Copy, Serde)]
pub enum Svg {
    None,
    New,
    Complete,
    GameOver,
    Progress,
}

#[generate_trait]
pub impl SvgImpl of SvgTrait {
    fn eval(next_number: u16, game_complete: bool, game_over: bool) -> Svg {
        if next_number.is_zero() && !game_over {
            return Svg::New;
        }
        if !game_over {
            return Svg::Progress;
        }
        if game_complete {
            return Svg::Complete;
        }
        Svg::GameOver
    }

    fn gen(self: Svg, slots: Span<u16>, num: u16) -> ByteArray {
        let raw = match self {
            Svg::None => "",
            Svg::New => svg::new::New::gen(slots, num, false),
            Svg::Complete => svg::complete::Completed::gen(slots, num, false),
            Svg::GameOver => svg::game_over::GameOver::gen(slots, num, false),
            Svg::Progress => svg::progress::Progress::gen(slots, num, false),
        };
        "data:image/svg+xml;base64," + svg::index::SvgTrait::encode(raw)
    }
}
