const { rgbToHsl, hslToRgb } = require('color-lib')

const RGB_REGEX = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/

function hexToDecChar(hex) {
  if (hex >= 'a' && hex <= 'f') {
    return hex.charCodeAt(0) - 'a'.charCodeAt(0) + 10
  } else if (hex >= '0' && hex <= '9') {
    return Number(hex)
  } else {
    throw new Error(`Invalid hex char ${hex}`)
  }
}

function decToHexChar(dec) {
  if (dec > 9) {
    return String.fromCharCode('a'.charCodeAt(0) + dec - 10)
  }
  return dec
}

function hexToDec(hex) {
  let val = hexToDecChar(hex[0])

  if (hex.length > 1) {
    val *= 16
    val += hexToDecChar(hex[1])
  }

  return val
}

function decToHex(dec) {
  let mod = dec % 16
  let rem = Math.floor(dec / 16)
  let hex = `${decToHexChar(rem)}${decToHexChar(mod)}`

  return hex
}

function invertLightnessRGB(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b)
  const nl = 1 - l
  const result = hslToRgb(h, s, nl)

  return [result.r, result.g, result.b]
}

function invertLightness(hexColor) {
  const [_match, r, g, b] = hexColor.match(RGB_REGEX) || []

  // decimal rgb values
  const dr = hexToDec(r)
  const dg = hexToDec(g)
  const db = hexToDec(b)

  // new rgb values
  const [nr, ng, nb] = invertLightnessRGB(dr, dg, db)

  // hex new rgb values
  const hr = decToHex(nr)
  const hg = decToHex(ng)
  const hb = decToHex(nb)

  return `${hr}${hg}${hb}`
}

module.exports = {
  invertLightness,
  RGB_REGEX,
}
