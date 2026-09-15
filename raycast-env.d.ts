/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `view-json` command */
  export type ViewJson = ExtensionPreferences & {}
  /** Preferences accessible in the `format-json` command */
  export type FormatJson = ExtensionPreferences & {}
  /** Preferences accessible in the `jsonpath-query` command */
  export type JsonpathQuery = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `view-json` command */
  export type ViewJson = {}
  /** Arguments passed to the `format-json` command */
  export type FormatJson = {}
  /** Arguments passed to the `jsonpath-query` command */
  export type JsonpathQuery = {}
}

