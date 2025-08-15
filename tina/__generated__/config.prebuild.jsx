// tina/config.js
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  schema: {
    collections: [
      {
        name: "pricing",
        label: "Pricing Page",
        path: "src/content",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          },
          // You can create a single file for this collection
          // The `relativePath` is a unique identifier.
          // This will point to `src/content/pricing.json`
          filename: {
            // Because this is a single-document collection, we hardcode the filename
            readOnly: true,
            slugify: true
          }
        },
        fields: [
          {
            type: "object",
            list: true,
            name: "features",
            label: "Features",
            fields: [
              {
                type: "string",
                name: "feature_name",
                label: "Feature Name",
                required: true
              },
              {
                type: "string",
                name: "silver",
                label: "Silver Plan"
              },
              {
                type: "string",
                name: "gold",
                label: "Gold Plan"
              },
              {
                type: "string",
                name: "platinum",
                label: "Platinum Plan"
              },
              {
                type: "string",
                name: "custom",
                label: "Custom Plan"
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
