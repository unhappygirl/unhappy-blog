const ORIGIN = math.matrix([0, 0]);
const BASIS = [math.matrix([1, 0]), math.matrix([0, 1])];

var M_projection;

function segment_collision(ls1, ls2) {
  const diff = math.subtract(ls2.known_point, ls1.known_point);
  const comatrix = math.matrix([
    [ls1.direction.get([0]), -ls2.direction.get([0])],
    [ls1.direction.get([1]), -ls2.direction.get([1])],
  ]);
  const solutions = find_linear_solutions(comatrix, diff);
  return solutions;
}

function perspective_divide(homo_matrix, _3D = false) {
  const z = homo_matrix.get([2]);
  const normalized = math.divide(homo_matrix, z);
  return math.subset(normalized, math.index(math.range(0, 2)));
}

function projection_matrix2D(camera_pos, camera_direction, viewport_distance) {
  const [dx, dy] = camera_direction.toArray();
  let projection = math.identity(3).set([2, 0], 1 / viewport_distance);
  projection.set([2, 2], 0);
  projection.set([2, 1], 0);
  const view = math.matrix([
    [dx, dy, 0],
    [-dy, dx, 0],
    [0, 0, 1],
  ]);
  const translation = math.matrix([
    [1, 0, -camera_pos.get([0])],
    [0, 1, -camera_pos.get([1])],
    [0, 0, 1],
  ]);
  return math.multiply(projection, math.multiply(view, translation));
}

class Viewport2D extends LineSegment {
  perspective_project(observer, point) {
    let homo = math.matrix([...point.toArray(), 1]);
    M_projection = projection_matrix2D(
      observer.pos,
      observer.view_dir,
      observer.d
    );
    homo = math.multiply(M_projection, homo);
    return perspective_divide(homo);
  }
}

class Observer {
  constructor(pos, view_dir, fov) {
    this.pos = math.matrix(pos);
    this.view_dir = normalize(math.matrix(view_dir));
    this.fov = fov;
    this.d = 50; // distance from the viewport
    const r1 = rotate(this.view_dir, ORIGIN, fov / 2);
    const r2 = rotate(this.view_dir, ORIGIN, -fov / 2);
    const H = this.d / Math.cos(fov / 2);
    const vp_p1 = math.add(this.pos, math.multiply(r1, H));
    const vp_p2 = math.add(this.pos, math.multiply(r2, H));
    this.vp = new Viewport2D(vp_p1, vp_p2, "blue");
    const perps_ = perps(this.view_dir);
    this.rays = [
      new Ray(this.pos, r1),
      new Ray(this.pos, r2),
      new Ray(this.vp.p2, perps_[1]),
      new Ray(this.vp.p1, perps_[0]),
    ];
    this.elegant_rotation = 0;
  }

  displace(tvec) {
    this.pos = math.add(this.pos, tvec);
    this.vp.displace(tvec);
    this.rays.forEach((ray) => {
      ray.displace(tvec);
    });
  }

  rotate(angle) {
    this.view_dir = rotate(this.view_dir, ORIGIN, angle);
    this.rays.forEach((ray) => {
      ray.rotate(angle);
    });
    this.vp.rotate(this.pos, angle);
    this.rays[2].displace(math.subtract(this.vp.p1, this.rays[2].origin));
    this.rays[3].displace(math.subtract(this.vp.p2, this.rays[3].origin));
  }

  project(point) {
    return this.vp.perspective_project(this, point);
  }

  move_to(destination, step) {
    if (math.norm(math.subtract(this.pos, destination)) < 0.1) {
      this.arrived = true;
      return;
    }
    const tvec = math.subtract(destination, this.pos);
    const angle = Math.atan2(-tvec.get([1]), tvec.get([0]));
    if (this.rotation_complete) {
      this.displace(math.multiply(tvec, step));
      return;
    }
    this.rotate_with_elegance(angle + this.fov / 2, 0.02);
  }

  rotate_with_elegance(destination, step) {
    if (this.elegant_rotation <= destination) {
      this.rotate(step)
      this.elegant_rotation += step;
      return
    }
    this.rotation_complete = true;
    this.elegant_rotation = 0;
  }
}
