import { Reorderable } from "../loaders";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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

export const reorderElement = <T extends Reorderable>(elements: Array<T>, movedElement: T, overElement: T) => {
    return arrayMove(
        elements,
        elements.indexOf(movedElement),
        elements.indexOf(overElement)
    );
}

export const useReorderable = () => {
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: { delay: 100, tolerance: 5 }})
    );

    const draggableProps = {
        sensors: sensors
    }

    return {
        draggableProps
    } as const;
}