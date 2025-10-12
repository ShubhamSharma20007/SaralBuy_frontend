import React, { type JSX } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../Components/ui/tooltip"
type Props={
    hoverChildren:JSX.Element;
    contentChildren:JSX.Element;
}
const TooltipComp = ({hoverChildren,contentChildren}:Props) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {hoverChildren}
            </TooltipTrigger>
            <TooltipContent>
                {contentChildren}
            </TooltipContent>
        </Tooltip>
    )
}

export default TooltipComp