import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPublicDir("public");

// Three.js needs a real GL context in headless Chrome. "angle" is the renderer
// Remotion recommends on macOS; without it every WebGL canvas fails to create.
Config.setChromiumOpenGlRenderer("angle");
