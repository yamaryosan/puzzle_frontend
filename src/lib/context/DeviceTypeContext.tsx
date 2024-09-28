'use client';

import { createContext } from 'react';

// デバイスの種類を定義
type DeviceType = "desktop" | "mobile";

export const DeviceTypeContext = createContext<DeviceType>("desktop");

export default DeviceTypeContext;