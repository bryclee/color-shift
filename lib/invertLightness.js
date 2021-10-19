const { rgbToHsl, hslToRgb, round } = require('color-lib')
const debug = require('debug')('color-shift')

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

function invertLightnessViaHsl(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b)
  const nl = 1 - l
  const result = hslToRgb(h, s, nl)

  return [result.r, result.g, result.b]
}

function normalizeColor(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

// Calculate relative luminosity from RGB 255 values
function calculateLuminosity(r, g, b) {
  const norm = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  const nr = norm(r / 255)
  const ng = norm(g / 255)
  const nb = norm(b / 255)

  // relative luminosity calculation
  // Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
  return nr * 0.2126 + ng * 0.7152 + nb * 0.0722
}

function invertRelativeLuminosity(r, g, b) {
  const luminosity = calculateLuminosity(r, g, b)
  // const CONTRAST_ADJUSTMENT = 0.2 // Try to correct for contrast at lighter colors
  // const invertedLuminosity = Math.max(0, 1 - luminosity - CONTRAST_ADJUSTMENT)

  // Invert over 0.23, roughly the half-way point in terms of color contrast
  const INVERSION_POINT = 0.23
  const invertedLuminosity = (INVERSION_POINT * INVERSION_POINT) / luminosity

  let { h, s, l: ol } = rgbToHsl(r, g, b)
  let l = 1 - ol
  let { r: cr, g: cg, b: cb } = hslToRgb(h, s, l)

  let currentLuminosity = calculateLuminosity(cr, cg, cb)
  let ll = ol > l ? 0 : ol
  let rl = ol < l ? 1 : ol

  debug(
    `...attempt luminosity adjustment: ${luminosity} -> ${invertedLuminosity}`
  )

  // bin search modifying lightness to find correct luminosity
  let attempts = 6
  let ALLOWED_ERROR = 0.005
  while (
    attempts-- > 0 &&
    Math.abs(invertedLuminosity - currentLuminosity) >= ALLOWED_ERROR
  ) {
    if (currentLuminosity > invertedLuminosity) {
      rl = l
      l = (l + ll) / 2
    } else {
      ll = l
      l = (l + rl) / 2
    }

    ;({ r: cr, g: cg, b: cb } = hslToRgb(h, s, l))
    currentLuminosity = calculateLuminosity(cr, cg, cb)
    debug('%o', { attempts, cr, cg, cb, currentLuminosity, invertedLuminosity })
  }

  if (attempts === 0) {
    console.error(`Max attempts while inverting rgb ${r},${g},${b}`)
  }

  return [cr, cg, cb]
}

function invertLightness(hexColor) {
  const [_match, r, g, b] = hexColor.match(RGB_REGEX) || []

  // decimal rgb values
  const dr = hexToDec(r)
  const dg = hexToDec(g)
  const db = hexToDec(b)

  debug(`Processing: #${r}${g}${b}`)

  // new rgb values
  const [nr, ng, nb] = invertRelativeLuminosity(dr, dg, db)

  // hex new rgb values
  const hr = decToHex(nr)
  const hg = decToHex(ng)
  const hb = decToHex(nb)

  debug(`Result: #${hr}${hg}${hb}`)

  return `${hr}${hg}${hb}`
}

module.exports = {
  invertLightness,
  RGB_REGEX,
}
