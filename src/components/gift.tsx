import { useState } from "react";
import type { BankAccount } from "../config/wedding-config";
import { weddingConfig } from "../config/wedding-config";
import { useReveal, type RevealRule } from "../hooks/use-reveal";
import { GiftBox } from "./gift-box";
import { GiftSheet } from "./gift-sheet";
import "./gift.css";
import { Photo } from "./photo";

const REVEAL: readonly RevealRule[] = [
  { selector: ".gift__heading", preset: "fadeUp" },
  { selector: ".gift__intro", preset: "fadeUp", delay: 100 },
  { selector: ".gift-card", preset: "fadeUp", delay: 200, stagger: 200 },
  { selector: ".duo__person", preset: "fadeUp", delay: 200, stagger: 150 },
];

interface GiftCardProps {
  account: BankAccount;
  onOpen: () => void;
}

/**
 * Kiểu "box": một hộp mừng cưới hồng phấn có phong bì đỏ ló ra khỏi khe, ảnh tròn của cô dâu hoặc chú rể ở góc. Cả thẻ
 * là một nút lớn; số tài khoản và QR chỉ hiện trong ngăn kéo khi khách mở hộp.
 */
function GiftCard({ account, onOpen }: GiftCardProps) {
  const { gift } = weddingConfig;
  return (
    <button
      type="button"
      className="gift-card"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span className="gift-card__art">
        <GiftBox state="closed" />
        <span className="gift-card__avatar">
          <Photo name={account.photo} alt="" sizes="6rem" />
        </span>
      </span>
      <span className="gift-card__role">{account.role}</span>
      <span className="gift-card__holder">{account.holder}</span>
      <span className="gift-card__open">{gift.open}</span>
    </button>
  );
}

interface GiftDuoProps {
  accounts: BankAccount[];
  onOpen: (account: BankAccount) => void;
}

/**
 * Kiểu "duo": chỉ hai chân dung tròn (cô dâu, chú rể) với tên và dòng "Gửi mừng". Chạm vào chân dung nào thì mở ngăn
 * kéo QR và số tài khoản của người đó. Không có trang trí nào khác để phần này yên tĩnh.
 */
function GiftDuo({ accounts, onOpen }: GiftDuoProps) {
  const { gift } = weddingConfig;
  return (
    <div className="duo">
      {accounts.map((account) => (
        <button
          key={account.role}
          type="button"
          className="duo__person"
          aria-haspopup="dialog"
          onClick={() => onOpen(account)}
        >
          <span className="duo__avatar">
            <Photo name={account.photo} alt="" sizes="7rem" />
          </span>
          <span className="duo__role">{account.role}</span>
          <span className="duo__holder">{account.holder}</span>
          <span className="duo__open">{gift.sendLabel}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Quà mừng: hai người (cô dâu, chú rể) trình bày theo `gift.style` ("duo" hoặc "box"). Chạm vào một người thì ngăn
 * kéo mở ra với mã QR và số tài khoản. Tách hẳn khỏi phần lời chúc: lời chúc là lời chúc, quà mừng là quà mừng.
 */
export function Gift() {
  const { gift } = weddingConfig;
  const ref = useReveal<HTMLDivElement>(REVEAL);
  const [opened, setOpened] = useState<BankAccount | null>(null);

  return (
    <section className="section gift" id="gift">
      <div className="gift__column" ref={ref}>
        <h2 className="gift__heading ornament">{gift.heading}</h2>
        <p className="gift__intro">{gift.intro}</p>
        {gift.style === "duo" ? (
          <GiftDuo accounts={gift.accounts} onOpen={setOpened} />
        ) : (
          <div className="gift__list">
            {gift.accounts.map((account) => (
              <GiftCard
                key={account.role}
                account={account}
                onOpen={() => setOpened(account)}
              />
            ))}
          </div>
        )}
      </div>
      {opened && (
        <GiftSheet
          account={opened}
          variant={gift.style}
          onClose={() => setOpened(null)}
        />
      )}
    </section>
  );
}
