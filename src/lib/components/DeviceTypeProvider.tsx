"use client";

import React, { useEffect, useState } from "react";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
type DeviceType = "desktop" | "mobile";

export default function DeviceTypeProvider({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setDeviceType("mobile");
            } else {
                setDeviceType("desktop");
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        console.log(`deviceType: ${deviceType}`);
    }, [deviceType]);

    if (!hasMounted) {
        return (
            <DeviceTypeContext.Provider value="desktop">
                {children}
            </DeviceTypeContext.Provider>
        );
    }

    return (
        <DeviceTypeContext.Provider value={deviceType}>
            {children}
        </DeviceTypeContext.Provider>
    );
}
