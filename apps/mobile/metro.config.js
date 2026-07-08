const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
const { assetExts, sourceExts } = config.resolver;

const resolveFromWorkspace = (moduleName) =>
  require.resolve(moduleName, {
    paths: [projectRoot, monorepoRoot],
  });

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: resolveFromWorkspace('react-native-svg-transformer/expo'),
};

config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = Array.from(new Set([...sourceExts, 'svg']));

module.exports = config;
