import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { navigateTo } from "../../../utils/navigate";
import PageNav from "../../../components/PageNav/PageNav";
import "./video.css";

// ============================================================
// 类型定义
// ============================================================

type CameraPhase = "requesting" | "active" | "error";
type ScreenPhase = "idle" | "active" | "error";
type RecordState = "idle" | "recording" | "finished";

// ============================================================
// 格式化秒数 → mm:ss
// ============================================================

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ============================================================
// Video 页面
// ============================================================

function VideoPage() {
  const [searchParams] = useSearchParams();
  const memberName = searchParams.get("name") || "成员";

  const videoRef = useRef<HTMLVideoElement>(null);

  // ── 摄像头 ──
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("requesting");
  const [cameraError, setCameraError] = useState("");

  // ── 投屏（屏幕捕获） ──
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>("idle");
  const [screenError, setScreenError] = useState("");

  // ── 录屏状态 ──
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);

  // ── 派生状态 ──
  const isCameraActive = cameraPhase === "active";
  const isScreenActive = screenPhase === "active";
  const isAnySourceActive = isCameraActive || isScreenActive;

  // ============================================================
  // 摄像头：开启
  // ============================================================

  const startCamera = useCallback(async () => {
    setCameraPhase("requesting");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraPhase("active");
    } catch (err: unknown) {
      const error = err as DOMException;
      let message: string;
      switch (error.name) {
        case "NotAllowedError":
          message = "摄像头权限被拒绝，请在浏览器设置中允许访问摄像头。";
          break;
        case "NotFoundError":
          message = "未检测到摄像头设备，请确认摄像头已连接。";
          break;
        case "NotReadableError":
          message = "摄像头被其他应用占用，请关闭其他使用摄像头的程序后重试。";
          break;
        default:
          message = `无法打开摄像头：${error.message || "未知错误"}`;
      }
      setCameraError(message);
      setCameraPhase("error");
    }
  }, []);

  // ============================================================
  // 摄像头：关闭
  // ============================================================

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
  }, []);

  // ============================================================
  // 投屏：开始屏幕捕获
  // ============================================================

  const startScreenCast = useCallback(async () => {
    // 录屏进行中不允许切换
    if (recordState === "recording") {
      alert("请先停止录制再切换投屏");
      return;
    }

    setScreenPhase("idle"); // 先清除之前的错误
    setScreenError("");

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      screenStreamRef.current = stream;
      setScreenPhase("active");

      // 停止摄像头以释放资源
      stopCamera();
      setCameraPhase("requesting"); // 非 active，避免 UI 混淆

      // 用户通过浏览器原生 UI 停止共享时，自动切回摄像头
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          // 如果正在录制，先停止
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          // 清理屏幕流
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          setScreenPhase("idle");
          // 重新打开摄像头
          startCamera();
        };
      }
    } catch (err: unknown) {
      const error = err as DOMException;
      // 用户取消选择器不算错误，保持摄像头
      if (error.name === "AbortError" || error.name === "NotAllowedError") {
        setScreenPhase("idle");
        return;
      }
      let message: string;
      switch (error.name) {
        case "NotFoundError":
          message = "未找到可共享的屏幕或窗口。";
          break;
        case "NotReadableError":
          message = "无法读取屏幕内容，请重试。";
          break;
        default:
          message = `投屏失败：${error.message || "未知错误"}`;
      }
      setScreenError(message);
      setScreenPhase("error");
    }
  }, [recordState, stopCamera, startCamera]);

  // ============================================================
  // 投屏：停止屏幕捕获，切回摄像头
  // ============================================================

  const stopScreenCast = useCallback(async () => {
    // 录屏进行中不允许切换
    if (recordState === "recording") {
      alert("请先停止录制再切换回摄像头");
      return;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenPhase("idle");
    setScreenError("");
    // 重新开启摄像头
    await startCamera();
  }, [recordState, startCamera]);

  // ============================================================
  // 挂载：自动打开摄像头
  // ============================================================

  useEffect(() => {
    startCamera();

    return () => {
      // 清理摄像头
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      // 清理投屏
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      // 清理录屏
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
        downloadUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // 视频流 → video 元素绑定
  // ============================================================

  useEffect(() => {
    if (!videoRef.current) return;
    const stream = screenStreamRef.current || cameraStreamRef.current;
    videoRef.current.srcObject = stream || null;
  }, [cameraPhase, screenPhase]);

  // ============================================================
  // ESC 返回
  // ============================================================

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigateTo("/family-tree");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ============================================================
  // 录制：开始
  // ============================================================

  const startRecording = useCallback(() => {
    const stream = screenStreamRef.current || cameraStreamRef.current;
    if (!stream) return;

    if (!MediaRecorder.isTypeSupported("video/webm")) {
      alert("当前浏览器不支持录屏功能，请使用 Chrome 或 Edge");
      return;
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
      const url = URL.createObjectURL(blob);
      downloadUrlRef.current = url;
      setDownloadUrl(url);
      setRecordState("finished");
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordState("recording");
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  // ============================================================
  // 录制：停止
  // ============================================================

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ============================================================
  // 录制：下载
  // ============================================================

  const downloadVideo = useCallback(() => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    const prefix = isScreenActive ? "投屏" : memberName;
    a.download = `${prefix}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [downloadUrl, memberName, isScreenActive]);

  // ============================================================
  // 录制：重置
  // ============================================================

  const resetRecording = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
      setDownloadUrl(null);
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setRecordState("idle");
    setElapsed(0);
  }, []);

  // ============================================================
  // 导航
  // ============================================================

  const goBack = () => navigateTo("/family-tree");

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <div className="video-page">
      <PageNav />

      <main className="video-page__main">
        {/* 顶部信息栏 */}
        <header className="video-page__bar">
          <button className="video-page__back" onClick={goBack} title="返回家谱">
            ← 返回
          </button>
          <h1 className="video-page__title">
            {isScreenActive ? "🖥️" : "📹"} {isScreenActive ? "电脑投屏" : `${memberName} · 视频预览`}
          </h1>
          <span className="video-page__spacer" />
        </header>

        {/* 视频区域 + 工具栏 */}
        <div className="video-page__stage">
          {/* ---- 摄像头：加载中 ---- */}
          {cameraPhase === "requesting" && screenPhase !== "active" && (
            <div className="video-page__status">
              <span className="video-page__spinner" />
              <p>正在请求摄像头权限…</p>
            </div>
          )}

          {/* ---- 投屏模式：隐藏视频避免循环，显示状态卡片 ---- */}
          {isScreenActive && (
            <div className="video-page__cast-placeholder">
              <div className="video-page__cast-placeholder-icon">🖥️</div>
              <h2 className="video-page__cast-placeholder-title">电脑屏幕正在投屏中</h2>
              <p className="video-page__cast-placeholder-desc">
                屏幕内容正在共享，视频预览已自动隐藏以避免画面循环。
                <br />
                你可以使用右侧工具栏录制屏幕。
              </p>
            </div>
          )}

          {/* ---- 摄像头模式：显示视频画面 ---- */}
          {isCameraActive && (
            <div className="video-page__video-wrap">
              <video
                ref={videoRef}
                className="video-page__video"
                autoPlay
                playsInline
                muted
              />
            </div>
          )}

          {/* ---- 摄像头错误 ---- */}
          {cameraPhase === "error" && screenPhase !== "active" && (
            <div className="video-page__error">
              <span className="video-page__error-icon">⚠️</span>
              <p>{cameraError}</p>
              <button className="video-page__btn" onClick={startCamera}>
                重试
              </button>
            </div>
          )}

          {/* ---- 右侧工具栏 — 有画面时显示 ---- */}
          {isAnySourceActive && (
            <aside className="video-page__toolbar">
              {/* 录制区块 */}
              <div className="video-page__toolbar-title">录制</div>
              <div className="video-page__toolbar-section">
                {recordState === "idle" && (
                  <button
                    className="video-page__record-btn video-page__record-btn--start"
                    onClick={startRecording}
                    title="开始录制"
                  >
                    <span className="video-page__record-dot" />
                    开始录制
                  </button>
                )}

                {recordState === "recording" && (
                  <div className="video-page__recording-group">
                    <button
                      className="video-page__record-btn video-page__record-btn--stop"
                      onClick={stopRecording}
                      title="停止录制"
                    >
                      <span className="video-page__record-stop-icon" />
                      停止
                    </button>
                    <div className="video-page__timer">
                      <span className="video-page__timer-dot" />
                      {formatTime(elapsed)}
                    </div>
                  </div>
                )}

                {recordState === "finished" && (
                  <div className="video-page__finished-group">
                    <div className="video-page__finished-label">
                      ✅ 录制完成（{formatTime(elapsed)}）
                    </div>
                    <button
                      className="video-page__download-btn"
                      onClick={downloadVideo}
                      title="下载视频"
                    >
                      ⬇ 下载视频
                    </button>
                    <button className="video-page__reset-btn" onClick={resetRecording} title="重新录制">
                      🔄 重新录制
                    </button>
                  </div>
                )}
              </div>

              {/* 分隔线 */}
              <div className="video-page__toolbar-divider" />

              {/* 投屏区块 */}
              <div className="video-page__toolbar-title">投屏</div>
              <div className="video-page__toolbar-section">
                {/* 摄像头模式 → 显示投屏入口 */}
                {isCameraActive && (
                  <button
                    className="video-page__cast-btn video-page__cast-btn--start"
                    onClick={startScreenCast}
                    title="投屏到电脑"
                  >
                    <span className="video-page__cast-icon">🖥️</span>
                    开始投屏
                  </button>
                )}

                {/* 投屏模式 → 显示状态 + 停止 */}
                {isScreenActive && (
                  <div className="video-page__cast-active-group">
                    <div className="video-page__cast-active-label">
                      <span className="video-page__cast-active-dot" />
                      正在投屏中
                    </div>
                    <button
                      className="video-page__cast-btn video-page__cast-btn--stop"
                      onClick={stopScreenCast}
                      title="停止投屏"
                    >
                      <span className="video-page__cast-stop-icon">📹</span>
                      切换回摄像头
                    </button>
                  </div>
                )}

                {/* 投屏错误 */}
                {screenPhase === "error" && (
                  <div className="video-page__cast-error">
                    <span className="video-page__cast-error-icon">⚠️</span>
                    <p className="video-page__cast-error-text">{screenError}</p>
                    <button className="video-page__reset-btn" onClick={startScreenCast}>
                      🔄 重试
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* 底部提示 */}
        <footer className="video-page__hint">
          <span>按 ESC 或点击左上角按钮返回家谱</span>
        </footer>
      </main>
    </div>
  );
}

export default VideoPage;
