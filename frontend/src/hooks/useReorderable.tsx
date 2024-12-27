import { Reorderable } from "../loaders";
import { useState } from "react";
import { PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { Transform } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

export const getDraggableData = (reorderable: Reorderable, type: string) => {
    return {
        element: reorderable,
        type: type
    }
}

export const getDraggableTransform = (transform: Transform | null, transition: string | undefined, isDragging: boolean) => {
    return transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
        opacity: isDragging ? 0.25 : 1
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

    reorderElement = (movedElement: T, overElement: T) => {
        const newElements = arrayMove(
                this.reorderables,
                this.reorderables.indexOf(movedElement),
                this.reorderables.indexOf(overElement)
        );
        this.setReorderables(newElements);
    };
}

export const useReorderable = <T extends Reorderable>(elements: Array<T>) => {
    const [reorderables, setReorderables] = useState(elements);
    const reorderableUtils = new ReorderableUtils(reorderables, setReorderables);

    const [activeElement, setActiveElement] = useState<T | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: { delay: 100, tolerance: 5 }})
    );

    const draggableProps = {
        sensors: sensors
    }

    return {
        reorderables,
        setReorderables,
        activeElement,
        setActiveElement,
        draggableProps,
        reorderableUtils
    } as const;
}