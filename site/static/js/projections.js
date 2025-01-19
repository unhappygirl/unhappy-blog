const ORIGIN = math.matrix([0, 0]);
const BASIS = [math.matrix([1, 0]), math.matrix([0, 1])];

function segment_collision(ls1, ls2) {
  const diff = math.subtract(ls2.known_point, ls1.known_point);
  const comatrix = math.matrix([
    [ls1.direction.get([0]), -ls2.direction.get([0])],
    [ls1.direction.get([1]), -ls2.direction.get([1])],
  ]);
  const solutions = find_linear_solutions(comatrix, diff);
  return solutions;
}

class Viewport2D extends LineSegment {
  perspective_project(observer, point) {
    const o_to_p = normalize(math.subtract(point, observer.pos));
    return segment_collision(
      { known_point: observer.pos, direction: o_to_p },
      this
    );
  }
}

class Observer {
  constructor(pos, view_dir, fov) {
    this.pos = math.matrix(pos);
    this.view_dir = normalize(math.matrix(view_dir));
    this.fov = fov;
    this.d = 40; // distance from the viewport
    const r1 = rotate(this.view_dir, ORIGIN, fov/2)
    const r2 = rotate(this.view_dir, ORIGIN, -fov/2)
    const H = this.d / Math.cos(fov/2)
    const vp_p1 = math.add(this.pos, math.multiply(r1, H))
    const vp_p2 = math.add(this.pos, math.multiply(r2, H))
    console.log(vp_p1, vp_p2)
    this.vp = new Viewport2D(vp_p1, vp_p2);
    this.ray1 = new Ray(this.pos, r1)
    this.ray2 = new Ray(this.pos, r2)
  }

  displace(tvec) {
    this.pos = math.add(this.pos, tvec);
    this.vp.displace(tvec);
    this.ray1.displace(tvec)
    this.ray2.displace(tvec)
  }

  rotate(angle) {
    this.view_dir = rotate(this.view_dir, ORIGIN, angle);
    this.ray1.rotate(angle)
    this.ray2.rotate(angle)
    this.vp.rotate(this.pos, angle);
  }

  project(point) {
    return this.vp.perspective_project(this, point);
  }
}
function perspective_divide(homo_matrix, _3D = false) {
  const z = homo_matrix.get([2]);
  const normalized = math.divide(homo_matrix, z);
  return normalized;
}
