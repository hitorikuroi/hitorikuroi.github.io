const glslify = require('glslify');
const MathEx = require('js-util/MathEx');

const computeFaceNormal = (v0, v1, v2) => {
  const n = [];
  const v1a = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  const v2a = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  n[0] = v1a[1] * v2a[2] - v1a[2] * v2a[1];
  n[1] = v1a[2] * v2a[0] - v1a[0] * v2a[2];
  n[2] = v1a[0] * v2a[1] - v1a[1] * v2a[0];
  const l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2], 2);
  for (var i = 0; i < n.length; i++) {
    n[i] = n[i] / l;
  }
  return n;
};

export default class SkyOctahedron {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      },
    };
    this.obj = this.createObj();
    this.obj.position.set(0, 200, 0);
  }
  createObj() {
    const geometry = new THREE.OctahedronBufferGeometry(90, 5);
    const positions = geometry.attributes.position.array;
    const faceNormalsBase = [];
    const delaysBase = [];
    for (var i = 0; i < positions.length; i += 9) {
      const n = computeFaceNormal(
        [positions[i + 0], positions[i + 1], positions[i + 2]],
        [positions[i + 3], positions[i + 4], positions[i + 5]],
        [positions[i + 6], positions[i + 7], positions[i + 8]]
      );
      faceNormalsBase.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
      const delay = Math.random() * 0.5;
      delaysBase.push(delay, delay, delay);
    }
    const faceNormals = new Float32Array(faceNormalsBase);
    const delays = new Float32Array(delaysBase);
    geometry.addAttribute('faceNormal', new THREE.BufferAttribute(faceNormals, 3))
    geometry.addAttribute('delay', new THREE.BufferAttribute(delays, 1))
    return new THREE.Mesh(
      geometry,
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: glslify('../../../glsl/index/skyOctahedron.vs'),
        fragmentShader: glslify('../../../glsl/index/skyOctahedron.fs'),
        shading: THREE.FlatShading,
        transparent: true,
        side: THREE.DoubleSide
      })
    )
  }
  render(time) {
    this.uniforms.time.value += time;
  }
}