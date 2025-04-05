import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // Import Prettier recommended config

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Fetch base configs from Next.js using FlatCompat
const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

// Combine Next.js configs with Prettier recommended config
const eslintConfig = [
  ...nextConfigs,
  eslintPluginPrettierRecommended, // Add Prettier config - should be last
];

export default eslintConfig;
