// @ts-check
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import FFI from 'ffi-napi';

const inputPath = process.argv[2];

if (!inputPath) {
	process.exit(1);
}

const fontLoaderSubExe = 'FontLoaderSub.exe';

/**
 * @typedef {Object} FfiUser32
 * @property {FFI.ForeignFunction<number, [hWnd: number, lpText: string|Buffer, lpCaption: string|Buffer, uType: number]>} MessageBoxW 
 */
/** @type {FfiUser32} */
const ffiUser32 = new FFI.Library('user32', {
	MessageBoxW: ['int32', ['int32', 'string', 'string', 'int32']]
});

/**
 * @param {string} string 
 */
function win32TEXT(string) {
	return Buffer.from(string, 'ucs2');
}

const MB_ICONWARNING = 0x00000030; // 0x00000030L

/**
 * @param {string} message 
 */
function warning(message) {
	const result = ffiUser32.MessageBoxW(
		0,
		win32TEXT(message),
		win32TEXT('FontLoaderSubWrapper'),
		MB_ICONWARNING,
	);
	if (!result) {
		throw new Error('Fail to open message box.');
	}
	return result;
}

function denyPathNotFound() {
	warning(`找不到可能放置 ${fontLoaderSubExe} 的地方。`);
}

/**
 * @param {string} searchPath 
 */
function denyExecutableNotFound(searchPath) {
	warning(`在 ${searchPath} 找不到 ${fontLoaderSubExe}。`);
}

/**
 * @param {string} searchPath 
 */
async function invokeExecutable(searchPath) {
	try {
		const searchPathStat = await fs.promises.stat(searchPath);
		if (!searchPathStat.isDirectory()) {
			return false;
		}
	} catch {
		return false;
	}
	
	try {
		const exePath = path.join(searchPath, fontLoaderSubExe);
		await fs.promises.access(exePath, fs.constants.X_OK);

		console.log(
			exePath,
			[path.basename(inputPath)],
			{
				detached: true,
				stdio: 'ignore',
				shell: false,
				cwd: path.dirname(inputPath)
			}
		);
		spawn(
			exePath,
			[path.basename(inputPath)],
			{
				detached: true,
				stdio: 'ignore',
				shell: false,
				cwd: path.dirname(inputPath)
			}
		);
		process.exit(0);
	} catch {
		denyExecutableNotFound(searchPath);
		return false;
	}
}

for (const inputDir of [inputPath, path.dirname(inputPath)]) {
	try {
		const inputDirStat = await fs.promises.stat(inputDir);
		if (!inputDirStat.isDirectory()) {
			continue;
		}
	} catch {
		continue;
	}
	
	for (const fontDir of ['font', 'fonts']) {
		const fontDirPath = path.join(inputDir, fontDir);
		try {
			const fontDirPathStat = await fs.promises.stat(fontDirPath);
			if (!fontDirPathStat.isDirectory()) {
				continue;
			}
		} catch {
			continue;
		}
		await invokeExecutable(fontDirPath);
	}

	await invokeExecutable(inputDir);
}

denyPathNotFound();
