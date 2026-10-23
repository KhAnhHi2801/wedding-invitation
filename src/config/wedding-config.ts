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
  /** car: đón dâu · camera: hai tay ôm tim (chụp ảnh, khoảnh khắc) · toast: khai tiệc · church: thánh lễ · gift: ăn hỏi · rings: hôn lễ */
  icon: "car" | "camera" | "toast" | "church" | "gift" | "rings";
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

/** Thông tin đầy đủ của một bên (nhà trai/nhà gái): địa điểm, giờ tổ chức và lịch trình riêng. */
export interface SideEvent extends EventInfo {
  timeline: TimelineItem[];
}

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
  /** Lời mời gieo lời chúc ở màn thành công, kèm nút mở lớp phủ gieo hoa */
  successWish: string;
  wishButton: string;
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
  send: string;
  sendSub: string;
  doneTitle: string;
  plantAnother: string;
  /** Nút mở lớp phủ gieo hoa (ở phần "Lời chúc" và nút nổi) */
  open: string;
  /** Nút nhấn giữ để gieo hạt, gợi ý dưới nút, và nhãn đọc cho bàn phím/trình đọc màn hình */
  hold: string;
  holdHint: string;
  holdKeyboard: string;
  /** Tiêu đề bước chọn hoa và trạng thái đang gieo */
  chooseTitle: string;
  sowing: string;
  close: string;
  /** Nút ở bước hoàn thành, dẫn xuống phần "Lời chúc" */
  seeWishes: string;
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

/** Phần "Lời chúc": cuốn sổ lưu bút lò xo và chi tiết từng lời. `{n}` và `{name}` được thay khi hiển thị. */
export interface WishGalleryText {
  label: string;
  subtitle: string;
  /** Hiện khi chưa có lời chúc nào */
  empty: string;
  /** Dòng hướng dẫn trên nút gieo hoa: khách cần làm gì */
  guide: string;
  /** Dấu hiệu bấm được khi lời trên trang sổ bị cắt bớt */
  more: string;
  /** Nhãn trên trang sổ chứa lời khách vừa gieo */
  mine: string;
  /** Nút trước/sau và nhãn mỗi trang sổ; `{n}` và `{total}` được thay khi hiển thị */
  prev: string;
  next: string;
  slideLabel: string;
  /** Số trang đang xem khi sổ dày quá để hiện chấm; `{n}` và `{total}` được thay khi hiển thị */
  counter: string;
  listLabel: string;
  close: string;
  flowerLabel: string;
  /** Tên người gửi khi lời chúc thêm tay vào Sheet không có tên */
  anonymous: string;
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
    /** Chữ đứng trước năm; năm lấy từ `event.startsAt` */
    yearPrefix: string;
    inviteLine: string;
    guestFallback: string;
    /** Dòng riêng trên phong bì khi link có tên khách; `{name}` là tên khách */
    guestEnvelopeLine: string;
  };
  /** Tên khách lấy từ query này, ví dụ `?to=Anh%20Nam` */
  guestParam: string;
  couple: { bride: Person; groom: Person; connector: string };
  /** Tên query chọn bên, ví dụ `?from=bride` (nhà gái) hoặc `?from=groom` (nhà trai) */
  sideParam: string;
  /** ISO có múi giờ: mốc đếm ngược ở ảnh bìa, chung cho mọi bên (ngày đầu tiên của các lễ, không phụ thuộc `?from=`) */
  countdownTo: string;
  /** Bên được dùng khi link không có `from` hoặc `from` không hợp lệ */
  defaultSide: "groom" | "bride";
  /** Mỗi bên khai báo đủ địa điểm, giờ tổ chức và lịch trình của riêng mình */
  sides: { groom: SideEvent; bride: SideEvent };
  /** `greetingNamed` thay cho dòng đầu của `lines` khi link có tên khách; `{name}` là tên khách */
  invitation: { heading: string; greetingNamed: string; lines: string[] };
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
  gallery: {
    /** Tiêu đề chữ trắng giãn rộng ở đầu khối ảnh */
    title: string;
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
  wishGallery: WishGalleryText;
  gift: {
    heading: string;
    /** Nhãn đọc cho nút sao chép số tài khoản (nút chỉ có biểu tượng) */
    copyLabel: string;
    copied: string;
    copyFailed: string;
    qrAlt: string;
    accounts: BankAccount[];
  };
  /** `animation`: WebP động, `still`: ảnh tĩnh cho người giảm chuyển động (tạo bởi `npm run images`) */
  thankYou: {
    text: string;
    note: string;
    noteGuestFallback: string;
    animation: string;
    still: string;
    alt: string;
  };
  /** Nhãn giao diện cố định */
  ui: {
    countdownUnits: [string, string, string, string];
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

/*
 * ===== DỮ LIỆU GỐC =====
 * Mỗi thông tin chỉ ghi một lần ở đây; các phần trong `weddingConfig` bên dưới tự ghép lại từ các giá trị này
 * (tên, địa chỉ, ngày, giờ, âm lịch). Đổi ở đây là cập nhật khắp thiệp.
 */

/** Cô dâu và chú rể: tên hiển thị, họ tên, ngày sinh, bố mẹ và nơi ở (thôn, xã). */
const bride = {
  name: "Ngọc Khánh",
  fullName: "Nguyễn Thị Khánh",
  birthDate: "28/01/2001",
  father: "Nguyễn Vũ Cử",
  mother: "Trần Thị Mỳ",
  village: "Thôn Tiến Thắng",
  commune: "Xã Yên Đồng",
};
const groom = {
  name: "Quốc Tuân",
  fullName: "Tạ Quốc Tuân",
  birthDate: "30/04/1994",
  father: "Tạ Văn Tuấn",
  mother: "Phạm Thị Sáng",
  village: "Thôn Yên Lâm",
  commune: "Xã Yên Mạc",
};

const PROVINCE = "Ninh Bình";
const CHURCH = "Nhà thờ Giáo xứ Vỉ Nhuế";

type Home = { village: string; commune: string };
/** "Thôn Yên Lâm, Xã Yên Mạc, Tỉnh Ninh Bình": quê quán, địa chỉ tiệc */
const fullAddress = (home: Home) =>
  `${home.village}, ${home.commune}, Tỉnh ${PROVINCE}`;
/** "Thôn Yên Lâm, Xã Yên Mạc, Ninh Bình": nơi ở của gia đình, truy vấn bản đồ */
const shortAddress = (home: Home) => `${home.commune}, ${PROVINCE}`;

/** Ngày dương (yyyy-mm-dd) kèm âm lịch của hai ngày lễ: thứ Bảy ở nhà gái, Chủ nhật ở nhà trai. */
const brideDay = {
  date: "2026-11-28",
  lunar: "(Tức ngày 20 tháng 10 năm Bính Ngọ)",
};
const groomDay = {
  date: "2026-11-29",
  lunar: "(Tức ngày 21 tháng 10 năm Bính Ngọ)",
};

/** Giờ từng mốc (hh:mm). Dùng cho cả lịch trình lẫn `startsAt`/`countdownTo`, nên đổi giờ một chỗ. */
const brideTime = { engagement: "07:30", mass: "08:30", party: "10:00" };
const groomTime = { pickup: "07:00", ceremony: "11:00" };

/** ISO có múi giờ Việt Nam từ ngày và giờ ở trên. */
const at = (date: string, time: string) => `${date}T${time}:00+07:00`;

export const weddingConfig: WeddingConfig = {
  meta: {
    title: `${bride.name} & ${groom.name}`,
    description: `Trân trọng kính mời bạn đến dự lễ thành hôn của ${bride.name} và ${groom.name}.`,
    siteUrl: "",
    ogImage: "og.jpg",
    themeColor: "#8B2F30",
  },
  hero: {
    eyebrow: "WEDDING INVITATION",
    title: "THIỆP MỜI CƯỚI",
    photo: "hero/couple",
    coverPhoto: "hero/couple",
    yearPrefix: "NĂM",
    inviteLine: "TRÂN TRỌNG KÍNH MỜI",
    guestFallback: "Quý Khách",
    guestEnvelopeLine: "Dành tặng {name}",
  },
  guestParam: "to",
  sideParam: "from",
  couple: {
    bride: {
      name: bride.name,
      fullName: bride.fullName,
      birthDate: bride.birthDate,
      hometown: shortAddress(bride),
      photo: "photos/photo-06",
      widePhoto: "photos/photo-07",
    },
    groom: {
      name: groom.name,
      fullName: groom.fullName,
      birthDate: groom.birthDate,
      hometown: shortAddress(groom),
      photo: "photos/photo-05",
      widePhoto: "photos/photo-08",
    },
    connector: "&",
  },
  // Lễ đầu tiên: ăn hỏi ở nhà gái, 7h30 sáng thứ Bảy 28/11
  countdownTo: at(brideDay.date, brideTime.engagement),
  defaultSide: "groom",
  sides: {
    // Nhà trai (link `?from=groom`): đón dâu 7h sáng Chủ nhật 29/11, hôn lễ tại tư gia 11h rồi đãi tiệc
    groom: {
      startsAt: at(groomDay.date, groomTime.ceremony),
      lunarText: groomDay.lunar,
      venue: "TƯ GIA NHÀ TRAI",
      address: `(${fullAddress(groom)})`,
      mapsQuery: fullAddress(groom),
      timeline: [
        { time: groomTime.pickup, label: "Đón Dâu", icon: "car" },
        { time: groomTime.ceremony, label: "Lễ Thành Hôn", icon: "rings" },
        { time: "Sau lễ", label: "Khai Tiệc", icon: "toast" },
      ],
    },
    // Nhà gái (link `?from=bride`): ăn hỏi 7h30, thánh lễ 8h30, tiệc 10h sáng thứ Bảy 28/11. Tư gia nhà gái nằm sát nhà thờ nên bản đồ chỉ về nhà thờ
    bride: {
      startsAt: at(brideDay.date, brideTime.party),
      lunarText: brideDay.lunar,
      venue: "TƯ GIA NHÀ GÁI",
      address: `(Cạnh ${CHURCH}, ${fullAddress(bride)})`,
      mapsQuery: `${CHURCH}, ${bride.commune}, ${PROVINCE}`,
      timeline: [
        { time: brideTime.engagement, label: "Lễ Ăn Hỏi", icon: "gift" },
        { time: brideTime.mass, label: "Thánh Lễ Hôn Phối", icon: "church" },
        { time: brideTime.party, label: "Khai tiệc", icon: "toast" },
      ],
    },
  },
  invitation: {
    heading: "INVITATION",
    greetingNamed: "{name} thân mến,",
    lines: [
      "Thân gửi bạn,",
      "Trong ngày vui của chúng mình, rất mong được đón bạn đến chung vui, cùng sẻ chia niềm hạnh phúc và lưu giữ thêm một kỷ niệm đẹp bên nhau.",
      "Thân mời bạn đến dự lễ cưới của chúng mình.",
    ],
  },
  ceremony: {
    titleLines: ["Lễ", "Thành", "Hôn"],
    groomFamily: {
      label: "Nhà Trai",
      father: `Ông: ${groom.father}`,
      mother: `Bà: ${groom.mother}`,
      place: fullAddress(groom),
    },
    brideFamily: {
      label: "Nhà Gái",
      father: `Ông: ${bride.father}`,
      mother: `Bà: ${bride.mother}`,
      place: fullAddress(bride),
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
    photos: ["photos/photo-01", "photos/photo-04"],
  },
  about: { heading: "About us", brideLabel: "Bride", groomLabel: "Groom" },
  saveTheDate: { heading: "Save the date", photo: "photos/photo-07" },
  gallery: {
    title: "INVITATION",
    verticalLeft: "I love you forever",
    verticalRight: "So glad you're here",
    caption:
      "Chúng mình muốn chụp vài tấm hình kỷ niệm cùng bạn, nên nếu có thể, bạn đến sớm một chút nhé. Và ở cuối thiệp có một cuốn sổ lưu bút nhỏ: hãy ép vào đó một bông hoa cùng đôi dòng chúc, như một kỷ niệm bạn để lại cho chúng mình.",
    photos: ["photos/photo-03", "photos/photo-04", "photos/photo-08"],
    background: "photos/photo-02",
  },
  rsvp: {
    eyebrow: "R.S.V.P.",
    title: "Xác nhận tham dự",
    description:
      "Để chúng mình chuẩn bị chu đáo cho ngày vui, bạn xác nhận giúp chúng mình sự tham dự nhé.",
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
      successWish:
        "Còn một điều nữa: bạn gieo cho chúng mình một lời chúc nhé?",
      wishButton: "Gieo lời chúc",
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
    title: "Gieo lời chúc",
    carouselLabel: "Các loài hoa",
    plant: "Gieo hoa này",
    growing: "Hạt đang nảy mầm…",
    skipGrowing: "Bỏ qua",
    writeTitle: "Viết lời chúc",
    nameLabel: "Tên của bạn",
    messageLabel: "Lời chúc dành cho cô dâu chú rể",
    suggestAnother: "Chọn loài hoa khác",
    send: "Gieo lời chúc",
    sendSub: "Một lời chúc nhỏ, một kỷ niệm dài lâu.",
    doneTitle: "Hoa của bạn đã nở",
    plantAnother: "Gieo thêm một bông",
    open: "Gieo lời chúc",
    hold: "Chạm giữ để gieo hạt",
    holdHint: "Giữ ngón tay khoảng một giây",
    holdKeyboard: "Gieo hạt ngay",
    chooseTitle: "Chọn loài hoa của bạn",
    sowing: "Hạt đang rơi xuống chậu…",
    close: "Đóng",
    seeWishes: "Ép hoa vào sổ lưu bút",
    noteCaption: "Bông hoa này sẽ được ép vào sổ lưu bút của chúng mình",
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
  wishGallery: {
    label: "Lưu bút ngày cưới",
    subtitle:
      "Có những điều dịu dàng được gửi đi, rồi ở lại thật lâu giữa những trang sổ của chúng mình.",
    empty: "Hãy là người đầu tiên ép một bông hoa vào cuốn sổ này.",
    guide:
      "Chọn một loài hoa, viết vài dòng, bông hoa của bạn sẽ được ép vào cuốn sổ này.",
    more: "Đọc tiếp",
    mine: "Lời chúc của bạn",
    prev: "Trang trước",
    next: "Trang sau",
    slideLabel: "Trang {n} trên {total}",
    counter: "{n} / {total}",
    listLabel: "Các lời chúc",
    close: "Đóng",
    flowerLabel: "Loài hoa",
    anonymous: "Một người bạn",
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
        holder: bride.fullName,
        bank: "TECHCOMBANK",
        bankBin: "970407",
        accountNumber: "19036592558012",
        photo: "photos/photo-06",
      },
      {
        role: "Chú rể",
        holder: groom.fullName,
        bank: "TECHCOMBANK",
        bankBin: "970407",
        accountNumber: "19034008735010",
        photo: "photos/photo-05",
      },
    ],
  },
  thankYou: {
    text: "Thank you",
    note: "Cảm ơn {name} đã đến với ngày vui của chúng mình. Hẹn gặp bạn, và chúc bạn một ngày thật nhiều niềm vui.",
    noteGuestFallback: "bạn",
    animation: "bride-groom-dancing.webp",
    still: "bride-groom-dancing-still.webp",
    alt: "Cô dâu chú rể nhảy múa",
  },
  ui: {
    countdownUnits: ["ngày", "giờ", "phút", "giây"],
    mapTitle: "Bản đồ địa điểm tổ chức",
    weekdays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    openEnvelope: "Mở thiệp",
    fabWish: "Gieo lời chúc",
    fabGift: "Gửi quà mừng",
    fabRsvp: "Xác nhận tham dự",
    musicLabel: "Nhạc nền",
  },
  music: { src: "audio/bg-music.wav", autoplay: false, volume: 0.35 },
};
