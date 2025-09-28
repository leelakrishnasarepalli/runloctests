export interface MCPConfig {
  server: {
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
  };
  browser: {
    headless: boolean;
    viewport: {
      width: number;
      height: number;
    };
    userAgent?: string;
  };
  timeouts: {
    navigation: number;
    action: number;
    assertion: number;
  };
  retries: {
    max: number;
    delay: number;
  };
}

export const defaultMCPConfig: MCPConfig = {
  server: {
    name: 'playwright-mcp',
    command: 'npx',
    args: ['@modelcontextprotocol/server-playwright'],
  },
  browser: {
    headless: process.env.CI === 'true',
    viewport: {
      width: 1280,
      height: 720,
    },
  },
  timeouts: {
    navigation: 30000,
    action: 10000,
    assertion: 5000,
  },
  retries: {
    max: 3,
    delay: 1000,
  },
};

export function getMCPConfig(): MCPConfig {
  return {
    ...defaultMCPConfig,
    browser: {
      ...defaultMCPConfig.browser,
      headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
    },
  };
}