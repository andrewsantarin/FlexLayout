import Rect from "../Rect";
import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import Node from "./Node";
import Model from "./Model";
import TabSetNode from "./TabSetNode";
import DropInfo from "../DropInfo";
import IDropTarget from "./IDropTarget";
import IDraggable from "./IDraggable";

class FloatingNode extends Node implements IDropTarget{

    public static readonly TYPE = "floating";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = FloatingNode._createAttributeDefinitions();
    /** @hidden @internal */
    private _drawChildren: Array<(Node)>;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        this._dirty = true;
        this._drawChildren = [];
        FloatingNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    /** @hidden @internal */
    _layout(rect: Rect) {
        super._layout(rect);

        const drawChildren = this._getDrawChildren() as Array<TabSetNode>;

        // layout children
        drawChildren.forEach((child) => {
            const x = child.getLeft() || 0;
            const y = child.getTop() || 0;
            const width = child.getWidth() || 0;
            const height = child.getHeight() || 0;

            child._layout(new Rect(x, y, width, height));
        });

        return true;
    }

    /** @hidden @internal */
    _getDrawChildren(): Array<Node> | undefined {
        if (this._dirty) {
            this._drawChildren = [];

            for (let i = 0; i < this._children.length; i++) {
                const child = this._children[i] as TabSetNode;
                this._drawChildren.push(child);
            }
            this._dirty = false;
        }

        return this._drawChildren;
    }

    /** @hidden @internal */
    _tidy() {
        //console.log("a", this._model.toString());
        let i = 0;
        while (i < this._children.length) {
            const child = this._children[i];
            if (child instanceof TabSetNode && child.getChildren().length === 0) {
                if (child.isEnableDeleteWhenEmpty()) {
                    this._removeChild(child);
                }
                else {
                    i++;
                }
            }
            else {
                i++;
            }
        }

        // add tabset into empty root
        if (this === this._model.getFloatingRoot() && this._children.length === 0) {
            let child = new TabSetNode(this._model, { type: "tabset" });
            this._addChild(child);
        }

        //console.log("b", this._model.toString());
    }

    /** @hidden @internal */
    canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        let dropInfo = undefined;
        
        let dockLocation = DockLocation.getLocation(this._rect, x, y);
        let outlineRect = dockLocation.getDockRect(this._rect);

        dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");

        if (dropInfo !== undefined) {
            if (!dragNode._canDockInto(dragNode, dropInfo)) {
                return undefined;
            }
        }

        return dropInfo;
    }

    /** @hidden @internal */
    drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void {
        debugger;
        /**
         * FloatingNode floatingNode.drop((Node & IDraggable) dragNode, DockLocation location, number index) will do nothing for now.
         * We're not expecting to detect on the layer which contains all of the floating components just yet.
         */
    }

    isEnableDrop() {
        return true;
    }

    /** @hidden @internal */
    _toJson() {
        const json: any = {};
        FloatingNode._attributeDefinitions.toJson(json, this._attributes);

        json.children = [];
        this._children.forEach((child) => {
            json.children.push(child._toJson());
        });

        return json;
    }

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const newLayoutNode = new FloatingNode(model, json);

        if (json.children != undefined) {
            for (let i = 0; i < json.children.length; i++) {
                const jsonChild = json.children[i];
                if (jsonChild.type === TabSetNode.TYPE) {
                    let child = TabSetNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
                else {
                    let child = FloatingNode._fromJson(jsonChild, model);
                    newLayoutNode._addChild(child);
                }
            }
        }

        return newLayoutNode;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        FloatingNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return FloatingNode._attributeDefinitions;
    }

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {
        let attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", FloatingNode.TYPE, true);
        attributeDefinitions.add("id", undefined);

        return attributeDefinitions;
    }
}

export default FloatingNode;
