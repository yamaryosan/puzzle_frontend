'use client';

import { createContext } from 'react';

// デバイスの種類を保持するコンテキスト
type DeviceType = "desktop" | "mobile" | "unknown";

export const DeviceTypeContext = createContext<DeviceType>("desktop");

export default DeviceTypeContext;