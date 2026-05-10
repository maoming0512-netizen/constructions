const fs = require('fs')
const path = require('path')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(from, to)
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to)
    }
  }
}

const standaloneNext = path.join('.next', 'standalone', '.next')
fs.rmSync(path.join(standaloneNext, 'static'), { recursive: true, force: true })
fs.rmSync(path.join('.next', 'standalone', 'public'), { recursive: true, force: true })

copyDir(path.join('.next', 'static'), path.join(standaloneNext, 'static'))
copyDir('public', path.join('.next', 'standalone', 'public'))
