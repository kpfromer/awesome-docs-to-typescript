interface FunctionsInterface {
  'awful.wibar': (args: {
    position: string;
    stretch: string;
    border_width: number;
    border_color: string;
    ontop: boolean;
    cursor: string;
    visible: boolean;
    opacity: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    screen: screen;
    widget: wibox.widget;
    shape_bounding: unknown;
    shape_clip: unknown;
    shape_input: unknown;
    bg: color;
    bgimage: surface;
    fg: color;
    shape: gears.shape;
    input_passthrough: boolean;
  }) => any;
}
