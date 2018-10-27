# GitHub Auth CLI Helper

[![License][license-image]][license-url] [![version][npm-image]][npm-url] [![Build Status][circle-image]][circle-url]

> Helper utility for cli authentication flow with GitHub

Creates and manages [Personal Access Tokens](https://github.com/settings/tokens), prompting the user for `username`, `password`, `2FA` as needed, while using the system's keychain to store secrets. 

## Install

```bash
npm install @ahmadnassri/github-cli-auth
```

### OS Support

| OS          | Secret Manager                         | Setup Needed |
| ----------- | -------------------------------------- | ------------ |
| **macOS**   | Keychain                               | ✗            | 
| **Windows** | Credential Vault                       | ✗            |
| **Linux**   | Secret Service API Draft / `libsecret` | ✓            |

> **Linux Setup:** Install `libsecret` before running `npm install`:
> - Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
> - Red Hat-based: `sudo yum install libsecret-devel`
> - Arch Linux: `sudo pacman -S libsecret`

## API

### Method : `_(namespace)`

creates a new namespace in the system's keychain, returns an `Object` with two methods: [`token`](#method-token) & [`reset`](#method-reset)

| name            | type     | required | default | description                        |
| --------------- | -------- | -------- | ------- | ---------------------------------- |
| **`namespace`** | `String` | ✓        | `-`     | namespace value to use in keychain |

```js
const auth = require('@ahmadnassri/github-cli-auth')

const { token, reset } = auth('my-awesome-app')
```

<a id="method-token"/>

### Method : `token([options])`

creates a personal access token for supplied `scopes`, prompts for `username`, `password` & `2FA` as needed.

#### Options

| name           | type     | required | default                               | description            | 
| -------------- | -------- | -------- | ------------------------------------- | ---------------------- |
| **`remember`** | `Object` | ✗        | `{ lastuser: true, password: false }` | store additional info  | 
| **`scopes`**   | `Array`  | ✗        | `['repo']`                            | scopes to authenticate |

```js
const auth = require('@ahmadnassri/github-cli-auth')

const { token } = auth('my-awesome-app')

token({ scopes: ['admin:org', 'repo'] }).then(console.log) 
//=> { username: 'ahmadnassri', token: '88688d7a17c52e893e6dc27a2d22734955740c04' }
```

<a id="method-reset"/>

### Method : `reset(username)`

delete stored secrets for a given `username`

| name           | type     | required | default | description       |
| -------------- | -------- | -------- | ------- | ----------------- |
| **`username`** | `String` | ✓        | `-`     | username to erase |

```js
const auth = require('@ahmadnassri/github-cli-auth')

const { reset } = auth('my-awesome-app')

reset('ahmadnassri') // deletes stored secrets for 'ahmadnassri'
```

## Debug

Set `NODE_DEBUG=GITHUB_AUTH` for additional debug logs

---
> Author: [Ahmad Nassri](https://www.ahmadnassri.com) &bull; 
> Github: [@ahmadnassri](https://github.com/ahmadnassri) &bull; 
> Twitter: [@AhmadNassri](https://twitter.com/AhmadNassri)

[license-url]: LICENSE
[license-image]: https://img.shields.io/github/license/ahmadnassri/node-github-cli-auth.svg?style=for-the-badge&logo=circleci

[circle-url]: https://circleci.com/gh/ahmadnassri/node-github-cli-auth
[circle-image]: https://img.shields.io/circleci/project/github/ahmadnassri/node-github-cli-auth/master.svg?style=for-the-badge&logo=circleci

[npm-url]: https://www.npmjs.com/package/@ahmadnassri/github-cli-auth
[npm-image]: https://img.shields.io/npm/v/@ahmadnassri/github-cli-auth.svg?style=for-the-badge&logo=npm
