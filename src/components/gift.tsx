import { weddingConfig } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { copyText } from "../lib/copy-text"
import { useToast } from "../lib/toast-context"
import { GiftQr } from "./gift-qr"
import { CopyIcon } from "./icons/ui-icons"
import { Photo } from "./photo"
import "./gift.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".gift__heading", preset: "fadeUp" },
  { selector: ".gift-card", preset: "fadeUp", delay: 150, stagger: 200 },
]

/**
 * Quà mừng theo trang mẫu: mỗi tài khoản là một thẻ ngang, ảnh tròn viền hồng nằm ngoài thẻ, thẻ xám nhạt chứa
 * vai trò, tên, ngân hàng, số tài khoản và mã QR. Thẻ thứ hai đảo bên. Số tài khoản có nút biểu tượng để sao chép
 * (nút không chứa chữ nên không làm đổi bề rộng thẻ).
 */
export function Gift() {
  const { gift } = weddingConfig
  const toast = useToast()
  const ref = useReveal<HTMLDivElement>(REVEAL)

  const copy = async (accountNumber: string) => {
    toast((await copyText(accountNumber)) ? gift.copied : gift.copyFailed)
  }

  return (
    <section className="section gift" id="gift">
      <div className="gift__column" ref={ref}>
        <h2 className="gift__heading">{gift.heading}</h2>
        <div className="gift__list">
          {gift.accounts.map((account, index) => (
            <article className={`gift-card${index % 2 === 1 ? " gift-card--flip" : ""}`} key={account.role}>
              <div className="gift-card__avatar">
                <Photo name={account.photo} alt={account.holder} sizes="(min-width: 768px) 9rem, 30vw" />
              </div>
              <div className="gift-card__pill">
                <div className="gift-card__info">
                  <p className="gift-card__role">{account.role}</p>
                  <h3 className="gift-card__holder">{account.holder}</h3>
                  <p className="gift-card__bank">{account.bank}</p>
                  <p className="gift-card__number">
                    <span>{account.accountNumber}</span>
                    <button
                      type="button"
                      className="gift-card__copy"
                      aria-label={`${gift.copyLabel} ${account.holder}`}
                      onClick={() => copy(account.accountNumber)}
                    >
                      <CopyIcon />
                    </button>
                  </p>
                </div>
                <GiftQr
                  className="gift-card__qr"
                  bankBin={account.bankBin}
                  accountNumber={account.accountNumber}
                  alt={`${gift.qrAlt} ${account.holder}`}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
