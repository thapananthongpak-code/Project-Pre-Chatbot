import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { SCENE_COUNT } from './content'
import { useStore } from './store'
import { CAM_DIST, CAM_FOV, SceneSlot } from './scenes/shared'
import { Rig } from './scenes/Rig'
import { SCENE_COMPONENTS } from './scenes'
import { Overlay } from './components/Overlay'

export default function App() {
  const lite = useStore((s) => s.lite)

  return (
    <div className="stage">
      <Canvas
        dpr={lite ? 1 : [1, 1.75]}
        camera={{ fov: CAM_FOV, near: 0.1, far: 400, position: [0, 0.4, CAM_DIST + 8] }}
        gl={{ antialias: !lite, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#060a1c']} />
        <fogExp2 attach="fog" args={['#060a1c', 0.011]} />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={['#bcd4ff', '#1a1030', 0.7]} />
        <directionalLight position={[6, 10, 8]} intensity={1.7} />
        <directionalLight position={[-8, -4, 6]} intensity={0.7} color="#8ab4ff" />
        <Suspense fallback={null}>
          {/* ScrollControls รวมความสูงของ sticky layer เพิ่ม 1 หน้าจอ → ระยะเลื่อนจริง = pages × จอ ดังนั้นใช้ N−1 เพื่อให้ฉากที่ i อยู่ที่ scrollTop = i × จอ พอดี */}
          <ScrollControls pages={SCENE_COUNT - 1} damping={0.28}>
            <Rig />
            {SCENE_COMPONENTS.map((Scene, i) => (
              <SceneSlot key={i} index={i}>
                <Scene />
              </SceneSlot>
            ))}
          </ScrollControls>
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  )
}
