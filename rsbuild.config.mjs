import { defineConfig } from "@rsbuild/core";
import {
  SwcJsMinimizerRspackPlugin,
  SwcCssMinimizerRspackPlugin,
  EnvironmentPlugin,
} from "@rspack/core";
import { pluginReact } from "@rsbuild/plugin-react";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  devtool: "source-map",
  tools: {
    rspack: {
      plugins: [
        isDev
          ? new EnvironmentPlugin([
              "DEBUG",
              "GEMINI_AI_API_KEY",
              "AMELIA_SYSTEM_PROMPT",
            ])
          : new EnvironmentPlugin({
              NODE_ENV: "production",
              DEBUG: "false",
              GEMINI_AI_API_KEY:
                JSON.stringify(process.env.GEMINI_AI_API_KEY) || "",
              AMELIA_SYSTEM_PROMPT:
                JSON.stringify(process.env.AMELIA_SYSTEM_PROMPT) || "",
            }),
        isDev && new ReactRefreshPlugin(),
      ],
    },
  },
  experiments: {
    rspackFuture: {
      disableTransformByDefault: true,
    },
  },
  mode: isDev ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
              transform: {
                react: {
                  development: isDev,
                  refresh: isDev,
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "builtin:lightningcss-loader",
            /** @type {import('@rspack/core').LightningcssLoaderOptions} */
            options: {
              targets: isDev
                ? [
                    "last 3 chrome version",
                    "last 3 firefox version",
                    "last 3 safari version",
                  ]
                : [">0.2%", "not dead", "not op_mini all"],
            },
          },
        ],
        type: "css/auto",
      },
    ],
  },
  plugins: [pluginReact()],
  parser: {
    "css/auto": {
      namedExports: false,
    },
  },
  rules: [
    {
      test: /\.jsx$/,
      use: {
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "ecmascript",
              jsx: true,
            },
          },
        },
      },
      type: "javascript/auto",
    },
  ],
  optimization: {
    minimize: !isDev,
    minimizer: [
      new SwcJsMinimizerRspackPlugin({
        format: {
          comments: false,
        },
      }),
      new SwcCssMinimizerRspackPlugin(),
    ],
  },
});
