

function _2D_rotation_matrix(angle) {
  return math.matrix([
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)],
  ]);
}

function normalize(vec) {
  return math.divide(vec, math.norm(vec));
}

function find_linear_solutions(coefficient_matrix, RHS_matrix) {
  const inv = math.inv(coefficient_matrix);
  return math.multiply(inv, RHS_matrix);
}

function rotate(point, refpoint, angle) {
    // Standardize
    let spoint = math.subtract(point, refpoint);
    //
    const rot = _2D_rotation_matrix(angle);
    spoint = math.multiply(spoint, rot);
    spoint = math.add(spoint, refpoint);
    return spoint;
}


function clip_ray(ray, borders=[[0, 500], [0, 500]]) {
  let potential_ts = [];
  let t, tempd;
  for (const i in borders) {
    for (const value of borders.at(i)) {
      tempd = ray.direction.get([parseInt(i)]);
      // Handle division by zero
      if (tempd == 0) {
        potential_ts.push(Infinity)
        continue;
      }
      // ...
      t = (value - ray.origin.get([parseInt(i)])) / tempd
      if (t > 0) {
        potential_ts.push(t)
      }
    }
  }
  return [ray.origin, math.add(
    math.multiply(
      Math.min(...potential_ts), ray.direction), ray.origin)
    ];
}


function random_integer(min, max) {
  min = Math.ceil(Math.min(min, max));
  max = Math.floor(Math.max(min, max));
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function random_point() {}

