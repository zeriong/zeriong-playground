// 카메라 권한 상태 조회 및 요청. 브라우저 권한 API 만 다룬다.

export type CameraPermission = "granted" | "denied" | "prompt" | "unsupported";

// 현재 권한 상태를 가능한 범위에서 조회. Permissions API 미지원 시 'prompt' 로 간주.
export async function queryCameraPermission(): Promise<CameraPermission> {
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    // 일부 브라우저(Safari 등)는 navigator.permissions.query 의 'camera' 를 미지원.
    const status = await navigator.permissions?.query({
      name: "camera" as PermissionName,
    });
    if (status) return status.state as CameraPermission;
  } catch {
    // 무시하고 prompt 로 폴백
  }
  return "prompt";
}

// 실제 카메라 스트림을 요청한다. 성공 시 MediaStream, 거부/실패 시 null.
export async function requestCameraStream(): Promise<MediaStream | null> {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch {
    return null;
  }
}
