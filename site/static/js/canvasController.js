

class Controller {
  constructor(canvas_object, canvas_ctx) {
    this.canvas = canvas_object;
    this.observer = new Observer([250, 250], [1, 0], Math.PI / 2);
    this.ctx = this.canvas.getContext(canvas_ctx);
    this.polygons = new Array();
    this.lines = new Array();
    this.points = new Array();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    /*for (const obj of this.objs_to_project) {
    }*/
    const p = math.matrix([400, 200]);
    draw_point(this.ctx, p);
    const projected = this.observer.project(p);
    const pprojected = math.add(
      this.observer.vp.known_point,
      math.multiply(projected.get([1]), this.observer.vp.direction)
    )
    draw_point(
      this.ctx,
      pprojected,
    );
    draw_observer(this.ctx, this.observer);
    draw_dotted_line(this.ctx, pprojected, p, 4, "pink");
  }

  mainloop() {
    this.clear();
    this.draw();
    this.observer.rotate(Math.PI / 180);
    window.requestAnimationFrame(() => this.mainloop());
  }
}

class Controller3D {}

function main() {
  const _2Dcanvas = document.getElementById("2Dprojective");
  const mycontroller = new Controller(_2Dcanvas, "2d", math.matrix([100, 100]));
  mycontroller.mainloop();
}

main();
