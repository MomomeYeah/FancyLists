import { Reorderable } from "../loaders";
import { useState } from "react";
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { Transform } from "@dnd-kit/utilities";

export const getDraggableData = (reorderable: Reorderable) => {
    return {
        id: reorderable.id,
        displayOrder: reorderable.display_order
    }
}

export const getDraggableTransform = (transform: Transform | null, transition: string | undefined) => {
    return transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
    } : undefined;
}

export class ReorderableUtils<T extends Reorderable> {
    reorderables: Array<T>;
    setReorderables: Function;

    constructor(reorderables: Array<T>, setReorderables: Function) {
        this.reorderables = reorderables;
        this.setReorderables = setReorderables;
    }

    getElementById = (id: UniqueIdentifier | null): T | null => {
        return this.reorderables.find(element => element.id === id) || null;
    };

    createElement = async (newElement: T) => {
        this.setReorderables([...this.reorderables, newElement]);
    }

    deleteElement = async (deletedElement: T) => {
        const newElements = this.reorderables.filter(element => element.id !== deletedElement.id);
        this.setReorderables(newElements);
    }

    updateElement = async (updatedElement: T) => {
        const newElements = this.reorderables.map(element =>
            element.id === updatedElement.id ? updatedElement : element
        );
        this.setReorderables(newElements);
    }

    reorderElement = (movedElementID: number, newDisplayOrder: number) => {
        const movedElement = this.getElementById(movedElementID);
        if ( ! movedElement ) {
            return;
        }

        const unmovedElements = this.reorderables.filter(element => element.id !== movedElementID);
        const elementsBeforeMovePosition = unmovedElements.slice(0, newDisplayOrder - 1);
        const elementsAfterMovePosition = unmovedElements.slice(newDisplayOrder - 1);

        const newElements = [...elementsBeforeMovePosition, movedElement, ...elementsAfterMovePosition];
        newElements.forEach((element, idx) => {
            element.display_order = idx + 1;
        });

        this.setReorderables(newElements);
    };
}

export const useReorderable = <T extends Reorderable>(elements: Array<T>, onReorder: Function) => {
    const [reorderables, setReorderables] = useState(elements);
    const reorderableUtils = new ReorderableUtils(reorderables, setReorderables);

    const [activeElement, setActiveElement] = useState(null as T | null);
    const handleDragStart = (event: DragStartEvent): void => {
        const {active} = event;
        setActiveElement(reorderableUtils.getElementById(active.id));
    }
    
    const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
        const {active, over} = event;
        if ( ! active.data.current || ! over?.data.current ) {
            return;
        }
        
        onReorder(active.data.current.id, over.data.current.displayOrder);
    };

    const draggableProps = {
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd
    }

    return {
        reorderables,
        setReorderables,
        activeElement,
        draggableProps,
        reorderableUtils
    } as const;
}