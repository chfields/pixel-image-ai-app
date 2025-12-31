import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import dotenv from 'dotenv';
import { EnvironmentPlugin } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new EnvironmentPlugin({
    ...dotenv.config().parsed,
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: 'src/assets/images', to: 'main_window/assets/images' },
    ],
  }),
];
