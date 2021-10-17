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
  let hex = `${decToHexChar(mod)}${decToHexChar(rem)}`

  return hex
}

function invertBrightness(c1, c2) {
  return 1 - (c1 + c2) / 2
}

function invertColor(hexColor) {
  const [_match, r, g, b] = hexColor.match(RGB_REGEX) || []

  if (!match) {
    return hexColor
  }

  const dr = hexToDec(r)
  const dg = hexToDec(g)
  const db = hexToDec(b)

  const nr = invertBrightness(dg / 255, db / 255)
  const ng = invertBrightness(dr / 255, db / 255)
  const nb = invertBrightness(dr / 255, dg / 255)

  const hr = decToHex(Math.floor(nr * 255))
  const hg = decToHex(Math.floor(ng * 255))
  const hb = decToHex(Math.floor(nb * 255))

  return `${hr}${hg}${hb}`
}

module.exports = {
  invertBrightness,
  RGB_REGEX,
}
