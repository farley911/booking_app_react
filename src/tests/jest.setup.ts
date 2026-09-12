/// <reference types="node" />

import { TextDecoder, TextEncoder } from 'node:util'
import '@testing-library/jest-dom/jest-globals'

Object.assign(globalThis, { TextDecoder, TextEncoder })
