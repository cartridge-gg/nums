use nums::elements::achievements::interface::{
    AchievementTrait, ArcadeTask, Task, TaskTrait,
};

pub impl King of AchievementTrait {
    
    fn identifier(level: u8) -> felt252 {
        match level {
            0 => 'KOTH_I',
            1 => 'KOTH_II',
            2 => 'KOTH_III',
            3 => 'KOTH_IV',
            4 => 'KOTH_V',
            _ => '',
        }
    }

    
    fn index(level: u8) -> u8 {
        level
    }

    
    fn hidden(level: u8) -> bool {
        false
    }

    
    fn points(level: u8) -> u16 {
        match level {
            0 => 30,
            1 => 40,
            2 => 50,
            3 => 60,
            4 => 70,
            _ => 0,
        }
    }

    
    fn group() -> felt252 {
        'King of the Hill'
    }

    
    fn icon(level: u8) -> felt252 {
        match level {
            0 => 'fa-chess-pawn',
            1 => 'fa-chess-knight',
            2 => 'fa-chess-bishop',
            3 => 'fa-chess-rook',
            4 => 'fa-chess-king',
            _ => '',
        }
    }

    
    fn title(level: u8) -> felt252 {
        match level {
            0 => 'Lucky',
            1 => 'Challenger',
            2 => 'Expert',
            3 => 'Veteran',
            4 => 'King',
            _ => '',
        }
    }

    
    fn description(level: u8) -> ByteArray {
        match level {
            0 => "Better lucky than good!",
            1 => "Fortune favors the bold.",
            2 => "Practice makes perfect.",
            3 => "Endurance is patience concentrated.",
            4 => "Heavy is the head that wears the crown.",
            _ => "",
        }
    }

    
    fn tasks(level: u8) -> Span<ArcadeTask> {
        let count: u32 = match level {
            0 => 5,
            1 => 10,
            2 => 25,
            3 => 50,
            4 => 100,
            _ => 0,
        };
        Task::King.tasks(count)
    }
}
