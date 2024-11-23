import { Reorderable } from "../loaders";
import { useState } from "react";
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { Transform } from "@dnd-kit/utilities";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SnackbarContextType } from "../routes/root";

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

export const useReorderable = <T extends Reorderable>(elements: Array<T>, updateFn: Function) => {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;

    const [activeElement, setActiveElement] = useState(null as T | null);
    const getElementFromID = (id: UniqueIdentifier | null): T | null => {
        let elementRet = null;
        elements.forEach(element => {
            if (element.id === id) {
                elementRet = element;
            }
        });

        return elementRet;
    }

    const handleDragStart = (event: DragStartEvent): void => {
        const {active} = event;
        setActiveElement(getElementFromID(active.id));
    }
    
    const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
        const {active, over} = event;
        if ( ! active.data.current || ! over?.data.current ) {
            return;
        }
        
        const APIResponse = await updateFn(active.data.current.id, over.data.current.displayOrder);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    };

    return [activeElement, handleDragStart, handleDragEnd] as const;
}