const URL = "/cow";
const parser = new ObjParser();
identitym4 = (m) => glMatrix.mat4.identity(m);


const I = glMatrix.mat4.create();
identitym4(I);

async function load_mesh(url) {
  const response = await fetch(url);
  const obj_content = await response.text();
  return obj_content;
}

class Camera {
  constructor(pos, look_direction, up) {
    this.pos = math.matrix(pos);
    this.look_direction = math.matrix(look_direction);
    this.up = math.matrix(up);
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

  rotate(angle, axis) {}
}

class PropCamera extends Camera {}

class PropViewport {
  constructor(z_distance, width, height) {
    this.z_distance = z_distance;
    this.width = width;
    this.height = height;
  }

  perspective() {
    return math.matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 1 / z_distance, 0],
    ]);
  }
}


class PropSimulator {
  constructor(pp_viewport, pp_camera, meshes) {
    this.pp_viewport = pp_viewport;
    this.pp_camera = pp_camera;
    this.meshes = meshes;
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
    this.camera = new Camera([5, 5, 8], [0, 0, 1], [0, 1, 0]);
    this.init_matrices();
    this.prop_viewport = new PropViewport(2, 8, 4);
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
    let mv = glMatrix.mat4.create();
    identitym4(mv);
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

  render(mode, elements, color, model = I) {
    const pa_loc = this.gl.getAttribLocation(this.program, "vertex_position");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
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
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
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

  draw_obj(vertices, faces, pos, color = [1.0, 0.4118, 0.7059, 0.2]) {
    this.draw_points(vertices);
    this.set_vertices(vertices);
    this.set_indices(faces.map((i) => i - 1)); //indexing starts from 1 in obj files!
    let model = glMatrix.mat4.create();
    identitym4(model);
    glMatrix.mat4.translate(model, model, pos);
    this.render(this.gl.TRIANGLES, faces.length, color, model);
  }

  draw_rect(top, w, h, color = [1.0, 0.8, 1.0, 0.2]) {
    const a = [top[0] + w, top[1], top[2]];
    const b = [top[0], top[1] - h, top[2]];
    const c = [top[0] + w, top[1] - h, top[2]];
    const vertices = [top, a, b, c];
    const indices = [0, 1, 2, 1, 2, 3];
    this.set_vertices(vertices.flat());
    this.set_indices(indices);
    this.render(this.gl.TRIANGLES, indices.length, color);
  }

  async init_loop() {
    this.model = await load_mesh(URL);
    parser.parse(this.model);
    console.log(parser.vertices);
    console.log(parser.indices);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  mainloop() {
    // Do stuff

    this.gl.clear(this.gl.COLOR_BUFFER0_BIT);
    this.camera.translate([0.01, 0, 0]);
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [0.0, 0.0, 1.0],
      ],
      [1.0, 0.0, 0.0, 1.0]
    );
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
      ],
      [0.0, 1.0, 0.0, 1.0]
    );
    this.draw_lines(
      [
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
      ],
      [0.0, 0.0, 1.0, 1.0]
    );
    //this.draw_rect([-4, 2, 1], 8, 4);
    this.draw_obj(parser.vertices.flat(), parser.indices.flat(), [-3, 2, 5]);
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
