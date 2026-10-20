/**
 * TOÀN BỘ nội dung thiệp nằm ở đây. Đổi giá trị là đổi trang, không cần sửa component.
 * Ảnh khai báo theo khóa trong `src/generated/image-manifest.json` (ví dụ "photos/photo-01"),
 * tạo bởi `npm run images` từ thư mục `source-images/`. Khóa sai sẽ báo lỗi ngay khi gõ (kiểu `ImageKey`).
 * Đường dẫn file trong `public/` viết KHÔNG có dấu "/" đầu (ví dụ "audio/bg-music.wav"); khi deploy vào thư mục con hãy đặt `base` trong vite.config.ts.
 * Nội dung hoa và lời chúc mẫu của mini-game nằm ở `flower-wishes.ts`.
 */

import type { ImageKey } from "../lib/images.ts";

export interface Person {
  /** Tên hiển thị trong thiệp (script) */
  name: string;
  fullName: string;
  /** dd/mm/yyyy */
  birthDate: string;
  hometown: string;
  photo: ImageKey;
  /** Ảnh ngang thứ hai của mỗi người trong phần "About us" */
  widePhoto: ImageKey;
}

export interface Family {
  label: string;
  father: string;
  mother: string;
  place: string;
}

export interface TimelineItem {
  time: string;
  label: string;
  icon: "car" | "camera" | "toast";
}

export interface EventInfo {
  /** ISO có múi giờ, nguồn duy nhất cho countdown, lịch, ngày, giờ, thứ */
  startsAt: string;
  /** Ngày âm lịch không suy ra được từ `startsAt`, nhập tay */
  lunarText: string;
  venue: string;
  address: string;
  /** Nguồn duy nhất cho link và iframe bản đồ (xem `src/lib/maps.ts`) */
  mapsQuery: string;
}

/** Phần riêng của một bên (nhà trai/nhà gái): chỉ ghi trường khác `event`/`timeline` mặc định, trường bỏ trống lấy mặc định. */
export type SideOverride = Partial<EventInfo> & { timeline?: TimelineItem[] };

export interface BankAccount {
  role: string;
  holder: string;
  bank: string;
  accountNumber: string;
  /** Mã BIN ngân hàng (6 số) để sinh QR VietQR quét được, ví dụ MB Bank = 970422 */
  bankBin: string;
  photo: ImageKey;
}

export interface RsvpFormText {
  title: string;
  nameLabel: string;
  attendingLabel: string;
  yes: string;
  no: string;
  guestsLabel: string;
  noteLabel: string;
  submit: string;
  sending: string;
  close: string;
  successTitle: string;
  successYes: string;
  successNo: string;
  errors: {
    name: string;
    attending: string;
    guests: string;
    note: string;
    offline: string;
    unavailable: string;
    rateLimited: string;
    tooFast: string;
    generic: string;
  };
}

export interface GardenText {
  title: string;
  carouselLabel: string;
  plant: string;
  growing: string;
  skipGrowing: string;
  writeTitle: string;
  nameLabel: string;
  messageLabel: string;
  suggestAnother: string;
  inkLabel: string;
  /** Tên từng màu chữ, theo khóa trong `src/lib/wish-style.ts` */
  inkNames: Record<string, string>;
  send: string;
  sendSub: string;
  doneTitle: string;
  plantAnother: string;
  /** Nút mở lớp phủ gieo hoa (dưới sổ lưu bút, nút nổi) và câu gợi ý đứng trên nút */
  open: string;
  ctaHint: string;
  /** Nút nhấn giữ để gieo hạt, gợi ý dưới nút, và nhãn đọc cho bàn phím/trình đọc màn hình */
  hold: string;
  holdHint: string;
  holdKeyboard: string;
  /** Tiêu đề bước chọn hoa và trạng thái đang gieo */
  chooseTitle: string;
  sowing: string;
  close: string;
  /** Nút ở bước hoàn thành, dẫn xuống sổ lưu bút */
  seeBook: string;
  /** Dòng dưới mẩu giấy xem trước ở bước hoàn thành */
  noteCaption: string;
  errors: {
    nameRequired: string;
    nameTooLong: string;
    messageTooShort: string;
    messageTooLong: string;
    profanity: string;
  };
}

export interface GuestbookText {
  label: string;
  coverTitle: string;
  introTitle: string;
  /** Lời của cô dâu chú rể ở trang đầu */
  introText: string;
  introHint: string;
  endTitle: string;
  endText: string;
  write: string;
  reopen: string;
  prev: string;
  next: string;
  nextClose: string;
  statusClosed: string;
  statusCover: string;
  /** Dùng {page} và {total} */
  statusPage: string;
  /** Gắn sau tên khi một lời chúc dài sang trang kế */
  continued: string;
}

export interface WeddingConfig {
  /** `siteUrl` là địa chỉ tuyệt đối khi deploy (ví dụ https://thiep.example.com), cần cho ảnh chia sẻ. Để trống thì bỏ thẻ og:image/og:url. */
  meta: {
    title: string;
    description: string;
    siteUrl: string;
    ogImage: string;
    themeColor: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    /** Ảnh trong phong bì */
    photo: ImageKey;
    /** Ảnh bìa lớn ngay sau khi mở thiệp */
    coverPhoto: ImageKey;
    sealHint: string;
    /** Chữ đứng trước năm; năm lấy từ `event.startsAt` */
    yearPrefix: string;
    inviteLine: string;
    guestFallback: string;
  };
  /** Tên khách lấy từ query này, ví dụ `?to=Anh%20Nam` */
  guestParam: string;
  couple: { bride: Person; groom: Person; connector: string };
  /** Tên query chọn bên, ví dụ `?from=bride` (nhà gái) hoặc `?from=groom` (nhà trai) */
  sideParam: string;
  /** Mặc định khi link không có `from` hoặc `from` không hợp lệ */
  event: EventInfo;
  /** Mỗi bên có thể có địa điểm, giờ tổ chức và lịch trình riêng */
  sides: { groom: SideOverride; bride: SideOverride };
  invitation: { heading: string; lines: string[] };
  ceremony: {
    titleLines: string[];
    groomFamily: Family;
    brideFamily: Family;
  };
  party: {
    welcome: string;
    title: string;
    timePrefix: string;
    monthPrefix: string;
    venueLabel: string;
  };
  marryMe: {
    eyebrow: string;
    question: string[];
    answer: string[];
    photos: ImageKey[];
  };
  about: { heading: string; brideLabel: string; groomLabel: string };
  saveTheDate: { heading: string; photo: ImageKey };
  timeline: TimelineItem[];
  gallery: {
    verticalLeft: string;
    verticalRight: string;
    caption: string;
    photos: ImageKey[];
    background: ImageKey;
  };
  rsvp: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    form: RsvpFormText;
  };
  garden: GardenText;
  guestbook: GuestbookText;
  gift: {
    heading: string;
    copyLabel: string;
    copied: string;
    copyFailed: string;
    qrAlt: string;
    accounts: BankAccount[];
  };
  /** `animation`: WebP động, `still`: ảnh tĩnh cho người giảm chuyển động (tạo bởi `npm run images`) */
  thankYou: { text: string; animation: string; still: string; alt: string };
  /** Nhãn giao diện cố định */
  ui: {
    countdownUnits: [string, string, string, string];
    mapShow: string;
    mapOpen: string;
    mapTitle: string;
    /** Thứ 2 đến Chủ nhật */
    weekdays: string[];
    openEnvelope: string;
    fabWish: string;
    fabGift: string;
    fabRsvp: string;
    musicLabel: string;
  };
  /** `src` là file trong `public/` (không có "/" đầu). File hiện tại là PLACEHOLDER tạm, thay bằng nhạc thật khi có. */
  music: { src: string; autoplay: boolean; volume: number };
}

export const weddingConfig: WeddingConfig = {
  meta: {
    title: "Thiệp cưới Mai Anh & Quốc Huy",
    description:
      "Trân trọng kính mời bạn đến dự lễ cưới của Mai Anh và Quốc Huy.",
    siteUrl: "",
    ogImage: "og.jpg",
    themeColor: "#8B2F30",
  },
  hero: {
    eyebrow: "WEDDING INVITATION",
    title: "THIỆP MỜI CƯỚI",
    photo: "hero/couple",
    coverPhoto: "photos/photo-01",
    sealHint: "Chạm để mở thiệp",
    yearPrefix: "NĂM",
    inviteLine: "TRÂN TRỌNG KÍNH MỜI",
    guestFallback: "Quý Khách",
  },
  guestParam: "to",
  sideParam: "from",
  couple: {
    bride: {
      name: "Mai Anh",
      fullName: "Nguyễn Mai Anh",
      birthDate: "12/05/2000",
      hometown: "TP. Điện Biên",
      photo: "photos/photo-06",
      widePhoto: "photos/photo-07",
    },
    groom: {
      name: "Quốc Huy",
      fullName: "Phạm Quốc Huy",
      birthDate: "05/08/1995",
      hometown: "TP. Hà Nội",
      photo: "photos/photo-05",
      widePhoto: "photos/photo-04",
    },
    connector: "&",
  },
  event: {
    startsAt: "2026-12-24T10:30:00+07:00",
    lunarText: "(Tức ngày 17 tháng 11 năm Bính Ngọ)",
    venue: "TRỐNG ĐỒNG PALACE",
    address: "(18A Lý Văn Phức, P. Ô Chợ Dừa, Tp Hà Nội)",
    mapsQuery: "Trống Đồng Palace, 18A Lý Văn Phức, Ô Chợ Dừa, Hà Nội",
  },
  sides: {
    // Nhà trai dùng đúng thông tin mặc định ở `event` và `timeline`
    groom: {},
    // Ví dụ mẫu cho nhà gái (nội dung giả định, sửa lại cho đúng): link `?from=bride`
    bride: {
      startsAt: "2026-12-20T10:00:00+07:00",
      lunarText: "(Tức ngày 13 tháng 11 năm Bính Ngọ)",
      venue: "NHÀ VĂN HÓA THÀNH PHỐ ĐIỆN BIÊN",
      address: "(Phường Mường Thanh, Tp Điện Biên Phủ)",
      mapsQuery: "Nhà văn hóa thành phố Điện Biên Phủ",
      timeline: [
        { time: "07:30", label: "Lễ Đón Dâu", icon: "car" },
        { time: "09:00", label: "Chụp hình lưu niệm", icon: "camera" },
        { time: "10:00", label: "Khai tiệc", icon: "toast" },
      ],
    },
  },
  invitation: {
    heading: "INVITATION",
    lines: [
      "Gửi đến gia đình và bạn bè thân mến,",
      "Cảm ơn bạn đã dành thời gian quý báu để cùng chúng mình chung vui trong ngày đặc biệt này. Chúng mình vô cùng biết ơn vì luôn có sự đồng hành và ủng hộ của bạn, và thật vinh hạnh khi được chia sẻ niềm hạnh phúc của chúng mình cùng bạn.",
      "Trân trọng kính mời bạn đến dự lễ cưới của chúng mình",
    ],
  },
  ceremony: {
    titleLines: ["Lễ", "Thành", "Hôn"],
    groomFamily: {
      label: "Nhà Trai",
      father: "Ông: Phạm Quang Hải",
      mother: "Bà : Định Thị Mai",
      place: "TP. Hà Nội",
    },
    brideFamily: {
      label: "Nhà Gái",
      father: "Ông : Nguyễn Tiến Minh",
      mother: "Bà : Lê Thị Hải Yến",
      place: "TP. Điện Biên",
    },
  },
  party: {
    welcome: "TRÂN TRỌNG KÍNH MỜI",
    title: "TIỆC MỪNG LỄ THÀNH HÔN",
    timePrefix: "VÀO LÚC",
    monthPrefix: "THÁNG",
    venueLabel: "ĐỊA ĐIỂM TỔ CHỨC",
  },
  marryMe: {
    eyebrow: "SWEET WEDDING",
    question: ["MARRY", "ME?"],
    answer: ["YES !", "I DO !"],
    photos: ["photos/photo-04", "photos/photo-08", "photos/photo-03"],
  },
  about: { heading: "About us", brideLabel: "Bride", groomLabel: "Groom" },
  saveTheDate: { heading: "Save the date", photo: "photos/photo-07" },
  timeline: [
    { time: "08:00", label: "Lễ Rước Dâu", icon: "car" },
    { time: "09:30", label: "Chụp hình lưu niệm", icon: "camera" },
    { time: "10:30", label: "Khai tiệc", icon: "toast" },
  ],
  gallery: {
    verticalLeft: "I love you forever",
    verticalRight: "Nice to meet you",
    caption:
      "Mình rất muốn được chụp chung với bạn những tấm hình kỷ niệm vì vậy hãy đến sớm hơn một chút bạn yêu nhé! Đám cưới của chúng mình sẽ trọn vẹn hơn khi có thêm lời chúc phúc và sự hiện diện của các bạn",
    photos: ["photos/photo-03", "photos/photo-08", "photos/photo-04"],
    background: "photos/photo-02",
  },
  rsvp: {
    eyebrow: "R.S.V.P.",
    title: "Xác nhận tham dự",
    description:
      "Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.",
    button: "Gửi xác nhận",
    form: {
      title: "Xác nhận tham dự",
      nameLabel: "Họ và tên",
      attendingLabel: "Bạn sẽ tham dự chứ?",
      yes: "Có, mình sẽ đến",
      no: "Rất tiếc, mình không đến được",
      guestsLabel: "Số người đi cùng (tính cả bạn)",
      noteLabel: "Lời nhắn (không bắt buộc)",
      submit: "Gửi xác nhận",
      sending: "Đang gửi…",
      close: "Đóng",
      successTitle: "Cảm ơn bạn!",
      successYes:
        "Chúng mình đã nhận được xác nhận của bạn. Hẹn gặp bạn ở lễ cưới nhé!",
      successNo:
        "Chúng mình đã nhận được. Tiếc là không có bạn, mong sớm gặp lại!",
      errors: {
        name: "Bạn cho chúng mình biết tên nhé.",
        attending: "Bạn chọn giúp chúng mình có đến hay không nhé.",
        guests: "Số người từ 1 đến 10 thôi bạn nhé.",
        note: "Lời nhắn hơi dài, bạn rút gọn giúp chúng mình (tối đa 300 ký tự).",
        offline: "Chưa gửi được. Bạn kiểm tra mạng rồi thử lại nhé.",
        unavailable:
          "Chức năng gửi xác nhận chưa sẵn sàng. Bạn vui lòng liên hệ trực tiếp cô dâu chú rể nhé.",
        rateLimited:
          "Bạn thử hơi nhiều lần, vui lòng đợi một chút rồi gửi lại.",
        tooFast: "Bạn gửi hơi nhanh, đợi vài giây rồi gửi lại nhé.",
        generic: "Có lỗi xảy ra, bạn thử lại sau nhé.",
      },
    },
  },
  garden: {
    title: "Gieo một lời chúc",
    carouselLabel: "Các loài hoa",
    plant: "Gieo hoa này",
    growing: "Hạt đang nảy mầm…",
    skipGrowing: "Bỏ qua",
    writeTitle: "Viết lời chúc",
    nameLabel: "Tên người gửi",
    messageLabel: "Lời chúc gửi đôi mình",
    suggestAnother: "Chọn một mầm hoa khác",
    inkLabel: "Chọn sắc màu cho lời thương",
    inkNames: {
      brown: "Nâu mực",
      navy: "Xanh mực",
      forest: "Xanh rêu",
      wine: "Đỏ rượu vang",
      plum: "Tím mận",
      teal: "Xanh ngọc",
      earth: "Nâu đất",
      rose: "Hồng mận trầm",
      charcoal: "Xám than",
      olive: "Xanh olive đậm",
    },
    send: "Gieo lời thương",
    sendSub: "Một lời chúc nhỏ, một kỷ niệm dài lâu.",
    doneTitle: "Hoa của bạn đã nở",
    plantAnother: "Gieo thêm một bông",
    open: "Gieo một lời chúc",
    ctaHint:
      "Mỗi lời chúc là một bông hoa nằm trong sổ này. Bạn gieo một bông nhé.",
    hold: "Chạm giữ để gieo hạt",
    holdHint: "Giữ ngón tay khoảng một giây",
    holdKeyboard: "Gieo hạt ngay",
    chooseTitle: "Chọn loài hoa của bạn",
    sowing: "Hạt đang rơi xuống chậu…",
    close: "Đóng",
    seeBook: "Xem lời chúc trong sổ lưu bút",
    noteCaption: "Mẩu giấy này sẽ được dán vào sổ lưu bút của chúng mình",
    errors: {
      nameRequired: "Bạn cho chúng mình biết tên của bạn nhé.",
      nameTooLong:
        "Tên hơi dài, bạn rút gọn giúp chúng mình (tối đa 40 ký tự) nhé.",
      messageTooShort: "Bạn viết thêm đôi lời chúc nhé.",
      messageTooLong: "Lời chúc hơi dài, bạn rút gọn giúp chúng mình nhé.",
      profanity:
        "Tơ hồng đã se, duyên lành đã định, chúng mình chỉ nhận lời chúc thanh tịnh thôi. Bạn gột rửa từ ngữ rồi gửi lại nha.",
    },
  },
  guestbook: {
    label: "Sổ lưu bút",
    coverTitle: "Sổ lưu bút",
    introTitle: "Lời chúc từ những người thân yêu",
    introText:
      "Mỗi bông hoa trong khu vườn là một lời chúc. Cảm ơn bạn đã dành cho chúng mình những yêu thương này.",
    introHint: "Lật trang để đọc lời chúc của mọi người",
    endTitle: "Hết",
    endText: "Cảm ơn bạn đã gửi yêu thương cho chúng mình.",
    write: "Gửi lời chúc",
    reopen: "Đọc lại từ đầu",
    prev: "Trang trước",
    next: "Trang sau",
    nextClose: "Đóng sổ",
    statusClosed: "Đã đóng sổ",
    statusCover: "Bìa sổ",
    statusPage: "Trang {page} / {total}",
    continued: " (tiếp)",
  },
  gift: {
    heading: "GỬI QUÀ MỪNG",
    copyLabel: "Sao chép số tài khoản",
    copied: "Đã sao chép số tài khoản",
    copyFailed: "Chưa sao chép được, bạn giữ vào số tài khoản để chép nhé",
    qrAlt: "Mã QR chuyển khoản",
    accounts: [
      {
        role: "Cô dâu",
        holder: "Nguyễn Mai Anh",
        bank: "TECHCOMBANK",
        bankBin: "970407",
        accountNumber: "19036592558012",
        photo: "photos/photo-06",
      },
      {
        role: "Chú rể",
        holder: "Phạm Quốc Huy",
        bank: "TECHCOMBANK",
        bankBin: "970407",
        accountNumber: "19036592558012",
        photo: "photos/photo-05",
      },
    ],
  },
  thankYou: {
    text: "Thank you",
    animation: "bride-groom-dancing.webp",
    still: "bride-groom-dancing-still.webp",
    alt: "Cô dâu chú rể nhảy múa",
  },
  ui: {
    countdownUnits: ["ngày", "giờ", "phút", "giây"],
    mapShow: "Xem bản đồ",
    mapOpen: "Mở trong Maps",
    mapTitle: "Bản đồ địa điểm tổ chức",
    weekdays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    openEnvelope: "Mở thiệp",
    fabWish: "Gửi lời chúc…",
    fabGift: "Gửi quà mừng",
    fabRsvp: "Xác nhận tham dự",
    musicLabel: "Nhạc nền",
  },
  music: { src: "audio/bg-music.wav", autoplay: false, volume: 0.35 },
};
