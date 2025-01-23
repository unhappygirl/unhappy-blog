const POINT_RADIUS = 3;
const POINT_COLOR = "red";

const COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "magenta",
  "cyan",
  "purple",
  "yellow",
  "black",
  "brown",
  "gray",
  "pink",
  "lightblue",
  "lightgreen",
  "lightyellow",
  "lightgray",
  "lightpink",
  "lightbrown",
  "lightcyan",
  "lightpurple",
  "lightorange",
  "lightmagenta",
  "lightred",
  "darkred",
  "darkblue",
  "darkgreen",
  "darkorange",
  "darkmagenta",
  "darkcyan",
  "darkpurple",
  "darkyellow",
  "darkgray",
  "darkbrown",
  "white",
  "teal",
  "navy",
  "gold",
  "silver",
  "maroon",
  "olive",
  "lime",
  "coral",
  "beige",
  "khaki",
  "lavender",
  "turquoise",
  "peach",
  "aqua",
  "indigo",
  "crimson",
  "charcoal",
  "ivory",
  "mint",
  "plum",
  "salmon",
  "sienna",
  "emerald",
  "amber",
  "chocolate",
  "tan",
  "azure",
  "rose",
  "periwinkle",
  "orchid",
  "fuchsia",
  "scarlet",
  "amethyst",
  "mustard",
  "cobalt",
  "brickred",
  "forestgreen",
  "midnightblue",
  "skyblue",
  "sunsetorange",
  "lemonyellow",
  "pastelpink",
  "pastelgreen",
  "pastelblue",
  "pastelpurple",
  "neongreen",
  "neonyellow",
  "neonpink",
  "neonorange",
  "neonblue",
  "neonpurple"
];


function true_arc(ctx, center, start, end, radius) {
  ctx.arc(center.get([0]), center.get([1]), radius, -start, -end, true);
}

function draw_point(
  ctx,
  point,
  color = POINT_COLOR,
  radius = POINT_RADIUS,
  start = 0,
  end = Math.PI * 2
) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  true_arc(ctx, point, start, end, radius);
  ctx.stroke();
}

function draw_line_segment(ctx, line_segment, highlight_points = false) {
  ctx.strokeStyle = line_segment.color;
  ctx.beginPath();
  ctx.moveTo(...line_segment.p1.toArray());
  ctx.lineTo(...line_segment.p2.toArray());
  ctx.stroke();
  if (highlight_points) {
    draw_point(ctx, line_segment.p1, (color = line_segment.color));
    draw_point(ctx, line_segment.p2, (color = line_segment.color));
  }
}

function draw_dotted_line(ctx, p1, p2, dot_length = 3, color = "blue") {
  const p2_to_p1 = math.subtract(p2, p1);
  const length = math.norm(p2_to_p1);
  const direction = normalize(p2_to_p1);
  const start = p1;
  let end = start;
  let dash = 1;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(...start.toArray());
  while (math.norm(math.subtract(end, start)) <= length) {
    end = math.add(end, math.multiply(direction, dot_length));
    arr_end = end.toArray();
    dash ? ctx.lineTo(...arr_end) : ctx.moveTo(...arr_end);
    dash = (dash + 1) % 2;
  }
  ctx.stroke();
}

function draw_ray(ctx, ray, color = "blue", dotted = false) {
  const [rx, ry] = clip_ray(ray);
  dotted
    ? draw_dotted_line(ctx, rx, ry, undefined, color)
    : draw_line_segment(ctx, {
        p1: rx,
        p2: ry,
        color: color,
      });
}

function draw_poly(ctx, poly) {
  poly.lines.forEach((line_segment) => {
    draw_line_segment(ctx, line_segment, (highlight_points = false));
  });
}

function draw_observer(ctx, observer) {
  const fov = observer.fov;
  const view = observer.view_dir;
  const start = Math.atan2(-view.get([1]), view.get([0]));
  let latter;
  draw_point(ctx, observer.pos, "black", 10, start - fov / 2, start + fov / 2);
  draw_line_segment(ctx, observer.vp);
  for (const i in observer.rays) {
    const ray = observer.rays[i];
    latter = i > 1
    draw_ray(ctx, ray, latter ? "gray" : undefined, (dotted = latter));
  }
}


function random_color() {
  return random_choice(COLORS);
}

function random_line_segment(
  borders = [
    [0, 500],
    [0, 500],
  ]
) {
  return new LineSegment(
    random_coordinates(borders),
    random_coordinates(borders),
    random_color()
  );
}
