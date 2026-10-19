import { PageFlip } from "page-flip"

/**
 * Ngữ cảnh của sổ đang dựng (chỉ có một sổ trên trang): nội dung chữ, tên cô dâu chú rể, hàm vẽ hoa và màu chữ.
 * Được gán trong createGuestbook; các hàm dựng trang bên dưới đọc từ đây.
 * @type {{ texts: any, wedding: { monogram: string, names: string, dateLabel: string }, flowerSvg: (flowerId: string, seed: string) => string, inkColor: (key: string) => string | undefined, messageMax: number } | null}
 */
let ctx = null
const getCtx = () => {
  if (!ctx) throw new Error("createGuestbook chưa được gọi")
  return ctx
}

/**
 * Sổ lưu bút: mỗi trang giấy là HTML thật (chữ luôn sắc nét, đọc được bằng trình đọc màn hình),
 * lật bằng `page-flip` (kéo ngón tay/chuột để cuộn góc trang). Điện thoại dọc hiện MỘT trang,
 * màn hình rộng hiện hai trang như cuốn sổ mở.
 *
 * Thứ tự trang: bìa · lời đề tựa · các trang lời chúc · (trang trắng nếu cần chẵn) · bìa sau.
 */

const PAPER_PAD = 18 // padding ngang của tờ giấy (px)
const ITEM_PAD_X = 14
const NAME_H = 32
const ITEM_PAD_Y = 22
const ITEM_GAP = 14
const HEAD_H = 54
const FOOT_H = 44

/** Thay {khóa} trong mẫu câu bằng giá trị tương ứng */
const fill = (template, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template)

const measureCtx = document.createElement("canvas").getContext("2d")

const hash = (text) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

const el = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

/** Hoa năm cánh vẽ bằng SVG (trang trí, không mang nghĩa) */
function flower(color, size) {
  const wrap = el("span", "gb-flower")
  wrap.setAttribute("aria-hidden", "true")
  wrap.innerHTML = `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><g fill="${color}">${[0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="20" cy="9.5" rx="6.2" ry="9" transform="rotate(${a} 20 20)"/>`)
    .join("")}</g><circle cx="20" cy="20" r="4.6" fill="#f7e0a1"/></svg>`
  return wrap
}

/** Kích thước một trang theo màn hình: điện thoại dọc 1 trang, màn rộng 2 trang */
function bookSize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const portrait = vw < 760 || vw / vh < 0.9
  // Chừa chỗ cho nút Về đầu trang ở trên và thanh trang + nút gửi lời chúc ở dưới
  const maxH = Math.max(240, vh - 72 - 150)
  const ratio = 1.4
  const width = portrait
    ? Math.min(vw - 28, 440, maxH / ratio)
    : Math.min((vw - 80) / 2, 470, maxH / ratio)
  return { portrait, width: Math.floor(width), height: Math.floor(width * ratio) }
}

// Chỉ để phòng một ô Sheet bị dán nhầm cả cuốn sách làm đơ trang; mọi lời chúc thực tế (kể cả vài nghìn chữ) hiện đủ.
// Dùng chung với giới hạn khi gửi lời chúc (form và apps-script/wishes.gs), nên lời nào gửi được đều hiện đủ

/** Tách văn bản thành các dòng vừa bề rộng `textW` (khớp cách trình duyệt ngắt dòng, kể cả từ dài bị bẻ) */
function wrapLines(text, textW) {
  const lines = []
  let line = ""
  const push = () => {
    if (line) lines.push(line)
    line = ""
  }
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    let rest = word
    while (measureCtx.measureText(rest).width > textW) {
      // từ dài hơn cả dòng: bẻ ở ký tự cuối còn vừa
      push()
      let cut = rest.length - 1
      while (cut > 1 && measureCtx.measureText(rest.slice(0, cut)).width > textW) cut--
      lines.push(rest.slice(0, cut))
      rest = rest.slice(cut)
    }
    const next = line ? `${line} ${rest}` : rest
    if (line && measureCtx.measureText(next).width > textW) {
      push()
      line = rest
    } else line = next
  }
  push()
  return lines
}

/**
 * Tách mảng lời chúc thành các trang theo chiều cao ước tính. Lời chúc dài hơn chỗ còn lại của trang
 * được cắt theo dòng và tiếp tục ở trang sau (tên kèm "(tiếp)"), nên không bao giờ bị mất chữ.
 */
function paginate(wishes, { width, height }, fontPx) {
  measureCtx.font = `500 ${fontPx}px Quicksand, sans-serif`
  const textW = width - PAPER_PAD * 2 - ITEM_PAD_X * 2
  const lineH = Math.round(fontPx * 1.5)
  const budget = height - HEAD_H - FOOT_H - 16
  const fixed = NAME_H + ITEM_PAD_Y + ITEM_GAP // phần cao cố định của một ô (tên + đệm + khoảng cách)
  const MIN_LINES = 2 // không để lại một ô chỉ 1 dòng ở cuối trang nếu sang trang mới được nhiều hơn

  const pages = []
  let current = []
  let used = 0
  const newPage = () => {
    if (current.length) pages.push(current)
    current = []
    used = 0
  }

  for (const wish of wishes) {
    let lines = wrapLines(String(wish.message).slice(0, getCtx().messageMax), textW)
    let name = wish.name
    while (lines.length) {
      const room = Math.floor((budget - used - fixed) / lineH)
      const fitsWhole = lines.length <= room
      if (!fitsWhole && (room < MIN_LINES || room < 1) && current.length) {
        newPage()
        continue
      }
      const take = fitsWhole ? lines.length : Math.max(1, Math.min(room, Math.floor((budget - fixed) / lineH)))
      const part = lines.slice(0, take)
      lines = lines.slice(take)
      current.push({ name, message: part.join(" "), flower: wish.flower, ink: wish.ink, origin: `${wish.name}|${wish.message}` })
      used += fixed + part.length * lineH
      if (lines.length) {
        name = wish.name + getCtx().texts.continued
        newPage()
      }
    }
  }
  newPage()
  return pages
}

function coverPage(back) {
  const { texts, wedding } = getCtx()
  const page = el("div", `gb-page gb-cover${back ? " gb-cover--back" : ""}`)
  page.dataset.density = "hard"
  const frame = el("div", "gb-cover__frame")
  if (back) {
    frame.append(flower("#f3e3cb", 46), el("p", "gb-cover__mono", wedding.monogram))
  } else {
    frame.append(el("p", "gb-cover__mono", wedding.monogram))
    frame.append(el("p", "gb-cover__script", texts.coverTitle))
    frame.append(el("p", "gb-cover__names", wedding.names))
    frame.append(el("p", "gb-cover__small", wedding.dateLabel))
    const flowers = el("div", "gb-cover__flowers")
    flowers.append(flower("#f3e3cb", 30), flower("#e9c98a", 38), flower("#f3e3cb", 30))
    frame.append(flowers)
  }
  page.append(frame)
  return page
}

function introPage() {
  const { texts } = getCtx()
  const page = el("div", "gb-page")
  const paper = el("div", "gb-paper gb-paper--intro")
  paper.append(flower("#e9a590", 44))
  paper.append(el("h3", "gb-intro__title", texts.introTitle))
  paper.append(el("p", "gb-intro__text", texts.introText))
  paper.append(el("p", "gb-intro__hint", texts.introHint))
  paper.append(el("p", "gb-paper__num", "1"))
  page.append(paper)
  return page
}

/** Trang trắng đệm (để tổng số trang chẵn): vẫn là giấy, không trong suốt, để lật không nhìn xuyên thấy nền */
function blankPage() {
  const page = el("div", "gb-page")
  const paper = el("div", "gb-paper gb-paper--blank")
  paper.append(flower("#e9a590", 26))
  page.append(paper)
  return page
}

/** Trang cuối cùng trước bìa sau: khách đọc hết thì có luôn nút mở hộp quẻ để gửi thêm lời chúc */
function endPage() {
  const { texts, wedding } = getCtx()
  const page = el("div", "gb-page")
  const paper = el("div", "gb-paper gb-paper--intro gb-paper--end")
  paper.append(flower("#e9a590", 44))
  paper.append(el("h3", "gb-intro__title", texts.endTitle))
  paper.append(el("p", "gb-intro__text", texts.endText))
  paper.append(el("p", "gb-intro__hint", wedding.names))
  const write = el("button", "gb-end__write")
  write.type = "button"
  write.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
  write.append(texts.write)
  paper.append(write)
  page.append(paper)
  return page
}

function wishPage(wishes, number, newKey) {
  const { texts, flowerSvg, inkColor } = getCtx()
  const page = el("div", "gb-page")
  const paper = el("div", "gb-paper")
  const head = el("div", "gb-paper__head")
  head.setAttribute("aria-hidden", "true")
  head.append(flower("#e9a590", 18), el("span", "gb-paper__rule"), flower("#c6d7b0", 18))
  const list = el("ul", "gb-wishes")
  for (const wish of wishes) {
    const key = wish.origin // lời chúc gốc: các phần của một lời chúc dài cùng biểu tượng và màu chữ
    const seed = hash(key)
    const item = el("li", "gb-wish")
    const ink = inkColor(wish.ink)
    if (ink) item.style.setProperty("--wish-ink", ink)
    const icon = el("span", "gb-wish__icon")
    icon.setAttribute("aria-hidden", "true")
    icon.innerHTML = flowerSvg(wish.flower, key)
    item.style.setProperty("--tilt", `${((seed >> 5) % 21) / 10 - 1}deg`)
    if (key === newKey) item.classList.add("is-new")
    item.append(
      icon,
      el("p", "gb-wish__name", wish.name || texts.anonymous),
      el("p", "gb-wish__text", wish.message),
    )
    list.append(item)
  }
  paper.append(head, list, el("p", "gb-paper__num", String(number)))
  page.append(paper)
  return page
}

/**
 * @param {{
 *   host: HTMLElement,
 *   texts: any,
 *   wedding: { monogram: string, names: string, dateLabel: string },
 *   flowerSvg: (flowerId: string, seed: string) => string,
 *   inkColor: (key: string) => string | undefined,
 *   messageMax: number,
 *   onTurn?: () => void,
 *   onWrite?: () => void,
 * }} deps
 *   host: khung `.gb`, bên trong có `.gb__book` và các nút điều khiển `.gb__nav`.
 *   onTurn: được gọi khi lật xong một trang. onWrite: khách bấm nút "Gửi lời chúc" ở trang cuối.
 */
export function createGuestbook({ host, texts, wedding, flowerSvg, inkColor, messageMax, onTurn, onWrite }) {
  ctx = { texts, wedding, flowerSvg, inkColor, messageMax }
  const holder = host.querySelector(".gb__book")
  const prevBtn = host.querySelector(".gb__prev")
  const nextBtn = host.querySelector(".gb__next")
  const status = host.querySelector(".gb__status")
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const LID_MS = reduced ? 1 : 1100
  const LEAF_MS = 900 // thời gian tờ giấy lật lùi (ms)

  let wishes = []
  let flip = null
  let container = null
  let wide = null
  let lid = null
  let pageNodes = []
  let dirty = true
  let active = false
  let currentPage = 0
  let newKey = ""
  let pageOfNew = -1
  let shut = false // sách đang đóng bằng nắp bìa
  let cropped = false // điện thoại dọc: sách dựng 2 trang nhưng chỉ lộ nửa phải
  let reopenTimer = 0
  let builtWidth = 0 // bề rộng cửa sổ lúc dựng sổ gần nhất
  let turning = false // đang chạy cú lật lùi 3D: bỏ qua các lệnh lật khác cho đến khi xong
  let abortLeaf = null // hủy cú lật lùi đang chạy (khi sách bị dựng lại giữa chừng)

  /** Đang ở trang kết (trang cuối có thể xem): lật tiếp nghĩa là đóng sách chứ không phải lật thêm trang */
  const atEnd = () => {
    if (!flip) return false
    return flip.getCurrentPageIndex() >= flip.getPageCount() - 3
  }

  const updateStatus = () => {
    if (!flip) return
    const total = flip.getPageCount() - 1 // bìa sau chỉ là trang đệm, không tính
    const index = flip.getCurrentPageIndex()
    currentPage = index
    // Bìa trước: chỉ một nửa khung có nội dung, nên bóng độ dày chuyển sang chính tờ bìa
    host.classList.toggle("is-closed", index <= 0)
    host.classList.toggle("is-cover", index <= 0)
    host.classList.toggle("is-end", atEnd())
    if (shut) status.textContent = texts.statusClosed
    else if (cropped) {
      // Một trang: chỉ thấy trang phải của cặp (trái là mặt sau trắng của tờ trước), cứ hai trang thư viện là một trang nội dung
      status.textContent = index <= 0 ? texts.statusCover : fill(texts.statusPage, { page: (index + 1) / 2, total: (total - 1) / 2 })
    } else status.textContent = fill(texts.statusPage, { page: Math.min(total, index + 1), total })
    prevBtn.disabled = shut || index <= 0
    nextBtn.disabled = shut
    nextBtn.setAttribute("aria-label", atEnd() ? texts.nextClose : texts.next)
  }

  function destroy() {
    abortLeaf?.()
    flip?.destroy()
    flip = null
    wide?.remove()
    wide = null
    container = null
    lid?.remove()
    lid = null
  }

  /** Bản sao một trang của sách để đặt lên tờ giấy lật: bỏ các lớp và style do thư viện lật trang thêm vào */
  function leafFace(node) {
    const copy = node.cloneNode(true)
    copy.className = [...node.classList].filter((name) => !name.startsWith("stf__") && !name.startsWith("--")).join(" ")
    copy.removeAttribute("style")
    return copy
  }

  /**
   * Lật lùi một trang ở điện thoại dọc. Thư viện lật trang vẽ cú lật ngược bằng nếp gập 2D mà gáy sách nằm ngoài khung
   * (bị cắt), nên chỉ thấy một tấm giấy phẳng trượt từ trái sang như xếp chồng giấy. Ở đây dựng một tờ giấy thật bằng
   * 3D, quay quanh gáy (mép trái khung) từ -180° về 0°: mặt sau là trang trắng của tờ hiện tại, mặt trước là trang đích,
   * nên thấy tờ giấy nhấc lên, co lại theo phối cảnh rồi úp xuống. Lật xong mới đổi trang thật bên dưới sang trang đích
   * (giống hệt mặt trước của tờ giấy) rồi gỡ tờ giấy, nên không bị nhấp nháy.
   */
  function turnBackWithLeaf(index) {
    const target = index <= 1 ? 0 : index - 2 // chỉ số trang trái của cặp trang đích (0 = bìa)
    const leaf = el("div", "gb-leaf")
    const front = el("div", "gb-leaf__face gb-leaf__face--front")
    front.append(leafFace(pageNodes[index - 1]), el("i", "gb-leaf__shade"))
    const back = el("div", "gb-leaf__face gb-leaf__face--back")
    back.append(leafFace(pageNodes[index]), el("i", "gb-leaf__shade"))
    leaf.append(front, back)
    const under = el("i", "gb-leaf-shadow") // bóng tờ giấy đổ lên trang bên dưới
    holder.append(under, leaf)

    const animations = [
      leaf.animate([{ transform: "rotateY(-180deg)" }, { transform: "rotateY(0deg)" }], { duration: LEAF_MS, easing: "cubic-bezier(0.45, 0.05, 0.3, 1)", fill: "forwards" }),
      // Càng gần thẳng đứng càng tối (đón ít ánh sáng), úp xuống thì sáng lại
      front.querySelector(".gb-leaf__shade").animate([{ opacity: 0.6 }, { opacity: 0.35, offset: 0.6 }, { opacity: 0 }], { duration: LEAF_MS, easing: "ease-out", fill: "forwards" }),
      back.querySelector(".gb-leaf__shade").animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.5 }, { opacity: 0.55 }], { duration: LEAF_MS, fill: "forwards" }),
      under.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.55 }, { opacity: 0 }], { duration: LEAF_MS, fill: "forwards" }),
    ]
    turning = true
    const cleanup = () => {
      animations.forEach((animation) => animation.cancel())
      leaf.remove()
      under.remove()
      turning = false
      abortLeaf = null
    }
    abortLeaf = cleanup
    animations[0].finished.then(
      () => {
        if (flip) {
          flip.turnToPage(target)
          updateStatus()
          onTurn?.()
        }
        requestAnimationFrame(cleanup)
      },
      () => {},
    )
  }

  /** Lùi một trang (nút ‹, vuốt phải, phím ←) */
  function goBack() {
    if (!flip || turning || shut) return
    const index = flip.getCurrentPageIndex()
    if (index <= 0) return
    if (cropped && !reduced) turnBackWithLeaf(index)
    else flip.flipPrev()
  }

  /** Sang trang kế (nút ›, phím →); đang lật lùi thì bỏ qua */
  function goForward() {
    if (!flip || turning || shut) return
    flip.flipNext()
  }

  /** Nắp bìa 3D: bìa trước quay quanh gáy sách, úp lên các trang để đóng sách (và đảo ngược để mở lại) */
  function buildLid() {
    const el0 = el("div", "gb__lid")
    const front = el("div", "gb__lid-face gb__lid-face--front")
    front.append(coverPage(false))
    const back = el("div", "gb__lid-face gb__lid-face--back")
    back.append(flower("#e9a590", 34))
    el0.append(front, back)
    return el0
  }

  /**
   * Mặt sau của nắp bìa là bản sao của trang TRÁI đang hiện: khi đóng, nắp mang theo đúng trang đó nên nó không biến mất
   * trước khi nắp quay; khi mở lại, nắp đáp xuống đúng trang đầu rồi chuyển giao liền mạch cho trang thật.
   * (Điện thoại dọc: trang trái nằm ngoài khung nên mặt sau chỉ là giấy có hoa.)
   */
  function setLidBack() {
    const back = lid?.querySelector(".gb__lid-face--back")
    if (!back || !flip) return
    back.replaceChildren()
    const index = flip.getCurrentPageIndex()
    const paper = !cropped && index > 0 ? pageNodes[index]?.querySelector(".gb-paper") : null
    if (paper) back.append(paper.cloneNode(true))
    else back.append(flower("#e9a590", 34))
  }

  function build(shrink = 0) {
    const size = bookSize()
    const fontPx = Math.round(Math.min(17, Math.max(14, size.width / 23))) - shrink
    host.style.setProperty("--gb-font", `${fontPx}px`)
    host.style.setProperty("--gb-w", `${size.width}px`)
    host.style.setProperty("--gb-h", `${size.height}px`)
    host.style.setProperty("--gb-spread", size.portrait ? "1" : "2")
    host.classList.toggle("is-spread", !size.portrait)

    cropped = size.portrait
    builtWidth = window.innerWidth
    const pages = paginate(wishes, size, fontPx)
    const nodes = [coverPage(false)]
    pageOfNew = -1
    if (cropped) {
      // Điện thoại dọc: sách dựng như cuốn sổ mở 2 trang (lật qua gáy như thật, cả lật ngược) nhưng chỉ lộ nửa phải.
      // Mỗi trang nội dung nằm bên phải; mặt sau của tờ giấy (bên trái, không thấy) là giấy trắng.
      const contents = [introPage()]
      pages.forEach((group, i) => {
        if (pageOfNew < 0 && group.some((wish) => wish.origin === newKey)) pageOfNew = 2 + 2 * (i + 1)
        contents.push(wishPage(group, i + 2, newKey))
      })
      contents.push(endPage())
      nodes.push(blankPage()) // mặt trong của bìa trước
      contents.forEach((page, i) => {
        nodes.push(page)
        if (i < contents.length - 1) nodes.push(blankPage())
      })
      nodes.push(coverPage(true))
    } else {
      nodes.push(introPage())
      pages.forEach((group, i) => {
        if (pageOfNew < 0 && group.some((wish) => wish.origin === newKey)) pageOfNew = nodes.length
        nodes.push(wishPage(group, i + 2, newKey))
      })
      // Tổng số trang phải chẵn (thư viện cần bìa sau riêng ở cuối): thêm trang giấy trắng nếu cần, rồi trang kết.
      if (nodes.length % 2 === 1) nodes.push(blankPage())
      nodes.push(endPage(), coverPage(true))
    }
    // Bìa sau chỉ là trang đệm: không ai lật tới, vì lật tiếp từ trang kết là đóng sách bằng nắp bìa.

    // Kiểm tra bằng bố cục thật: nếu trình duyệt ngắt dòng nhiều hơn ước tính (font dự phòng, từ rất dài)
    // và có trang bị tràn, thu nhỏ chữ 1px rồi dựng lại (tối đa 3 lần) thay vì để mất chữ
    const probe = el("div", "gb__probe")
    probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;width:${size.width}px`
    for (const node of nodes) {
      node.style.height = `${size.height}px`
      probe.append(node)
    }
    host.append(probe)
    const overflows = [...probe.querySelectorAll(".gb-wishes")].some((list) => list.scrollHeight > list.clientHeight + 1)
    probe.remove()
    for (const node of nodes) node.style.height = ""
    if (overflows && shrink < 3) return build(shrink + 1)

    pageNodes = nodes
    destroy()
    // Khung rộng 2 trang (thư viện cần đủ chỗ để dựng chế độ hai trang); điện thoại dọc chỉ lộ nửa phải qua `.gb__book`
    wide = el("div", "gb__wide")
    wide.style.width = `${size.width * 2}px`
    container = el("div", "gb__stage")
    container.style.height = `${size.height}px`
    wide.append(container)
    holder.append(wide)
    lid = buildLid()
    holder.append(lid)

    flip = new PageFlip(container, {
      width: size.width,
      height: size.height,
      size: "fixed",
      showCover: true,
      usePortrait: false,
      drawShadow: true,
      maxShadowOpacity: 0.4,
      flippingTime: reduced ? 250 : 850,
      mobileScrollSupport: true,
      swipeDistance: 24,
      // Không dùng nếp gập góc khi hover: góc dưới-phải luôn bị lọ mực (nút viết lời chúc) che, hai thứ chồng lên nhau.
      // Lật bằng bấm trang, kéo, hoặc nút ‹ ›.
      showPageCorners: false,
      startPage: Math.min(currentPage, nodes.length - 2),
    })
    flip.loadFromHTML(nodes)
    flip.on("flip", () => {
      updateStatus()
      onTurn?.()
    })
    flip.on("changeOrientation", updateStatus)
    updateStatus()
    dirty = false
  }

  /** Chỉ dựng lại khi đang nhìn thấy; không thì chờ tới khi section vào màn hình */
  function refresh() {
    dirty = true
    if (active) build()
  }

  /** Đóng sổ: nắp bìa quay quanh gáy và úp lên các trang */
  function closeBook() {
    if (shut || !flip) return
    clearTimeout(reopenTimer)
    setLidBack()
    shut = true
    host.classList.add("is-shut")
    // Hai khung hình: nắp phải được vẽ ở trạng thái mở trước khi bắt đầu quay thì chuyển động mới thấy được
    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("is-lid-down")))
    updateStatus()
  }

  /** Mở lại sổ: nắp quay ngược lại và để lộ trang đầu */
  function reopenBook({ instant = false } = {}) {
    if (!shut) return
    shut = false
    clearTimeout(reopenTimer)
    flip?.turnToPage(1) // dưới nắp đang đóng, người xem không thấy
    setLidBack()
    host.classList.remove("is-lid-down")
    if (instant) host.classList.remove("is-shut")
    else reopenTimer = setTimeout(() => host.classList.remove("is-shut"), LID_MS + 100)
    updateStatus()
  }

  prevBtn.addEventListener("click", goBack)
  nextBtn.addEventListener("click", () => (atEnd() ? closeBook() : goForward()))
  host.querySelector(".gb__reopen").addEventListener("click", () => reopenBook())
  // `page-flip` sao chép các trang khi dựng sách nên trình xử lý gắn trực tiếp lên nút ở trang cuối sẽ mất: bắt ở khung chứa
  holder.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest(".gb-end__write")) onWrite?.()
  })

  // Ở trang kết thư viện lật trang bị tắt (lật tiếp sẽ là "sang trang khác" chứ không phải đóng sổ):
  // nên dùng cử chỉ riêng: vuốt sang trái là đóng sổ, vuốt sang phải là lùi một trang.
  // Điện thoại dọc (chỉ lộ nửa phải): trang trái không thấy nên không kéo từ mép trái được, vuốt sang phải lùi một trang.
  // Chạm dùng touch* (thư viện can thiệp vào sự kiện con trỏ nên pointerup có thể không tới); chuột dùng pointer*
  let down = null
  const onControl = (e) => e.target instanceof Element && e.target.closest(".gb__reopen, .gb-end__write")
  const swipeStart = (x, y) => {
    down = shut ? null : { x, y }
  }
  const swipeEnd = (x, y) => {
    if (!down) return
    const dx = x - down.x
    const dy = y - down.y
    down = null
    const atLast = host.classList.contains("is-end")
    // Bấm (gần như không di chuyển) ở trang kết, nơi thư viện đã bị tắt: nửa trái lùi một trang, nửa phải đóng sách
    if (atLast && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const rect = holder.getBoundingClientRect()
      if (!cropped && x < rect.left + rect.width / 2) goBack()
      else closeBook()
      return
    }
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dx < -40 && atLast) closeBook()
    else if (dx > 50 && (cropped || host.classList.contains("is-end"))) goBack()
  }
  holder.addEventListener("touchstart", (e) => !onControl(e) && swipeStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true })
  holder.addEventListener("touchend", (e) => !onControl(e) && swipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true })
  holder.addEventListener("pointerdown", (e) => e.pointerType === "mouse" && !onControl(e) && swipeStart(e.clientX, e.clientY))
  holder.addEventListener("pointerup", (e) => e.pointerType === "mouse" && !onControl(e) && swipeEnd(e.clientX, e.clientY))

  const onKeydown = (e) => {
    // Chỉ nhận phím khi tiêu điểm đang ở trong sổ (không cướp phím cuộn trang hay Enter của nút khác) và không có phím tắt trình duyệt
    if (!host.contains(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
    if (!active || !flip || document.querySelector("dialog[open]")) return
    const target = e.target
    if (target instanceof HTMLElement && target.matches("input, textarea, select")) return
    if (shut) {
      if (e.key === "Enter" || e.key === " ") reopenBook()
      return
    }
    if (e.key === "ArrowRight") {
      if (atEnd()) closeBook()
      else goForward()
    } else if (e.key === "ArrowLeft") goBack()
  }
  window.addEventListener("keydown", onKeydown)

  let resizeTimer = 0
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      // Thanh địa chỉ hoặc bàn phím ảo trên điện thoại chỉ đổi chiều cao: không dựng lại sổ. Chỉ dựng lại khi bề rộng đổi (xoay máy, đổi cỡ cửa sổ).
      if (window.innerWidth === builtWidth) return
      // Bàn phím ảo đang mở chỉ đổi chiều cao: không dựng lại sổ
      if (document.documentElement.classList.contains("is-typing")) return
      refresh()
    }, 250)
  }
  window.addEventListener("resize", onResize)

  return {
    /** Gỡ sổ khi component bị hủy: bỏ trình nghe toàn trang, hẹn giờ và thư viện lật trang */
    dispose() {
      window.removeEventListener("keydown", onKeydown)
      window.removeEventListener("resize", onResize)
      clearTimeout(resizeTimer)
      clearTimeout(reopenTimer)
      destroy()
      ctx = null
    },
    /** Danh sách đầy đủ lời chúc (mới nhất trước) */
    setWishes(list) {
      wishes = list
      refresh()
    },
    /** Section vào (hoặc rời) màn hình: chỉ dựng sổ khi đang nhìn thấy */
    setActive(value) {
      active = value
      if (active && dirty) build()
    },
    /** Đưa sổ tới trang có lời chúc vừa gửi và làm nổi bật nó (sổ đang đóng thì mở ra không animation) */
    reveal(wish) {
      newKey = `${wish.name}|${wish.message}`
      if (!active) {
        dirty = true
        return
      }
      if (shut) {
        shut = false
        host.classList.remove("is-shut", "is-lid-down")
      }
      build()
      if (pageOfNew > 0 && flip) setTimeout(() => flip?.flip(pageOfNew), 350)
    },
  }
}
