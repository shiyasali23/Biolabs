"use client";

// Last-resort boundary so one failed render shows a recovery screen instead of a blank page.
export default function Error({ reset }) {
  return <main className="bio-page"><div className="bio-container" style={{ padding: "96px 0", textAlign: "center" }}>
    <h1 className="bio-subtitle">Something Went Wrong</h1>
    <p className="bio-body" style={{ marginTop: 12 }}>This page couldn’t load. Your data is unchanged.</p>
    <button type="button" className="bio-button-primary" style={{ marginTop: 24 }} onClick={() => reset()}>Try again</button>
  </div></main>;
}
