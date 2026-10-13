/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.addElementLibrary({
    'url': 'https://remocn.dev/docs/typography',
    'displayName': 'Remocn'
});
Config.addElementLibrary({
    'url': 'https://snapcn.dev/docs/components',
    'displayName': 'snapcn'
});
Config.addElementLibrary({
    'url': 'https://lexingtonthemes.com/remotion/free-templates',
    'displayName': 'Lexington Themes'
});
