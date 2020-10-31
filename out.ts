interface Awful {
  /**
   * @noSelf
   */
  wibar: (args: {
    position: string,
    stretch: string,
    border_width: number,
    border_color: string,
    ontop: boolean,
    cursor: string,
    visible: boolean,
    opacity: number,
    type: string,
    x: number,
    y: number,
    width: number,
    height: number,
    screen: screen,
    widget: wibox.widget,
    shape_bounding: unknown,
    shape_clip: unknown,
    shape_input: unknown,
    bg: color,
    bgimage: surface,
    fg: color,
    shape: gears.shape,
    input_passthrough: boolean,
  }) => unknown;
}
interface FunctionsInterface {
  awful: Awful;
}
interface ObjectPropertiesInterface {
  stretch: boolean;
  width: number;
  height: number;
  position: unknown;
  border_width: unknown;
  border_color: unknown;
  ontop: unknown;
  cursor: unknown;
  visible: unknown;
  opacity: number;
  type: unknown;
  x: unknown;
  y: unknown;
  screen: unknown;
  drawable: drawable;
  widget: unknown;
  window: unknown;
  shape: gears.shape;
  input_passthrough: unknown;
  bg: unknown;
  bgimage: unknown;
  fg: unknown;
}
interface ThemeVariablesInterface {
  "beautiful.wibar_stretch": boolean;
  "beautiful.wibar_border_width": number;
  "beautiful.wibar_border_color": string;
  "beautiful.wibar_ontop": boolean;
  "beautiful.wibar_cursor": string;
  "beautiful.wibar_opacity": number;
  "beautiful.wibar_type": string;
  "beautiful.wibar_width": number;
  "beautiful.wibar_height": number;
  "beautiful.wibar_bg": color;
  "beautiful.wibar_bgimage": surface;
  "beautiful.wibar_fg": color;
  "beautiful.wibar_shape": gears.shape;
}
interface DeprecatedFunctionsInterface {}
interface Wibar {
  buttons: (buttons_table: unknown) => unknown;
  geometry: (A: unknown) => unknown;
  struts: (strut: unknown) => unknown;
  setup: (args: unknown) => unknown;
  find_widgets: (x: number, y: number) => unknown;
}
interface MethodsInterface {
  awful: Awful;
}
