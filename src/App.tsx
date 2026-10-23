import { useEffect, useRef, useState } from "react"
import { About } from "./components/about"
import { Ceremony } from "./components/ceremony"
import { Cover } from "./components/cover"
import { EnvelopeIntro } from "./components/envelope-intro"
import { EventInfo } from "./components/event-info"
import { FloatingActions } from "./components/floating-actions"
import { Gallery } from "./components/gallery"
import { GardenOverlayHost } from "./components/garden-overlay-host"
import { Gift } from "./components/gift"
import { WishGallery } from "./components/wish-gallery"
import { MapCard } from "./components/map-card"
import { MarryMe } from "./components/marry-me"
import { SiteNav } from "./components/site-nav"
import { Rsvp } from "./components/rsvp"
import { RsvpModal } from "./components/rsvp-modal"
import { SaveTheDate } from "./components/save-the-date"
import { ThankYou } from "./components/thank-you"
import { Timeline } from "./components/timeline"
import { ToastProvider } from "./components/toast"
import { weddingConfig } from "./config/wedding-config"
import { autoScroll } from "./lib/auto-scroll"
import { prefersReducedMotion } from "./lib/device-tier"
import { music } from "./lib/music"
import { loadAllImagesAfterPageLoad } from "./lib/preload-images"
import { lockScroll } from "./lib/scroll-lock"
import { promptRsvpOnDwell } from "./lib/rsvp-prompt"

export default function App() {
  const [opened, setOpened] = useState(false)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Trước khi mở phong bì thì khóa cuộn (khóa có đếm, dùng chung với modal)
  useEffect(() => (opened ? undefined : lockScroll()), [opened])

  // Tải sớm các ảnh lazy trong lúc khách còn ở phong bì, để cuộn tới là đã có ảnh
  useEffect(() => loadAllImagesAfterPageLoad(), [])

  // Mở xong: về đầu trang và chuyển tiêu điểm sang nội dung để bàn phím và trình đọc màn hình đi tiếp
  useEffect(() => {
    if (!opened) return
    window.scrollTo({ top: 0, behavior: "instant" })
    mainRef.current?.focus({ preventScroll: true })
  }, [opened])

  // Mở xong thì chờ một nhịp rồi tự cuộn nhẹ xuống; ai bật giảm chuyển động thì không tự chạy (vẫn bật được bằng nút)
  useEffect(() => {
    if (!opened || prefersReducedMotion()) return
    // Chờ font tải xong: chữ đổi font giữa lúc đang cuộn sẽ làm trang dồn và giật
    let cancel = () => {}
    let active = true
    const ready = document.fonts?.ready ?? Promise.resolve()
    void ready.then(() => {
      if (active) cancel = autoScroll.startAfter(weddingConfig.autoScroll.delayMs)
    })
    return () => {
      active = false
      cancel()
      autoScroll.stop()
    }
  }, [opened])

  const handleOpenStart = () => {
    // Phải bật nhạc ngay trong thao tác chạm của khách (iOS không cho phát sau khi animation kết thúc)
    if (weddingConfig.music.autoplay) music.play()
  }

  const openRsvp = () => setRsvpOpen(true)

  // Khách dừng ở phần xác nhận (sau khi đã xem ngày giờ, địa điểm) thì nhẹ nhàng mở form, mỗi lần tải trang tối đa một lần
  useEffect(() => {
    const section = document.getElementById("rsvp")
    return opened && section ? promptRsvpOnDwell(section, openRsvp) : undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  return (
    <ToastProvider>
      <EnvelopeIntro onOpenStart={handleOpenStart} onOpened={() => setOpened(true)} />
      {/* inert: phần sau phong bì không focus/đọc được cho tới khi thiệp mở */}
      <main ref={mainRef} tabIndex={-1} inert={!opened} className={opened ? "is-open" : "is-pending"}>
        <Cover />
        <Ceremony />
        {/* Các nhóm chỉ để bố cục desktop xếp hai cột; ở mobile là khối thường nên thứ tự và giao diện không đổi */}
        <div className="pair">
          <EventInfo />
          <MapCard />
        </div>
        <div className="story" id="story">
          <MarryMe />
          <About />
          <SaveTheDate />
        </div>
        <div className="finale">
          <Timeline />
          <Gallery />
          <Rsvp onOpen={openRsvp} />
        </div>
        <Gift />
        <WishGallery />
        <ThankYou />
      </main>
      {opened && (
        <>
          <SiteNav />
          <FloatingActions onOpenRsvp={openRsvp} />
        </>
      )}
      <RsvpModal open={rsvpOpen} onClose={() => setRsvpOpen(false)} />
      <GardenOverlayHost />
    </ToastProvider>
  )
}
