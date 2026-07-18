/**
 * Skybridge 类型助手
 * 通过 generateHelpers 生成类型安全的 useToolInfo hook
 */

import { generateHelpers } from "skybridge/web";
import type { AppType } from "../../server/src/server.js";

export const { useToolInfo } = generateHelpers<AppType>();
