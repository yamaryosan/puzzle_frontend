import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

type PortalProps = {
    children: React.ReactNode;
    element: HTMLElement;
}

/**
 * ポータル
 */
export default function Portal({children, element}: PortalProps) {
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(true);
        return () => {
            setIsShow(false);
        }
    }, []);

    return isShow ? createPortal(<div>{children}</div>, element) : null;
}