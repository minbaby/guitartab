interface X {
    [key: string]: Y;
}

interface Y {
    [key: string]: string;
}

export class Chord {

    x: number;
    y: number;
    width: number;
    height: number;

    readonly defaultWidth = 60;

    readonly defaultHeight = 70;

    num_strings: number;
    num_frets: number;

    string_spacing: number;

    fret_spacing: number;

    name_size: number;

    chord_name: string;

    duration: number;

    paper: any;

    readonly chords: X = {
        "C": {"positions": "x32010", "fingers": "-32-1-"},
        "D": {"positions": "xx0232", "fingers": "---132"},
        "D7": {"positions": "xx0212", "fingers": "---213"},
        "A": {"positions": "x02220", "fingers": "--123-"},
        "Gmaj7/d": {"positions": "320002", "fingers": "32---1"},
        "Gsus2": {"positions": "300233", "fingers": "2--134"},
        "A7sus4": {"positions": "002233", "fingers": "--1123"},
        "Csus2": {"positions": "035533", "fingers": "-13411"},
        "#Cm": {"positions": "x46654", "fingers": "-13421"},
        "Em7": {"positions": "002433", "fingers": "--1423"},
        "Em7(7)": {"positions": "x79787", "fingers": "-13121"}
    };

    constructor(paper: any, x: number, y: number, width: number, height: number) {
        this.paper = paper;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.width = (!width) ? 60 : width;
        this.height = (!height) ? 70 : height;
        this.num_strings = 6;
        this.num_frets = 5;

        this.string_spacing = this.width / (this.num_strings - 1);
        this.fret_spacing = this.height / this.num_frets;

        // Content
        this.name_size = 15;
        this.chord_name = "";
        this.duration = 0;
    }

    setChord(chord_name: string, duration: number) {
        this.chord_name = chord_name;
        this.duration = duration;
        return this
    }

    draw() {
        let string_spacing = this.string_spacing;
        let fret_spacing = this.fret_spacing;
        let chord_name = this.chord_name;

        // Draw strings
        for (let i = 0; i < this.num_strings; i++) {
            this.paper.verLine(this.x + string_spacing * i, this.y, this.y + this.height - fret_spacing / 2)
        }

        // Draw frets
        for (let i = 0; i < this.num_frets; i++) {
            this.paper.horLine(this.x, this.y + fret_spacing * i, this.x + this.width)
        }

        // Draw chord name
        this.paper.text(this.x + this.width / 2, this.y - fret_spacing, chord_name).attr("font-size", this.name_size);
        if (!this.chords[chord_name]) {
            return
        }

        // Draw min_fret
        let max = 0;
        for (let i = 0; i < this.num_strings; i++) {
            let fret = Math.floor(parseInt(this.chords[chord_name]["positions"][i]));
            if (fret > max) {
                max = fret
            }
        }
        let min = max;
        for (let i = 0; i < this.num_strings; i++) {
            let fret = Math.floor(parseInt(this.chords[chord_name]["positions"][i]));
            if (fret != 0 && fret < min) {
                min = fret
            }
        }
        let capo = 1;
        if (max < 5) {
            capo = 1
        } else if (max >= 5) {
            capo = min
        }
        if (capo != 1) {
            this.paper.text(this.x - string_spacing * 0.5, this.y + fret_spacing * 0.5, capo)
        }

        // Draw finger
        for (let i = 0; i < 6; i++) {
            let position = this.chords[chord_name]["positions"][i];
            let finger = this.chords[chord_name]["fingers"][i];
            if (position == 'x') {
                this.paper.text(this.x + string_spacing * i, this.y - fret_spacing / 4, "x")
            }
            else if (position == '0') {
                this.paper.text(this.x + string_spacing * i, this.y - fret_spacing / 4, "o")
            }
            else {
                let fret = Math.floor(parseInt(position));
                this.paper.circle(this.x + string_spacing * i, this.y + fret_spacing * (fret - capo + 1) - fret_spacing / 2, fret_spacing / 3).attr("fill", "black");
                this.paper.text(this.x + string_spacing * i, this.y + fret_spacing * (fret - capo + 1) - fret_spacing / 2, finger).attr("fill", "white")
            }
        }
        return
    }

    draw_chords(chord_list: any, tab_x0: number, tab_y0: number, tab_y_width: number, tab_x_width: number, bars_num_oneline: number) {
        let x = tab_x0;
        let y = tab_y0 - tab_y_width / 4.5;
        let total_chord_duration = 0;

        // 和弦
        for (let i = 0; i < chord_list.length; i++) {
            let chord = new Chord(this, x, y, 0, 0);
            let c = chord_list[i][0];
            let d = chord_list[i][1];
            chord.setChord(c, d);
            chord.draw();

            total_chord_duration += d;

            x = x + d * (tab_x_width / bars_num_oneline);
            if (total_chord_duration % bars_num_oneline == 0) {
                x = tab_x0;
                y = y + tab_y_width
            }
        }
    }
}