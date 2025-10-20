use core::num::traits::Zero;
use crate::svg;

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
    fn eval(number: u16, game_complete: bool, game_over: bool) -> Svg {
        if number.is_zero() && !game_over {
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

    fn gen(self: Svg, slots: Span<u16>, number: u16) -> ByteArray {
        let raw = match self {
            Svg::None => "",
            Svg::New => svg::new::New::gen(slots, number, false),
            Svg::Complete => svg::complete::Completed::gen(slots, number, false),
            Svg::GameOver => svg::game_over::GameOver::gen(slots, number, false),
            Svg::Progress => svg::progress::Progress::gen(slots, number, false),
        };
        "data:image/svg+xml;base64," + svg::index::SvgTrait::encode(raw)
    }
}
