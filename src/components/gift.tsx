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
  { selector: ".ticket", preset: "fadeUp", delay: 150, stagger: 200 },
]

/**
 * Quà mừng: mỗi tài khoản là một "vé mừng cưới" đứng dọc. Đầu vé đỏ rượu có ảnh đại diện và tên, đường xé răng cưa,
 * thân vé giấy kem có mã QR lớn, số tài khoản nổi bật và nút sao chép. Một cột trên điện thoại, hai vé nghiêng
 * ngược chiều nhau; hai cột cạnh nhau trên màn rộng.
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
      <div className="container" ref={ref}>
        <h2 className="gift__heading">{gift.heading}</h2>
        <div className="gift__list">
          {gift.accounts.map((account, index) => (
            <article className={`ticket${index % 2 === 1 ? " ticket--alt" : ""}`} key={account.role}>
              <header className="ticket__head">
                <Photo
                  name={account.photo}
                  alt={account.holder}
                  sizes="(min-width: 768px) 8rem, 30vw"
                  className="ticket__avatar"
                />
                <p className="ticket__role">{account.role}</p>
                <h3 className="ticket__holder">{account.holder}</h3>
              </header>

              <div className="ticket__perf" aria-hidden="true" />

              <div className="ticket__body">
                <GiftQr
                  className="ticket__qr"
                  bankBin={account.bankBin}
                  accountNumber={account.accountNumber}
                  alt={`${gift.qrAlt} ${account.holder}`}
                />
                <p className="ticket__hint">{gift.scanHint}</p>
                <p className="ticket__bank">{account.bank}</p>
                <p className="ticket__number">{account.accountNumber}</p>
                <button type="button" className="ticket__copy" onClick={() => copy(account.accountNumber)}>
                  <CopyIcon />
                  {gift.copyLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
