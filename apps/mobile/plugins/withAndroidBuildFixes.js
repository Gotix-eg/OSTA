const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidForceAndroidxCore = (config) => {
  return withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    const searchString = 'allprojects {';
    const forceConfig = `
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.15.0'
            force 'androidx.core:core-ktx:1.15.0'
        }
    }
`;
    
    if (!buildGradle.includes("force 'androidx.core:core:1.15.0'")) {
      buildGradle = buildGradle.replace(searchString, `allprojects {${forceConfig}`);
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });
};

const withAndroidMetroMonorepo = (config) => {
  return withAppBuildGradle(config, (config) => {
    let appBuildGradle = config.modResults.contents;
    
    const envConfig = `
// Force Metro to resolve paths relative to apps/mobile instead of the monorepo root
tasks.configureEach { task ->
    if (task instanceof org.gradle.process.ProcessForkOptions) {
        task.environment("EXPO_NO_METRO_WORKSPACE_ROOT", "1")
    }
}
`;
    
    if (!appBuildGradle.includes("EXPO_NO_METRO_WORKSPACE_ROOT")) {
      appBuildGradle = appBuildGradle + "\n" + envConfig;
    }
    
    config.modResults.contents = appBuildGradle;
    return config;
  });
};

module.exports = (config) => {
  return withAndroidMetroMonorepo(withAndroidForceAndroidxCore(config));
};
