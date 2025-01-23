class Controller {
  constructor(canvas_object, canvas_ctx) {
    this.canvas = canvas_object;
    this.observer = new Observer([100, 100], [1, 1], Math.PI / 1.9);
    this.ctx = this.canvas.getContext(canvas_ctx);
    this.polygons = new Array();
    this.lines = new Array();
    this.points = new Array();
    this.time = Date.now();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  time_events() {}

  draw_projected(point, color) {
    const [vx, vy] = this.observer.view_dir.toArray();
    let projected = this.observer.project(point);
    // transform back to global coordinates
    projected = math.add(projected, this.observer.pos);
    projected = rotate(projected, this.observer.pos, Math.atan2(-vy, vx));
    // ...
    if (math.norm(projected) > 1000) {
      return;
    }
    draw_point(this.ctx, projected, (color = color));
    draw_dotted_line(this.ctx, projected, point, 4, color);
  }

  draw() {
    for (const line of this.lines) {
      draw_line_segment(this.ctx, line, true);
      this.draw_projected(line.p1, line.color);
      this.draw_projected(line.p2, line.color);
    }
    draw_observer(this.ctx, this.observer);
  }

  handle_time_events() {
    if (Math.floor(this.time) % 5 == 0) {
      if (!(this.move_lock)) {
        this.observer.rotation_complete = false;
        this.observer.arrived = false;
        this.observer_moving = true;
        this.move_lock = true;
        this.observer_destination = random_coordinates([[200, 400], [200, 400]])
      }
    }

    if (this.move_lock) {
      this.observer.move_to(this.observer_destination, 0.02)
      if (this.observer.arrived) {
        this.move_lock = false;
      }
    }
  }
  mainloop(time) {
    this.time = time / 1000
    this.handle_time_events();
    //console.log(this.time, "seconds have passed.");
    this.clear();
    this.draw();
    //this.observer.displace([-0.1, 0])
    window.requestAnimationFrame((time) => this.mainloop(time));
  }
}

class Controller3D {
  constructor(canvas_object, ) {}
}

function main() {
  const _2Dcanvas = document.getElementById("2Dprojective");
  const mycontroller = new Controller(_2Dcanvas, "2d", );
  for (let i = 0; i < 5; i++) {
    mycontroller.lines.push(
      random_line_segment([
        [100, 500],
        [100, 500],
      ])
    );
  }
  mycontroller.mainloop();
}

main();
