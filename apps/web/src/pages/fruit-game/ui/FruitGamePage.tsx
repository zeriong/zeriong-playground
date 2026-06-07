import { useCallback, useEffect, useRef, useState } from "react";
import {
  queryCameraPermission,
  useHandTracking,
  type CameraPermission,
} from "../../../features/hand-tracking";
import { useFruitGame } from "../../../features/fruit-game";
import { useLeaderboard } from "../../../features/leaderboard";
import { GameCanvas } from "../../../widgets/game-canvas";
import { GameHud } from "../../../widgets/game-hud";
import { LeaderboardBoard } from "../../../widgets/leaderboard-board";
import { GameButton } from "../../../shared/ui/GameButton";
import { Modal } from "../../../shared/ui/Modal";
import { IntroScreen } from "./IntroScreen";
import "./introScreen.css";

// 인트로 위에 뜨는 다이얼로그 상태.
type Dialog = "none" | "permission" | "confirm" | "rank";

// 페이지는 "조합"만 한다: 권한/손추적/게임/랭킹 훅을 받아 화면 상태에 따라 뷰를 결선.
export function FruitGamePage() {
  const [perm, setPerm] = useState<CameraPermission>("prompt");
  const [dialog, setDialog] = useState<Dialog>("none");
  // 카메라를 실제로 켤지 — 게임 진행(playing/paused) 중이고 권한 허용 시 true.
  const [cameraWanted, setCameraWanted] = useState(false);
  // 카메라 준비를 기다려 게임 시작을 보류 중인지. true 면 로딩 화면을 띄우고
  // 카메라가 ready 되는 순간(또는 실패 시) 게임을 시작한다.
  const [pendingCameraStart, setPendingCameraStart] = useState(false);

  const { handRef, videoRef, ready, error } = useHandTracking(cameraWanted);
  const game = useFruitGame(handRef);
  const board = useLeaderboard();

  // 방금 등록한 기록의 랭킹 인덱스(게임오버 모달 강조용). -1 이면 랭크 외.
  const [submittedRank, setSubmittedRank] = useState<number>(-1);
  const submittedRef = useRef(false);

  // 최초 진입 시 카메라 권한 상태 조회.
  useEffect(() => {
    queryCameraPermission().then(setPerm);
  }, []);

  // 게임이 끝나면 점수를 랭킹에 제출(중복 방지). 진입 순위를 저장해 모달에서 강조.
  useEffect(() => {
    if (game.status === "over" && !submittedRef.current) {
      submittedRef.current = true;
      setSubmittedRank(board.submit(game.score));
    }
    if (game.status === "playing") submittedRef.current = false;
  }, [game.status, game.score, board]);

  // "start" 클릭: 권한 있으면 confirm, 없으면 permission 안내.
  const handleStartClick = useCallback(() => {
    setDialog(perm === "granted" ? "confirm" : "permission");
  }, [perm]);

  // 카메라와 함께 게임 시작 — 단, 카메라가 준비된 뒤에 시작하도록 보류.
  const beginWithCamera = useCallback(() => {
    setCameraWanted(true);
    setPendingCameraStart(true);
    setDialog("none");
  }, []);

  // 카메라 없이(클릭 전용) 게임 시작.
  const beginWithoutCamera = useCallback(() => {
    setCameraWanted(false);
    setPendingCameraStart(false);
    setDialog("none");
    game.start();
  }, [game]);

  // 카메라 준비 완료(또는 실패) 시 보류된 게임을 시작.
  useEffect(() => {
    if (!pendingCameraStart) return;
    if (ready || error) {
      setPendingCameraStart(false);
      game.start();
    }
  }, [pendingCameraStart, ready, error, game]);

  // 권한 직접 요청 — 성공 시 곧바로 카메라로 시작.
  const requestPermission = useCallback(async () => {
    const stream = await navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .catch(() => null);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setPerm("granted");
      beginWithCamera();
    } else {
      setPerm("denied");
      // 거부되면 클릭 모드로라도 진행할 수 있게 안내 유지.
    }
  }, [beginWithCamera]);

  // 메인으로 — 게임 정지 및 카메라 종료.
  const goHome = useCallback(() => {
    game.reset();
    setCameraWanted(false);
    setPendingCameraStart(false);
    setDialog("none");
  }, [game]);

  const inGame = game.status === "playing" || game.status === "paused";
  const cameraOn = cameraWanted && ready;

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(120% 90% at 50% -10%, #2a1f55 0%, #140f2c 55%, #0a0818 100%)",
        fontFamily:
          "'Pretendard', system-ui, -apple-system, 'Apple SD Gothic Neo', sans-serif",
        color: "#fff",
        userSelect: "none",
      }}
    >
      {/* 게임 캔버스: 인게임/게임오버 + 카메라 준비 대기 중에도 마운트해
          비디오 ref 가 살아 있어 스트림이 곧바로 붙도록 한다. */}
      {(inGame || game.status === "over" || pendingCameraStart) && (
        <GameCanvas
          videoRef={videoRef}
          cameraOn={cameraOn}
          fruits={game.fruits}
          bursts={game.bursts}
          handRef={handRef}
          grabScorableRef={game.grabScorableRef}
          onTap={game.catchAt}
        />
      )}

      {/* 카메라 준비 대기 로딩 화면 */}
      {pendingCameraStart && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 35,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            background: "rgba(8,6,20,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="fg-bounce" style={{ fontSize: 56 }}>
            🎥
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>카메라 준비 중…</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            손이 잘 보이도록 카메라 앞에 자리를 잡아 주세요
          </div>
        </div>
      )}

      {/* 인게임 HUD */}
      {inGame && (
        <GameHud
          score={game.score}
          lives={game.lives}
          timeLeft={game.timeLeft}
          onPause={game.pause}
        />
      )}

      {/* 인트로 (idle) */}
      {game.status === "idle" && dialog === "none" && (
        <IntroScreen onStart={handleStartClick} onRank={() => setDialog("rank")} />
      )}

      {/* 권한 없음 안내 모달 */}
      {dialog === "permission" && (
        <Modal
          title="🎥 카메라 권한"
          footer={
            <>
              <GameButton variant="primary" onClick={requestPermission}>
                접근 권한 허용
              </GameButton>
              <GameButton variant="secondary" onClick={beginWithoutCamera}>
                시작 (클릭/탭 모드)
              </GameButton>
              <GameButton variant="ghost" onClick={() => setDialog("none")}>
                취소
              </GameButton>
            </>
          }
        >
          카메라 접근 권한이 없으면 클릭(탭)을 통해서 게임을 진행할 수 있습니다.
        </Modal>
      )}

      {/* 권한 있음 — 시작 확인 모달 */}
      {dialog === "confirm" && (
        <Modal
          title="게임을 시작하시겠습니까?"
          footer={
            <div style={{ display: "flex", gap: 10 }}>
              <GameButton variant="ghost" onClick={() => setDialog("none")} style={{ flex: 1 }}>
                취소
              </GameButton>
              <GameButton variant="primary" onClick={beginWithCamera} style={{ flex: 1 }}>
                시작
              </GameButton>
            </div>
          }
        >
          손을 펼쳤다가 ✊ 쥐는 동작으로 과일을 잡으세요!
        </Modal>
      )}

      {/* 랭킹 보기 모달 */}
      {dialog === "rank" && (
        <Modal
          title="🏆 랭킹 TOP 10"
          footer={
            <GameButton variant="secondary" onClick={() => setDialog("none")}>
              닫기
            </GameButton>
          }
        >
          <LeaderboardBoard records={board.records} />
        </Modal>
      )}

      {/* 일시정지 모달 */}
      {game.status === "paused" && (
        <Modal
          title="일시정지"
          footer={
            <>
              <GameButton variant="primary" onClick={game.resume}>
                이어서 시작
              </GameButton>
              <GameButton variant="secondary" onClick={goHome}>
                메인화면으로
              </GameButton>
            </>
          }
        />
      )}

      {/* 게임오버 모달 */}
      {game.status === "over" && (
        <Modal
          title={submittedRank >= 0 ? `🎉 ${submittedRank + 1}위 신기록!` : "게임 종료"}
          footer={
            <>
              <GameButton variant="primary" onClick={game.start}>
                다시 도전
              </GameButton>
              <GameButton variant="secondary" onClick={goHome}>
                메인화면으로
              </GameButton>
            </>
          }
        >
          <div style={{ fontSize: 15, marginBottom: 16 }}>최종 점수</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#ffd23f", marginBottom: 18 }}>
            {game.score.toLocaleString()}
          </div>
          <LeaderboardBoard records={board.records} highlightAt={submittedRank} />
        </Modal>
      )}

      {/* 카메라 실패 토스트 — 인게임 중 카메라가 끊겨도 클릭/탭으로 진행 가능 안내 */}
      {error && inGame && (
        <div style={toastStyle}>⚠️ {error} · 클릭/탭으로 진행하세요</div>
      )}
    </main>
  );
}

const toastStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 24,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 25,
  background: "rgba(8,6,20,0.7)",
  backdropFilter: "blur(8px)",
  padding: "10px 18px",
  borderRadius: 999,
  fontSize: 14,
};
