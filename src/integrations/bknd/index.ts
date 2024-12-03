import type { AstroIntegration } from "astro";
import { App, getDefaultConfig, type CreateAppConfig } from "bknd";

export default function bkndIntegration(appConfig: CreateAppConfig): AstroIntegration {
  return {
    name: "bknd-integration",
    hooks: {
      "astro:server:setup": async () => {
        // not required, just as a template
        const config = getDefaultConfig();

        const initialConfig = {
          version: 7, // just the latest version, configs get auto migrated
          // config goes here. You can either use the default config and extend it,
          // or just inspect the "__bknd" table (check for entries of "type" = "config")
          ...config,
          ...(appConfig.initialConfig || {})
        };

        // create instance
        const app = App.create({
          ...appConfig,
          initialConfig
        });

        // build app, sync and save.
        // The config will be saved to the "__bknd" table
        // of the database specified in the connection
        await app.build({ sync: true, save: true });

        console.log("\nEquipped with BKND.io 🚀");
      },
      "astro:config:setup": async ({ injectRoute }) => {
        injectRoute({
          pattern: "[...admin]",
          entrypoint: "./src/integrations/bknd/admin.astro",
          prerender: false
        });

        injectRoute({
          pattern: "/api/[...api]",
          entrypoint: "./src/integrations/bknd/api.ts",
          prerender: false
        });
      }

      // TODO - when running add user to Astro.locals
    }
  } as AstroIntegration;
}
