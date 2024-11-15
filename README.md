# Textualize

## Local Development

1. Setup Python Environment
   Create and activate a virtualenv with the requirements installed.

2. Start Electron Server
   `npm run start` spins up a python API instance and starts the application.

## Build

The build is managed via the Github build action that is triggered on new commit
tags. To kick-off a build, add a tag in the form 'v0.0.1' and push the tag to
remote/origin: `git tag <tag_name> && git push origin <tag_name>`

## Local Build

Certain features, like the autoupdater, can only be tested on a complete build.
When working on these features, a local build helps with quick iteration.

The build happens in two chunks. First, the python backend is built by
PyIntaller into an executable at `python-build/api/api`. Next, this executable
is packaged into a Vite Electron application. Build settings can be found in
`electron-builder.json5`

Local builds are created in `releases/0.0.n`. The release number is controlled by
the package.json version.

By default, code signing and validation are skipped during a local build.
Signing is turned off in the npm command using `-c.mac.identity=null`.
Validation is turned off via SKIP_NOTARIZATION in the .env setting. This toggle
is used to early exit from `scripts/notarize.cjs`
