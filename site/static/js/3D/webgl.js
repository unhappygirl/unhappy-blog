

const URL = "/cow";
const parser = new ObjParser();


function identitym4() {
  return glMatrix.mat4.identity(glMatrix.mat4.create());
}

const I = identitym4();

function perps(vec) {
  const perp = math.matrix([-vec.get([1]), vec.get([0])])
  return [perp, math.multiply(-1, perp)];
}

function rotate_mat4(point, angle, axis) {
  const R = identitym4();
  glMatrix.mat4.rotate(R, R, glMatrix.glMatrix.toRadian(angle), axis);
  const p = glMatrix.vec4.fromValues(point[0], point[1], point[2], 1);
  glMatrix.vec4.transformMat4(p, p, R);
  return math.matrix([p[0], p[1], p[2]]);
}

async function load_mesh(url) {
  const response = await fetch(url);
  const obj_content = await response.text();
  return obj_content;
}

class Camera {
  constructor(pos, look_direction) {
    this.pos = math.matrix(pos);
    this.basis = [math.matrix([1, 0, 0]), math.matrix([0, 1, 0]), math.matrix(look_direction)];
    this.look_direction = this.basis.at(2);
    this.up = this.basis.at(1);
    this.view_matrix = glMatrix.mat4.create();
  }

  get_view_matrix() {
    glMatrix.mat4.lookAt(
      this.view_matrix,
      this.pos.toArray(),
      this.look_direction.toArray(),
      this.up.toArray()
    );
    return this.view_matrix;
  }

  translate(tvec) {
    this.pos = math.add(this.pos, tvec);
  }

  rotate(angle, axis) {
    // normalize axis (vec3)
    const _axis = glMatrix.vec3.clone(axis);
    glMatrix.vec3.normalize(_axis, _axis);

    // build rotation matrix 4×4 around arbitrary axis
    const R = identitym4();
    glMatrix.mat4.rotate(R, R, glMatrix.glMatrix.toRadian(angle), _axis);

    this.look_direction = rotate_mat4(this.look_direction.toArray(), angle, _axis);

    // rotate basis (each is vec3 -> vec4 with w=0)
    this.basis = this.basis.map(b => rotate_mat4(b.toArray(), angle, _axis));
    this.up = this.basis[1];
}

}

class PropCamera extends Camera {}

class PropViewport {
  constructor(camera, z_distance, width, height) {
    this.camera = camera
    this.center = math.add(math.matrix(camera.pos), math.multiply(z_distance, camera.basis.at(2)));
    this.z_distance = z_distance;
    this.width = width;
    this.height = height;
    this.look = camera.basis.at(2);
    this.init_corners();
    
  }

  init_corners() {
    const [i, j] = this.camera.basis.slice(0, 2);
    const w = this.width;
    const h = this.height;
    this.corners = [
      math.add(this.center, math.add(math.multiply(-w / 2, i), math.multiply(h / 2, j))),
      math.add(this.center, math.add(math.multiply(w / 2, i), math.multiply(h / 2, j))),
      math.add(this.center, math.add(math.multiply(-w / 2, i), math.multiply(-h / 2, j))),
      math.add(this.center, math.add(math.multiply(w / 2, i), math.multiply(-h / 2, j))),
    ];
  }

  adjust_to_camera() {
    this.look = this.camera.basis.at(2);
    this.center = math.add(math.matrix(this.camera.pos), 
                            math.multiply(this.z_distance, this.look));
    
    this.init_corners();
  }

  translate(tvec) {
    this.center = math.add(this.center, tvec);
    this.init_corners();
  }

  // For display purposes only
  perspective() {
    return math.matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 1 / this.z_distance, 0],
    ]);
  }
  //
}

// Controller for prop simulation
class PropSimulator {
  constructor(...opt_meshes) {
    this.pp_camera = new PropCamera(math.matrix([0, 0, 0]), math.matrix([0, 0, 1]));
    this.pp_viewport = new PropViewport(this.pp_camera, 5, 10, 10)
    this.opt_meshes = opt_meshes;
  }

  translate(tvec) {
    this.pp_camera.translate(tvec);
    this.pp_viewport.adjust_to_camera();
  }

  rotate(angle, axis) {
    this.pp_camera.rotate(angle, axis);
    this.pp_viewport.adjust_to_camera();
  }

  draw_prop_camera() {
    return;
  }

  project_on_viewport(point) {
    
  }

  draw_projection_lines(controller) {
    let pairs = parser.vertices.map((e, i) => [math.add(controller.mesh.pos.toArray(), e), this.pp_camera.pos.toArray()]);
    pairs = pairs.map((e, i) => i % 12 === 0 ? e : null).filter(e => e !== null);
    pairs = pairs.flat()
    controller.draw_lines(pairs, [0.0, 0.0, 0.0, 0.4]);
  }

  draw_prop_viewport(controller) {
    const top_pos = this.pp_viewport.corners.at(0);
    const [i, j] = this.pp_camera.basis.slice(0, 2);
    const w = this.pp_viewport.width;
    const h = this.pp_viewport.height;
    controller.draw_rect(top_pos.toArray(), i, j, w, h);
  }

  draw_cosmetics(controller) {
    controller.draw_lines(
      [
          this.pp_camera.pos.toArray(),
          this.pp_viewport.corners.at(0).toArray(),

          this.pp_camera.pos.toArray(),
          this.pp_viewport.corners.at(1).toArray(),

          this.pp_camera.pos.toArray(),
          this.pp_viewport.corners.at(2).toArray(),

          this.pp_camera.pos.toArray(),
          this.pp_viewport.corners.at(3).toArray(),
      ],
      [1.0, 0.3, 1.0, 0.6]
    );
  }

  draw_this(controller) {
    this.draw_prop_camera(controller);
    this.draw_prop_viewport(controller);
    this.draw_cosmetics(controller);
  }
}


class InputHandler {
  constructor(prop_sim) {
    this.prop_sim = prop_sim;
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  onMouseMove(e) {
    // calculate x and y drag
    const deltaX = e.movementX;
    const deltaY = e.movementY;
    this.prop_sim.rotate(deltaX * 0.3, [0, 1, 0]);
    this.prop_sim.rotate(deltaY * 0.3, [1, 0, 0]);
  }
}

class webglController {
  constructor(canvas_object) {
    this.canvas = canvas_object;
    this.gl = canvas_object.getContext("webgl");
    this.vertex_buffer = this.gl.createBuffer();
    this.index_buffer = this.gl.createBuffer();
    this.vertex_shader = vertex_shader;
    this.fragment_shader = fragment_shader;
    this.program = this.gl.createProgram();
    this.init_program();
    this.camera = new Camera([0, 0, 0], [0, 1, 0]);
    this.init_matrices();
    this.prop_sim = new PropSimulator()
    this.input_handler = new InputHandler(this.prop_sim);
    this.canvas.addEventListener('mousemove', (e) => this.input_handler.onMouseMove(e));
  }

  static line_indices(point_count) {
    return [...Array(point_count).keys()];
  }

  compile_shader(shader_type, shader_source) {
    const shader = this.gl.createShader(this.gl[shader_type]);
    this.gl.shaderSource(shader, shader_source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = `An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(
        shader
      )}`;
      console.error(error);
      alert(error);
      this.gl.deleteShader(shader);
      return;
    }

    return shader;
  }

  init_program() {
    const vertexShader = this.compile_shader(
      "VERTEX_SHADER",
      this.vertex_shader
    );
    const fragmentShader = this.compile_shader(
      "FRAGMENT_SHADER",
      this.fragment_shader
    );
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const error = `Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
        this.program
      )}`;
      console.error(error);
      alert(error);
      return;
    }

    this.gl.useProgram(this.program);
  }

  init_matrices() {
    this.projection_matrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
      this.projection_matrix,
      glMatrix.glMatrix.toRadian(120),
      1,
      0.1,
      200.0
    );
  }

  populate_buffer(buffer, buffer_type, size, data, mode = "STATIC_DRAW") {
    const type = this.gl[buffer_type];
    this.gl.bindBuffer(type, buffer);
    this.gl.bufferData(type, new size(data), this.gl[mode]);
  }

  set_vertices(vertices) {
    this.populate_buffer(
      this.vertex_buffer,
      "ARRAY_BUFFER",
      Float32Array,
      vertices
    );
  }

  set_indices(indices) {
    this.populate_buffer(
      this.index_buffer,
      "ELEMENT_ARRAY_BUFFER",
      Uint16Array,
      indices
    );
  }

  set_matrices(model = I) {
    const mvlocation = this.gl.getUniformLocation(this.program, "model_view");
    let mv = identitym4();
    glMatrix.mat4.multiply(mv, this.camera.get_view_matrix(), model);
    this.gl.uniformMatrix4fv(mvlocation, false, mv);
    const plocation = this.gl.getUniformLocation(this.program, "projection");
    this.gl.uniformMatrix4fv(plocation, false, this.projection_matrix);
  }

  set_color(color) {
    this.gl.uniform4fv(
      this.gl.getUniformLocation(this.program, "color"),
      new Float32Array(color)
    );
  }

  render(mode, elements, color, model = I, mesh=null) {
    const vbuffer = mesh ? mesh.vbo : this.vertex_buffer;
    const ibuffer = mesh ? mesh.ebo : this.index_buffer;

    const pa_loc = this.gl.getAttribLocation(this.program, "vertex_position");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
    this.gl.enableVertexAttribArray(pa_loc);
    this.gl.vertexAttribPointer(
      pa_loc,
      3,
      this.gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    this.set_matrices(model);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    this.set_color(color);
    this.gl.drawElements(mode, elements, this.gl.UNSIGNED_SHORT, 0);
  }

  draw_points(points, color = [0.8, 0.8, 0.8, 1.0]) {
    this.set_vertices(points.flat());
    this.render(this.gl.POINTS, points.length, color);
  }

  draw_lines(points, color = [0.8, 0.8, 0.8, 0.5]) {
    this.set_vertices(points.flat());
    this.set_indices(webglController.line_indices(points.length));
    this.render(this.gl.LINES, points.length, color);
  }

  load_obj() {
    const verts = new Float32Array(parser.vertices.flat());
    const idx   = new Uint16Array(parser.indices.flat().map(i => i - 1));

    this.mesh = {
      vbo: this.gl.createBuffer(),
      ebo: this.gl.createBuffer(),
      count: idx.length,
      pos: math.matrix([0, 0, 0])
    };

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mesh.vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.ebo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, idx, this.gl.STATIC_DRAW);
  }

  draw_obj(color = [1.0, 0.4118, 0.7059, 0.3], scale=1.0) {
    let model = identitym4();
    glMatrix.mat4.translate(model, model, this.mesh.pos.toArray());
    glMatrix.mat4.scale(model, model, [scale, scale, scale]);
    this.render(this.gl.TRIANGLES, this.mesh.count, color, model, this.mesh);
  }

  draw_rect(top, i, j, w, h, color = [1.0, 0.8, 1.0, 0.2]) {
    const nj = math.multiply(j, -1);
    const a = math.add(top, math.multiply(i, w))
    const b = math.add(top, math.multiply(nj, h))
    const c = math.add(top, math.add(math.multiply(i, w), math.multiply(nj, h)))
    const vertices = [top, a.toArray(), b.toArray(), c.toArray()];
    const indices = [0, 1, 2, 1, 2, 3];
    this.set_vertices(vertices.flat());
    this.set_indices(indices);
    this.render(this.gl.TRIANGLES, indices.length, color);
  }

  async init_loop() {
    this.model = await load_mesh(URL);
    parser.parse(this.model);
    this.gl.clearColor(0, 0, 0, 1); 
    this.gl.enable(this.gl.BLEND); 
    this.gl.blendEquation(this.gl.FUNC_ADD); 
    this.gl.blendFunc(this.gl.SRC_ALPHA, 
      this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    // forbidden
    //this.gl.enable(this.gl.CULL_FACE);
    //this.gl.cullFace(this.gl.BACK);

    this.load_obj();

    this.camera.translate([0, 0, -5]);
    
  }

  draw_axes() {
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [0.0, 0.0, 2.0],
      ],
      [1.0, 0.0, 0.0, 1.0]
    );
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [0.0, 2.0, 0.0],
      ],
      [0.0, 1.0, 0.0, 1.0]
    );
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [2.0, 0.0, 0.0],
      ],
      [0.0, 0.0, 1.0, 1.0]
    );
  }

  mainloop() {
    // Do stuff
    this.draw_axes();
    //this.prop_sim.draw_this(this);
    //this.prop_sim.draw_projection_lines(this);
    //this.prop_sim.pp_camera.translate([0, 0.1, 0.0]);
    //this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.draw_obj();
    window.requestAnimationFrame(() => this.mainloop());
  }
}

async function main() {
  const canvas = document.getElementById("3Dprojective");
  const _3Dcontroller = new webglController(canvas);
  await _3Dcontroller.init_loop();
  _3Dcontroller.mainloop();
}

main();
