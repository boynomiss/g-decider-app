module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Configure expo-router app root
          'expo-router': {
            root: './src/app',
          },
        },
      ],
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
