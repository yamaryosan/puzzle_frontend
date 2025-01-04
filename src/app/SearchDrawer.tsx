"use client";

import { Drawer, Box } from "@mui/material";
import { useState } from "react";
import { useContext } from "react";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import { Search } from "@mui/icons-material";
import MobileSearchResultsList from "@/lib/components/MobileSearchResultsList";

export default function SearchDrawer() {
    const [isOpen, setOpen] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    const handleOpenSearchDrawer = () => {
        setOpen(true);
    };

    return (
        <>
            {deviceType === "mobile" && (
                <>
                    <Box
                        onClick={handleOpenSearchDrawer}
                        sx={{
                            position: "fixed",
                            top: "25%",
                            left: "0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "2rem",
                            height: "4rem",
                            backgroundColor: "lightgray",
                        }}
                    >
                        <Search sx={{ scale: "1.5" }} />
                    </Box>
                    <Drawer
                        anchor="left"
                        open={isOpen}
                        onClose={() => setOpen(false)}
                    >
                        <MobileSearchResultsList
                            onClose={() => setOpen(false)}
                        />
                    </Drawer>
                </>
            )}
        </>
    );
}
