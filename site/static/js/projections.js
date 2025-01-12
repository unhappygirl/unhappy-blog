

class LineSegment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    direction() {
        
    }

}

class Viewport2D extends LineSegment {

}

class Observer {
    constructor(pos, view_dir, fov) {
        this.pos = pos
        this.view_dir = view_dir
        this.fov = fov
    }
}