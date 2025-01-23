

function _2D_rotation_matrix(angle) {
  return math.matrix([
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)],
  ]);
}

function normalize(vec) {
  return math.divide(vec, math.norm(vec));
}

function perps(vec) {
  const perp = math.matrix([-vec.get([1]), vec.get([0])])
  return [perp, math.multiply(-1, perp)];
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

function random_choice(arr) {
  const randint = random_integer(0, arr.length-1);
  return arr.at(randint)
}

function random_coordinates(
  borders = [
    [0, 500],
    [0, 500],
  ]
) {
  const [b1, b2] = borders;
  return math.matrix([
    random_integer(b1[0], b1[1]),
    random_integer(b2[0], b2[1]),
  ]);
}



