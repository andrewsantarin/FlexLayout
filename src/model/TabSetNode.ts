import Rect from "../Rect";
import AttributeDefinitions from "../AttributeDefinitions";
import Attribute from "../Attribute";
import DockLocation from "../DockLocation";
import DropInfo from "./../DropInfo";
import Node from "./Node";
import Model from "./Model";
import TabNode from "./TabNode";
import RowNode from "./RowNode";
import FloatingNode from "./FloatingNode";
import BorderNode from "./BorderNode";
import Orientation from "../Orientation";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";

class TabSetNode extends Node implements IDraggable, IDropTarget {
    public static readonly TYPE = "tabset";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = TabSetNode._createAttributeDefinitions();

    /** @hidden @internal */
    private _contentRect?: Rect;
    /** @hidden @internal */
    private _tabHeaderRect?: Rect;
    // /** @hidden @internal */
    // private _outlineTabHeaderWidth: number = 100;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        TabSetNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    getName() {
        return this._getAttributeAsStringOrUndefined("name");
    }

    getSelected() {
        const selected = this._attributes["selected"];
        if (selected !== undefined) {
            return selected as number;
        }
        return -1;
    }

    getSelectedNode() {
        let selected = this.getSelected();
        if (selected !== -1) {
            return this._children[selected];
        }
        return undefined;
    }

    getWeight(): number {
        return this._attributes["weight"] as number;
    }

    getWidth() {
        return this._getAttributeAsNumberOrUndefined("width");
    }

    getHeight() {
        return this._getAttributeAsNumberOrUndefined("height");
    }

    getMinFloatingWidth() {
        // local first, then global fallback.
        return this._getAttributeAsNumberOrUndefined("minFloatingWidth") || this._model._getAttribute("minFloatingTabsetWidth") as number;
    }

    getMinFloatingHeight() {
        // local first, then global fallback.
        return this._getAttributeAsNumberOrUndefined("minFloatingHeight") || this._model._getAttribute("minFloatingTabsetHeight") as number;
    }

    getX() {
        return this._getAttributeAsNumberOrUndefined("x");
    }

    getY() {
        return this._getAttributeAsNumberOrUndefined("y");
    }

    isMaximized() {
        return this._model.getMaximizedTabset() === this;
    }

    isActive() {
        return this._model.getActiveTabset() === this;
    }

    isEnableDeleteWhenEmpty() {
        return this._getAttr("enableDeleteWhenEmpty") as boolean;
    }

    isEnableDrop() {
        return this._getAttr("enableDrop") as boolean;
    }

    isEnableDrag() {
        return this._getAttr("enableDrag") as boolean;
    }

    isEnableDivide() {
        return this._getAttr("enableDivide") as boolean;
    }

    isEnableMaximize() {
        return this._getAttr("enableMaximize") as boolean;
    }

    isEnableTabStrip() {
        return this._getAttr("enableTabStrip") as boolean;
    }

    getClassNameTabStrip() {
        return this._getAttributeAsStringOrUndefined("classNameTabStrip");
    }

    getClassNameHeader() {
        return this._getAttributeAsStringOrUndefined("classNameHeader");
    }

    getHeaderHeight() {
        return this._getAttr("headerHeight") as number;
    }

    getTabStripHeight() {
        return this._getAttr("tabStripHeight") as number;
    }

    /** @hidden @internal */
    _setWeight(weight: number) {
        this._attributes["weight"] = weight;
    }

    /** @hidden @internal */
    _setX(x: number) {
        this._attributes["x"] = x;
    }

    /** @hidden @internal */
    _setY(y: number) {
        this._attributes["y"] = y;
    }

    /** @hidden @internal */
    _setWidth(width: number) {
        this._attributes["width"] = width;
    }

    /** @hidden @internal */
    _setHeight(height: number) {
        this._attributes["height"] = height;
    }

    /** @hidden @internal */
    _setMinFloatingWidth(width: number) {
        this._attributes["minFloatingWidth"] = width;
    }

    /** @hidden @internal */
    _setMinFloatingHeight(height: number) {
        this._attributes["minFloatingHeight"] = height;
    }

    /** @hidden @internal */
    _setSelected(index: number) {
        this._attributes["selected"] = index;
    }

    /** @hidden @internal */
    _layout(rect: Rect) {

        if (this.isMaximized()) {
            rect = (this._model.getRoot() as Node).getRect();
        }

        rect = rect.removeInsets(this._getAttr("marginInsets"));
        this._rect = rect;
        rect = rect.removeInsets(this._getAttr("borderInsets"));

        const showHeader = (this.getName() !== undefined);
        let y = 0;
        if (showHeader) {
            y += this.getHeaderHeight();
        }
        if (this.isEnableTabStrip()) {
            this._tabHeaderRect = new Rect(rect.x, rect.y + y, rect.width, this.getTabStripHeight());
            y += this.getTabStripHeight();
        }
        this._contentRect = new Rect(rect.x, rect.y + y, rect.width, rect.height - y);

        this._children.forEach((child, i) => {
            child._layout(this._contentRect!);
            child._setVisible(i === this.getSelected());
        });
    }

    /** @hidden @internal */
    _remove(node: TabNode) {
        this._removeChild(node);
        this._model._tidy();
        this._setSelected(Math.max(0, this.getSelected() - 1));
    }

    /** @hidden @internal */
    canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        let dropInfo = undefined;

        if (dragNode === this) {
            let dockLocation = DockLocation.CENTER;
            let outlineRect = this._tabHeaderRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, "flexlayout__outline_rect");
        }
        else if (!(this._parent instanceof FloatingNode) && this._contentRect!.contains(x, y)) {
            let dockLocation = DockLocation.getLocation(this._contentRect!, x, y);
            const isDockedToCenterLocation = dockLocation === DockLocation.CENTER;
            let outlineRect = !isDockedToCenterLocation ? dockLocation.getDockRect(this._rect) : new Rect(x, y, 0, 0);
            let className = [
                'flexlayout__outline_rect',
                isDockedToCenterLocation ? `flexlayout__outline_rect${isDockedToCenterLocation ? '--hidden' : ''}` : '',
            ].filter(str => str).join(' ');
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, className);
        }
        else if (this._children.length > 0 && this._tabHeaderRect != undefined && this._tabHeaderRect.contains(x, y)) {
            let child = this._children[0] as TabNode;
            let r = child.getTabRect()!;
            const yy = r.y;
            const h = r.height;
            let p = this._tabHeaderRect.x;
            let childCenter = 0;
            for (let i = 0; i < this._children.length; i++) {
                child = this._children[i] as TabNode;
                r = child.getTabRect()!;
                childCenter = r.x + r.width / 2;
                if (x >= p && x < childCenter) {
                    let dockLocation = DockLocation.HEADER;
                    let outlineRect = new Rect(r.x - 2, yy, 3, h);
                    // TODO: find out how to add better tactile feedback with tabs. Right now, it's just too narrow.
                    // outlineRect = new Rect(r.x - 2, yy, this._outlineTabHeaderWidth, h);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                    break;
                }
                p = childCenter;
            }
            if (dropInfo == undefined) {
                let dockLocation = DockLocation.HEADER;
                let outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
                // TODO: find out how to add better tactile feedback with tabs. Right now, it's just too narrow.
                // outlineRect = new Rect(r.getRight() - 2, yy, this._outlineTabHeaderWidth, h);
                dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
            }
        }

        if (!dragNode._canDockInto(dragNode, dropInfo)) {
            return undefined;
        }

        return dropInfo;
    }

    removeFromParent(dragNode: (Node & IDraggable), index: number) {
        let dragParent = dragNode.getParent() as (BorderNode | TabSetNode);
        let fromIndex = 0;
        if (dragParent !== undefined) {
            fromIndex = dragParent._removeChild(dragNode);
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragParent !== undefined) {
            if (dragParent.getType() === TabSetNode.TYPE) {
                dragParent._setSelected(0);
            }
            else if (dragParent.getType() === BorderNode.TYPE) {
                if (dragParent.getSelected() !== -1) {
                    if (fromIndex === dragParent.getSelected() && dragParent.getChildren().length > 0) {
                        dragParent._setSelected(0);
                    }
                    else if (fromIndex < dragParent.getSelected()) {
                        dragParent._setSelected(dragParent.getSelected() - 1);
                    }
                    else if (fromIndex > dragParent.getSelected()) {
                        // leave selected index as is
                    }
                    else {
                        dragParent._setSelected(-1);
                    }
                }
            }
        }

        return index;
    }

    dropToLayout(dragNode: (Node & IDraggable), dockLocation: DockLocation, index: number) {
        index = this.removeFromParent(dragNode, index);

        switch (dockLocation) {
            case DockLocation.HEADER:
                {
                    let insertPos = index === -1 ? this._children.length : index;

                    if (dragNode.getType() === TabNode.TYPE) {
                        this._addChild(dragNode, insertPos);
                        this._setSelected(insertPos);
                        //console.log("added child at : " + insertPos);
                    }
                    else {
                        dragNode.getChildren().forEach((child, i) => {
                            this._addChild(child, insertPos);
                            //console.log("added child at : " + insertPos);
                            insertPos++;
                        });
                    }

                    this._model._setActiveTabset(this);

                    break;
                }
            case DockLocation.LEFT:
            case DockLocation.RIGHT:
            case DockLocation.TOP:
            case DockLocation.BOTTOM:
                {
                    let tabSet: TabSetNode | undefined;
                    if (dragNode instanceof TabNode) {
                        // create new tabset parent
                        //console.log("create a new tabset");
                        tabSet = new TabSetNode(this._model, {});
                        tabSet._addChild(dragNode);
                        //console.log("added child at end");
                    }
                    else {
                        tabSet = dragNode as TabSetNode;
                    }

                    const parentRow = this._parent as Node;
                    const pos = parentRow.getChildren().indexOf(this);

                    if (parentRow.getOrientation() === dockLocation._orientation) {
                        tabSet._setWeight(this.getWeight() / 2);
                        this._setWeight(this.getWeight() / 2);
                        //console.log("added child 50% size at: " +  pos + dockLocation.indexPlus);
                        parentRow._addChild(tabSet, pos + dockLocation._indexPlus);
                    }
                    else {
                        // create a new row to host the new tabset (it will go in the opposite direction)
                        //console.log("create a new row");
                        const newRow = new RowNode(this._model, {});
                        newRow._setWeight(this.getWeight());
                        newRow._addChild(this);
                        this._setWeight(50);
                        tabSet._setWeight(50);
                        //console.log("added child 50% size at: " +  dockLocation.indexPlus);
                        newRow._addChild(tabSet, dockLocation._indexPlus);

                        parentRow._removeChild(this);
                        parentRow._addChild(newRow, pos);
                    }

                    this._model._setActiveTabset(tabSet);

                    break;
                }
            default:
                break;
        }
    }

    dropToFloating(dragNode: (Node & IDraggable), dockLocation: DockLocation, index: number) {
        // determine initial size of the new tabset from the global config.
        let width: number = this.getMinFloatingWidth() || 0;
        let height: number = this.getMinFloatingHeight() || 0;
        const { x, y } = dockLocation;

        // derive the size of the new free-floating tabset from the tab's former tabset.
        let parentNode = dragNode.getParent();
        if (parentNode !== undefined) {
            if (parentNode.getType() === TabSetNode.TYPE) {
                const rootNode = parentNode.getParent();

                if (rootNode !== undefined && rootNode.getType() === FloatingNode.TYPE) {
                    const parentTabSetNode = parentNode as TabSetNode;
                    const rect = parentTabSetNode.getRect();
                    width = rect.width;
                    height = rect.height;
                }
            }
            else if (parentNode.getType() === FloatingNode.TYPE) {
                const rect = dragNode.getRect();
                width = rect.width;
                height = rect.height;
            }
        }
        // use the size from the tab config passed to Actions.addNode().
        else if (dragNode.getType() === TabNode.TYPE) {
            const tabNode = dragNode as TabNode;
            const tabSetConfig = tabNode.getTabSetConfig();
            width = tabSetConfig.width || width;
            height = tabSetConfig.height || height;
            tabNode._setTabSetConfig(undefined);
        }

        // after retrieving width & height from the parent node, remove the dragged node.
        this.removeFromParent(dragNode, index);

        let tabSet: TabSetNode;

        if (dragNode.getType() === TabNode.TYPE) {
            tabSet = new TabSetNode(this._model, {
                x,
                y,
                width,
                height,
            });
            tabSet._addChild(dragNode);
        }
        else {
            tabSet = dragNode as TabSetNode;
            tabSet._setX(x);
            tabSet._setY(y);
            tabSet._setWidth(width);
            tabSet._setHeight(height);
            tabSet._setRect(new Rect(x, y, width, height));
        }

        // create a tabset in the free-floating space.
        const floatingNode: FloatingNode = this._model.getFloatingRoot();
        const pos = floatingNode.getChildren().length;
        floatingNode._addChild(tabSet, pos);

        this._model._setActiveTabset(tabSet);
    }

    /** @hidden @internal */
    drop(dragNode: (Node & IDraggable), dockLocation: DockLocation, index: number) {
        if (this === dragNode) {
            return;
        }

        if (dockLocation === DockLocation.CENTER) {
            this.dropToFloating(dragNode, dockLocation, index);
        }
        else {
            this.dropToLayout(dragNode, dockLocation, index);
        }

        this._model._tidy();
    }

    /** @hidden @internal */
    _toJson(): any {
        const json: any = {};
        TabSetNode._attributeDefinitions.toJson(json, this._attributes);
        json.children = this._children.map((child) => child._toJson());

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    /** @hidden @internal */
    static _fromJson(json: any, model: Model) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children != undefined) {
            json.children.forEach((jsonChild: any) => {
                const child = TabNode._fromJson(jsonChild, model);
                newLayoutNode._addChild(child);
            });
        }

        if (json.maximized && json.maximized === true) {
            model._setMaximizedTabset(newLayoutNode);
        }

        if (json.active && json.active === true) {
            model._setActiveTabset(newLayoutNode);
        }

        return newLayoutNode;
    }

    /** @hidden @internal */
    _updateAttrs(json: any) {
        TabSetNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    _getAttributeDefinitions() {
        return TabSetNode._attributeDefinitions;
    }

    /** @hidden @internal */
    _getPrefSize(orientation: Orientation) {
        let prefSize = this.getWidth();
        if (orientation === Orientation.VERT) {
            prefSize = this.getHeight();
        }
        return prefSize;
    }

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {

        let attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabSetNode.TYPE, true);
        attributeDefinitions.add("id", undefined).setType(Attribute.ID);

        attributeDefinitions.add("weight", 100);
        attributeDefinitions.add("x", undefined);
        attributeDefinitions.add("y", undefined);
        attributeDefinitions.add("width", undefined);
        attributeDefinitions.add("height", undefined);
        attributeDefinitions.add("selected", 0);
        attributeDefinitions.add("name", undefined).setType(Attribute.STRING);

        attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty");
        attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop");
        attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag");
        attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide");
        attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize");
        attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip");
        attributeDefinitions.addInherited("classNameHeader", "tabSetClassNameHeader");
        attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip");
        attributeDefinitions.addInherited("borderInsets", "tabSetBorderInsets");
        attributeDefinitions.addInherited("marginInsets", "tabSetMarginInsets");

        attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
        attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");

        attributeDefinitions.addInherited("minFloatingWidth", "minFloatingTabsetWidth");
        attributeDefinitions.addInherited("minFloatingHeight", "minFloatingTabsetHeight");
        return attributeDefinitions;
    }
}

export default TabSetNode;
