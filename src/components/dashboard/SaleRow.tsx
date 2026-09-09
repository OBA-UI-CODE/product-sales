/*
  Sale row — Figma 203:3715 (web) / 205:4306 (tablet) / 209:4616 (mobile)

  Mobile is not a smaller copy of the web row; it is laid out differently:

                     mobile              tablet + web
    padding          px 8, py 16         px 16, py 20
    halves           both flex-1         both hug, pushed apart
    avatar           36                  46
    initials         Inter 12/16         Inter 14/20
    item name        Inter 14/20, wraps  Inter 18/28, one line
    meta             Inter 10/16         Inter 14/20
    price            Inter Medium 14/20  Inter Medium 18/28
                     text/primary        text/secondary
    badge + seller   10px                12px

  Height is a fixed 90 at every size (set rather than left to padding, so the
  1px border does not add to it). On mobile the name wrapping to two lines is
  what fills that height.

  The "Paid" badge is #144d38 on #59cc8c, taken from the file. There is NO
  unpaid badge anywhere in the design — every row drawn is paid — so the
  "Owing" variant reuses the danger tokens the rest of the app already uses.
*/
export default function SaleRow({
  initials,
  name,
  meta,
  price,
  paid,
  seller,
}: {
  initials: string;
  name: string;
  meta: string;
  price: string;
  paid: boolean;
  seller: string;
}) {
  return (
    <div className="flex h-[90px] items-center justify-between overflow-hidden rounded-md border border-border-strong bg-bg-surface px-2 tab:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 tab:flex-none tab:gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle tab:size-[46px]">
          <span className="font-body text-[12px] font-normal leading-[16px] text-text-primary tab:text-[14px] tab:leading-[20px]">
            {initials}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 tab:flex-none">
          <p className="font-body text-[14px] font-normal leading-[20px] text-text-primary tab:whitespace-nowrap tab:text-[18px] tab:leading-[28px]">
            {name}
          </p>
          <p className="whitespace-nowrap font-body text-[10px] font-normal leading-[16px] text-text-secondary tab:text-[14px] tab:leading-[20px]">
            {meta}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 tab:flex-none">
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap font-body text-[14px] font-medium leading-[20px] text-text-primary tab:text-[18px] tab:leading-[28px] tab:text-text-secondary">
            {price}
          </p>
          <div
            className={`flex shrink-0 items-start rounded-full px-2 py-[3px] ${
              paid ? "bg-[#144d38]" : "bg-danger-bg"
            }`}
          >
            <p
              className={`whitespace-nowrap font-body text-[10px] font-medium leading-[16px] tab:text-[12px] ${
                paid ? "text-[#59cc8c]" : "text-danger"
              }`}
            >
              {paid ? "Paid" : "Owing"}
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap font-body text-[10px] font-normal leading-[16px] text-text-muted tab:text-[12px]">
          {seller}
        </p>
      </div>
    </div>
  );
}
