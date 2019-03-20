import Node from "./Node";
// import Model from "./Model";
import DockLocation from "../DockLocation";
import TabNode from "./TabNode";
// import AttributeDefinitions from "../AttributeDefinitions";
// import IDropTarget from "./IDropTarget";
import IDraggable from "./IDraggable";
import BorderNode from "./BorderNode";
import TabSetNode from "./TabSetNode";

/**
 * An unsplittable, free-floating TabSetNode, separated from the main layout.
 * 
 * Features:
 * - It can be dragged around.
 * - It can be given TabNode children.
 * - It can't be halved horizontally or vertically to make room for another TabSetNode.
 */
class FloatingTabSetNode extends TabSetNode {
    /** @hidden @internal */
    drop(dragNode: (Node & IDraggable), location: DockLocation, index: number) {
        const dockLocation = location;

        if (this === dragNode) { // tabset drop into itself
            return; // dock back to itself
        }

        let dragParent: Node | undefined = dragNode.getParent();
        let fromIndex = 0;
        if (dragParent !== undefined) {
            fromIndex = dragParent._removeChild(dragNode);
        }
        //console.log("removed child: " + fromIndex);

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragParent !== undefined) {
            if (dragParent instanceof TabSetNode) {
                dragParent._setSelected(0);
            }
            else if (dragParent instanceof BorderNode) {
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
            else if (dragParent.getType() === FloatingTabSetNode.TYPE) {
                /**
                 * TODO: derive solution from BorderNode.ts and / or TabSetNode.ts
                 *       so that the selected index here will also change.
                 */
            }
        }

        // simple_bundled dock to existing tabset
        if (dockLocation === DockLocation.CENTER || dockLocation === DockLocation.HEADER) {
            let insertPos = index;
            if (insertPos === -1) {
                insertPos = this._children.length;
            }

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
        }
        // else {
        //     TabSetNode.split();
        // }
        //
        // Don't perform any splitting operation like the main layout TabSetNode.
        // This behavior isn't expected from a floating tabset.

        this._model._tidy();

        return;
    }
}

// class FloatingTabSetNode extends Node implements IDraggable, IDropTarget {
//     public static readonly TYPE = "floating";
//     /** @hidden @internal */
//     private static _attributeDefinitions: AttributeDefinitions = FloatingTabSetNode._createAttributeDefinitions();

//     constructor(json: any, model: Model) {
//         super(model);
//     }

//     getName() {
//         return this._getAttributeAsStringOrUndefined("name");
//     }

//     getSelected() {
//         const selected = this._attributes["selected"];
//         if (selected !== undefined) {
//             return selected as number;
//         }
//         return -1;
//     }

//     getSelectedNode() {
//         let selected = this.getSelected();
//         if (selected !== -1) {
//             return this._children[selected];
//         }
//         return undefined;
//     }

//     getWeight(): number {
//         return this._attributes["weight"] as number;
//     }

//     getWidth() {
//         return this._getAttributeAsNumberOrUndefined("width");
//     }

//     getHeight() {
//         return this._getAttributeAsNumberOrUndefined("height");
//     }

//     /** @hidden @internal */
//     _toJson() {
//         const json: any = {};
//         FloatingTabSetNode._attributeDefinitions.toJson(json, this._attributes);
//         json.children = this._children.map((child) => (child as TabNode)._toJson());
//         return json;
//     }

//     /** @hidden @internal */
//     static _fromJson(json: any, model: Model) {
//         const floating = new FloatingTabSetNode(json, model);

//         return floating;
//     }

//     isEnableDrop() {
//         return this._getAttr("enableDrop") as boolean;
//     }

//     isEnableDrag() {
//         return this._getAttr("enableDrag") as boolean;
//     }

//     /** @hidden @internal */
//     _getAttributeDefinitions() {
//         return FloatingTabSetNode._attributeDefinitions;
//     }

//     /** @hidden @internal */
//     _updateAttrs(json: any) {
//         FloatingTabSetNode._attributeDefinitions.update(json, this._attributes);
//     }

//     /** @hidden @internal */
//     private static _createAttributeDefinitions(): AttributeDefinitions {
//         let attributeDefinitions = new AttributeDefinitions();
//         attributeDefinitions.add("type", FloatingTabSetNode.TYPE, true);
//         attributeDefinitions.add("id", undefined);

//         attributeDefinitions.add("weight", 100);
//         attributeDefinitions.add("width", undefined);
//         attributeDefinitions.add("height", undefined);

//         return attributeDefinitions;
//     }

//     /** @hidden @internal */
//     drop(dragNode: (Node & IDraggable), location: DockLocation, index: number) {
//         const dockLocation = location;

//         if (this === dragNode) { // tabset drop into itself
//             return; // dock back to itself
//         }

//         let dragParent: Node | undefined = dragNode.getParent();
//         let fromIndex = 0;
//         if (dragParent !== undefined) {
//             fromIndex = dragParent._removeChild(dragNode);
//         }
//         //console.log("removed child: " + fromIndex);

//         // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
//         if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
//             index--;
//         }

//         // for the tabset/border being removed from set the selected index
//         if (dragParent !== undefined) {
//             if (dragParent instanceof TabSetNode) {
//                 dragParent._setSelected(0);
//             }
//             else if (dragParent instanceof BorderNode) {
//                 if (dragParent.getSelected() !== -1) {
//                     if (fromIndex === dragParent.getSelected() && dragParent.getChildren().length > 0) {
//                         dragParent._setSelected(0);
//                     }
//                     else if (fromIndex < dragParent.getSelected()) {
//                         dragParent._setSelected(dragParent.getSelected() - 1);
//                     }
//                     else if (fromIndex > dragParent.getSelected()) {
//                         // leave selected index as is
//                     }
//                     else {
//                         dragParent._setSelected(-1);
//                     }
//                 }
//             }
//             else if (dragParent.getType() === FloatingTabSetNode.TYPE) {
//                 /**
//                  * TODO: derive solution from BorderNode.ts and / or TabSetNode.ts
//                  *       so that the selected index here will also change.
//                  */
//             }
//         }

//         // simple_bundled dock to existing tabset
//         if (dockLocation === DockLocation.CENTER || dockLocation === DockLocation.HEADER) {
//             let insertPos = index;
//             if (insertPos === -1) {
//                 insertPos = this._children.length;
//             }

//             if (dragNode.getType() === TabNode.TYPE) {
//                 this._addChild(dragNode, insertPos);
//                 this._setSelected(insertPos);
//                 //console.log("added child at : " + insertPos);
//             }
//             else {
//                 dragNode.getChildren().forEach((child, i) => {
//                     this._addChild(child, insertPos);
//                     //console.log("added child at : " + insertPos);
//                     insertPos++;
//                 });
//             }
//             this._model._setActiveTabset(this);
//         }
//         // else {
//         //     TabSetNode.split();
//         // }
//         //
//         // Don't perform any splitting operation like the main layout TabSetNode.
//         // This behavior isn't expected from a floating tabset.

//         this._model._tidy();

//         return;
//     }
// }

export default FloatingTabSetNode;
