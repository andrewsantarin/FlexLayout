import Rect from "./Rect";
import Orientation from "./Orientation";
import { JSMap } from "./Types";

class DockLocation {

    static values: JSMap<DockLocation> = {};
    static TOP = new DockLocation("top", Orientation.VERT, 0);
    static BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
    static LEFT = new DockLocation("left", Orientation.HORZ, 0);
    static RIGHT = new DockLocation("right", Orientation.HORZ, 1);
    static CENTER = new DockLocation("center", Orientation.VERT, 0);
    static HEADER = new DockLocation("header", Orientation.VERT, 0);

    /** @hidden @internal */
    _name: string;
    /** @hidden @internal */
    _orientation: Orientation;
    /** @hidden @internal */
    _indexPlus: number;

    public x: number = -1;
    public y: number = -1;

    /** @hidden @internal */
    constructor(name: string, orientation: Orientation, indexPlus: number) {
        this._name = name;
        this._orientation = orientation;
        this._indexPlus = indexPlus;
        DockLocation.values[this._name] = this;
    }

    getName() {
        return this._name;
    }

    getOrientation() {
        return this._orientation;
    }

    /** @hidden @internal */
    static getByName(name: string): DockLocation {
        return DockLocation.values[name];
    }

    /** @hidden @internal */
    static getLocation(rect: Rect, x: number, y: number) {
        // Set the maximum non-edge dock location to 40px
        // so that the free floating tabsets have a lot of
        // space to move around freely.
        if (x < rect.x + Math.min(rect.width / 4, 40)) {
            let dockLocation = DockLocation.LEFT;
            dockLocation.x = x;
            dockLocation.y = y;
            return dockLocation;
        }

        else if (x > rect.getRight() - Math.min(rect.width / 4, 40)) {
            let dockLocation = DockLocation.RIGHT;
            dockLocation.x = x;
            dockLocation.y = y;
            return dockLocation;
        }

        else if (y < rect.y + Math.min(rect.height / 4, 40)) {
            let dockLocation = DockLocation.TOP;
            dockLocation.x = x;
            dockLocation.y = y;
            return dockLocation;
        }

        else if (y > rect.getBottom() - Math.min(rect.height / 4, 40)) {
            let dockLocation = DockLocation.BOTTOM;
            dockLocation.x = x;
            dockLocation.y = y;
            return dockLocation;
        }

        else {
            let dockLocation = DockLocation.CENTER;
            dockLocation.x = x;
            dockLocation.y = y;
            return dockLocation;
        }
    }

    /** @hidden @internal */
    getDockRect(r: Rect) {
        if (this === DockLocation.TOP) {
            return new Rect(r.x, r.y, r.width, r.height / 2);
        }
        else if (this === DockLocation.BOTTOM) {
            return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
        }
        if (this === DockLocation.LEFT) {
            return new Rect(r.x, r.y, r.width / 2, r.height);
        }
        else if (this === DockLocation.RIGHT) {
            return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
        }
        else {
            return r.clone();
        }
    }

    /** @hidden @internal */
    split(rect: Rect, size: number) {
        if (this === DockLocation.TOP) {
            let r1 = new Rect(rect.x, rect.y, rect.width, size);
            let r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        }
        else if (this === DockLocation.LEFT) {
            let r1 = new Rect(rect.x, rect.y, size, rect.height);
            let r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        }
        if (this === DockLocation.RIGHT) {
            let r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
            let r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        }
        else {//if (this === DockLocation.BOTTOM) {
            let r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
            let r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        }
    }

    /** @hidden @internal */
    reflect() {
        if (this === DockLocation.TOP) {
            return DockLocation.BOTTOM
        }
        else if (this === DockLocation.LEFT) {
            return DockLocation.RIGHT
        }
        if (this === DockLocation.RIGHT) {
            return DockLocation.LEFT
        }
        else { //if (this === DockLocation.BOTTOM) {
            return DockLocation.TOP
        }
    }

    toString() {
        return "(DockLocation: name=" + this._name + ", orientation=" + this._orientation + ")";
    }
}


export default DockLocation;

