import { ImageResponse } from "next/og";

/*
  The picture WhatsApp, Facebook and X show when someone shares a johta.click
  link. Without one they render a bare blue link with no context, which is
  exactly how the link has been arriving when it is sent to shop owners.

  Generated rather than a static file so it cannot drift from the brand
  colours, and so there is no binary in the repo to keep in sync.

  Deliberately no custom font. Loading Dokdo or DM Sans here means fetching a
  font file during the build, which is one more thing that can fail and take
  the whole deployment with it — for an image that is only ever seen at
  thumbnail size in a chat. The system sans is fine at 1200x630.
*/

export const alt = "JOHTA — Every sale, accounted for.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: 10,
            fontWeight: 700,
            color: "#5ddba4",
            marginBottom: 34,
          }}
        >
          JOHTA
        </div>

        <div
          style={{
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -2,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <span>Every sale,&nbsp;</span>
          <span style={{ color: "#5ddba4" }}>accounted for.</span>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.4,
            marginTop: 30,
            color: "#b5b5b5",
            maxWidth: 900,
          }}
        >
          Log daily sales, track stock and know who owes you — built for small
          shops.
        </div>

        {/* A rule in the accent colour, so the card reads as JOHTA's even at
            the thumbnail size a chat app shows. */}
        <div
          style={{
            marginTop: 46,
            width: 190,
            height: 8,
            borderRadius: 4,
            background: "#158060",
          }}
        />
      </div>
    ),
    size
  );
}
