import { type ChildProcess, spawn } from 'child_process'
import { cp } from 'fs/promises'
import { resolve } from 'path'
import { defineConfig } from 'tsup'

let serverProcess: ChildProcess | null = null

const killServerProcess = async (): Promise<void> => {
  if (!serverProcess || serverProcess.exitCode !== null) {
    return
  }

  const process = serverProcess

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (process.exitCode === null) {
        process.kill('SIGKILL')
      }
      resolve()
    }, 5000)

    process.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })

    process.kill('SIGINT')
  })
}

export default defineConfig((options) => {
  return {
    format: ['esm'],
    entryPoints: ['src/server.ts'],
    async onSuccess() {
      await cp(resolve('src/templates'), resolve('dist/templates'), {
        recursive: true,
        force: true
      })

      if (options.watch) {
        await killServerProcess()
        serverProcess = null

        serverProcess = spawn('node', ['dist/server.js'], {
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'development' }
        })

        serverProcess.on('exit', (code) => {
          if (code !== null && code !== 0 && code !== 130) {
            console.error(`Server process exited with code ${code}`)
          }
          serverProcess = null
        })
      }
    },
    async onEnd() {
      await killServerProcess()
    },
    minify: !options.watch,
    external: ['pino']
  }
})
