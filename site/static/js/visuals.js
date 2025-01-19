const POINT_RADIUS = 3;
const POINT_COLOR = "red";
const LINE_COLOR = "blue";

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
  true_arc(ctx, point, start, end, radius)
  ctx.stroke();
}

function draw_line_segment(
  ctx,
  line_segment,
  highlight_points = false,
  color = LINE_COLOR
) {
  ctx.strokeStyle = color;
  if (highlight_points) {
    draw_point(ctx, line_segment.p1);
    draw_point(ctx, line_segment.p2);
  }
  ctx.beginPath();
  ctx.moveTo(...line_segment.p1.toArray());
  ctx.lineTo(...line_segment.p2.toArray());
  ctx.stroke();
}

function draw_dotted_line(ctx, p1, p2, dot_length=3, color="blue") {
  const p2_to_p1 = math.subtract(p2, p1);
  const length = math.norm(p2_to_p1);
  const direction = normalize(p2_to_p1);
  const start = p1;
  let end = start;
  let dash = 1;
  ctx.strokeStyle = color
  ctx.beginPath();
  ctx.moveTo(...start.toArray())
  while (math.norm(math.subtract(end, start)) <= length) {
    end = math.add(end, math.multiply(direction, dot_length))
    arr_end = end.toArray();
    dash ? ctx.lineTo(...arr_end) : ctx.moveTo(...arr_end);
    dash = (dash + 1) % 2
  }
  ctx.stroke();
}

function draw_poly(ctx, poly) {
  poly.lines.forEach((line_segment) => {
    draw_line_segment(ctx, line_segment, (highlight_points = false));
  });
}

function draw_observer(ctx, observer) {
  const fov = observer.fov
  const view = observer.view_dir
  const start = Math.atan2(-view.get([1]), view.get([0]));
  draw_point(
    ctx,
    observer.pos,
    "blue",
    10,
    start-fov/2,
    start+fov/2
  );
  draw_line_segment(ctx, observer.vp);
  const ray_points1 = clip_ray(observer.ray1);
  const ray_points2 = clip_ray(observer.ray2);
  draw_dotted_line(ctx, ...ray_points1)
  draw_dotted_line(ctx, ...ray_points2)
}



function random_position() {
  rando
}



function move_with_elegance() {}
