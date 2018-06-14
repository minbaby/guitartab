export class Tab {
    public paper: any;
    public width: number;
    public height: number;
    public tab_spacing: number;
    public font_size: number;
    public note_spacing: number;
    public string_spacing: number;
    public stringS: number;
    public fret: string;
    public duration: number;
    public grace: undefined;
    public new_bar: number;
    public bar_internal_offset: number;
    public total_duration: number;
    public x: number;
    public y: number;

    public readonly num_strings = 6;
    public readonly num_bars = 5;

    constructor(raphael: any, x: number, y: number, width: number, height: number) {
        this.paper = raphael;
        this.x = x;
        this.y = y;

        this.width = (!width) ? 900 : width;
        this.height = (!height) ? 60 : height;

        this.tab_spacing = 320;

        // Content
        this.font_size = 10;
        this.note_spacing = 20;
        this.string_spacing = this.height / (this.num_strings - 1);
        this.stringS = 0;
        this.fret = 'X';
        this.duration = 0;
        this.grace = undefined;

        this.new_bar = 0;
        this.bar_internal_offset = 0;

        this.total_duration = 0

    }

    verLine(x: number, y: number, new_y: number) {
        return this.paper.path("M" + x + " " + y + "V" + new_y);
    }

    horLine(x: number, y: number, new_x: number) {
        return this.paper.path("M" + x + " " + y + "H" + new_x);
    }

    arcLine(x: number, y: number, mid_x: number, mid_y: number, end_x: number, end_y: number) {
        return this.paper.path("M" + x + " " + y + "S" + " " + mid_x + " " + mid_y + " " + end_x + " " + end_y)
    }

    draw_six_line() {
        for (let i = 0; i < this.num_strings; i++) {
            this.horLine(this.x, this.y + this.string_spacing * i, this.x + this.width)
        }
    }

    draw_bar_line() {
        let bar_width = Math.floor(this.width / this.num_bars);
        let spacing = this.height / (this.num_strings - 1);
        for (let i = 0; i <= this.num_bars; i++) {
            this.verLine(this.x + bar_width * i, this.y, this.y + spacing * (this.num_strings - 1))
        }
    }

    draw_fret_note(x: number, y: number, f: string) {
        if (f == '⟿') {
            this.paper.text(x, y - this.string_spacing * 1.5, f).attr("font-size", this.font_size * 2.5).rotate(-90)
        } else {
            this.paper.text(x, y, f).attr("font-size", this.font_size)
        }
    }

    draw_fingering(tab_x0: number) {
        let ss = this.stringS.toString();
        let x = this.x;
        if (Math.floor(this.total_duration) == this.total_duration) {
            x += this.note_spacing;
            this.new_bar = 1;
            this.bar_internal_offset = 0
        } else {
            this.new_bar = 0;
            this.bar_internal_offset += 1
        }

        let d = this.duration;
        this.total_duration += d;
        for (let i = 0; i < ss.length; i++) {
            let s = parseInt(ss[i]); // string
            let f = this.fret.split('/')[i]; // fret
            let y = this.y + this.string_spacing * (s - 1);
            this.draw_fret_note(x, y, f)
        }

        //ss[0]是最小的那根弦
        let grace_y = this.y + this.string_spacing * (parseInt(ss[0]) - 1);
        this.draw_grace_note(x, grace_y, d);

        let gap = d * (this.width / this.num_bars - this.note_spacing);

        //ss[-1]是最大的那根弦
        let duration_y_start = this.y + this.string_spacing * parseInt(ss[ss.length - 1]);
        let duration_y_end = this.y + this.string_spacing * (this.num_strings + 0.5);
        let duration_x_end = x + gap * (0.5 - this.bar_internal_offset % 2);

        this.draw_duration_line(x, duration_y_start, duration_x_end, duration_y_end);

        this.x = x + gap;
        if (this.total_duration % this.num_bars == 0) {
            this.x = tab_x0;
            this.y += this.tab_spacing
        }
    }

    draw_duration_line(x: number, y: number, new_x: number, new_y: number) {
        let gap = this.duration * (this.width / this.num_bars - this.note_spacing);
        switch (this.duration) {
            case 0:
                //休止符
                break;
            case 0.125:
                // 八分音符
                this.paper.verLine(x, y, new_y);
                this.paper.horLine(x, new_y, new_x).attr("stroke-width", 2);
                break;
            case 0.25:
                // 四分音符
                this.paper.verLine(x, y, new_y);
                break;
            case 0.5:
                // 二分音符
                this.paper.verLine(x, y, new_y);
                this.paper.text(x + gap / 2, this.y + this.string_spacing * 2.5, '—').attr("font-weight", "bold");
                break;
            case 1:
                // 全音符
                this.paper.verLine(x, y, new_y);
                this.paper.text(x + gap * 1 / 4, this.y + this.string_spacing * 2.5, '—').attr("font-weight", "bold");
                this.paper.text(x + gap * 2 / 4, this.y + this.string_spacing * 2.5, '—').attr("font-weight", "bold");
                this.paper.text(x + gap * 3 / 4, this.y + this.string_spacing * 2.5, '—').attr("font-weight", "bold");
                break
        }
    }

    draw_grace_note(x: number, y: number, d: number) {
        let grace = this.grace; //装饰音
        // 延音/滑音/点弦/勾弦 线条有待改进
        let gap = d * (this.width / this.num_bars - this.note_spacing);
        if (Math.floor(this.total_duration) == this.total_duration) {
            gap += this.note_spacing
        }
        switch (grace) {
            case undefined:
                break;
            case '^':
                this.paper.arcLine(
                    x,
                    y - this.string_spacing / 2,
                    x + 1 / 2 * gap,
                    y - this.string_spacing * 1.3,
                    x + gap,
                    y - this.string_spacing / 2
                ).attr("stroke-width", 1.2);
                break;
            case 's':
                this.paper.arcLine(
                    x,
                    y - this.string_spacing / 2,
                    x + 1 / 2 * gap,
                    y - this.string_spacing * 1.3,
                    x + gap,
                    y - this.string_spacing / 2
                ).attr("stroke-width", 1.2);
                this.paper.text(x + this.note_spacing * 0.5, y - this.string_spacing * 1.5, 's').attr("font-size", this.font_size * 1.3);
                break;
            default:
                break
        }
    }

    draw_tabs(fingering: any, num_groups: any, tab_x0: number, tab_y0: number) {
        let x = tab_x0;
        let y = tab_y0;
        for (let i = 0; i < num_groups; i++) {
            let tab = new Tab(this, x, y, 0, 0);
            tab.draw_six_line();
            tab.draw_bar_line();
            y += tab.tab_spacing
        }
        let tab = new Tab(this, tab_x0, tab_y0, 0, 0);
        for (let i = 0; i < fingering.length; i++) {
            tab.stringS = fingering[i][0];
            tab.fret = fingering[i][1];
            tab.duration = fingering[i][2];
            tab.grace = fingering[i][3];
            tab.draw_fingering(0)
        }
    }
}