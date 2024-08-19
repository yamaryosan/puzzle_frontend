import React from 'react';
import { SvgIcon } from '@mui/material';
import { Extension, AddCircleOutline } from '@mui/icons-material';

type Props = {
    color?: string;
};

/**
 * パズル追加のアイコン(未完成)
 */
export default function AddPuzzleIcon(props: Props) {
    return (
      <SvgIcon style={{ position: 'relative' }}>
        <AddCircleOutline />
        <Extension style={{ position: 'absolute', top: 0, left: 0, color: props.color }} />
      </SvgIcon>
    );
  }