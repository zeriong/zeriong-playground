import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { pickNearestHand, type HandState } from "./grabDetection";
import { requestCameraStream } from "./cameraPermission";

// MediaPipe HandLandmarker 를 비디오 스트림에 결선하는 훅.
// 매 프레임 손 상태를 ref(handRef)에 기록한다 — 게임 루프가 리렌더 없이 읽도록.
// active=true 일 때만 카메라/추론을 켜고, false 가 되면 정리한다.

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export interface UseHandTracking {
  // 게임 루프가 읽는 최신 손 상태(없으면 null).
  handRef: React.RefObject<HandState | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  ready: boolean;
  error: string | null;
}

export function useHandTracking(active: boolean): UseHandTracking {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handRef = useRef<HandState | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTime = useRef<number>(-1);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    handRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        // 1) 모델 로드 (한 번만)
        if (!landmarkerRef.current) {
          const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
            // 양손을 감지한 뒤 원근 우선법칙으로 가장 가까운 손 하나만 인식한다.
            numHands: 2,
            runningMode: "VIDEO",
          });
        }
        if (cancelled) return;

        // 2) 카메라 스트림 연결
        const stream = await requestCameraStream();
        if (!stream) {
          setError("카메라를 시작할 수 없습니다.");
          return;
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setReady(true);
        setError(null);

        // 3) 매 프레임 추론
        const loop = () => {
          if (cancelled) return;
          const v = videoRef.current;
          const lm = landmarkerRef.current;
          if (v && lm && v.readyState >= 2 && v.currentTime !== lastVideoTime.current) {
            lastVideoTime.current = v.currentTime;
            const result = lm.detectForVideo(v, performance.now());
            // 감지된 모든 손 중 가장 가까운(손바닥이 가장 큰) 손만 선택.
            const nearest = pickNearestHand(result.landmarks ?? []);
            // 비디오는 거울 모드로 표시하므로 x 를 반전해 화면 좌표계와 맞춘다.
            handRef.current = mirrorX(nearest);
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "손 인식 초기화 실패");
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [active, stop]);

  return { handRef, videoRef, ready, error };
}

function mirrorX(hand: HandState | null): HandState | null {
  if (!hand) return null;
  return {
    ...hand,
    x: 1 - hand.x,
    tips: hand.tips.map((t) => ({ x: 1 - t.x, y: t.y })),
  };
}
