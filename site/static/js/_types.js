

class LineSegment {
  constructor(p1, p2) {
    this.p1 = math.matrix(p1);
    this.p2 = math.matrix(p2);
    this.length = math.norm(math.subtract(this.p2, this.p1))
    this.known_point = this.p1;
    this.direction = this.init_direction();
  }

  init_direction() {
    const direction = math.matrix(math.subtract(this.p2, this.p1));
    return normalize(direction);
  }

  init_normals() {}

  displace(tvec) {
    this.p1 = math.add(this.p1, tvec)
    this.p2 = math.add(this.p2, tvec)
    this.known_point = this.p1
  }

  rotate(refpoint, angle) {
    this.p1 = rotate(this.p1, refpoint, angle)
    this.p2 = rotate(this.p2, refpoint, angle)
    this.known_point = this.p1
    this.direction = this.init_direction()
  }
}

class Line {}


class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  rotate(angle) {
    this.direction = rotate(this.direction, ORIGIN, angle);
  }

  displace(tvec) {
    this.origin = math.add(this.origin, tvec);
  }
}

class Poly {
  constructor(line_segments) {
    this.line_segments = line_segments;
  }
}
