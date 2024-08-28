import { MutableRefObject, useEffect, useState } from 'react';
import Editor from '@/lib/components/Editor';
import Quill from 'quill';
import DeltaClass from 'quill-delta';
import { Box, Button } from '@mui/material';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

type HintEditorProps = {
    quill: MutableRefObject<Quill | null>;
    defaultValue: DeltaClass;
    number: number;
    canToggle: boolean;
    show: boolean;
    toggleShow: () => void;
};

export default function HintEditor({ quill, defaultValue, number, canToggle, show, toggleShow }: HintEditorProps) {
    const [range, setRange] = useState<Range | undefined>(undefined);
    const [lastChange, setLastChange] = useState<Change | undefined>(undefined);

    return (
        <Box>
            <Button 
            sx={{
                marginY: 1,
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
                readOnly={false}
                defaultValue={defaultValue}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
                ref={quill}/>
            )}
        </Box>
    )
}