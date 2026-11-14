/** Can this device draw the 3D base smoothly? Software-drawn WebGL (common on school laptops) cannot. */
export function canDo3D(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('3d')
    if (q === '0') return false
    if (q === '1') return true
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|software|basic render/.test(renderer)
  } catch {
    return false
  }
}

export const fastLapse = () => new URLSearchParams(location.search).get('fast') === '1'
