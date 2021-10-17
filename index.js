const readline = require('readline')
const { invertLightness, RGB_REGEX } = require('./lib/invertLightness')

const EXTRACT_RGB_REGEX = new RegExp(`(^.*)${RGB_REGEX.source}(.*$)`)

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
})

let output = []

rl.on('line', (line) => {
  const [match, start, r, g, b, end] = line.match(EXTRACT_RGB_REGEX) || []

  if (!match) {
    output.push(line)
    return
  }

  const invertedColor = invertLightness(`${r}${g}${b}`)
  const modifiedLine = `${start}${invertedColor}${end}`
  output.push(modifiedLine)
})

rl.on('close', () => {
  console.log(output.join('\n'))
})
