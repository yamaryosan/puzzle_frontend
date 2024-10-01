import { MutableRefObject, useEffect, useState } from 'react';
import Editor from '@/lib/components/Editor';
import Quill from 'quill';
import DeltaClass from 'quill-delta';
import { Box, Button } from '@mui/material';
import Delta from 'quill-delta';
import { useContext } from 'react';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

type Range = {
    index: number;
    length: number;
};

type HintEditorProps = {
    hintRef: MutableRefObject<Quill | null>;
    defaultValue: DeltaClass;
    number: number;
    canToggle: boolean;
    show: boolean;
    toggleShow: () => void;
};

export default function HintEditor({ hintRef, defaultValue, number, canToggle, show, toggleShow }: HintEditorProps) {
    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);

    const deviceType = useContext(DeviceTypeContext);

    return (
        <Box>
            <Button 
            sx={{
                marginY: 1,
                fontSize: deviceType === "desktop" ? "1.5rem" : "2rem",
                width: deviceType === "desktop" ? "auto" : "100%",
                ":hover": {
                    backgroundColor: "secondary.light",
                    transition: "background-color 0.3s",
                },
                ":disabled": {
                    backgroundColor: "grey",
                    color: "white",
                    cursor: "not-allowed",
                    ":hover": {
                        backgroundColor: "grey"
                    },
                },
            }}
            disabled={!canToggle}
            onClick={toggleShow} >
                {show ? "非表示" : "表示"}
            </Button>
            {show && (
                <Editor
                ref={hintRef}
                defaultValue={defaultValue}
                onSelectionChange={setRange}
                onTextChange={setLastChange}/>
            )}
        </Box>
    )
}