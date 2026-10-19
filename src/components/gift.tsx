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
  { selector: ".gift__row:nth-of-type(odd)", preset: "slideLeft" },
  { selector: ".gift__row:nth-of-type(even)", preset: "slideRight" },
]

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
        {gift.accounts.map((account, index) => (
          <article className={`gift__row${index % 2 === 1 ? " gift__row--reverse" : ""}`} key={account.role}>
            <Photo
              name={account.photo}
              alt={account.holder}
              sizes="(min-width: 768px) 12rem, 30vw"
              className="gift__avatar"
            />
            <div className="gift__card">
              <div className="gift__info">
                <p className="gift__role">{account.role}</p>
                <p className="gift__holder">{account.holder}</p>
                <p className="gift__bank">
                  {account.bank} : {account.accountNumber}
                </p>
                <button type="button" className="gift__copy" onClick={() => copy(account.accountNumber)}>
                  <CopyIcon />
                  {gift.copyLabel}
                </button>
              </div>
              <GiftQr
                className="gift__qr"
                bankBin={account.bankBin}
                accountNumber={account.accountNumber}
                alt={`${gift.qrAlt} ${account.holder}`}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
