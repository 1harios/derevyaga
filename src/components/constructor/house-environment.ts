import * as THREE from 'three'

/** Soft outdoor illumination and a distant tree line, used only in reflections. */
export function createHouseEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  const sky = ctx.createLinearGradient(0, 0, 0, 1024)
  sky.addColorStop(0, '#789cb8')
  sky.addColorStop(.38, '#c5d9e3')
  sky.addColorStop(.5, '#edf0e8')
  sky.addColorStop(.56, '#7c8878')
  sky.addColorStop(1, '#9e9b86')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 2048, 1024)
  const glow = ctx.createRadialGradient(420, 300, 10, 420, 300, 360)
  glow.addColorStop(0, 'rgba(255,250,231,.95)')
  glow.addColorStop(1, 'rgba(255,250,231,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 2048, 650)
  let seed = 94
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 }
  for (let x = 0; x < 2048; x += 13) {
    const height = 25 + random() * 105
    ctx.fillStyle = `rgba(46,65,54,${.28 + random() * .3})`
    ctx.beginPath()
    ctx.moveTo(x, 553)
    ctx.lineTo(x + 14, 553 - height)
    ctx.lineTo(x + 31, 553)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  const generator = new THREE.PMREMGenerator(renderer)
  const environment = generator.fromEquirectangular(texture)
  texture.dispose()
  generator.dispose()
  return environment
}
