/**
 * Điểm đăng ký GSAP duy nhất: import từ đây để plugin chỉ đăng ký một lần.
 * ScrollTrigger chưa nạp ở đây vì phần lớn hiệu ứng cuộn dùng IntersectionObserver; chỉ import khi thật sự cần scrub.
 */
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

gsap.registerPlugin(useGSAP)

export { gsap, useGSAP }
