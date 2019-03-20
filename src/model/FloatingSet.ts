import Model from "./Model";
import FloatingTabSetNode from "./FloatingTabSetNode";

class FloatingSet {
    /** @hidden @internal */
    private _model: Model;
    /** @hidden @internal */
    private _floatings: Array<FloatingTabSetNode>;

    /** @hidden @internal */
    constructor(model: Model) {
        this._model = model;
        this._floatings = [];
    }

    getFloatings() {
        return this._floatings;
    }

    /** @hidden @internal */
    _toJson() {
        return this._floatings.map((borderNode) => borderNode._toJson());
    }

    static _fromJson(json: any, model: Model) {
        const floatingSet = new FloatingSet(model);
        floatingSet._floatings = json.map((floatingJson: any) => FloatingTabSetNode._fromJson(floatingJson, model));
        return floatingSet;
    }

    getModel() {
        return this._model;
    }
}

export default FloatingSet;
